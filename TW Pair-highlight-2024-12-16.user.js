// ==UserScript==
// @name         TW Pair-highlight
// @namespace    http://tampermonkey.net/
// @version      2024-12-16
// @description  try to take over the world!
// @author       Zeos
// @match        https://twork.tinkoff.ru/*
// @match        file:///C:/temp/Projects.tmp/Tinkoff-Kleks/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM_openInTab
// @run-at       document-end
// @require      https://code.jquery.com/jquery-3.7.1.min.js
// @require      file:///C:/temp/Projects.tmp/Tinkoff-Kleks/Pair-highlighter/Goods_in_check.js
// @require      file:///C:/temp/Projects.tmp/Tinkoff-Kleks/Pair-highlighter/Obuv_v1.js
// @require      file:///C:/temp/Projects.tmp/Tinkoff-Kleks/Pair-highlighter/Call_027.js
// @require      file:///C:\temp\Projects.tmp\Tinkoff-Kleks\Pair-highlighter\Preset_defaults.js
// ==/UserScript==

console.log('Monkey very begin!');

const MARK_SAME_COLOR = '#e6fff3';

const tc_Obuv = 1;
const tc_Banki = 2;
const tc_Brand = 3;
const tc_GiC = 4;
const tc_Call027 = 5;
const tc_CallType = 6;
const tc_CheckImage = 7;

var SubWindows = [null, null];

if (window!=window.top) {
    /* I'm in a frame! */
    console.log('Tw: frame');


    $(document).ready(function() {
        // желаемый код jQuer
        console.log('Tw: ready');

/*
       // Example usage of Observer API
       const observer = new MutationObserver(() => {

           var has_marker = document.documentElement.textContent.includes("Что");

           if (document.links.length==2) {
               console.log('The DOM has changed!', has_marker);

               Compare_href_simple(document.links);
               //Compare_href_byParts(document.links);

               var bound = document.links[0].getBoundingClientRect();
               //console.log('Tw bound:', bound.top);
               if (bound.top>0) {
                   window.scroll(0, (bound.top-50)); }
           }

     });
    observer.observe(document.body, { childList: true, subtree: true });
*/
        let linkTabs = [{tab:null, href:''}, {obj:null, href:''}];

        var observer = new customObserver(document,false,function(observer,mutations){
            this.disconnect();

            //some DOM changes
            let docText = document.documentElement.textContent;
            if (docText.includes('👌')) { //Already done
                this.connect();
                return;
            };

            let taskCode, taskVersion;
            [taskCode, taskVersion] = detectTask(docText);
            console.log('detectTask:', taskCode, taskVersion);

            if (taskCode==tc_Banki) DoBanki();
console.log('detectTask2:', taskCode, taskVersion);
            if (taskCode==tc_Obuv) {
                //AskHttpHelper('obuv', document.links);
                console.log('before DoObuv()');
                DoObuv();
                OpenPreviewTabs(linkTabs);
            }

            if (taskCode==tc_Brand) {DoBrandCorrespond()};

            //Сопоставить товары в чеке
            let selector;
            //selector = document.querySelector("#klecks-app > tui-root > tui-dropdown-host > div > task > flex-view > flex-common-view > div.tui-container.tui-container_adaptive.flex-common-view__main > div > main > flex-element > flex-container > flex-element:nth-child(3) > flex-header > div");
            //v1
            selector = document.querySelector("#klecks-app > tui-root > div > task > flex-view > flex-common-view > div.tui-container.tui-container_adaptive.flex-common-view__main > div > main > flex-element > flex-container > flex-element:nth-child(3) > flex-header > div");

            //v2
            //selector = document.querySelector("#klecks-app > tui-root > div > task > flex-view > flex-common-view > div.tui-container.tui-container_adaptive.flex-common-view__main > div > main > flex-element > flex-container > flex-element:nth-child(7) > flex-header > div")

            if (taskCode==tc_GiC) {
//console.log('detectTask4:', taskCode, taskVersion);
                //selector.innerHTML += '  &#128076;'; // append 👌 as a mark

                DoGoodsInCheck(taskVersion);
            }

            if (taskCode==tc_Call027) {
                DoCall027();
            }

            if (taskCode==tc_CallType) {
                DoCallType();
            }

            if (taskCode==tc_CheckImage) {
                DoCheckImage();
            }



            this.connect();
        });

        observer.connect();

    });


}
else {
    //console.log('Tw: not frame');
}

function OpenPreviewTabs(linkTabs) {

    //Close last pre-view tabs
    if (linkTabs[0].href != document.links[0].href) {
        if ( (linkTabs[0].tab!=null) && !linkTabs[0].tab.closed ) linkTabs[0].tab.close();
    }

    if (linkTabs[1].href != document.links[1].href) {
        if ( (linkTabs[1].tab!=null) && !linkTabs[1].tab.closed ) linkTabs[1].tab.close();
    }


    //Open pre-view tabs
    if (linkTabs[0].href != document.links[0].href) {
        linkTabs[0].href = document.links[0].href;
        linkTabs[0].tab = GM_openInTab(document.links[0].href);
    }
    if (document.links[0].href != document.links[1].href) {
        if (linkTabs[1].href != document.links[1].href) {
            linkTabs[1].href = document.links[1].href;
            linkTabs[1].tab = GM_openInTab(document.links[1].href);
        }
    }

    return;
}


//return [taskCode, taskVersion]
function detectTask(docText) {

  const taskMarkers = [
    { marker: "Товары полностью совпадают", code: tc_Obuv },
    { marker: "БАНКИ.РУ", code: tc_Banki },
    { marker: "соответствие бренда", code: tc_Brand },
    { marker: "Подходят ли товары?|Название товара в чеке:", code: tc_GiC },
    { marker: "расшифровка телефонного разговора", code: tc_Call027 },
    { marker: "Фраза из диалога:", code: tc_CallType },
    { marker: "Проверь изображение", code: tc_CheckImage },

  ].reverse();

  for (let task of taskMarkers) {
    let mark_arr = task.marker.split('|');

    for (let sub_ver = 0; sub_ver < mark_arr.length; sub_ver++) {
      if (docText.includes(mark_arr[sub_ver]) ) {
        return [task.code, sub_ver];
      }

    } //for(mar_arr)

  } //for(testMarkers)

  return [-1, 0];
}





//********************* Соответствие бренду  ********************************
function DoBrandCorrespond() {
    //console.log('Brand corr');

    var elm = document.querySelector("#klecks-app > tui-root > tui-dropdown-host > div > task > flex-view > flex-common-view > div.tui-container.tui-container_adaptive.flex-common-view__main > div > main > flex-element > flex-container > flex-element:nth-child(3) > flex-text > tui-editor-socket > p");
    if (! elm.innerHTML.includes('nbsp')) {
        var theText = document.querySelector("#klecks-app > tui-root > tui-dropdown-host > div > task > flex-view > flex-common-view > div.tui-container.tui-container_adaptive.flex-common-view__main > div > main > flex-element > flex-container > flex-element:nth-child(3) > flex-text > tui-editor-socket > b").innerHTML;

        var ctg = theText.split(' - ');
        ctg[0] = ctg[0].trim().replaceAll(' ', '+');
        ctg[1] = ctg[1].trim().replaceAll(' ', '+');

        ctg[0] = ctg[0].replaceAll('гигены', 'гигиены');
        ctg[0] = ctg[0].replaceAll('Мужские', '"Мужские"');

        //ctg[1] = encodeURIComponent(ctg[1]);
        ctg[1] = ctg[1].replaceAll('&amp;', '%26');

        var newUrl = `https://www.google.com/search?q=${ctg[0]}+"${ctg[1]}"`;

        var newInner = `получить ответ запроса в <a href=\'${newUrl}\'>Google</a> &nbsp&nbsp	&#128076;`;
        //console.log('url: ', newUrl);
        //console.log('newInner: ', newInner);

        elm.innerHTML = newInner;

        // Open/close tabs
        window.open(newUrl, '_blank');
    }

    return;
}


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
// Request remote http-server
// Return  {result:RET, answer: ANS}
// Result:  0=Failed 1=Ok, -1=Timeouted

function AskHttpHelper(task, links) {
    var timerId;

    var url = 'http://localhost:8000/request&task='+task;
    //var data_out = {task: 'obuv'}
    var data_out = { name: "John", time: "2pm" }

    $.post(url, JSON.stringify(data_out), function(data) { console.log('TW server:', data) });

    return {result:1, answer:'Ok'}

    return {result:0, answer:null}
}



//**********************************************
function hasUnicode(s) {
    return /[^\u0000-\u007f]/.test(s);
}


//**********************************************
function DoBanki() {

    var item = document.querySelector("#klecks-app > tui-root > tui-dropdown-host > div > task > flex-view > flex-common-view > div.tui-container.tui-container_adaptive.flex-common-view__main > div > main > flex-element > flex-container > flex-element:nth-child(6) > flex-text > tui-editor-socket");

    if ((item!=null) && (!item.innerHTML.includes('<a')) && (item.textContent.startsWith('http') )) {
    //if ((item!=null) && (!item.innerHTML.includes('<a')) ) {
        item.innerHTML = `<a href="${item.textContent}">${item.textContent}</a>`
    }
};