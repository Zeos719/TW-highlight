
var	pulse_idea = null;

function DoPulseIdea(taskVesrion, exam){
	if (pulse_idea==null) {
		pulse_idea = new PulseIdea();
	}


	try {
		pulse_idea.Run()
	} catch(err) {
		console.log('PulseIdea.DoPulseIdea', err)
	}
	

};


//******************** class PulseIdea ********************
class PulseIdea {
  //constructor(name) { this.name = name; }
  //sayHi() { alert(this.name); }

	constructor() {
		console.log('PulseIdea.constructor');


		this.JSselector = 'tui-editor-socket';
		//this.JSselector = 'flex-text';


		this.GREEN_COLOR_LIGHT='#e6fff2';
		this.RED_COLOR_LIGHT  ='#ffe6e6';

		this.header_main = null;
		this.header_2nd = null;


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
			console.log('PulseIdea.onCtrlEnter: CtrlEnter--');

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
			console.log('PulseIdea.onCtrlEnter: AutoRun');
			autoRun = !autoRun;
			this.DrawAutoIndicator(autoRun);
		}
		
		//1..4 -> Radio buttons
		const RB_keys  = ["Digit1", "Digit2"];
		let RB_selected = -1;
		
		for (let i=0;i<RB_keys.length;i++) {
			if (e.code==RB_keys[i]) {
				RB_set(i);
				RB_selected = i;
				break;
			}
		} //for(RB_keys[])

	//Double check RB setiings
	if ( (RB_selected!=-1) && (RB_selected!=RB_get()) ) {
		console.error('PulseIdea.RB_set err', RB_selected);
	}
		
		

	} //onCtrlEnter()

	onBtnClick(e) {
		console.log('PulseIdea.onOkClick');
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
		if (!pulse_idea) return -1;

		let sol = this.GetSolution();
		if ((sol==-1) || (sol==''))
			return;

		//let node = document.querySelector(pulse_idea.JSselector);
		//let question = node.textContent;

		let payload = {
			task: 'pulseidea',
			//subtask: this.subtask,
			solution: sol,
			question: this.que,
			header_main: this.header_main || '',
			header_2nd: this.header_2nd || '',
		};

		console.log('PulseIdea.SendToServer-1: ', payload);

		let json = JSON.stringify(payload);

		$.post('http://localhost:8000/tw', json, function(data){
			console.log('PulseIdea.SendToServer-2:', data);
		});

		return sol;
	} //SendToServer()

	DrawAutoIndicator(isOn) {
		console.log('PulseIdea.DrawAutoIndicator');

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


	CheckPost_simple() {

		return NOT_SURE;
	} //CheckPost_simple

/*
	Colorize(decision) {
		//const COLOR_RED = '#FFA07A';
		//const COLOR_GREEN = '#98FB98';

		let color = null;
		if (decision==0) color = this.RED_COLOR_LIGHT;
		if (decision==1) color = this.GREEN_COLOR_LIGHT;

		if (color) this.queNode.style.backgroundColor = color;
	}
*/

	//**** Main ****
	Run() {

		//check 'Done' mark
		if (document.querySelector('div.z-done-mark')) {
			console.log('PulseIdea-already done');
			return;
		}

		// Attach handlers to track exit
		let completeBtn = document.querySelector("#completeBtn");
		completeBtn.addEventListener("click", this);

		document.addEventListener("keydown", this);

		//Main
		this.DrawAutoIndicator(autoRun);

		let nodes = document.querySelectorAll(this.JSselector);
		if (nodes.length!=3) {
			return;
		} else { //=3
			this.queNode = nodes[1];
			this.que = this.queNode.innerText;
		}
		
		console.log('PulseIdea.que', this.que);
		console.log('PulseIdea.Solution', this.GetSolution());

		this.GetHeaders();
		
		//Send a request to ai
		// '/broker/?task=ai&subtask=cli-post-req&id=ABCDEF'
		
		this.Analize()
		//this.AutoAnswer();



		//Append 'Done' marker
		//if (this.Answers.length>0) 
		{ // If valid Answers were loded..
			let doneMark = document.createElement('div');
			doneMark.className = 'z-done-mark';
			this.queNode.appendChild(doneMark);
		}

	} //Run()

	Analize() {
		//Count tickers
		const regExp = /\$\w+\b/g

		let matches = this.que.matchAll(regExp);
		let matchesArr = Array.from(matches);
	
		if (matchesArr.length>2) {
			this.queNode.style.backgroundColor = this.RED_COLOR_LIGHT		
		}
		
	} //Analize()


	GetSolution() {
		let sol = ''

		sol = RB_get_lbl();

		//console.log('PulseIdea.GetSol-4', sol);
		return sol;
	}

	GetHeaders() {
		//Main h3 header
		this.header_main = document.querySelector('h3');
		if (this.header_main)
			this.header_main = this.header_main.innerText;

		// tui-header
		this.header_2nd = null;
		let headers = document.querySelectorAll('.tui-text_h6');
		if (headers && headers.length>0)
			this.header_2nd = headers[headers.length-1].innerText;

		console.log('PulseIdea.GetHeaders:', this.header_main, this.header_2nd);
			} //GetHeaders


	AutoAnswer() {


		return -1
	} //AutoAnswer()


} //PulseIdea
