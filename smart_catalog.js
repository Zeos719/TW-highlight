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
		
		
		
		
		
		//Append 'Done' marker
		{ // If valid Answers were loded..
			let doneMark = document.createElement('div');
			doneMark.className = 'z-done-mark';
			//this.queNode.appendChild(doneMark);
		}
		
		//
		
		

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
		let sol = null;
		
		let node = document.querySelector('div.child__text_with-check');
		if (node) sol = node.innerText;
		
		return sol;		
	} //GetSolution()

} //SmartCatalog
