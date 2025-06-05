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
// @require      https://zeos719.github.io/TW-highlight/Goods_in_check.js
// @require      file://C:/temp/Projects.tmp/Tinkoff-Kleks/Pair-highlighter/Obuv_v1.js
// @require      https://zeos719.github.io/TW-highlight/Call_027.js
// @require      https://zeos719.github.io/TW-highlight/Preset_defaults.js

// ==/UserScript==

// @require      https://zeos719.github.io/TW-highlight/Obuv_v1.js


//Красивые символы UTF-8
// https://www.drive2.ru/b/463440578768535663/


console.log('Monkey very begin!');

const MARK_SAME_COLOR = '#e6fff3';

const tc_Obuv = 1;
const tc_Banki = 2;
const tc_Brand = 3;
const tc_GiC = 4;
const tc_Call027 = 5;
const tc_CallType = 6;
const tc_CheckImage = 7;

//var SubWindows = [null, null];

//Global and control vars
var autoRun = false;
const SEND_TO_SERVER = false;

var vbd = null;


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
        var observer = new customObserver(document,false,function(observer,mutations){
            this.disconnect();

            //some DOM changes
            let docText = document.documentElement.textContent;
            if (docText.includes('👌')) { //Already done
                this.connect();
                return;
            };

            //Check for error
            if (docText.includes('Не удалось')) {
                console.log('DoObuv-error! Canceled');
                this.connect();
                return;
            }
/*
        let url = 'https://www.phonewarez.ru/files/TW-brands/Letu/А-Я.cp1251.txt';

		$.get(url, '', function(data) {
this.saveUrl = url;
			console.log('ValidBrands.get-Lamoda', this.saveUrl, data.slice(0,22));
		} );
*/

            if (!vbd) {
                vbd = new ValidBrands();
                vbd.Load_TXT();
            }

            if (vbd.HasData()) {
                    let brName = '1TOY';
                    console.log('ValidBrands.Includes', brName, vbd.Includes(brName));

                    brName = '1TAY';
                    console.log('ValidBrands.Includes', brName, vbd.Includes(brName));

                    brName = 'Baby balance';
                    console.log('ValidBrands.Includes', brName, vbd.Includes(brName));

                    brName = 'адмиралЪ';
                    console.log('ValidBrands.Includes', brName, vbd.Includes(brName));

            }





            let taskCode, taskVersion;
            [taskCode, taskVersion] = detectTask(docText);
            console.log('detectTask:', taskCode, taskVersion);

            if (taskCode==tc_Banki) DoBanki();

            if (taskCode==tc_Obuv) {
                //AskHttpHelper('obuv', document.links);
                DoObuv();
                //if (!autoRun)
                //    OpenPreviewTabs(document.links[0].href, document.links[1].href);
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
                DoCheckImage(taskVersion);
            }

            if (taskCode==-1) {
                PresetCommonDefaults();
            }



            this.connect();
        });

        observer.connect();

    });


}
else {
    //console.log('Tw: not frame');
}

//Multiple items
function OpenPreviewTabs(link0, link1) {
    if (!Object.hasOwn(this, 'linkTabs')) {
        this.linkTabs = [];
        this.epoch = 0;
    }

    //console.log('OpenPreviewTabs start', this.linkTabs)

    //Close last pre-view tabs
    for (let i=this.linkTabs.length-1;i>=0;i--) {
        let item = this.linkTabs[i]

        let closed_0 = ((item[0].tab!=null) && item[0].tab.closed) || (item[0].tab==null)
        let closed_1 = ((item[1].tab!=null) && item[1].tab.closed) || (item[1].tab==null)

        if ( (item[0].tab!=null) && !item[0].tab.closed ) item[0].tab.close(); //better before splice because item then will be deleted
        if ( (item[1].tab!=null) && !item[1].tab.closed ) item[1].tab.close();

        if ( closed_0 && closed_1 ) { //delete closed
            this.linkTabs.splice(i,1); //remove closed
            continue;
        }
    } //for

    //Delete old 'hanging' items
    const OLD_TRESHOLD = 10

    for (let i=this.linkTabs.length-1;i>=0;i--) {
        let item_age = this.linkTabs[i][2]

        if ((this.epoch-item_age)>OLD_TRESHOLD) {
            this.linkTabs.splice(i,1); //remove very old
            console.log('OpenPreviewTabs delete hanging')
        }

        } //for


    // May new links are already in list?
    for (let i=0;i<this.linkTabs.length;i++) {
        let item = this.linkTabs[i]

        if ((item[0].href==link0) && (item[1].href==link1)) {
            return false;
            }
    } //for

    //Add new item to list and open previews
    let v1 = {tab:GM_openInTab(link1), href: link1}
    let v0 = {tab:GM_openInTab(link0), href: link0}
    
    this.linkTabs.push( [v0, v1, this.epoch] );
    this.epoch++;

    //console.log('OpenPreviewTabs end', this.linkTabs)
    return true
}


//Just a test
/*
function OpenPreviewTabs() {
    console.log('OpenPreviewTabs start', this.linkTabs)

    if (typeof this.linkTabs !== 'undefined') {
        if ((this.linkTabs[0]==document.links[0].href) && (this.linkTabs[1]==document.links[1].href)) {
            console.log('OpenPreviewTabs same!!!')
            return
        }
    }

    this.linkTabs = [document.links[0].href, document.links[1].href]
    console.log('OpenPreviewTabs end', this.linkTabs)
}
*/


//return [taskCode, taskVersion]
function detectTask(docText) {

  const taskMarkers = [
    { marker: "Товары полностью совпадают", code: tc_Obuv },
    { marker: "БАНКИ.РУ", code: tc_Banki },
    { marker: "соответствие бренда", code: tc_Brand },
    { marker: "Подходят ли товары?|Название товара в чеке:", code: tc_GiC },
    { marker: "расшифровка телефонного разговора", code: tc_Call027 },
    { marker: "Фраза из диалога:", code: tc_CallType },
    { marker: "Проверь изображение|половые органы", code: tc_CheckImage },

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
}


function PresetCommonDefaults() {
    console.log('PresetCommonDefaults');

    //Focus on text area
	const edits = document.querySelectorAll('textarea');
    if (edits.length>0) {
        edits[0].focus();
    }

}

