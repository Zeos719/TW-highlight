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

//*** Принимает в конструктор дерево вида [{name:'node1', children:[...]}, {name:'node2', children:[...]}]
// Поиск производится тоько по листьям! (не по промежуточным узлам)
class Ctg_Tree {
	
	//data from html
	constructor(orgData) {
		console.log('Ctg_Tree.constructor');
	
		let flatList = this.Traverse_tree(orgData);
		
		this.data = [];
		
		for (let item of flatList) {
			let path = item.join('|');
			let ctg = item[ item.length-1];
			
			this.data.push( {path, ctg} );
		};
		
		this.wordList = this.BuildWordLists();
		
	} //constructor

	// Returns list of elements like: [word, [ref1, ref2..]]
	//result ex.: ['a', [0,1]], ['b', [5]], ...   ]
	BuildWordLists() {		
		let wList = [];
	
		for (let i=0;i<this.data.length;i++) {
			let words = this.data[i].ctg;				
			
			words = words.replace(/[,\(\)]/g, ' '); // ',()'
			words = words.toLowerCase().split(' ');
			words = words.filter( (a)=>{return a!=''} );
							
			for (let w of words)
				wList.push( [w, [i]] );					
		} //for
		
		wList = this.CombineSameWords(wList);			
		
		return wList;		
	}//BuildWordLists()

	CombineSameWords(arr) {
		if (arr.length<=1) return arr;
	
		//Remove duplicates and summarize references
		let compare_fn = function (a,b) {return a[0].localeCompare(b[0])}
		
		let sorted = arr;
		sorted.sort( compare_fn );
				
		let prev = sorted[0];
		let unique = [ prev ]; //[ '', []  ]
						
		for (let i=1;i<sorted.length;i++) {
			let w = sorted[i];
					
			if(compare_fn(prev, w)!=0) {
				//Add new
				prev = w;
				unique.push( w );			
			} else {
				//Summarize
				let last = unique[unique.length-1];
				last[1].push( ...w[1] );			
			}		
		}//for

		// На всякий случай удалям повторы внутри каждого списка references
		for (let w of unique) { w[1] = UniqueSort(w[1]) }
		
		return unique;			
	} //CombineSameWords

	// Поиск вхождений по одному слову (префиксу)
	LocateWord(w) {
		let compare_fn = function (aa,bb) {
			let a=aa[0]; let b=bb[0]; 
			return a.localeCompare(b.slice(0,a.length)) }; //Только один slice! Чтобы педотвратить совпадение 'пол' с ключом 'поло'

		//this.data: [ .., [name, [refs]], ..]
		let idx = BinarySearch(this.wordList, [w], compare_fn); //Ok for [w]; compare_fn accepts two ARRAYS
		if (idx==-1) return null;
	
		let r = InflateSearchRange(this.wordList, [w], idx, compare_fn); //Again Ok for [w]; compare_fn accepts two ARRAYS
				
		//Объединяем все списки reference в найденных пределах 		
		let refs = [];
		for (let i=r[0];i<=r[1];i++) {
			let refs_i = this.wordList[i][1];
			refs.push( ...refs_i );
		} //for

		//console.log('refs', refs);										
		
		refs = UniqueSort(refs);
		return refs;		
	} //LocateWord

	//hint из нескольких слов: 'муж поло'. Ищем пересечение refs для всех слов. 
	// !Возвращает Set()!
	LocateHint(hint) {	
		hint = hint.toLowerCase().replace(/[,()]/g, ' ');
		hint = hint.split(' ');
		hint = hint.filter( (w)=>{return w!=''} );
		
		if (hint.length==0) return new Set();
	
		let refs_common = new Set( this.LocateWord( hint[0] ) );  
		
		for (let i=1;i<hint.length;i++) {
			let refs_i = new Set( this.LocateWord( hint[i] ) );  
			refs_common = refs_common.intersection(refs_i);
			
			if (refs_common.length==0) break;				
		} //for
	
		//console.log('Ctg_Tree.LocateHint', hint, refs_common);
	
		return refs_common; //Set()!
	} //LocateHint


	//Function for tree parsing (out of clsss)
	Traverse_tree(data) {
	
		let all_paths = [];				
				
		for (let ch_node of data) {				
			let ch_path = [];
			let ch_ret = this.Traverse_subtree(ch_node, ch_path);
			
			all_paths = all_paths.concat( ch_ret );						
		}
		
		return all_paths;
	} //Traverse_tree
	
	Traverse_subtree(node, path) {
	
		path.push(node.name);
		
		
		if (!node.children) {
			return [path];
		} else {
			let all_paths = [];		
		
			for (let ch_node of node.children) {
				let ch_path = path.slice(); //create shellow copy of path[]
				let ch_ret = this.Traverse_subtree(ch_node, ch_path);
				
				all_paths = all_paths.concat( ch_ret );		
			} //for
			
			return all_paths;
		} //if
	
		//I don't expected to be here! 
		
	} //Traverse_subtree



} //Ctg_Tree


//******************** class SmartCtgTree - load categories tree ********************
class SmartCtgTree {
  //constructor(name) { this.name = name; }
  //sayHi() { alert(this.name); }

	constructor() {
		console.log('SmartCtgTree.constructor');

		//this.URL = 'https://www.phonewarez.ru/files/TW/smart-ctg-tree.json';
		this.URL = 'https://www.phonewarez.ru/files/TW/smart-ctg-tree-v2.json';
		this.data = null;
		
		this.quickCtg = null;
	} //constructor
	
	Load_http(){
		console.log('SmartCtgTree.Load_http', this.URL);

		let myself = this;  //save 'this' for use inside callback!!!

		$.get(this.URL, { "_": $.now() }, function(data){
			console.log('SmartCtgTree.GET-func', data.length);
			
			myself.quickCtg = new Ctg_QuickSearch(data);			
		} )
		.fail(function( jqXHR, textStatus, errorThrown ) {
			console.log( "SmartCtgTree.GET-fail error", textStatus, errorThrown )
		  })
		.done(function() {
			//console.log( "SmartCtgTree.GET-done", myself.data );			
		})  
		
		return;
	}; //Load_http


	// hint='муж об' ctg='мужская обувь'
	 CompareWithCtg(hint, ctg) {
	
		hint = hint.toLowerCase().replace(/[,()]/g, '');
		hint = hint.split(' ');
		hint = hint.filter( (w)=>{return w!=''} );
		hint = hint.slice(0, this.NUM_CTGS);
		
		ctg = ctg.toLowerCase();
		ctg = ctg.split(' ').filter( (w)=>{return w!=''} );
		
		//console.log('CWC', hint, ctg);
		
		if (hint.length==0) return false;
		
		for (let h of hint) {		
			let gotIt = false;
			ctg.forEach( (ct)=>{ gotIt = gotIt || ct.startsWith(h) } );
			
			if (!gotIt) return false;
		};
	
		return true;
	} //CompareWithCtg

	//hints = 'abc,cd ef' ctgs = Array(this.NUM_CTGS)
	CompareWithCtgGroup(hints, ctgs) {
		hints = hints.split(',').slice(0,this.NUM_CTGS);
		
		if (hints.length==0) return false;
				
		let skipTill = this.NUM_CTGS - hints.length;		
		let ok = true;
		
		//console.log('CWCG', skipTill, hints);
				
		for(let i=skipTill;i<this.NUM_CTGS;i++) {
			ok = ok && this.CompareWithCtg(hints[i-skipTill], ctgs[i]);			
		} //for

		return ok;
	} //CompareWithCtgGroup

	//hint = 'об,муж кр' )
	GetSuitableCtgs_quick(hint) {		
		if (!this.quickCtg) return [];
	
		let refs = this.quickCtg.LocateHint( hint );
			
		//converts refs to ctgs
		let ctgs_ok = [];
		
		for (const r of refs) 
			ctgs_ok.push( this.data[r].path );

		return ctgs_ok;
	} //GetSuitableCtgs_quick


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
		
		this.QuickJump_prev = {'hint':'', 'paths':[]};
		
		this.linkTabs = [];
		this.linkHref = null;
		this.prevLinkHref = null;
		

	} //constructor

	//*** Events ***
	handleEvent(e) {
				//Ctrl-Enter
				if (e.type=="keydown") {
					this.onKeydown(e);
					}

				if (e.type=="click") {
					this.onBtnClick(e);
					}

				this.DeleteOverlay();

			}//handleEvent

	onKeydown(e) {
		let choice = -1;

		//Ctrl-Enter
		if (e.ctrlKey && (e.keyCode == 13 || e.keyCode == 10)) {
			console.log('SmartCatalog.onKeydown: CtrlEnter--');

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

		//Open links
		if (e.ctrlKey && (e.code == "KeyM")) { //Ctrl + M
			let link = this.GetGoodsLink();
			
			if (link)
				this.OpenPreviewTab(link);
		}

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
		
		this.linkHref = this.GetGoodsLink();
		this.ClosePreviewTabs(this.linkHref);
		this.ModifyGoodsLink();

		this.GetDescr();
		console.log('SmartCatalog.descr', this.descr, this.link);
		
		if (!document.querySelector('div.z-overlay')) this.AddOverlay();
		this.PrintQuickJump();
		this.PrintLastCtgs();

		const commentEdit = document.querySelector('div.tiptap.ProseMirror');
		if (document.activeElement != commentEdit) {					
			let nd = document.getElementById('quick-jump-imput');
			if (nd) nd.focus();
		}

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

	//Путь к выбранной категории в виде 'cat_1|cat_2|cat_3'
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
		nd.onkeydown = this.Edit_onkeydown;		
		

		div_chi.appendChild(nd);			
		
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

		//Exit button
		nd = document.createElement('hr');
		div_ovr.appendChild(nd);			

		nd = document.createElement('button');
		nd.className = 'button-z';
		nd.style['text-align'] = 'center';
		nd.style['background-color'] = 'gold';
		
		let completeBtn = document.querySelector("#completeBtn");
		nd.onclick = function(elem) { triggerClick(completeBtn) };
		
		nd.innerText = 'Завершить задание';			
		div_ovr.appendChild(nd);			
				
	} //AddOverlay

	Edit_oninput() {		
		let nd = document.getElementById('quick-jump-imput');
		//console.log('SmartCatalog.Edit_oninput', nd);
		if (nd) {
			let hint = nd.value;
			smart_cat.PrintSuitableCtgs(hint);
		}
	} //Edit_oninput

	Edit_onkeydown(e) {
		//console.log('SmartCatalog.Edit_onkeydown', e.ctrlKey, e.key);		
		if (!e.ctrlKey && (e.keyCode == 13 || e.keyCode == 10)) {									
			let div = document.querySelector('#quick-jump-ctgs');					
			if (!div) return;						
			
			/* strings
			let ctgPath = div.innerHTML;
			//console.log('SmartCatalog.Edit_onkeydown', ctgPath);	
			
			if (!ctgPath || ctgPath.indexOf('<br/>')>=0) return; //Должен быть строго один путь						
			*/
			
			//buttons
			let btns = div.querySelectorAll('button');
			if (btns.length==1) { //Должна быть строго одна кнопка
				//let ctgPath = btns.firstChild.innerText;
				//smart_cat.SelectCtg(ctgPath);									
				btns[0].click();
			};			
		}
	} //Edit_onkeydown

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
	
		//Remove old 
		const MIN_FREQ = 0.5;
		items_byKey = items_byKey.filter((a)=>{return a[1]>MIN_FREQ});
			
		//console.log('SmartCatalog.PrintLastCtgs', items_byKey);		
		
		//Format titles	for buttons
		let btns_info = [];
		for (let a of items_byKey) {			
			let title = a[0].split('|').pop();
			
			btns_info.push({'title':title, 'ctgPath':a[0], 'rate':a[1]});						
		}//for		
		
		btns_info.sort((a,b)=>{ return a['title'].localeCompare(b['title']) } );
		
		// console.log('SmartCatalog.PrintLastCtgs.btns_info', items_byKey, btns_info);
	
		//Create buttons
		//for (let a of items_byKey) {			
		for (let bi of btns_info) {			
			let btn = document.createElement('button');
			btn.className = 'button-z';

			//btn.innerText = `${a[0]}:${a[1].toFixed(2)}`;
			btn.innerText = `${bi['title']}:${bi['rate'].toFixed(2)}`;
			
			btn.onclick = this.OnClick_btn;
			
			btn['ctgPath'] = bi['ctgPath']; //Сохраняем путь для обработчика OnClick_btn
			
			div.appendChild(btn);			
		} //for		
			
	} //PrintLastCtgs
	
	PrintQuickJump() {
		//Tree is ready
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
		
		//console.log('SmartCatalog.PrintQuickJump', nd);
		if (nd) nd.textContent = txt;
		
		
	} //PrintQuickJump

	PrintSuitableCtgs(hint) {
		if (!smart_tree) return;
		
		let paths;
		
		if (hint!=this.QuickJump_prev.hint) //new hint
		{
			console.log('SmartCatalog.PrintSuitableCtgs', hint);
			this.QuickJump_prev.hint = hint;
			
			this.QuickJump_prev.paths = smart_tree.GetSuitableCtgs_quick(hint);			
		}
		paths = this.QuickJump_prev.paths; //Кешированное значение
							
		//* as buttons
		let div = document.querySelector('#quick-jump-ctgs');		
		if (!div) return;
		
		if (paths.length==0) {
			//Clear and return
			while (div.firstChild) {
				div.removeChild(div.lastChild);
				
			return;	
			} //while
		} 		
/*
		//Может быть, нужные кнопки уже добавлены?
		let alreadyDone = true;		
		let btns = div.querySelectorAll('button');
		
		for (let p of paths) {
			let gotIt = false;
			for (let b of btns) {if (b.innerText==p) gotIt = true};
			alreadyDone &&= gotIt;			
		} //for(p)
			
console.log('SmartCatalog.PrintSuitableCtgs.paths-2', paths.length, ctgs.length, alreadyDone);		

		if (alreadyDone) return;
*/
		//Remove old info
		while (div.firstChild) 
			div.removeChild(div.lastChild);
			
		//Format titles	for buttons
		let btns_info = [];
		for (let p of paths) {			
			let title = p.split('|').pop();
			
			btns_info.push({'title':title, 'ctgPath':p});						
		}//for		
		
		btns_info.sort((a,b)=>{ return a['title'].localeCompare(b['title']) } );
			
		//Add new ones		
		for (let bi of btns_info) {			
			let btn = document.createElement('button');
			btn.className = 'button-z';
			btn.innerText = bi.title;
			
			btn['ctgPath'] = bi.ctgPath; //Сохраняем путь для обработчика OnClick_btn
			
			btn.onclick = this.OnClick_btn; //Тот же обработчик, что и для кнопок из истории
			
			div.appendChild(btn);			
		} //for		

		//Label with total count of options	
		if (ctgs.length>MAX_PATHS) {
			let lbl = document.createElement('div');		
			lbl.textContent = `${ctgs.length}...`
			div.appendChild(lbl);					
		}
				
	} //PrintSuitableCtgs

	OnClick_btn(elem) {
		//let ctgPath = elem.currentTarget.innerHTML;
		let ctgPath = elem.srcElement['ctgPath'];
					
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


	SelectCtg_trigger(category_title) {
		let ok = false;
		let divs;
						
		//Проверяем, может быть путь уже открыт
		let alreadySelected = false;
		
		divs = document.querySelectorAll('div.child__header_child-selected'); //for stages 1,2
		for (let d of divs) alreadySelected ||= (d.textContent==category_title);
		
		divs = document.querySelectorAll('div.child__header_hover-selected'); //for stage 3
		for (let d of divs) alreadySelected ||= (d.textContent==category_title);
					
		//Click itself
		divs = document.querySelectorAll('[automation-id="selection-tree__child__body"]');
		
		for (let d of divs) {
			if (d.innerText==category_title) {
								
				if (!alreadySelected) triggerClick(d);
				
				//d.scrollIntoView();
				setTimeout(()=>{if (!isScrolledIntoView(d)) d.scrollIntoView()}, 400);										
				
				ok = true;
				break;
			}	
		} //for

		//console.log('SmartCatalog.SelectCtg_trigger', divs.length, ok, category_title);					

		return ok;
	}	

	GetGoodsLink() {
		let ret = document.querySelector('tui-editor-socket a');
			
		return ret.href;		
	} //GetGoodsLink
	
	OpenPreviewTab(linkHref) {
		// May new link are already is alreday open?
		let alreadyOpen = false;
		// this.linkTabs.forEach((a)=>{alreadyOpen ||= (a.href==linkHref) });
		if (alreadyOpen)
			return;		
		
		//Add new item to list and open previews
		let v0 = {tab:GM_openInTab(linkHref), href: linkHref};
		this.linkTabs.push( v0 );
			
		//console.log('SmartCatalog.OpenPreviewTabs', this.linkTabs.length);
		return;		
	} //OpenPreviewTab

	ClosePreviewTabs(activeLinkHref) {
		//Close last pre-view tabs
		let activeItem = null;		
		
		for (let item of this.linkTabs) {
			
			console.log('SmartCatalog.ClosePreviewTabs-0', item, activeLinkHref);
			
			if (item.href==activeLinkHref) {
				activeItem = item;
				continue; //Skip current
			}
			
			console.log('SmartCatalog.ClosePreviewTabs-1');
			
			if (item.tab==null || item.tab.closed) {
				continue;
			} else {
				console.log('SmartCatalog.ClosePreviewTabs-2 close');
				item.tab.close();
			}
		} //for
		
		//Remove closed tabs
		this.linkTabs = [];
		if (activeItem) this.linkTabs.push(activeItem);

		return;				
	} //ClosePreviewTabs

	ModifyGoodsLink() {
		let lnk = document.querySelector('tui-editor-socket a');
		if (lnk) {
			lnk.setAttribute('target', '_blank')
			lnk.style['background-color'] = 'Honeydew';			
		}		
	} //ModifyMainLink

} //SmartCatalog

