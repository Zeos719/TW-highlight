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
// @require      file://C:\temp\Projects.tmp\Tinkoff-Kleks\Pair-highlighter\Goods_in_check.js
// @require      file://C:/temp/Projects.tmp/Tinkoff-Kleks/Pair-highlighter/Obuv_v1.js
// @require      https://zeos719.github.io/TW-highlight/Call_027.js
// @require      https://zeos719.github.io/TW-highlight/Preset_defaults.js
// @require      file://C:/temp/Projects.tmp/Tinkoff-Kleks/Pair-highlighter/mixed-tools.js
// @require      file://C:/temp/Projects.tmp/Tinkoff-Kleks/Pair-highlighter/que_answ.js
// @require      file://C:\temp\Projects.tmp\Tinkoff-Kleks\Pair-highlighter\Category_of_goods.js
// @require      file://C:\temp\Projects.tmp\Tinkoff-Kleks\Pair-highlighter\post-theme-nicely-formated.js
// @require      file://C:\temp\Projects.tmp\Tinkoff-Kleks\Pair-highlighter\pulse_idea.js
// @require      file://C:\temp\Projects.tmp\Tinkoff-Kleks\Pair-highlighter\smart_catalog.js
// @require      file://C:\temp\Projects.tmp\Tinkoff-Kleks\Pair-highlighter\norm_sentences.js
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
const tc_NormSent = 15;

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
    { marker: "Какое из предложений нормализовано лучше?|Прослушайте аудио и выберите наилучшую транскрипцию", code: tc_NormSent},

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
    [tc_NormSent, DoNormSent],

]);


//Global and control vars
var autoRun = false;
const SEND_TO_SERVER = true;

var vbd = null;
let startPage;

var observer = null;

var taskHunt_timerId = null;

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
            /*
            if (docText.includes('👌')) { //Already done
                this.connect();
                return;
            };
            */

            //Check for error
            if (docText.includes('Не удалось')) {
                console.log('DoObuv-error! Canceled');
                this.connect();
                return;
            }

/*
        let url = 'https://www.phonewarez.ru/files/TW/smart-ctg-tree.json';
        //let url = 'https://www.phonewarez.ru/files/TW/example.json';

        console.log('SmartCtgTree.GET-0', url);
		$.get(url, '', function(data, textStatus) {
            this.saveUrl = url;
			console.log('SmartCtgTree.GET-1', this.saveUrl, textStatus, data);
		})
  .fail(function( jqXHR, textStatus, errorThrown ) {
    console.log( "SmartCtgTree.GET error", textStatus );
  })
*/
            if (!smart_tree) {
                smart_tree = new SmartCtgTree();
                smart_tree.Load_http();
            }

            //Auto-hunt
            let tasks = GetOfferedTasks();
            console.log('GetOfferedTasks.tasks', tasks);

            if (tasks.length==1 && !tasks[0].button) {
                //'Нет заданий' - reload after delay
                let reloadDelay = 30*1000;
                //let reloadDelay = 30 + getRandomInt(30); //30-59 sec

                clearTimeout(taskHunt_timerId);
                taskHunt_timerId = setTimeout(function() {
                    //console.log('GetOfferedTasks - reload');
                    sessionStorage.setItem('th_beepEnabled', true); //Использую sessionStorage потому что th_beepEnabled должен сохраниться после перезагрузки страницы
                    window.location.reload();
                },
                reloadDelay);
            }

            if (tasks.length>0 && tasks[0].button) {
                //have some tasks
                console.log('GetOfferedTasks - has some');
                if (sessionStorage.getItem('th_beepEnabled')=='true') { // Сравниваем строки - getItem() всегда возвращает string!
                    //PlayAudio('zvukogram-iphone-text-message.mp3');
                    PlayAudio();

                    //console.log('GetOfferedTasks - PlayAudio');
                    sessionStorage.setItem('th_beepEnabled', false);
                }

            }


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

/*
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
*/

//Returns -1=not a start page; 0 - no jobs; 1 - jobs availabel
function DetectStartPage() {
    let tasks = GetOfferedTasks();

    if (tasks.length==0) return -1;

    if (tasks.length==1 && !tasks[0].button) return 0;

    return 1;
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
    {'key':'Товар на картинке действительно относится к указанной категории?', 'RButton':0},
    {'key':'Даны два изображения', 'RButton':[0,2,4,6]},
    {'key':'Товар подходит для размещения на главной странице?', 'RButton':0},



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
    //"Прослушайте аудио и выберите наилучшую транскрипцию",
    "Клиент формулирует свой запрос в поиск или поддержку",
    //"Исполнитель (БЕЗ ИП)",
    "Анализ отзывов",
    "В какой аудиозаписи голос больше похож на оригинал",
    //"Прослушайте аудио и выберите наилучшую транскрипцию",
];

function IsIgnoredTask(docText) {
  for(let t of ignoredTasks) if (docText.includes(t)) return true;
  return false;
}

function ExitTask_v0() {
    const Z_BUTTON_CLICKED = "z-button-clicked";

    let btns = document.querySelectorAll("button");

    let exitBtns = [null, null, null];
    for(let b of btns) {
        if (b.innerText.includes("Выйти из задания")) exitBtns[0] = b;
        if (b.innerText.includes("Да, выйти")) exitBtns[1] = b;
        if (b.innerText.includes("Начать")) exitBtns[2] = b; //Что делать с кнопкой начать?
    }

    //console.log('ExitTask.btns', exitBtns);

    if (!exitBtns[0] && !exitBtns[1]) return; //Нет кнопок

    if (exitBtns[0] && !exitBtns[1]) //Только первая кнопка
    {
        if (!exitBtns[0].classList.contains(Z_BUTTON_CLICKED)) {
            exitBtns[0].classList.add(Z_BUTTON_CLICKED);

            //exitBtns[0].click();
            setTimeout(function () {exitBtns[0].click()}, 500);

            console.log('ExitTask.click-0');
        } else {
            console.log('ExitTask.alreadyClicked-0');
        }

    }

    if (exitBtns[0] && exitBtns[1]) //Обе кнопки
    {
        exitBtns[0].classList.remove(Z_BUTTON_CLICKED);

        //exitBtns[1].click();
        setTimeout(function () {exitBtns[1].click()}, 500);

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
            console.log('Ignored task');
            ExitTask();
        } else {
            PresetCommonDefaults();
        }
    } else {
        let func = taskFuncs.get(taskCode);
        if (func) func(taskVersion, exam);
    }

} //RunTask()


//Return [{'title':.., 'button':..}, ...]
function GetOfferedTasks() {
    // if idle
    let node = document.querySelector('dashboard h4');
    if (node && node.innerText=='Заданий пока нет') {
        return [{'title': node.innerText, 'button': null}];
    }

    //list of tasks
    let tasks = [];

    let task_items = document.querySelectorAll('task-item');
    if (task_items.length==0) return tasks;

    for (let tnode of task_items) {
        let hdr_node = tnode.querySelector('h6');
        let btn= tnode.querySelector('button');

        if (!hdr_node || hdr_node.innerText=='' || !btn) continue;

        tasks.push({'title': hdr_node.innerText, 'button': btn});
    } //for

    return tasks;
} //GetOfferedTasks

// *** ExitTask() ***
var et_data = {
		'timerId':null,
		'stage':0,
        'tryCount': 0,
		};

function ExitTask() {

//return;

    if (et_data.timerId>0) return; //Prevent re-entry

    et_data.stage = 10; //wait "Начать" button

    et_data.timerId = setInterval(ExitTask_onTimer, 200);

    console.log('ExitTask.start ***', et_data);

    return;
} //ExitTask

function ExitTask_onTimer() {

    console.log('ExitTask_onTimer', et_data);

    //Если присутствует кнопка 'Начать'..
    if (et_data.stage==10) {
        let res = ExitTask_clickBtn('button.tui-space_top-6', 'Начать');

        if (res==BC_OK) {et_data.tryCount=0; et_data.stage=15}; // переход на закрытие pdf
        if (res==BC_TIMEOUT) {et_data.tryCount=0; et_data.stage=20}; //переход на кнопку 'Выйти..'

        return;
    } //if (stage==10)


    // Кнопка 'Начать' была обнаружена и нажата, ждем кнопку закрытия pdf
    if (et_data.stage==15) {
        let res = ExitTask_clickBtn('button.t-close', 'Закрыть');
        if (res!=BC_WAITING) {et_data.tryCount=0; et_data.stage=20}; //В любом случае переходим к кнопке 'Выйти..'

        return;
    } //if (stage==15)

    // Кнопка 'Выйти из задания'
    if (et_data.stage==20) {
        let res = ExitTask_clickBtn('button.task-exit-button', 'Выйти из задания');
        if (res!=BC_WAITING) {et_data.tryCount=0; et_data.stage=30}; //В любом случае переходим к кнопке 'Да, выйти..'

        return;
    } //if (stage==20)

    // Кнопка 'Да, выйти'
    if (et_data.stage==30) {
        let res = ExitTask_clickBtn('button.t-button', 'Да, выйти');
        if (res!=BC_WAITING) {et_data.tryCount=0; et_data.stage=85}; //В любом случае переходим к финальному блоку

        return;
    } //if (stage==30)

/*
    //Задержка перед финалом
    if (et_data.stage==80) {
        const FINAL_DELAY = 10;

        console.log('ExitTask_onTimer.final delay', et_data);

        et_data.tryCount++;
        if (et_data.tryCount>=FINAL_DELAY) {et_data.tryCount=0; et_data.stage=99} //На выход!

    return;
    }
*/
    //Ожидаем стартовой страницы - 'Клекс в мобильном приложении'
    if (et_data.stage==85) {
        const MAX_TRY = 10;

        console.log('ExitTask_onTimer.WaitStartPage', et_data);

        et_data.tryCount++;
        let docText = document.documentElement.textContent;
        if (et_data.tryCount>=FINAL_DELAY || docText.includes('Клекс в мобильном приложении')) {
            et_data.tryCount=0;
            et_data.stage=99; //На выход!
        }

        return;
    }


    //Final
    if (et_data.stage==99) {
		console.log('ExitTask_onTimer.exit 99', et_data);

        clearInterval(et_data.timerId);
        et_data.timerId = -1;
        et_data.stage = 0; //Idle
        et_data.tryCount = 0;

        //Блокируем работу ExitTask to N sec чтобы дать обновиться странице
        //et_data.disabled = true;
        //setTimeout(function () {et_data.disabled = false; console.log('ExitTask.afterFinalDelay')}, 1000);

    } // if (stage==99)




    if (et_data.stage==0) {
        //Странная ошибка? Таймер продолжает работать?
    }


} //ExitTask_onTimer

const BC_WAITING = 0;
const BC_OK = 1;
const BC_TIMEOUT = 2;

function ExitTask_clickBtn(btn_class, btn_title) {

    console.log('ExitTask_clickBtn', et_data, btn_class, btn_title);

    const MAX_TRY = 5;

    if (et_data.tryCount>=MAX_TRY) {
        console.log('ExitTask_clickBtn:timeout');
        return BC_TIMEOUT;
    } else {
        et_data.tryCount++;

        let btns = document.querySelectorAll(btn_class);
        for (let b of btns) {
            if (b.innerText.trim()==btn_title) { //Got it!
                triggerClick(b);
                console.log('ExitTask_clickBtn:clicked', btn_class, btn_title);
                return BC_OK;
            }
        } //for(btns)

		console.log('ExitTask_clickBtn:btn not found');
        return BC_WAITING;
    } //if (tryCount)

    //Здесь я не могу оказаться!
    console.log('ExitTask_clickBtn:waiting', et_data);
    return BC_WAITING;
} //ExitTask_clickBtn
