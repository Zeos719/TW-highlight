// ==UserScript==
// @name         YN-helper
// @namespace    http://tampermonkey.net/
// @version      2025-08-12
// @description  try to take over the world!
// @author       You
// @match        https://tasks.yandex.ru/task/*
// @match        https://iframe-tasks.yandex
// @icon         https://www.google.com/s2/favicons?sz=64&domain=yandex.ru
// @grant        none
// @run-at       document-end
// @require      https://code.jquery.com/jquery-3.7.1.min.js
// ==/UserScript==

(function() {
    'use strict';

    console.log('YN.top', window.frames.length + ':' + parent.frames.length);

    // Your code here...
    if (window==window.top) {
        /* Not a frame! */
        console.log('YN: not frame');

    } else {
    /* I'm in a frame! */
    console.log('YN: frame');

    //ajaxSetup({ cache: false });

    $(document).ready(function() {
        // желаемый код jQuery
        console.log('Yn: ready');

        var observer = new customObserver(document,false,function(observer,mutations){
            this.disconnect();
            //console.log('Yn: observer');

            //Detect 'Текущее взаимодействие'
            let nodes = document.querySelectorAll('header');
            if (nodes.length>0)
                DoMainJob();

            this.connect();
        });

        observer.connect();

   }); //$.ready()

} //else(frame)

function DoMainJob(){
    console.log('YN.DoMainJob start', parent.frames.length);

    let currentHdr = null;
    let nodes = document.querySelectorAll('header');
    for(const nd of nodes)
        if (nd.innerText.includes('взаимодействие'))
            currentHdr = nd;

    if (!currentHdr) return;

    let bound = currentHdr.getBoundingClientRect();
    const REQUIRED_TOP = 30; //600
    //console.log('YN bound:', bound.top);

    //let frameWnd = parent.frames.contentWindow;

    //console.log('YN.YOffset', window.pageYOffset);
    //if (window.pageYOffset==0) {

    const doneMark = '⇓';
    if (currentHdr.innerText[0]!=doneMark) {

        //window.scrollTo(0, (bound.top-REQUIRED_TOP));
        setTimeout(function (){
            currentHdr.scrollIntoView();
            console.log('YN scrolled');

            currentHdr.innerText = doneMark + currentHdr.innerText;

        }, 500);

    }

    return;
}; //DoMainJob()



})(); //*** YN script - end of name space isolation ***


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

