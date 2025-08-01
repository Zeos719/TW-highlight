/*
<div _ngcontent-ng-c2192362928="" automation-id="flex-header" class="flex-header__content tui-text_h6">
Произнесено ли предложение с вопросительной интонацией?
</div>

document.querySelector('.tui-editor-socket').textContent
*/

var	play_exam = null;

function DoPlayExam(subversion){
	if (play_exam==null) {
		play_exam = new PlayExam();
	}

	if (play_exam.subversion!=subversion)
		play_exam.Load_TXT(subversion);

	play_exam.Run(subversion, null)

};



//namespace isolation
var PLEX_isolatedFuncs;

(function() {

function onBtnClick(e) {
	console.log('PlayExam.onBtnClick');
	let choice = -1;

	if (SEND_TO_SERVER) {
		choice = SendToServer()
	} else {
		choice = 0; //?!
	}

	//Remove listeners
	if (choice!=-1) {
		document.removeEventListener("keydown", onCtrlEnter);

		let completeBtn = document.querySelector("#completeBtn");
		completeBtn.removeEventListener("click", onBtnClick);
	}
} //onBtnClick()


function onCtrlEnter(e) {
	let choice = -1;

	//Ctrl-Enter
	if (e.ctrlKey && (e.keyCode == 13 || e.keyCode == 10)) {
		console.log('PlayExam.onCtrlEnter: CtrlEnter--');

		if (SEND_TO_SERVER) {
			choice = SendToServer()
		} else {
			choice = 0; //?!
		}

		//Remove listeners
		if (choice!=-1) {
			document.removeEventListener("keydown", onCtrlEnter);

			let completeBtn = document.querySelector("#completeBtn");
			completeBtn.removeEventListener("click", onBtnClick);
		}
	}

	//console.log('Obuv.onCtrlEnter-key', e.key, e.keyCode, e.code);

	//Toggle AutoRun
	if (e.ctrlKey && (e.keyCode == 192)) { //Ctrl + ~
		console.log('PlayExam.onCtrlEnter: AutoRun');
		autoRun = !autoRun;
		DrawAutoIndicator(autoRun);
	}

} //onCtrlEnter

function SendToServer() {
	if (!play_exam) return -1;

	let sol = play_exam.GetSolution();

	//let node = document.querySelector(play_exam.JSselector);
	//let question = node.textContent;

	let payload = {
		task: 'playexam',
		subtask: play_exam.subtask,
		solution: sol,
		question: play_exam.que,
	};

	if (payload.solution==-1)
		return

	console.log('PLEX.SendToServer-1: ', payload);

	let json = JSON.stringify(payload);

	$.post('http://localhost:8000/tw', json, function(data){
		console.log('PLEX.SendToServer-2:', data);
	});

	return sol;
} //SendToServer()

function DrawAutoIndicator(isOn) {
	console.log('Toggle autoRun');

	let completeBtn = document.querySelector("#completeBtn");

	if (completeBtn && !Object.hasOwn(this, 'originalText')) this.originalText = completeBtn.textContent;

	if (isOn) {
		//completeBtn.style.background = 'solid 2px green';
		completeBtn.textContent = this.originalText + '\u00A0💥'; //☑ ▶💥😎✔✈
	} else {
		//completeBtn.style.background = '';
		completeBtn.textContent = this.originalText; //'Завершить задание';
	}
} //DrawAutoIndicator()

	PLEX_isolatedFuncs = {
		'onBtnClick':onBtnClick,
		'onCtrlEnter':onCtrlEnter,
		'DrawAutoIndicator':DrawAutoIndicator,
		};

	return;
})(); //end namespace function


//******************** class PlayExam ********************
class PlayExam {
  //constructor(name) { this.name = name; }
  //sayHi() { alert(this.name); }

	constructor() {
		console.log('PlayExam.constructor');


		this.JSselector = '.tui-editor-socket';
		//this.JSselector = 'flex-text';

		this.Answers = []; //for Auto

		this.GREEN_COLOR_LIGHT='#e6fff2';
		this.RED_COLOR_LIGHT  ='#ffe6e6';

		this.SOLTYPE_RB = 0;
		this.SOLTYPE_EDIT = 1;

	} //constructor


	Run(subtask, textJSpath) {
		this.subtask = subtask;
		this.textJSpath = textJSpath;

		// Attach handlers to track exit
		let completeBtn = document.querySelector("#completeBtn");
		completeBtn.addEventListener("click", PLEX_isolatedFuncs['onBtnClick']);

		document.addEventListener("keydown", PLEX_isolatedFuncs['onCtrlEnter']);

		//Main
		PLEX_isolatedFuncs['DrawAutoIndicator'](autoRun);

		this.solutionType = this.DetectSolType();
		console.log('PlayExam.solutionType', this.solutionType);

		let nodes = document.querySelectorAll(this.JSselector);
		this.queNode = nodes[ nodes.length-1 ];
		this.que = this.queNode.innerText;

		console.log('PlayExam.que', this.que);
		console.log('PlayExam.Solution', this.GetSolution());

		this.AutoAnswer();
		if (autoRun) {
		}

	} //Run()

	DetectSolType() {
		//const editNode = document.querySelector('div.t-pseudo-content');
		const radio_btns = document.querySelectorAll('input[type=radio]');

		let ret = this.SOLTYPE_EDIT;
		if (radio_btns.length>0)
			ret = this.SOLTYPE_RB;

		return ret;
	}

	GetSolution() {
		let sol = ''

		if (this.solutionType==this.SOLTYPE_RB) {//Radio buttons
			sol = RB_get();
		}

		if (this.solutionType==this.SOLTYPE_EDIT) {//Text area
			let node = document.querySelector('div.t-pseudo-content');
			if (node) sol = node.innerText;

			//encode LF->'\n'
			sol = sol.replaceAll('\n', '\\n');
		}


		return sol;
	}


	Load_TXT(subversion){
		console.log('PlayExam.Load_TXT', subversion);

		let myself = this;

		let rootUrl = 'https://www.phonewarez.ru/files/play-exams/';

		//let url = rootUrl + 'que-inton.csv';
		let url = rootUrl + 'pay-systems.csv';

		$.get(url, '', function(data){
				myself.ProcessServerAnswer(this.url, data); //this.url ! 'this' referes settings of GET() function!
				vbd_count += 1;
		} );


	};

	ProcessServerAnswer(url, data) {
		console.log('PlayExam.ProcessServerAnswer', data.length, url);

		//Parse url: https://www.phonewarez.ru/files/play-exams/que-inton.csv
		let tokens = url.split('/');
		let fileNameWithExt  = tokens[ tokens.length-1 ];  // 'que-inton.csv'

		//Split data to lines and pre-process them
		data = data.replaceAll('\r\n', '\r');

		let dataLines = data.split('\r');
		dataLines = dataLines.filter(function(s) {return (s!='')});

		dataLines = dataLines.map( function(item, index, array) {		
			let cols = CSVToArray(item, ',', '"')
			
			cols = cols.map(function(item, index, array) {
				item = StripQuotes(item); //strip quotes
				item = item.replaceAll('\\n', '\n'); //Decode '\\n'->LF
				return item;
				}); 
			
			return cols;
		});
				
		//console.log('PlayExam.ProcessServerAnswer test', StripQuotes(dataLines[0][3]) );		
		//console.log('PlayExam.ProcessServerAnswer test2',  '" тест два"'.replaceAll(/^\"(.*)\"$/gm, '$1'));		
		
		//console.log('PlayExam.ProcessServerAnswer dataLines:', dataLines);

		play_exam.Answers = dataLines;
		console.log('PlayExam.ProcessServerAnswer got lines:', play_exam.Answers.length);		

		return;
	}

	/*
	MarkTheQue(color) {
		console.log('PlayExam.MarkTheQue');
		let node = document.querySelector(this.JSselector);
		node.style.backgroundColor = color;
	}
	*/

	AutoAnswer() {
		//console.log('PlayExam.Answer.length', this.Answers.length);
		console.log('PlayExam.Answer.que', this.que);

		//Look for the answer
		let rb = -1
		for (let i=0;i<this.Answers.length;i++) {
			
		//console.log('PlayExam.Answer.Answ', this.Answers[i][3]==this.que, this.Answers[i][3]);
			
			if (this.Answers[i][3]==this.que) {
				rb = this.Answers[i][2]
				break;
			}
		} //for

		console.log('PlayExam.AutoAnswer rb', rb);

		if (rb==-1) {
			this.queNode.style.backgroundColor = this.RED_COLOR_LIGHT; //No stored answer..
		} else {
			console.log('PlayExam.AutoAnswer', this.queNode);

			//I have the answer!
			this.queNode.style.backgroundColor = this.GREEN_COLOR_LIGHT;

			if (!RB_alreadySet())
				RB_set(rb);
		}

		return rb;
	} //AutoAnswer()


} //PlayExam
