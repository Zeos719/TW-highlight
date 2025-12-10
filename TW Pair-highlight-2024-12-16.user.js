// ==UserScript==
// @name         TW Pair-highlight
// @namespace    http://tampermonkey.net/
// @version      2024-12-16
// @description  try to take over the world!
// @author       Zeos
// @match        https://twork.tinkoff.ru/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM_openInTab
// @run-at       document-end
// @require      https://code.jquery.com/jquery-3.7.1.min.js
// @require      https://zeos719.github.io/TW-highlight/Goods_in_check.js
// @require      file://C:/temp/Projects.tmp/Tinkoff-Kleks/Pair-highlighter/Obuv_v1.js
// @require      https://zeos719.github.io/TW-highlight/Call_027.js
// @require      https://zeos719.github.io/TW-highlight/Preset_defaults.js
// @require      file://C:/temp/Projects.tmp/Tinkoff-Kleks/Pair-highlighter/mixed-tools.js
// @require      file://C:/temp/Projects.tmp/Tinkoff-Kleks/Pair-highlighter/que_answ.js
// @require      file://C:\temp\Projects.tmp\Tinkoff-Kleks\Pair-highlighter\Category_of_goods.js
// @require      file://C:\temp\Projects.tmp\Tinkoff-Kleks\Pair-highlighter\post-theme-nicely-formated.js
// @require      file://C:\temp\Projects.tmp\Tinkoff-Kleks\Pair-highlighter\pulse_idea.js
// @require      file://C:\temp\Projects.tmp\Tinkoff-Kleks\Pair-highlighter\smart_catalog.js
// ==/UserScript==

// @require      https://zeos719.github.io/TW-highlight/Obuv_v1.js
// @require      https://zeos719.github.io/TW-highlight/mixed-tools.js

// @match        file:///C:/temp/Projects.tmp/Tinkoff-Kleks/*

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
const tc_FrontPage = 8;
const tc_BadPic = 9;
const tc_PlayExam = 10;
const tc_CtgGoods = 11;
const tc_PostTheme = 12;
const tc_PulseIdea = 13;
const tc_SmartCat = 14;

const le_UNKNOWN = 0;
const le_LEARN = 1;
const le_EXAM = 2;

//Task functions

const taskMarkers = [
    //!! 'Полностью идентичные_товары' - 'Полностью идентичные__товары'
    { marker: "Товары полностью совпадают|Полностью идентичные|Различные варианты одной и той же модели одного бренда|Нет, товары совсем разные", code: tc_Obuv },
    //{ marker: "БАНКИ.РУ", code: tc_Banki },
    { marker: "соответствие бренда", code: tc_Brand },
    { marker: "Подходят ли товары?|Название товара в чеке:", code: tc_GiC },
    { marker: "расшифровка телефонного разговора", code: tc_Call027 },
    { marker: "Фраза из диалога:", code: tc_CallType },
    { marker: "Проверь изображение|половые органы", code: tc_CheckImage },
    { marker: "Да, товар подходит для главной страницы", code: tc_FrontPage},
    { marker: "Проверьте наличие нарушений на изображении", code: tc_BadPic},
    //{ marker: "Произнесено ли предложение с вопросительной интонацией?|исправьте все опечатки в транскрипции|Откорректируйте расстановку дефисов|Исправьте ошибки нормализации", code: tc_PlayExam},
    { marker: "Список категорий для товара", code: tc_CtgGoods},
    { marker: "Проверьте пост|Проверь пост|Проверь коммент", code: tc_PostTheme}, //'Проверьте пост на принадлежность к тематике', 'Проверь пост на наличие указанного нарушения'
    { marker: "Пост подходит для ленты \"Идеи\"?", code: tc_PulseIdea},
    { marker: "Выберите категорию для товара", code: tc_SmartCat},
  ].reverse();


const taskFuncs = new Map([
    [tc_Obuv, DoObuv],
    [tc_Banki, DoBanki],
    [tc_Brand, DoBrandCorrespond],
    [tc_GiC, DoGoodsInCheck],
    [tc_Call027, DoCall027],
    [tc_CallType, DoCallType],
    [tc_CheckImage, DoCheckImage],
    [tc_FrontPage, DoFrontPage],
    [tc_BadPic, DoBadPic],
    [tc_PlayExam, DoQueAnsw], //!
    [tc_CtgGoods, DoCtgGoods],
    [tc_PostTheme, DoQueAnsw], //!
    [tc_PulseIdea, DoPulseIdea],
    [tc_SmartCat, DoSmartCat],

]);


//Global and control vars
var autoRun = false;
const SEND_TO_SERVER = true;

var vbd = null;
let startPage;

var observer = null;


console.log('Before window');

//if (window!=window.top)
if (window==window.top) {
    /* Not a frame! */
    startPage = DetectStartPage();
    DrawStartPage(startPage);
    console.log('DetectStartPage-2', startPage, (new Date()).toTimeString());


} else {
    /* I'm in a frame! */
    console.log('Tw: frame');


    $(document).ready(function() {
        // желаемый код jQuer
        console.log('Tw: ready');

        startPage = DetectStartPage();
        DrawStartPage(startPage);
        console.log('DetectStartPage-1', startPage, (new Date()).toTimeString());

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

        if (!observer) observer = new customObserver(document,false,function(observer,mutations){
            this.disconnect();

            $.ajaxSetup({ cache: false });

            let startPage = DetectStartPage();
            DrawStartPage(startPage);
            console.log('DetectStartPage-3', startPage, (new Date()).toTimeString());
            //if (startPage>=0) return;

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

            RunTask(docText);

            this.connect();
        });

        observer.connect();

    }); //$.ready()


}//else(frame)

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

//console.log('detectTask.docText:', docText);

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

//Returns -1=not a start page; 0 - no jobs; 1 - jobs availabel
function DetectStartPage() {

    if (document.querySelector("div.tasks-empty-block")) return 0;

    document.querySelectorAll('iframe').forEach( function (item ) {
        if (item.contentWindow.document.body && item.contentWindow.document.body.querySelectorAll('div.tasks-empty-block')) return 0;
    });

    if (document.querySelector("task-item")) return 1;

    document.querySelectorAll('iframe').forEach( function (item ) {
        if (item.contentWindow.document.body && item.contentWindow.document.body.querySelectorAll('task-item').length>0) return 1;
    });

    return -1;
}

function DrawStartPage(startPage) {
        let tt = window.parent.document.title;
        if (startPage==1) {
            if (!tt.includes('💥')) tt = '💥 ' + tt;
        } else {
            if (tt.includes('💥')) tt = tt.slice(2);
        }
        window.parent.document.title = tt;
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
function DoBanki() {

    var item = document.querySelector("#klecks-app > tui-root > tui-dropdown-host > div > task > flex-view > flex-common-view > div.tui-container.tui-container_adaptive.flex-common-view__main > div > main > flex-element > flex-container > flex-element:nth-child(6) > flex-text > tui-editor-socket");

    if ((item!=null) && (!item.innerHTML.includes('<a')) && (item.textContent.startsWith('http') )) {
    //if ((item!=null) && (!item.innerHTML.includes('<a')) ) {
        item.innerHTML = `<a href="${item.textContent}">${item.textContent}</a>`
    }
}

//**********************************************
function DoFrontPage() {
    console.log('DoFrontPage');

    RB_set(0); //Да, подходит

    const REQUIRED_TOP = 50;

    //window.scrollTo(0, 50);
    //document.querySelector('#dummy_element').scrollIntoView()

    setTimeout(function () {
            window.scrollTo(0, 300);
        },200);

    console.log('DoFrontPage after scroll');

} //DoFrontPage


function DoBadPic() {
    console.log('DoBadPic');

    //Radio buttons - set defaults
    const radio_btns = document.querySelectorAll('input[type=radio]');
	let anyChecked = false;
	for (const btn of radio_btns)
		{anyChecked = anyChecked || btn.checked }

    if (!anyChecked) {
        radio_btns[ 0 ].parentNode.click(); //Нет нарушений
    }

    //Ярлыки с нарушениями
    function OnClickBadge() {
        //console.log('DoBadPic onclick');
        radio_btns[ 1 ].parentNode.click(); //Есть нарушения
    }

    const badges = document.querySelectorAll('tui-badge');
    //console.log('DoBadPic badges', badges);
    for (let bg of badges) {
        bg.onclick = OnClickBadge;
    }


};


let PCD_Marks = [
    //{'key':'в красной рамке', 'RButton':0}, //'Оцените, насколько товар в красной рамке подходит под ваш запрос?'
    {'key':'Манипуляция', 'RButton':1}, //'В посте присутствует нарушение «Манипуляция рынком»?'
    //{'key':'живость', 'RButton':0}, //'Проверьте фотографию лица на "живость"'
    {'key':'Проверь пост на наличие нарушений', 'RButton':1},
    {'key':'Проверь комментарий на наличие нарушений', 'RButton':1},
    //{'key':'Товар подходит для размещения на главной странице?', 'RButton':0},
    //{'key':'Корректно ли нормализован текст?', 'RButton':0},
    //{'key':'На аудио голос человека или результат синтеза?', 'RButton':1},
    {'key':'Оценка качества изображения', 'RButton':[2,5,8,11]},
    {'key':'Проверьте наличие тематики "Инвестиции"', 'TextFunc': PCD_Tiker, 'TextPrm':null},
    {'key':'Описание намерения:', 'RButton':0},


];

function PCD_Tiker(docText, prm) {
    let rb = -1;
    if (docText.match(/\$[A-Z|0-9]+/) ) rb = 0;

    //console.log('PCD_Tiker', docText, rb);

    try {
        if (!RB_alreadySet() && (rb!=-1)) RB_set(rb)
        } catch {
            console.log('PCD_Tiker RB-except')
        } //try

    return;
}

function PresetCommonDefaults() {
    console.log('PresetCommonDefaults');

    //Presets
    let docText = document.documentElement.textContent;
    if (!docText) return;
    //console.log('PresetCommonDefaults length', docText.length);

    if(docText.includes('Характеристика товара и её значение')) return;


    for (let i=0;i<PCD_Marks.length;i++) {
        let item = PCD_Marks[i];

        if (!docText.includes(item.key)) continue;

        if (item.hasOwnProperty('RButton')) {
            try {
                if (!RB_alreadySet()) RB_set(item.RButton);
            } catch {
                console.log('PresetCommonDefaults RB-except')
            } //try

            } //if(hasOwnProperty)

        if (item.hasOwnProperty('TextFunc')) {
            item.TextFunc(docText, item.TextParam)
            } //if(hasOwnProperty)


        //Scroll to first header
        let headers = document.querySelectorAll('.tui-text_h6');
        if (headers.length>=1) {
            headers[0].scrollIntoView()
        }



    } //for

    //Focus on text area
	const edits = document.querySelectorAll('textarea');
    if (edits.length==1) {
        edits[0].focus();
    }

} //PresetCommonDefaults()

function DetectLearnOrExam() {

    let node = document.querySelector('div.b-statistical-panel-block');
    if (node) {
        if (node.innerText.includes('Обучение') || node.innerText.includes('Тренировка'))
            return le_LEARN;
        if (node.innerText.includes('Экзамен'))
            return le_EXAM;
    }

    return le_UNKNOWN;
} //DetectLearnOrExam()

const ignoredTasks = [
    //"Особенности разметки отзывов на БАНКИ.РУ",
    //"В какой аудиозаписи голос звучит лучше?",
    //"В какой аудиозаписи голос больше похож на оригинал", // Сравнение 3 аудио!
    //"Выберите категорию для товара",
    //"Проверьте соответствие текста и аудио",
    //"Прочитай сообщение и выбери подходящую категорию",
    //"Запишите транскрипцию аудио",
    //"Прослушайте аудио и выберите наилучшую транскрипцию",
    //"Предложенные данные организации",
    "Прослушайте аудио и выберите наилучшую транскрипцию",
    "Клиент формулирует свой запрос в поиск или поддержку",
    //"Исполнитель (БЕЗ ИП)",
];

function IsIgnoredTask(docText) {
  for(let t of ignoredTasks) if (docText.includes(t)) return true;
  return false;
}

function ExitTask() {
    const Z_BUTTON_CLICKED = "z-button-clicked";

    let btns = document.querySelectorAll("button");

    let exitBtns = [null, null];
    for(let b of btns) {
        if (b.innerText.includes("Выйти из задания")) exitBtns[0] = b;
        if (b.innerText.includes("Да, выйти")) exitBtns[1] = b;
    }

    //console.log('ExitTask.btns', exitBtns);

    if (!exitBtns[0] && !exitBtns[1]) return; //Нет кнопок

    if (exitBtns[0] && !exitBtns[1]) //Только первая кнопка
    {
        if (!exitBtns[0].classList.contains(Z_BUTTON_CLICKED)) {
            exitBtns[0].classList.add(Z_BUTTON_CLICKED);

            //exitBtns[0].click();
            setTimeout(function () {exitBtns[0].click()}, 300);

            console.log('ExitTask.click-0');
        } else {
            console.log('ExitTask.alreadyClicked-0');
        }

    }

    if (exitBtns[0] && exitBtns[1]) //Обе кнопки
    {
        exitBtns[0].classList.remove(Z_BUTTON_CLICKED);

        //exitBtns[1].click();
        setTimeout(function () {exitBtns[1].click()}, 300);

        console.log('ExitTask.click-1');

    }

    return;


    return
}

function RunTask(docText) {

    //Exams: le_UNKNOWN, le_LEARN, le_EXAM
    var exam = DetectLearnOrExam();
    console.log('DetectLearnOrExam', exam);

    let taskCode, taskVersion;
    [taskCode, taskVersion] = detectTask(docText);
    console.log('detectTask:', taskCode, taskVersion);

    //if (taskCode>=0) exam = le_UNKNOWN;

    if (taskCode==-1) {
        if (IsIgnoredTask(docText)) {
            //console.log('Ignored task');
            ExitTask();
        } else {
            PresetCommonDefaults();
        }
    } else {
        let func = taskFuncs.get(taskCode);
        if (func) func(taskVersion, exam);
    }

} //RunTask()

