// ==UserScript==
// @name         TW-Letu
// @namespace    http://tampermonkey.net/
// @version      2025-05-30
// @description  Letu.ru vendorCode parser
// @author       Zeos
// @match        https://www.letu.ru/product/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=letu.ru
// @require      https://code.jquery.com/jquery-3.7.1.min.js
// @run-at       document-end
// @grant        none

//==/UserScript==


//(function() {
    'use strict';

//Пример страницы
// https://www.letu.ru/product/bobbi-brown-tush-dlya-brovei-natural-brow-shaper-hair-touch-up/133100097/sku/152100010
// https://www.letu.ru/product/l-etual-tonalnoe-sredstvo-sovershenstvo-obnazhennoi-kozhi-decollete/20800019/sku/22800035?vendorCode=LT0290213
// https://www.letu.ru/product/l-oreal-paris-blesk-dlya-gub-infaillible-mega-blesk-bezuprechnyi-/37300075/sku/51500138?vendorCode=LOR339500

var timerId;
var letu = null;

// Your code here...
console.log('Monkey very begin!');

if (window==window.top) { //!!! Отличается от Pair highlight
    /* I'm in a frame! */
    console.log('Tw: top window');

/*
    $(document).ready(function() {
        // желаемый код jQuer
        console.log('Tw: ready');


        var observer = new customObserver(document,false,function(observer,mutations){
            this.disconnect();

            console.log('TW: inside observer');

            if (letu==null) letu = new Letu();

            letu.MainJob();

            this.connect();
        });

        observer.connect();



    });

*/

    timerId = setInterval(function () {
        if (letu==null) {
            letu = new Letu();
        }

        letu.MainJob();
    }, 200);

}//if(window.top)


//})(); //*** very end of script ***



//**********************************************
//https://stackoverflow.com/questions/44503173/how-to-pause-observing-in-callback-of-a-mutationobserver

function customObserver(target,config,callback){
    this.target =target|| document;
    this.config = config||{childList:true, subtree:true};

    var that=this;

    this.ob = new MutationObserver(function(mut,observer){
        callback.call(that,mut,observer);
    });
 }

customObserver.prototype={
    connect:function(){
        this.ob.observe(this.target,this.config);
    },

    disconnect:function(){ this.ob.disconnect()}
};


//**********************************************
class Letu {
  //constructor(name) { this.name = name; }
  //sayHi() { alert(this.name); }

	constructor() {
		console.log('** Letu.constructor **');

        //Page data
        this.data = {date: null,
                     base_URL: null,
                     req_vCode: null,
                     prev_vCode: null,
                     prev_vDescr: null,
                     clickedLink: null,
                     state: 'idle',
                     result: null,
                     idx:0};
		}

	MainJob() {
        //console.log('** Letu.MainJob **');

        //Parse main url address
        let req_vCode, base_URL;
        [base_URL, req_vCode] = this.Parse_main_URL();

        if (req_vCode) {
            //Initiate new job
            console.log('Letu: new job', req_vCode);
            this.data = {req_vCode:req_vCode, base_url: base_URL, state: 'running', idx:0, result:'not_yet'}
            sessionStorage.Letu = JSON.stringify(this.data);
        }

         //Extract values from page
        let vCode = this.Get_vCode();
        let vDescr = this.Get_Descr();
        if (!vCode || !vDescr) {
            console.log('Letu: page not loaded yet', vCode, vDescr); //страница еще загружена полностью
            return;
        }

        //Если я здесь - всё готово: страница загружена, req_vCode запомнен в sessionStorage
        this.data = JSON.parse( sessionStorage.Letu );

        if (!this.data || this.data.state!='running') {
            console.log('Letu: exit if no run', this.data.state);
            return; //Далее можно пройти только с кодом 'running'
        }

        req_vCode = this.data.req_vCode; //вспоминаем значение из первого входа на страницу

        //console.log('Letu: p1', req_vCode, vCode, this.data.state, vDescr);

        //Если код на текущей странице совпал с требуемым - всё отлично, заканчиваем
        if (vCode==req_vCode) {
            //console.log('Letu: p2', this.data.state);
            this.data.prev_vDescr = vDescr; //всегда обновляем vDescr с правильной страницы - вдруг еще подгрузился?

            if (this.data.state=='running') {
                this.Action_OnSuccess(vCode, vDescr);
                this.data.state = 'done';
                this.data.result = 'success';
            }
            sessionStorage.Letu = JSON.stringify(this.data);

            return;
        } //if(vCode)

        // код не совпал, начинаем обход опций
        //CSS classes:
        //Obuv:    product-detail-sku-volume sku-view-table__item-volume product-detail-sku-volume--active
        //Krasota: product-detail-sku-regular-v2
        //let links = document.querySelectorAll('.product-detail-sku-regular-v2');

        let links = Array.from(document.links);
        links = links.filter((x)=>x.className.startsWith('product-detail-sku'))

/*
        //Отключаем tooltips
        const tooltip_classes = ['v-popper--theme-tooltip-black', 'v-popper--theme-tooltip'];
        links.forEach(function(lnk) {
            tooltip_classes.forEach(function(cl) { lnk.classList.remove(cl) } );
        });
*/
        //console.log('Letu.MainJob.links', links);


        links = this.Resort_links(links);
        if (links.length<2) {
            //Если я здесь, то код не совпал и опций для перебора нет
            console.log('Letu.MainJob.links too short, exit', links.length);
            this.Action_OnFail(vCode, vDescr);

            this.data.state = 'done';
            this.data.result = 'failed';
            }
         sessionStorage.Letu = JSON.stringify(this.data);

        //Подготовка к следующему клику - ждем, когда прогрузится страница после предыдущего клика (должен измениться vCode)
        if (vCode==this.data.prev_vCode) {
            return; // код без изменений
        } else {
            this.data.prev_vCode = vCode; //код изменился
            sessionStorage.Letu = JSON.stringify(this.data);
        }

        //Клик на следующей опции
        if (this.data.idx<links.length) {
            console.log('Letu.MainJob.click', this.data.idx, links.length);

            this.data.prev_vCode = vCode;
            this.data.prev_vDescr = vDescr;
            this.data.clickedLink = links[ this.data.idx ].textContent;

            links[ this.data.idx ].click();

            //To remove tooltip
            //links[ this.data.idx ].blur(); //Simulate mouseOut event
/*
            let descr_node = document.querySelector('.sku-block__info'); //click on description div
            if (descr_node) {
                descr_node.click();
            }
*/
            this.data.idx += 1;

            if (this.data.idx==links.length) { // вышли за пределы списка, а результатат нет
                this.data.state = 'done';
                this.data.result = 'failed';

                this.data.base_URL = null;

                this.Action_OnFail();
                console.log('Letu.MainJob - FAILED!');
                alert('TW.Letu - FAILED!')
            }

            sessionStorage.Letu = JSON.stringify(this.data);
        }

        return;
    } //MainJob

    Resort_links(links) {
        //possible CSS classes: item.className
        //product-detail-sku-regular-v2 product-detail-sku-regular-v2--active *** в наличии, выбран
        //product-detail-sku-regular-v2 product-detail-sku-regular-v2--not-stock *** отсутствует
        //product-detail-sku-regular-v2 product-detail-sku-regular-v2--not-stock product-detail-sku-regular-v2--active *** отсутствует, выбран


        let links_sorted = [];

        //Put 'not in stock' first
        for (let lk of links) {
            if (lk.className.includes('not-stock')) {
                links_sorted.unshift(lk) //в начало
            } else {
                links_sorted.push(lk); //в конец
            }
        } //for (links)

        return links_sorted;
    } //Resort_links()

    Get_vCode() {
        let vCode = null;

        let items = document.querySelectorAll('.product-group-characteristics__item');

        for (let it of items) {
            if (it.textContent.includes('Код продукта')) {
                let vc_node = it.querySelector('.product-group-characteristics__item-value');

                vCode = vc_node && vc_node.textContent.trim();
                return vCode;
            }
        } //for(items)

        return null;
    } //Get_vCode()

    Get_Descr() {
        let vDescr = null;

        let descr_node = document.querySelector('.sku-block__info');
        vDescr = descr_node && descr_node.firstElementChild && descr_node.firstElementChild.textContent.trim();

        return vDescr;
    } //Get_Descr()

    Get_BaseSKU() {
        //return document.baseURL.split('/')[5];
        return window.location.href.split('\/')[5];
    } //Get_BaseSKU()

    // Return [baseUrl, vendorCode]
    // https://www.letu.ru/product/pupa-karandash/44300389/sku/58400613?vendorCode=PUP244013
    // -> ['http://../58400613', 'PUP244013']
    Parse_main_URL() {
        let url = window.location.href;
        let sku = null;

        let idx = window.location.href.indexOf('vendorCode');

        if (idx>0) {
            url = window.location.href.slice(0, idx-1); //  https://www.letu.ru/product/pupa-karandash/44300389/sku/58400613?vendorCode=PUP244013
            sku = window.location.href.slice(idx+10+1); //  https://www.letu.ru/product/pupa-karandash/44300389/sku/58400613?vendorCode=PUP244013
        }

        return [url, sku]
    } //Parse_main_URL()

    Action_OnSuccess(vCode, vDescr)
    {
        console.log('Letu.MainJob: got it!', vCode, vDescr);

        if (!document.title.includes('|')) {
            document.title = vDescr + '|' + document.title;
        }
    } //Action_OnSuccess

    Action_OnFail() {
        let msg = 'FAILLED! ' + this.data.req_vCode;

        console.log('Letu.MainJob - ' + msg);

        if (!document.title.includes('|')) {
            document.title = msg + '|' + document.title;
        }

        alert('TW.Letu - ' + msg);
    } //Action_OnFail



} //class Letu
