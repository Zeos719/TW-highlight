/*
<div _ngcontent-ng-c2192362928="" automation-id="flex-header" class="flex-header__content tui-text_h6">
Произнесено ли предложение с вопросительной интонацией?
</div>

document.querySelector('.tui-editor-socket').textContent
*/

var	smart_cat = null;
var smart_tree = null;

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

//******************** class SmartCtgTree - load categories tree ********************
class SmartCtgTree {
  //constructor(name) { this.name = name; }
  //sayHi() { alert(this.name); }

	constructor() {
		console.log('SmartCtgTree.constructor');

		this.URL = 'https://www.phonewarez.ru/files/TW/smart-ctg-tree.json';
		this.data = null;

	} //constructor
	
	Load_http(){
		console.log('SmartCtgTree.Load_http', this.URL);

		let myself = this;  //save 'this' for use inside callback!!!

		$.get(this.URL, { "_": $.now() }, function(data){
			console.log('SmartCtgTree.GET-func', data.length);
			
			//myself.data = data;
			
			myself.data = [];
			for (let ctg of data) myself.data.push( [ctg.cat1_name, ctg.cat2_name, ctg.cat3_name] );						
		} )
		.fail(function( jqXHR, textStatus, errorThrown ) {
			console.log( "SmartCtgTree.GET-fail error", textStatus, errorThrown )
		  })
		.done(function() {
			console.log( "SmartCtgTree.GET-done", myself.data );			
		})  
		
		return;
	}; //Load_http

	GetSuitableCtgs(hint) {
		const IGNORE = '<<NOTUSED>>'

		//prepare hint	
		hint = hint.toLowerCase().replace('.', ',');
		hint = hint.split(',');
		if (hint.length==2) hint.push(IGNORE).reverse();
		if (hint.length==1) hint.push([IGNORE, IGNORE]).reverse();
				
		//search		
		let ctgs = [];
		for (let ctg in this.data) {
			
			
			
			
			
			return ctgs;
		} //for
		
		
		return ['Category 1: ' + hint , 'Category 2: ' + hint];
	}

}; //SmartCtgTree

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
		this.PrintQuickJump();
		this.PrintLastCtgs();


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



		//* Add div *
		
		//div-overlay		
		const div_ovr = document.createElement('div');
		div_ovr.className = 'z-overlay';
		
		//for text
/*		
		div_ovr.style.cssText = "\
            position: fixed; // Фиксируем положение элемента относительно окна браузера \
            top: 40px;\
            right: 15px;\
            //background-color: rgba(255, 255, 255, 0.8); // Полупрозрачный фон \
			background-color: rgba(255, 255, 255, 1); //Полупрозрачный фон \
            border: 3px solid #888; // Рамка серого цвета толщиной 3px \
            box-sizing: border-box; // Учитываем толщину рамки внутри размера блока \
            width: calc(100vw / 3); // Ширина одной трети ширины экрана \
            height: calc(100vh * 0.50); // Высота 50% высоты экрана \
            display: flex;\
            //justify-content: center;\
			justify-content: left;\
            align-items: center;\
            z-index: 1000; //Устанавливаем элемент поверх всех остальных \
		";
*/
		//for buttons
		div_ovr.style.cssText = "\
            position: fixed; /* Зафиксирован относительно окна браузера */\
            top: 40px;\
            right: 15px;\
            width: calc(100vw / 3); /* Ширина = треть ширины экрана */\
            height: calc(100vh * 0.40); // Высота 40% высоты экрана \
            background-color: white; /* Белый фон */\
            border: 3px solid gray; /* Серый контур шириной 3 пикселя */\
            display: flex; /* Используем Flexbox для размещения кнопок */\
            flex-direction: column; /* Кнопки расположены друг над другом */\
            gap: 5px; /* Расстояние между кнопками */\
            padding-left: 10px; /* Левое расстояние от края */\
            padding-right: 10px; /* Правое расстояние от края */\
			padding-top: 5px;\
		";

	
		//Прикрепляем к элементу, который будет удален при обновлении
		let parent_node = document.querySelector('tui-editor-socket');
		if (parent_node) parent_node.appendChild(div_ovr);

		let div_chi;
		let nd;
		
		//div-edit
		div_chi = document.createElement('div');
		div_chi.id = 'div-quick-jump';
		div_chi.style.cssText = "\
            display: flex; /* Используем Flexbox для размещения кнопок */\
            flex-direction: column; /* Кнопки расположены друг над другом */\
            gap: 5px; /* Расстояние между кнопками */\
            padding-left: 10px; /* Левое расстояние от края */\
            padding-right: 10px; /* Правое расстояние от края */\
			//padding-top: 5px;\
		";
		
		//nd = document.createTextNode('А вот и я');		
		nd = document.createElement('div');		
		nd.id = 'quick-jump-lbl';		
		nd.textContent = 'А вот и я';
		div_chi.appendChild(nd);			

		nd = document.createElement('input');
		nd.id = 'quick-jump-imput';
		nd.oninput = this.Edit_oninput;		
		div_chi.appendChild(nd);			
		this.QJmp_edit = nd;
		
		//nd = document.createElement('button');
		//nd.className = 'button-z';
		//nd.innerText = 'Click me!';			
		//div_chi.appendChild(nd);			

		nd = document.createElement('div');		
		nd.id = 'quick-jump-ctgs';		
		//nd.textContent = 'А вот и я';
		div_chi.appendChild(nd);			


		nd = document.createElement('hr');
		div_chi.appendChild(nd);			


		div_ovr.appendChild(div_chi);		

		//div-buttons
		div_chi = document.createElement('div');
		div_chi.id = 'div-prev-choices';

		div_ovr.appendChild(div_chi);		
				
	} //AddOverlay

	Edit_oninput() {
		let hint = this.QJmp_edit.value;
		this.PrintSuitableCtgs(hint);
	};

	DeleteOverlay() {
		//const div = document.querySelector('div.z-overlay');
		const div = document.querySelector('#div-prev-choices');
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

	PrintLastCtgs() {
		const CHOICE_TRESHOLD = 1.0;
		const MAX_BUTTONS = 7;
		
		//const div = document.querySelector('div.z-overlay');
		const div = document.querySelector('#div-prev-choices');
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
		
		//console.log('SmartCatalog.PrintLastCtgs', items_byKey);		
		
		//Create buttons
		for (let a of items_byKey) {			
			let btn = document.createElement('button');
			btn.className = 'button-z';
			btn.innerText = `${a[0]}:${a[1].toFixed(2)}`;
			btn.onclick = this.OnClick_btn;
			
			div.appendChild(btn);			
		} //for		
		
	} //PrintLastCtgs
	
	PrintQuickJump() {
		//Tree is reday
		let txt;
		if (smart_tree && smart_tree.data) {
			txt = `Categories are loaded: ${smart_tree.data.length}`
		} else {
			txt = 'Categories are absent!'
		}
		
		let nd = document.querySelector('#quick-jump-lbl');
		//let nd = $("#div-quick-jump").contents().filter(function() {
		//	return this.nodeType == Node.TEXT_NODE;
		//})//.text();
		
		console.log('SmartCatalog.PrintQuickJump', nd);
		if (nd) nd.textContent = txt;
		
		
	} //PrintQuickJump

	PrintSuitableCtgs(hint) {
		if (!smart_tree) return;
		
		let ctgs = smart_tree.GetSuitableCtgs(hint);
		
		let content = '';
		for (ct of ctgs) content += ct + 'br/';
		
		let nd = document.querySelector('#quick-jump-ctgs');
		if (nd) nd.innerHTML = content;
		
		
	} //PrintSuitableCtgs

	
	OnClick_btn(elem) {
		let ctgPath = elem.currentTarget.innerHTML;
		console.log('SmartCatalog.OnClick_btn', ctgPath);
		smart_cat.SelectCtg(ctgPath);		
	}

	/* 
	Симулирует клики по цепочке узлов, чтобы раскрыть путь к заданной категории
	catPath = "cat1|cat2|cat3"
	*/
	SelectCtg(catPath) {
		
		//Loop over categories		
		this.clickPath = catPath;
		//this.clickResult = false;
		this.clickStage = 1;
		this.clickTry = 0;
		this.CLICK_TRY_DELAY = 200;
		this.CLICK_MAX_TRY = 5;					
			
		this.clickTimerId = setInterval(this.SelectCtg_OnTimer, 
			this.CLICK_TRY_DELAY);		
		
		return;
	} //ClickChoice


	SelectCtg_OnTimer() {
		//console.log('SmartCatalog.SelectCtg_OnTimer', smart_cat.choice, smart_cat.stage);
		
		//pat = 'a'|b|c:3'
		let ctgs = smart_cat.clickPath.split('|');		
		if (ctgs.length>0) {
			let c = ctgs.pop();
			ctgs.push( c.split(':')[0] );
		}
			
		

		if (smart_cat.SelectCtg_trigger(ctgs[ smart_cat.clickStage-1 ])) {
			if (smart_cat.clickStage==ctgs.length) {
				//All done Ok
				clearInterval(smart_cat.clickTimerId)
				smart_cat.clickStage = 0;
				//smart_cat.clickResult = true;
				console.log('SmartCatalog.SelectCtg Ok', smart_cat.clickStage, smart_cat.clickTry, smart_cat.clickPath);				
			} else {
				//Continue to next stage
				smart_cat.clickStage += 1;
				smart_cat.clickTry = 0;										
			}							
		} else {
			// SelectCtg_trigger failed
			if (smart_cat.clickTry<smart_cat.CLICK_MAX_TRY) {
				//Just one more try
				smart_cat.clickTry += 1; 					
			} else {
				//Final failure after max tries
				clearInterval(smart_cat.clickTimerId)
				smart_cat.clickStage = 0;
				//smart_cat.clickResult = false;
				console.log('SmartCatalog.SelectCtg failed', smart_cat.clickStage, smart_cat.clickTry, smart_cat.clickPath);					
			}				
		} //if SelectCtg_trigger
					
	} //ClickChoice_OnTimer


	//path - as list, stage = 1-3
	SelectCtg_trigger(category_title) {
		let ok = false;
		
		//let divs = document.querySelectorAll('flex-selection-tree div');
		let divs = document.querySelectorAll('[automation-id="selection-tree__child__body"]')
				
		for (let d of divs) {
			if (d.innerText==category_title) {
				triggerClick(d);
				
				d.scrollIntoView();
				
				ok = true;
				break;
			}	
		} //for

		console.log('SmartCatalog.SelectCtg_trigger', divs.length, ok, category_title);					

		return ok;
	}	


} //SmartCatalog
