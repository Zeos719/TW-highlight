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
//https://www.letu.ru/product/bobbi-brown-tush-dlya-brovei-natural-brow-shaper-hair-touch-up/133100097/sku/152100010

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

            console.log('TW-inside oserver');

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
		}

	MainJob() {
        console.log('** Letu.MainJob **');

        //Extract values from page
        let links = document.querySelectorAll('.product-detail-sku-regular-v2');
        links = this.Resort_links(links);
        console.log('Letu.MainJob.links', links);

        let vCode = this.Get_vCode();
        console.log('Letu.MainJob.vCode', vCode);

        let vDescr = this.Get_Descr();
        console.log('Letu.MainJob.vDescr', vDescr);

        let base_sku = this.Get_BaseSKU();
        console.log('Letu.MainJob.base_sku', base_sku);

        //Storage
        let letuStorage;
        let now = new Date();

        if (!sessionStorage.getItem('letu')) {

            letuStorage = {date: now, base_sku: base_sku, last_idx: null};
            sessionStorage.setItem('letu', JSON.stringify(letuStorage) );
        }

        //Main part
        let req_vCode = this.Get_ReqSKU();
        if (req_vCode) { //Got a request for new job
            letuStorage = {date: now, base_sku: base_sku, req_vCode: req_vCode, last_idx: null};
            sessionStorage.setItem('letu', JSON.stringify(letuStorage) );
            console.log('Letu.MainJob: new job', req_vCode)
        } else {
            letuStorage = JSON.parse( sessionStorage.getItem('letu') );
            req_vCode = letuStorage.req_vCode;
            console.log('Letu.MainJob: continue', req_vCode);
        }

        if (vCode==req_vCode) {
            console.log('Letu.MainJob.equals!', vCode, req_vCode);
        }

        let idx = letuStorage.last_idx;
        idx = (idx==null)?0:idx+1;

/*
        if (window.location.href.includes(156601627)) {
            console.log('Letu.MainJob 156601627', idx, vCode, req_vCode, vCode==req_vCode)
        }
*/

        if ((idx<links.length) && (vCode!=req_vCode)) {
            letuStorage = {date: now, base_sku: base_sku, req_vCode: req_vCode, last_idx: idx};
            sessionStorage.setItem('letu', JSON.stringify(letuStorage) );

            //Fire!
            //console.log('Letu.MainJob.click', idx, links[idx]);
            links[idx].click();
        }
/*
        if (vCode==req_vCode) {
            console.log('Letu.MainJob.success!', vCode, req_vCode);
        }
*/

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
            }
        } //for(items)

        return vCode;
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
    } //Get_Descr()

    Get_ReqSKU(){
        let sku = null;

        let idx = window.location.href.indexOf('reqsku');

        if (idx>0) {
            sku = window.location.href.slice(idx+7); //  https://www.letu.ru/product/pupa-karandash/44300389/sku/58400613?reqsku=PUP244013
        }

        return sku;
    } //Get_ReqSKU


} //class Letu
