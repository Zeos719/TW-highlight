// ==UserScript==
// @name         TW-Lamoda
// @namespace    http://tampermonkey.net/
// @version      2025-06-08
// @description  try to take over the world!
// @author       You
// @match        https://www.lamoda.ru/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=lamoda.ru
// @grant        none
// ==/UserScript==

var Lamoda_tryCount;
var Lamoda_timerId;
const LAMODA_DELAY = 100



function Lamoda_OnTimer() {
    console.log('Lamoda_OnTimer', Lamoda_tryCount);

    const MAX_TRY_COUNT = 20;

    Lamoda_tryCount += 1;
    if (Lamoda_tryCount>MAX_TRY_COUNT) {
        clearTimeout(Lamoda_timerId);
        console.log('Lamoda tries over', Lamoda_tryCount);
        return;
    }

    const sizeClasses = ['_sizeValue_14ecl_285', '_recaptcha_l2bu3_7'];

    let size_node = null;
    let size_val = null;
    for(let i=0; i<sizeClasses.length;i++) {
        size_node = document.getElementsByClassName(sizeClasses[i]);
        if (size_node && (size_node.length>0)) {
            size_val = size_node[0].textContent;
            break;
        }
    } //for

    if (size_val) {
        //Got it!
        console.log('Lamoda sucess', size_val, Lamoda_tryCount);
        clearTimeout(Lamoda_timerId);

        document.title = size_val + '|' + document.title;
    } else {
        //Next try
        Lamoda_timerId = setTimeout(Lamoda_OnTimer, LAMODA_DELAY); //timer
    }

} //Lamoda_OnTimer()


(function() {
    'use strict';

    // Your code here...
    Lamoda_tryCount = 0;
    Lamoda_timerId = setTimeout(Lamoda_OnTimer, LAMODA_DELAY); //timer

})();