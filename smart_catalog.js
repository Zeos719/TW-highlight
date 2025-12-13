/*
<div _ngcontent-ng-c2192362928="" automation-id="flex-header" class="flex-header__content tui-text_h6">
Произнесено ли предложение с вопросительной интонацией?
</div>

document.querySelector('.tui-editor-socket').textContent
*/

var	smart_cat = null;

function DoSmartCat(taskVesrion, exam) {
	if (smart_cat==null) {
		smart_cat = new SmartCatalog();
	}

	try {
		smart_cat.Run()
	} catch(err) {
		console.log('SmartCatalog.DoSmartCat', err)
	}


};


//******************** class SmartCatalog ********************
class SmartCatalog {
  //constructor(name) { this.name = name; }
  //sayHi() { alert(this.name); }

	constructor() {
		console.log('SmartCatalog.constructor');

		this.Answers = []; //for Auto
		this.LastChoices = {};

		this.GREEN_COLOR_LIGHT='#e6fff2';
		this.RED_COLOR_LIGHT  ='#ffe6e6';

	} //constructor

	//*** Events ***
	handleEvent(e) {
				//Ctrl-Enter
				if (e.type=="keydown") {
					this.onCtrlEnter(e);
					}

				if (e.type=="click") {
					this.onBtnClick(e);
					}

				this.DeleteOverlay();

			}//handleEvent

	onCtrlEnter(e) {
		let choice = -1;

		//Ctrl-Enter
		if (e.ctrlKey && (e.keyCode == 13 || e.keyCode == 10)) {
			console.log('SmartCatalog.onCtrlEnter: CtrlEnter--');

			if (SEND_TO_SERVER) {
				choice = this.SendToServer()
			} else {
				choice = 0; //?!
			}

			//Remove listeners
			if (choice!=-1) {
				document.removeEventListener("keydown", this);

				let completeBtn = document.querySelector("#completeBtn");
				completeBtn.removeEventListener("click", this);
			}
		}

		//console.log('Obuv.onCtrlEnter-key', e.key, e.keyCode, e.code);

		//Toggle AutoRun
		if (e.ctrlKey && (e.keyCode == 192)) { //Ctrl + ~
			console.log('SmartCatalog.onCtrlEnter: AutoRun');
			autoRun = !autoRun;
			this.DrawAutoIndicator(autoRun);
		}

	} //onCtrlEnter()

	onBtnClick(e) {
		console.log('SmartCatalog.onOkClick');
		let choice = -1;

		if (SEND_TO_SERVER) {
			choice = this.SendToServer()
		} else {
			choice = 0; //?!
		}

		//Remove listeners
		if (choice!=-1) {
			document.removeEventListener("keydown", this);

			let completeBtn = document.querySelector("#completeBtn");
			completeBtn.removeEventListener("click", this);
		}
	} //onBtnClick()

	SendToServer() {
		if (!smart_cat) return -1;

		let sol = this.GetSolution();
		if (!sol) return;

		this.UpdateChoices(sol);

		let payload = {
			task: 'SmartCatalog',
			//subtask: this.subtask,
			descr: this.descr || '',
			href: this.href || '',
			solution: sol,
		};

		console.log('SmartCatalog.SendToServer-1: ', payload);

		let json = JSON.stringify(payload);

		$.post('http://localhost:8000/tw', json, function(data){
			console.log('SmartCatalog.SendToServer-2:', data);
		});

		return sol;

	} //SendToServer()

	DrawAutoIndicator(isOn) {
		console.log('SmartCatalog.DrawAutoIndicator');

		let completeBtn = document.querySelector("#completeBtn");

		if (completeBtn && !Object.hasOwn(this, 'originalText')) this.originalText = completeBtn.textContent;

		if (isOn) {
			const mark = '\u00A0💥'; //☑ ▶💥😎✔✈
			if (!completeBtn.textContent.includes(mark))
				completeBtn.textContent = this.originalText + mark;
		} else {
			//completeBtn.style.background = '';
			completeBtn.textContent = this.originalText; //'Завершить задание';
		}
	} //DrawAutoIndicator()



	//**** Main ****
	Run() {

		//check 'Done' mark
		if (document.querySelector('div.z-done-mark')) {
			console.log('SmartCatalog-already done');
			return;
		}

		// Attach handlers to track exit
		let completeBtn = document.querySelector("#completeBtn");
		completeBtn.addEventListener("click", this);

		document.addEventListener("keydown", this);

		//Main
		this.DrawAutoIndicator(autoRun);

		this.GetDescr();
		console.log('SmartCatalog.descr', this.descr, this.link);

		if (!document.querySelector('div.z-overlay')) this.AddOverlay();
		this.PrintChoices();


		//Append 'Done' marker
		{ // If valid Answers were loded..
			let doneMark = document.createElement('div');
			doneMark.className = 'z-done-mark';
			//this.queNode.appendChild(doneMark);
		}


	} //Run()

	GetDescr() {
		this.descr = null;
		this.href = null;

		let node = document.querySelector('.tui-editor-socket');
		if (node) this.descr = node.innerText;

		let nodes = document.querySelectorAll('a');
		if (nodes && nodes.length>=3) this.href = nodes[2].href;

		return;
	} //GetDescr()

	GetSolution() {
		return this.GetSelectedPath();
	} //GetSolution()

	//Путь к выбранной категории в виде 'cat_1|cat_2}cat_3'
	GetSelectedPath() {
		let path = '';

		//Categories
		let nodes = document.querySelectorAll('div.child__header_child-selected');
		for (let nd of nodes) path += nd.innerText + '|';

		//Final node
		let nd = document.querySelector('div.child__text_with-check');

		if (!path && !nd) return;

		if (nd) {
			path += nd.innerText;
		} else {
			path += '?';
		};

		return path;
	} //GetSelectedPath

	AddOverlay() {
		//console.log('SmartCatalog.AddOverlay');
/*
		//Add css for buttons
		const style = document.createElement('style').
		style.innerHTML = '.button-z {\
            display: block;\
            background-color: white;\
            border: 2px solid #ccc;\
            color: black;\
            padding: 10px 0;\
            width: 100%;\
            box-sizing: border-box;\
            cursor: pointer;\
            text-align: left;\
            padding-left: 10px;\
            margin-bottom: 5px;\
            border-radius: 5px;\
        }';
			
		document.head.appendChild(style);
*/
		//Add div
		const div = document.createElement('div');
		div.className = 'z-overlay';

		div.style.cssText = "\
            position: fixed; /* Фиксируем положение элемента относительно окна браузера */ \
            top: 40px;\
            right: 15px;\
            //background-color: rgba(255, 255, 255, 0.8); /* Полупрозрачный фон */\
			background-color: rgba(255, 255, 255, 1); /* Полупрозрачный фон */\
            border: 3px solid #888; /* Рамка серого цвета толщиной 3px */\
            box-sizing: border-box; /* Учитываем толщину рамки внутри размера блока */\
            width: calc(100vw / 3); /* Ширина одной трети ширины экрана */\
            height: calc(100vh / 3); /* Высота одной трети высоты экрана */\
            display: flex;\
            //justify-content: center;\
			justify-content: left;\
            align-items: center;\
            z-index: 1000; /* Устанавливаем элемент поверх всех остальных */\
		";

		div.innerHTML = 'Hello, World!';
		
		//document.body.appendChild(div);
		//Прикрепляем к элементу, который будет удален при обновлении
		let nd = document.querySelector('tui-editor-socket');
		if (nd) nd.appendChild(div);
				
	} //AddOverlay

	DeleteOverlay() {
		const div = document.querySelector('div.z-overlay');
		if (div) div.remove()
	} //DeleteOverlay

	UpdateChoices(sol) {
		const CHOICE_WEIGHT = 3.0;
		const CHOICE_DECAY = 0.8;
		
		if (sol in this.LastChoices) {
			this.LastChoices[sol] += CHOICE_WEIGHT;
		} else {
			this.LastChoices[sol] = CHOICE_WEIGHT;
		}

		for (let key in this.LastChoices) this.LastChoices[key] *= CHOICE_DECAY

		console.log('SmartCatalog.LastChoices', this.LastChoices);
	} //UpdateChoices

	PrintChoices() {
		const CHOICE_TRESHOLD = 1.0;
		
		const div = document.querySelector('div.z-overlay');
		if (!div) return;

		let items = [];
		for (let key in this.LastChoices) {
			if (this.LastChoices[key]>CHOICE_TRESHOLD)
				items.push(key + ':' + this.LastChoices[key].toFixed(2));
				//txt +=  key + ':' + this.LastChoices[key].toFixed(2) + '<br\>';
		}
		
		items.sort();
		
		//Create buttons
		for (let txt of items) {			
			let btn = document.createElement('button');
			btn.className = 'button-z';
			btn.innerText = txt;
			
			div.appendChild(btn);			
		} //for		
		
	} //PrintChoices


} //SmartCatalog
