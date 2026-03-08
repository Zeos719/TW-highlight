// ==UserScript==
// @name         TW Rendez-Vous
// @namespace    http://tampermonkey.net/
// @version      2026-03-07
// @description  try to take over the world!
// @author       You
// @match        https://www.rendez-vous.ru/catalog/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=rendez-vous.ru
// @grant        none
// @require      file://C:/temp/Projects.tmp/Tinkoff-Kleks/Pair-highlighter/mixed-tools.js
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...

    let goods = document.querySelectorAll('.model-variants__list a');
    //console.log('goods', goods);
    if (goods) {
        let artcs = ExtractArticuls(goods);

        let ovr = document.querySelector('#z-overlay');
        if (!ovr) AddOverlay();

        let twinArt = Get_TwinArticul(artcs);

        console.log('articuls', Boolean(twinArt), artcs);

        PrintArticuls(artcs, twinArt);

        if (Boolean(twinArt))
            MarkupTitle( artcs.includes(twinArt) );
        //SendToServer(artcs);



    }

    function ExtractArticuls(links){
        let artcs = [];
        for (let lk of links) {
            let splited = lk.href.split('-');
            //let art = splited[splited.length-1];
            let art = splited.pop();
            art = art.replace('/', '')

            artcs.push(art);
        }

        return artcs;
    } //ExtractArticuls

	function AddOverlay() {
		//console.log('AddOverlay');

		//div-overlay
		const div_ovr = document.createElement('div');
		//div_ovr.className = 'z-overlay';
        div_ovr.id = 'z-overlay';

		//for text
/*
		div_ovr.style.cssText = "\
            position: fixed; // Фиксируем положение элемента относительно окна браузера \
            top: 140px;\
            right: 15px;\
            //background-color: rgba(255, 255, 255, 0.8); // Полупрозрачный фон \
			background-color: rgba(255, 255, 255, 0.3); //Полупрозрачный фон \
            border: 3px solid #888; // Рамка серого цвета толщиной 3px \
            box-sizing: border-box; // Учитываем толщину рамки внутри размера блока \
            width: calc(100vw / 3); // Ширина одной трети ширины экрана \
            height: calc(100vh * 0.20); // Высота 20% высоты экрана \
            display: flex;\
            //justify-content: center;\
			justify-content: left;\
            align-items: center;\
            z-index: 1000; //Устанавливаем элемент поверх всех остальных \
		";
*/
		div_ovr.style.cssText = "\
            position: fixed; /* Зафиксирован относительно окна браузера */\
            top: 150px;\
            right: 100px;\
            width: calc(100vw / 10); /* Ширина */\
            height: calc(100vh * 0.40); /* Высота  */ \
            background-color: LightCyan; /* Белый фон */\
            border: 3px solid gray; /* Серый контур шириной 3 пикселя */\
            display: flex; /* Используем Flexbox для размещения кнопок */\
            flex-direction: column; /* Кнопки расположены друг над другом */\
            gap: 5px; /* Расстояние между кнопками */\
            padding-left: 10px; /* Левое расстояние от края */\
            padding-right: 10px; /* Правое расстояние от края */\
			padding-top: 5px;\
		";

        document.body.append(div_ovr);
        return div_ovr;
	} //AddOverlay

    function PrintArticuls (artcs, twinArt) {
        let ovr = document.querySelector('#z-overlay');

        let nd = document.createElement('div');
        nd.textContent = 'Артикулы';
        ovr.append(nd);

        nd = document.createElement('hr');
        ovr.append(nd);

        for (let art of artcs) {
            nd = document.createElement('div');

            nd.innerHTML = art;
            if (art==twinArt) nd.style.color = 'red';

            ovr.append(nd);
        }

    } //PrintArticuls

    function SendToServer(artcs) {

        //let id = new URL(window.location.href);
        let id = StringHash(window.location.href);

        let json = {'href':window.location.href,
                    'articuls': artcs,
                   }

        http_POST(`http://localhost:8000/broker?id=${id}&task=rendez-vous`, json);

    } //SendToServer

    // 'https://www.rendez-vous.ru/catalog/female/lofery/tendance_ys_2299k_x20_svetlo_bezhevyy-4751856/?twinArt=4754575'
    function Get_TwinArticul(artcs) {
        let art = window.location.href.split('/').pop();

        if (art.includes('=')) {
            art = art.split('=').pop()
        } else {
            art = null
        }

        return art;
    } //Get_TwinArticul

    function MarkupTitle(hasTwin) {
        const marks = ['✗ ', '✔ ']; //✘

        if (!( document.title.includes(marks[0]) || document.title.includes(marks[1])) ) {
            document.title = marks[+hasTwin] + document.title; //Ok for '+' - converts Boolean to Integer
        }
    } //MarkupTitle

})();