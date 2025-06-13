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

//Прмер страницы
// https://www.letu.ru/product/bobbi-brown-tush-dlya-brovei-natural-brow-shaper-hair-touch-up/133100097/sku/152100010
// https://www.letu.ru/product/l-etual-tonalnoe-sredstvo-sovershenstvo-obnazhennoi-kozhi-decollete/20800019/sku/22800035?vendorCode=LT0290213

var letu = null;

    // Your code here...
    console.log('Monkey very begin!');

if (window==window.top) { //!!! Отличается от Pair highlight
    /* I'm in a frame! */
    console.log('Tw: top window');

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
                     status: 'created', idx:0};
		}

	MainJob() {
        console.log('** Letu.MainJob **');

         //Extract values from page
        let req_vCode = this.Get_ReqSKU();

        let base_URL = this.Get_Trim_ReqSKU();
        //console.log('Letu.MainJob.URL', base_URL);

        let vCode = this.Get_vCode();
        if (!vCode) {
            console.log('Letu.MainJob.vCode=null, exit'); //страница еще загружена полностью
            return;
        }
        console.log('Letu.MainJob.vCode', vCode, this.data.req_vCode);


        //Classes:
        //Obuv:    product-detail-sku-volume sku-view-table__item-volume product-detail-sku-volume--active
        //Krasota: product-detail-sku-regular-v2
        //let links = document.querySelectorAll('.product-detail-sku-regular-v2');

        let links = Array.from(document.links);
        links = links.filter((x)=>x.className.startsWith('product-detail-sku'))

        console.log('Letu.MainJob.links', links);

        links = this.Resort_links(links);
        if (links.length<2) {
            console.log('Letu.MainJob.links too short, exit', links.length);
            return;
        }

        let vDescr = this.Get_Descr();
        console.log('Letu.MainJob.vDescr', vDescr);


        //Initiate new job
        if (req_vCode) {
            if (this.data.base_URL!=base_URL) { //Got a request for new job

                this.data.base_URL = base_URL;
                this.data.req_vCode = req_vCode;
                this.data.date = new Date();
                this.data.status = 'run';

                console.log('Letu.MainJob: new job', req_vCode, vCode)
            }
        } else { //Пустой req_vCode - это заходы после a.click(), воостанавливаем req_vCode из сохраненного в первом вызове
                req_vCode = this.data.req_vCode;
        } //if(req_vCode)

        //Если код на текущей странице совпал с требуемым - всё отлично, заканчиваем
        if (vCode==req_vCode) {
            if (this.data.status=='run') {
                console.log('Letu.MainJob: got it!', vCode, vDescr, this.data.clickedLink);

                if (!document.title.includes('|'))
                    document.title = vDescr + '|' + document.title;

                this.data.status = 'done,success';
            }

            this.data.prev_vDescr = vDescr; //всегда обновляем vDescr с правильной страницы - вдруг еще подгрузился?
            return;
        } //if(vCode)

        //Подготовка к следующему клику - ждем, когда прогрузится страница после предыдущего клика (должен измениться vCode)
        if (vCode==this.data.prev_vCode) {
            return; // код без изменений
        } else {
            this.data.prev_vCode = vCode; //код изменился
        }

        //Клик на следующей опции
        if (this.data.idx<links.length) {
            console.log('Letu.MainJob.click', this.data.idx, links.length);

            this.data.prev_vCode = vCode;
            this.data.prev_vDescr = vDescr;
            this.data.clickedLink = links[ this.data.idx ].textContent;

            links[ this.data.idx ].click();
            links[ this.data.idx ].blur(); //Simulate mouseOut event



            this.data.idx += 1;

            if (this.data.idx==links.length) { // вышли за пределы списка, а результатат нет
                this.data.status = 'done,failed';
                this.data.base_URL = null;
                console.log('Letu.MainJob - FAILED!');
                alert('TW.Letu - FAILED!')
            }

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

    Get_ReqSKU(){
        let sku = null;

        let idx = window.location.href.indexOf('vendorCode');

        if (idx>0) {
            sku = window.location.href.slice(idx+10+1); //  https://www.letu.ru/product/pupa-karandash/44300389/sku/58400613?vendorCode=PUP244013
        }

        return sku;
    } //Get_ReqSKU

    Get_Trim_ReqSKU(){
        let sku = null;

        let idx = window.location.href.indexOf('vendorCode');

        if (idx>0) {
            sku = window.location.href.slice(0, idx-1); //  https://www.letu.ru/product/pupa-karandash/44300389/sku/58400613?vendorCode=PUP244013
        }

        return sku;
    } //Get_Trim_ReqSKU(){


} //class Letu
