var	gic = null;


function DoGoodsInCheck(task_version, exam) {	

	console.log('GiC.DoGoodsInCheck start');	
		
	if (gic==null) {
		gic = new GiC();
	}

	gic.task_version = task_version;

	try {
		gic.Run()
	} catch(err) {
		console.log('GiC.DoGoodsInCheck', err)
	}

} //DoGoodsInCheck



//*****
const entityMap = {
  //'&': '&amp;',
  '&': '%26',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};
function escapeHtml(string) {
  return String(string).replaceAll(/[&<>"'`=\/]/g, (s) => entityMap[s]);
}


//******************** class GiC ********************
class GiC {
  //constructor(name) { this.name = name; }
  //sayHi() { alert(this.name); }

	constructor() {
		console.log('GiC.constructor');

		//Constants
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

			}//handleEvent

	onCtrlEnter(e) {
		let choice = -1;

		//Ctrl-Enter
		if (e.ctrlKey && (e.keyCode == 13 || e.keyCode == 10)) {
			console.log('GiC.onCtrlEnter: CtrlEnter--');

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
				
				this.ReleaseNodes();
			}
		}

		//Toggle AutoRun
/*		
		if (e.ctrlKey && (e.keyCode == 192)) { //Ctrl + ~
			console.log('GiC.onCtrlEnter: AutoRun');
			autoRun = !autoRun;
			this.DrawAutoIndicator(autoRun);
		}
*/
	} //onCtrlEnter()

	onBtnClick(e) {
		console.log('GiC.onOkClick');
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
			
			clearTimeout(this.aiTimerId);
			this.ReleaseNodes();
		}
	} //onBtnClick()

	SendToServer() {
		
	//!!!!	
	return;	
		if (!gic) return -1;
			
		let nodeA; let nodeB;
		[nodeA, nodeB] = this.GetMainNodes();	
			
		if (nodeA.innerText.includes('backgroud')) return -1; //Already colorized

		let innerA = nodeA.innerText;	
		let innerB = nodeB.innerText;	

		idx = innerA.indexOf('Поиск товара');
		innerA = innerA.slice(0, idx).trim();

		idx = innerB.indexOf('Поиск товара');
		innerB = innerB.slice(0, idx).trim();

		//get user choice
		const radio_btns = document.querySelectorAll('input[type=radio]');
		
		let user_choice = -1;
		let i = 0
		for (const btn of radio_btns) 
			{if (btn.checked) user_choice = i; i++}
		
		if (user_choice==-1) return -1;
		
		let payload = {
			task: 'gic',
			links: [null,null],
			descr: [innerA, innerB],
			choice: user_choice		
		};	
		
		console.log('GiC_SendToServer: ', payload);
		
		let json = JSON.stringify(payload);
		
		/*
		$.post('http://localhost:8000/tw', json, function(data){
			console.log('GiC_SendToServer:', data);
		});
		*/
		
		http_POST('http://localhost:8000/tw', json);
		
		return user_choice;
	} //SendToServer()

/*
	DrawAutoIndicator(isOn) {
		console.log('GiC.DrawAutoIndicator');

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
*/

	//**** Main ****
	Run() {

		//check 'Done' mark
		if (document.querySelector('div.z-done-mark')) {
			console.log('GiC-already done');
			return;
		}

		// Attach handlers to track exit
		let completeBtn = document.querySelector("#completeBtn");
		completeBtn.addEventListener("click", this);

		document.addEventListener("keydown", this);

		//Main		
		//this.DrawAutoIndicator(autoRun);
		
		let recommended_choice = -1;		
						
		let nodeA; let nodeB;				
		[nodeA, nodeB] = this.GetMainNodes();	
		console.log('GiC.nodes', nodes)
			
		if (nodeA.innerText.includes('backgroud')) {return -1}; //Already colorized
		
		//Same words in latin
		this.MarkSameLatin(nodeA, nodeB);
		
		//If did not find brand name in nodeB
		if (!nodeB.innerText.includes('backgroud')) {recommended_choice = this.MarkIfNoBrand(nodeB)};
		
		//Reformat if v2
		if (this.task_version==1) {
			this.GIC_ReformatPage(nodeA, nodeB);
			
			this.GIC_SelectDecision(0); // 0 = 'подходит', 1 = 'Совсем не подходит'		
			}

		//Scrool to view - should be after GIC_SelectDecision()
		let bound = document.links[0].getBoundingClientRect();
		const REQUIRED_TOP = 80;
		if (window.pageYOffset==0) {
				window.scroll(0, (bound.top-REQUIRED_TOP));
		}

		
		//Open search window for SOKOLOV
		this.SOKOLOV_special(nodeA, nodeB);
		
		return recommended_choice;	

		//Append 'Done' marker
/*		
		{ // If valid Answers were loded..
			let doneMark = document.createElement('div');
			doneMark.className = 'z-done-mark';
			this.queNode.appendChild(doneMark);
		}
*/

	} //Run()

	GIC_SetMark(inner, match, index) {	

		const MARK_SAME_COLOR = '#ccffcc'; //defined in Obuv

		let colored_text = ''.concat(
								inner.slice(0, index), 
								'<span style="background-color:', '#ddd', ';">', 
								match, 
								'</span>', 
								inner.slice(index+match.length)
								);	
		colored_text = colored_text.replace('#ddd', MARK_SAME_COLOR);									
		
	/*
		let colored_text = ''.concat(
								node.innerHTML.slice(0, index), 
								'{', 
								match, 
								'}', 
								node.innerHTML.slice(index+match.length)
								);	
	*/	
								
		//console.log('colored:', colored_text);

		return colored_text;
	} //GIC_SetMark

//Разместить копию nodeB сразу под nodeA
	GIC_ReformatPage(nodeA, nodeB){
		let title = document.querySelector("#klecks-app > tui-root > div > task > flex-view > flex-common-view > div.tui-container.tui-container_adaptive.flex-common-view__main > div > main > flex-element > flex-container > flex-element:nth-child(5)")
			
		let pic = document.querySelector("#klecks-app > tui-root > div > task > flex-view > flex-common-view > div.tui-container.tui-container_adaptive.flex-common-view__main > div > main > flex-element > flex-container > flex-element:nth-child(6)");
		
		//Before radio buttons
		let dest_point = document.querySelector("#klecks-app > tui-root > div > task > flex-view > flex-common-view > div.tui-container.tui-container_adaptive.flex-common-view__main > div > main > flex-element > flex-container > flex-element:nth-child(13)");
		
		if ((title==null) || (pic==null) || (dest_point==null)) return;

		//Move titel and pic before dest_point	
		/*
		dest_point.parentNode.insertBefore(pic, dest_point);	
		dest_point.parentNode.insertBefore(title, pic);	
		*/
		console.log('GIC_ReformatPage-after');		
	} //GIC_ReformatPage

	GIC_SelectDecision(choice) {
		const radio_btns = document.querySelectorAll('input[type=radio]');
		
		let anyChecked = false;
		for (const btn of radio_btns) 
			{anyChecked = anyChecked || btn.checked }
			
		if (anyChecked) {
			console.log('GIC_SelectDecision: already done');
			return;
		}
	
		console.log('GIC_SelectDecision: before click()');
		//radio_btns[choice].checked = true;	
		//radio_btns[choice].click();
		
		radio_btns[choice].parentNode.click();
		window.scroll(0, 0); //scroll back to top
 	
	} //GIC_SelectDecision

	
	MarkSameLatin(nodeA, nodeB) {
		
		let innerA = nodeA.innerText;	
		let innerB = nodeB.innerText;	
		
		let idx, hasAmp;
		idx = innerA.indexOf('Поиск товара');
		if (idx!=-1) innerA = innerA.slice(0, idx);

		idx = innerB.indexOf('Поиск товара');
		if (idx!=-1) innerB = innerB.slice(0, idx);
		
		let innerA0 = innerA; //backup original (not colored) value
		let innerB0 = innerB; //backup original (not colored) value
			
		//Split to words (only digits and latin chars)
		//const regexp = /([a-zA-Z0-9]+)/g;	
		const regexp = /[&\w]\w*/g;	
		let matchesA  = innerA.matchAll(regexp);
		let matchesB  = innerB.matchAll(regexp);	
		
		// Copy to array
		let Ar=[]; 
		for (const m of matchesA) Ar.push( {match: m[0], index: m.index, marked: false} );	
		
		let Br=[]; 
		for (const m of matchesB) Br.push( {match: m[0], index: m.index, marked: false} );	
			
		Ar = Ar.filter((item) => !item.match.startsWith('&'));
		Br = Br.filter((item) => !item.match.startsWith('&'));
					
		//console.log('Ar:', Ar);		
		//console.log('Br:', Br);	

		//for (let m of Br) console.log('Bt.index:', m.index);

		//Compare and mark - Br	
		for (let j = Br.length-1; j>=0; j--) 
			for (let i = Ar.length-1; i>=0; i--) {
				if (Ar[i].match.toUpperCase()==Br[j].match.toUpperCase()) {		
					
					/*if (!Ar[i].marked) {
						this.GIC_SetMark(nodeA, Ar[i].match, Ar[i].index);
						Ar[i].marked = true;
					}*/
					
					if (!Br[j].marked) {
						innerB = this.GIC_SetMark(innerB, Br[j].match, Br[j].index);
						Br[j].marked = true;
					} 
					
				} //for
			} //for

		//console.log('innerB:', innerB);

		//idx = nodeB.innerHTML.indexOf('<a href');
		//nodeB.innerHTML = innerB + nodeB.innerHTML.slice(idx);	
		nodeB.innerHTML = ''.concat(innerB,
									'<a href="https://yandex.ru/search/?text=',
									escapeHtml(innerB0),
									'"> Поиск товара</a>');
			
		//Compare and mark - Ar
		for (let i = Ar.length-1; i>=0; i--) 
			for (let j = Br.length-1; j>=0; j--) {
				if (Ar[i].match.toUpperCase()==Br[j].match.toUpperCase()) {		
					
					if (!Ar[i].marked) {
						innerA = this.GIC_SetMark(innerA, Ar[i].match, Ar[i].index);
						Ar[i].marked = true;
					}
					
					/*if (!Br[j].marked) {
						this.GIC_SetMark(nodeB, Br[j].match, Br[j].index);
						Br[j].marked = true; 
					} */
					
				} //for
			} //for

		//hasAmp = nodeA.innerText.indexOf(Ar[0].match);
		//console.log('innerA:', innerA);

		//idx = nodeA.innerHTML.indexOf('<a href');
		//nodeA.innerHTML = innerA + nodeA.innerHTML.slice(idx);	
		
		nodeA.innerHTML = ''.concat(innerA,
									'<a href="https://yandex.ru/search/?text=',
									escapeHtml(innerA0),
									'"> Поиск товара</a>');
		
		return;	
	} //MarkSameLatin


	MarkIfNoBrand(nodeB) {

		const DIFF_COLOR = '#ffcccc';

		let innerB = nodeB.innerText;

		let innexB, idx;
		idx = innerB.indexOf('Поиск товара');
		innerB = innerB.slice(0, idx);

		let words = innerB.split(' ');
		
		let hasBrand = false;
		let isFirst = true;
		for (let w of words) {
			if (w.match(/(^[A-Z|a-z]+)/gm)) {
				hasBrand = true;  // 'PUMA'
				//console.log('MarkIfNoBrand-F:', w);
			}
			
			if (!isFirst && w.match(/([А-Я]+[а-я]*)/gm)) {
				hasBrand = true; // 'Соколов'
				//console.log('MarkIfNoBrand-Я:', w);
			}
			
			isFirst = false;
		}
		
		//console.log('MarkIfNoBrand', hasBrand);
		
		if (!hasBrand) {
			nodeB.innerHTML = `<span style="background-color:${DIFF_COLOR};">${innerB}</span><a href="https://yandex.ru/search/?text='${escapeHtml(innerB)}'"> Поиск товара</a>`;		
		}	
			
		return -1;
	} //MarkIfNoBrand

	GetMainNodes(){
		/*
		const GiC_locatorA_v1 = '#klecks-app main > flex-element > flex-container > flex-element:nth-child(2) > flex-text > tui-editor-socket';
		const GiC_locatorB_v1 = '#klecks-app main > flex-element > flex-container > flex-element:nth-child(4) > flex-text > tui-editor-socket';

		const GiC_locatorA_v2 = '#klecks-app main > flex-element > flex-container > flex-element:nth-child(3) > flex-text > tui-editor-socket';
		//const GiC_locatorB_v2 = '#klecks-app main > flex-element > flex-container > flex-element:nth-child(8) > flex-text > tui-editor-socket';
		const GiC_locatorB_v2 = '#klecks-app main > flex-element > flex-container > flex-element:nth-child(10) > flex-text > tui-editor-socket';

		const GiC_locators = [ 
			{locatorA: GiC_locatorA_v1, locatorB: GiC_locatorB_v1},
			{locatorA: GiC_locatorA_v2, locatorB: GiC_locatorB_v2},
			];

		//return GiC_locators[this.task_version] 
		return [
			document.querySelector(GiC_locators[this.task_version].locatorA), 
			document.querySelector(GiC_locators[this.task_version].locatorB)		
		]
		*/
		
		// * Smart search *
		let nodes = document.querySelectorAll('tui-editor-socket')
		
		// nodeA = '....Поиск товара'
		let nodeA = null;
		for (let nd of nodes) {
			if (nd.innerText.endsWith('Поиск товара')) nodeA = nd;
		}
				
		// nodeB = 'Название:....'
		let nodeB = null;
		for (let nd of nodes) {
			if (nd.innerText.startsWith('Название:')) nodeB = nd;
		}
		
		return {'locatorA':nodeA, 'locatorB':nodeB};				
	} //GetMainNodes

/*
	NodeA: '94031896: подвеска мусульманская из серебра с зелеными и синим фианитами (9108217691644)'
	Nodeb: 'Серебряное обручальное парное кольцо SOKOLOV 94110002'
*/	
	SOKOLOV_special(nodeA, nodeB){
		if (!nodeB.textContent.includes('SOKOLOV')) return;
	
		let id = nodeA.textContent.split(':')[0];
		//let url = `https://www.google.ru/search?q=site%3Asokolov.ru+${id}`
		let url = `https://sokolov.ru/jewelry-catalog/product/${id}/`
	
		// console.log('SOKOLOV_special', url);
	
		GM_openInTab(url);
	} //SOKOLOV_special


	ReleaseNodes() {
		
	} //ReleaseNodes

} ////GiC
