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

		//Add css for buttons
		const style = document.createElement('style');
		style.type = 'text/css';
		/*
		style.innerHTML = ".button-z {\
			//display: block;\
            //background-color: white;\
            //border: 2px solid #ccc;\
            //color: black;\
            padding: 10px 0;\
            width: 100%;\
            box-sizing: border-box;\
            cursor: pointer;\
            text-align: left;\
            padding-left: 10px;\
            margin-bottom: 5px;\
            border-radius: 5px;\
        }";
		*/
		style.innerHTML = ".button-z {\
		    width: 100%; /* Ширина равна ширине родительского элемента */\
            //height: calc((100% - 4*5px)/5); /* Равномерное распределение высоты между пятью кнопками */\
            outline: none; /* Без границ вокруг кнопок при фокусировке */\
            cursor: pointer; /* Курсор меняется при наведении */\
			\
			text-align: left;\
			padding-left: 10px;\
        }";

		
			
		if (document.head) {
			console.log('SmartCatalog.AddOverlay button-z', );
			document.head.appendChild(style);
		}

		//Add div
		const div = document.createElement('div');
		div.className = 'z-overlay';
		

		//for text
/*		
		div.style.cssText = "\
            position: fixed; // Фиксируем положение элемента относительно окна браузера \
            top: 40px;\
            right: 15px;\
            //background-color: rgba(255, 255, 255, 0.8); // Полупрозрачный фон \
			background-color: rgba(255, 255, 255, 1); //Полупрозрачный фон \
            border: 3px solid #888; // Рамка серого цвета толщиной 3px \
            box-sizing: border-box; // Учитываем толщину рамки внутри размера блока \
            width: calc(100vw / 3); // Ширина одной трети ширины экрана \
            height: calc(100vh / 3); // Высота одной трети высоты экрана \
            display: flex;\
            //justify-content: center;\
			justify-content: left;\
            align-items: center;\
            z-index: 1000; //Устанавливаем элемент поверх всех остальных \
		";
*/
		//for buttons
		div.style.cssText = "\
            position: fixed; /* Зафиксирован относительно окна браузера */\
            top: 40px;\
            right: 15px;\
            width: calc(100vw / 3); /* Ширина = треть ширины экрана */\
            height: calc(100vh / 3); /* Высота = треть высоты экрана */\
            background-color: white; /* Белый фон */\
            border: 3px solid gray; /* Серый контур шириной 3 пикселя */\
            display: flex; /* Используем Flexbox для размещения кнопок */\
            flex-direction: column; /* Кнопки расположены друг над другом */\
            gap: 5px; /* Расстояние между кнопками */\
            padding-left: 10px; /* Левое расстояние от края */\
            padding-right: 10px; /* Правое расстояние от края */\
			padding-top: 5px;\
		";

		//div.innerHTML = 'Hello, World!';
		
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
		const CHOICE_DECAY = 0.85;
		
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
		const MAX_BUTTONS = 5;
		
		const div = document.querySelector('div.z-overlay');
		if (!div) return;
		
		//Remove existing buttons
		let btns = div.querySelectorAll('button');
		for (let b of btns) b.remove();
		
		
		//Convert to list and sort on Count
		let items_byCount = [];
		
		for (let key in this.LastChoices) items_byCount.push([key, this.LastChoices[key]]); 
		items_byCount.sort(function(a, b) {return b[1]-a[1]}); //descending order - largest first 
		
		//Get top values and sort by key
		let items_byKey = items_byCount.slice(0, MAX_BUTTONS);						
		items_byKey.sort(function (a, b) {return a[0].localeCompare(b[0])});
		
		console.log('SmartCatalog.PrintChoices', items_byKey);		
		
		//Create buttons
		for (let a of items_byKey) {			
			let btn = document.createElement('button');
			btn.className = 'button-z';
			btn.innerText = `${a[0]}:${a[1].toFixed(2)}`;
			btn.onclick = this.OnClick_btn;
			
			div.appendChild(btn);			
		} //for		
		
	} //PrintChoices

	OnClick_btn(elem) {
		console.log('SmartCatalog.OnClick_btn', elem.currentTarget.innerHTML);
	}

	// choice = "cat1|cat2|cat3"
	ClickChoice(choice) {
		choice = choice.split('|');
		
		this.clickPath = choice;
		//this.clickResult = false;
		this.clickStage = 1;
		this.clickTry = 0;
		this.CLICK_TRY_DELAY = 200;
		this.CLICK_MAX_TRY = 5;
						
		//Loop over categories		
		this.clickStage = 1;
		this.clickTry = 0;
			
		this.clickTimerId = setInterval(ClickChoice_OnTimer, 
			this.CLICK_TRY_DELAY);		
		
		return;
	} //ClickChoice


	ClickChoice_OnTimer() {
		//console.log('SmartCat.ClickChoice_OnTimer', smart_cat.choice, smart_cat.stage);

		if (ClickChoice_trigger(smart_cat.clickPath, smart_cat.clickStage)) {
			if (smart_cat.clickStage==smart_cat.clickPath.length) {
				//All done Ok
				clearInterval(smart_cat.clickTimerId)
				smart_cat.clickStage = 0;
				//smart_cat.clickResult = true;
				console.log('ClickChoice Ok', smart_cat.stage, smart_cat.clickTry, smart_cat.clickPath);				
			} else {
				//Continue to next stage
				smart_cat.clickStage += 1;
				smart_cat.clickTry = 0;										
			}							
		} else {
			// ClickChoice_trigger failed
			if (smart_cat.clickTry<smart_cat.CLICK_MAX_TRY) {
				//Just one more try
				smart_cat.clickTry += 1; 					
			} else {
				//Final failure after max tries
				clearInterval(smart_cat.clickTimerId)
				smart_cat.clickStage = 0;
				//smart_cat.clickResult = false;
				console.log('ClickChoice failed', smart_cat.stage, smart_cat.clickTry, smart_cat.clickPath);					
			}				
		} //if ClickChoice_trigger
					
	} //ClickChoice_OnTimer


	//path - as list, stage = 1-3
	ClickChoice_trigger(path, stage) {
		let ok = false;
		let divs = document.querySelectorAll('flex-selection-tree div');
		for (let d of divs) {
			if (d.innerText==path[stage-1]) {
				triggerClick(d);
				ok = true;
				break;
			}	
		} //for
		
		return ok;
	}	


} //SmartCatalog
