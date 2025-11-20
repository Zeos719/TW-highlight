/*
<div _ngcontent-ng-c2192362928="" automation-id="flex-header" class="flex-header__content tui-text_h6">
Произнесено ли предложение с вопросительной интонацией?
</div>

document.querySelector('.tui-editor-socket').textContent
*/

var	play_exam = null;

function DoPlayExam(isExam){
	if (play_exam==null) {
		play_exam = new PlayExam();
	}

	if (isExam) { //&& play_exam.subversion!=subversion) {
		//play_exam.subversion=subversion;
		play_exam.Load_TXT(null);
	}

	try {
		play_exam.Run(isExam)
	} catch(err) {
		console.log('PlayExam.DoPlayExam', err)
	}
	

};


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
		this.SOLTYPE_BADGES = 2;

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
			console.log('PlayExam.onCtrlEnter: CtrlEnter--');

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
			console.log('PlayExam.onCtrlEnter: AutoRun');
			autoRun = !autoRun;
			this.DrawAutoIndicator(autoRun);
		}

	} //onCtrlEnter()

	onBtnClick(e) {
		console.log('PlayExam.onOkClick');
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
		if (!play_exam) return -1;

		let sol = this.GetSolution();
		if ((sol==-1) || (sol==''))
			return;

		//let node = document.querySelector(play_exam.JSselector);
		//let question = node.textContent;

		let payload = {
			task: 'playexam',
			//subtask: this.subtask,
			solution: sol,
			question: this.que,
			header_main: this.header_main || '',
			header_2nd: this.header_2nd || '',
		};

		console.log('PlayExam.SendToServer-1: ', payload);

		let json = JSON.stringify(payload);

		$.post('http://localhost:8000/tw', json, function(data){
			console.log('PlayExam.SendToServer-2:', data);
		});

		return sol;
	} //SendToServer()

	DrawAutoIndicator(isOn) {
		console.log('PlayExam.DrawAutoIndicator');

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
		console.log('PlayExam.CheckPost_simple');

		const BAD_POST = 0;
		const GOOD_POST = 1;
		const NOT_SURE = -1;

		let que_low = this.que.toLowerCase();
		let iPos;

		//* Только тикер *
		//if ( this.que.match(/^\$[A-Z|0-9]+$/) )	return BAD_POST;

		//* Только стратегия *
		//let numWords = this.que.split(' ').length;
		//if ( numWords<=2 && this.que.match(/^\&\S+/) )	return BAD_POST;
		
		//* Начинается с #disclosure *
		//if (que_low.startsWith('#disclosure')) return GOOD_POST;

		//* "Анализ" в начале
		iPos = que_low.indexOf(" анализ");
		if (iPos>=0 && iPos<15) return GOOD_POST;

		//* Хорошие хэштеги
		/*
		#обзор #прояви_себя_в_пульсе + #новичкам + #аналитика #сердце__пульса #мышление
		#акции #новости #аналитика #новичкам #инвестиции #трейдинг
		*/
		const good_hashtags = ['#сердце_пульса', '#disclosure', '#аналитика', '#новичкам', 'получил ачивку', 'млрд',
			'сентимент'];
		for (let ht of good_hashtags) {
			if (que_low.includes(ht)) return GOOD_POST;
		}

		//* Неверно использован символ '$'
		//if (que_low.includes('$ ')) return BAD_POST;

		//*Оскобления политиков, 'плохие' слова
		const politics = ['рыжий', ' зеля', ' войн', ' 3.14',  ' 3,14', ' еба', 'хуй', ' хуе', 'пидор', ' бля', 'telegram', ' тг ', 'телеграм', 
			' https://youtu', 'dzen.ru'];
		for (let w of politics) {
			if (que_low.includes(w)) return BAD_POST;
		}


		return NOT_SURE;
	} //CheckPost_simple

	Colorize(desision) {
		//const COLOR_RED = '#FFA07A';
		//const COLOR_GREEN = '#98FB98';

		let color = null;
		if (desision==0) color = this.RED_COLOR_LIGHT;
		if (desision==1) color = this.GREEN_COLOR_LIGHT;

		if (color) this.queNode.style.backgroundColor = color;
	}


	//**** Main ****
	Run(isExam) {

		//check 'Done' mark
		if (document.querySelector('div.z-done-mark')) {
			console.log('PlayExam-already done');
			return;
		}

		this.isExam = isExam;

		// Attach handlers to track exit
		let completeBtn = document.querySelector("#completeBtn");
		completeBtn.addEventListener("click", this);

		document.addEventListener("keydown", this);

		//Main
		this.DrawAutoIndicator(autoRun);

		this.solutionType = this.DetectSolType();
		console.log('PlayExam.solutionType', this.solutionType);

		let nodes = document.querySelectorAll(this.JSselector);
		this.queNode = nodes[ nodes.length-1 ];
		this.que = this.queNode.innerText;

		console.log('PlayExam.que', this.que);
		console.log('PlayExam.Solution', this.GetSolution());

		this.GetHeaders();

		if (this.isExam) {
			this.AutoAnswer();
			if (autoRun) {
			}
		} else {
			let isCheckPost = this.header_main.includes(' пост ') || this.header_main.includes(' коммент');
			let isManipulPost = isCheckPost&& this.header_2nd.includes('Манипуляция');
			let isThemePost = isCheckPost && this.header_2nd.includes('Выберите тематик');

console.log('PalyExam.theme', isCheckPost, isManipulPost, isThemePost, this.header_2nd)

			let decision = -1;

			if (!(isManipulPost || isThemePost)) { //Обычная проверка

				decision = this.CheckPost_simple();
				//RB_uncheckAll();

				let summary = NF_summary(this.que)
				console.log('PlayExam.summary', summary)
				
				if (decision==-1) {
					let rate = NF_rating(summary);
					console.log('PlayExam.rate', rate);
					if (rate>=10) decision = 1; //Good post
				}

				if (decision!=-1) {
					RB_set(decision);

					this.Colorize(decision);

					const lbls = ['Да (Z)', 'Нет (Z)'];
					RB_set_lbl(decision, lbls[decision]);
				}
			} //Обычная проверка
			
			if (isManipulPost) { //Манипуляция
				let header_2nd = null;
				let headers = document.querySelectorAll('.tui-text_h6');
				if (headers && headers.length>0)
					header_2nd = headers[headers.length-1];
					
				if (header_2nd)
					header_2nd.innerHTML = 'В посте присутствует нарушение <span style="background-color:BlanchedAlmond;">«Манипуляция рынком»</span>?'
			}

			if (isThemePost) { //Проверка темы 
				let hasTicker = this.que.match(/\$[A-Z][A-Z\d]+/) //Look for any ticker. Was /\$[A-Z\d]+/
				console.log('PalyExam.hasTicker', hasTicker)
				
				const ACTIVE_BADGE_CLASS = 'flex-labeling__badge_active'
				
				let badges = document.querySelectorAll('tui-badge')
				
				let badges_dict = {} //Create a dict of badges: badges_dict['Инвестиции'] -> bd
				for(let bd of badges) 											
					badges_dict[bd.innerText] = bd
								
				if (hasTicker) {
						let bd = badges_dict['Инвестиции']
						if (bd) 					
							bd.classList.add(ACTIVE_BADGE_CLASS)											
				}
			}

			//Default
			if (!isThemePost && !RB_alreadySet())
				RB_set(1);

		}



		//Append 'Done' marker
		//if (this.Answers.length>0) 
		{ // If valid Answers were loded..
			let doneMark = document.createElement('div');
			doneMark.className = 'z-done-mark';
			this.queNode.appendChild(doneMark);
		}


	} //Run()

	DetectSolType() {
		//const editNode = document.querySelector('div.t-pseudo-content');
		const radio_btns = document.querySelectorAll('input[type=radio]');
		const badges = document.querySelectorAll('tui-badge');

		let ret = this.SOLTYPE_EDIT;
		if (radio_btns.length>0)
			ret = this.SOLTYPE_RB;
		if (badges.length>0)
			ret = this.SOLTYPE_BADGES;

		return ret;
	}

	GetSolution() {
		let sol = ''

		if (this.solutionType==this.SOLTYPE_RB) {//Radio buttons
			sol = RB_get_lbl();
		}

		if (this.solutionType==this.SOLTYPE_EDIT) {//Text area
			let node = document.querySelector('div.t-pseudo-content');
			if (node) sol = node.innerText;

			//encode LF->'\n'
			sol = sol.replaceAll('\n', '\\\\n'); // Four slashes to fight against Python corrections while writting to the file
		}

		if (this.solutionType==this.SOLTYPE_BADGES) {//Set of badges
			const badges = document.querySelectorAll('tui-badge');
			//console.log('PlayExam.GetSol-1', badges);

			const active_class = 'flex-labeling__badge_active';

			for (let bd of badges) {
				bd.classList.forEach(function (cl) {
					//if(cl==active_class) sol=bd.innerText});
					if(cl.includes('active')) sol=bd.innerText});
			}//for
						
		}

		//console.log('PlayExam.GetSol-4', sol);
		return sol;
	}


	Load_TXT(subversion){
		console.log('PlayExam.Load_TXT', subversion);

		let myself = this;

		let rootUrl = 'https://www.phonewarez.ru/files/play-exams/';

		let url = rootUrl + 'que-inton.csv';
		//let url = rootUrl + 'pay-systems.csv';
		//let url = rootUrl + 'moderate-comments.csv';
		//let url = rootUrl + 'post-moderate.csv';
		//let url = rootUrl + 'post-theme.csv';
		//let url = rootUrl + 'defise-tire.csv';

		$.get(url, { "_": $.now() }, function(data){
				myself.ProcessHttpAnswer(this.url, data); //this.url ! 'this' referes settings of GET() function!
				vbd_count += 1;
		} );


	};

	ProcessHttpAnswer(url, data) {
		console.log('PlayExam.ProcessHttpAnswer length', data.length, url);

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

		//console.log('PlayExam.ProcessHttpAnswer test', StripQuotes(dataLines[0][3]) );
		//console.log('PlayExam.ProcessHttpAnswer test2',  '" тест два"'.replaceAll(/^\"(.*)\"$/gm, '$1'));

		//console.log('PlayExam.ProcessHttpAnswer dataLines:', dataLines);

		play_exam.Answers = dataLines;
		console.log('PlayExam.ProcessHttpAnswer got lines:', play_exam.Answers.length);

		return;
	}

	/*
	MarkTheQue(color) {
		console.log('PlayExam.MarkTheQue');
		let node = document.querySelector(this.JSselector);
		node.style.backgroundColor = color;
	}
	*/

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

		console.log('PlayExam.GetHeaders:', this.header_main, this.header_2nd);
			} //GetHeaders


	AutoAnswer() {
		console.log('PlayExam.AutoAnswer.length', this.Answers.length);
		console.log('PlayExam.AutoAnswer.que', this.que);

		//Look for the answer
		let answId = -1;
		for (let i=0;i<this.Answers.length;i++) {

		//console.log('PlayExam.AutoAnswer.Answ', this.Answers[i][3]==this.que, this.Answers[i][3]);

			if (this.Answers[i][3]==this.que) {
				answId = i

				if (i<5) console.log('AutoAnswer equ', i, this.Answers[i][3]==this.que)

				break;
			}
		} //for

		if (answId!=-1) {
			console.log('PlayExam.AutoAnswer found:', answId, this.Answers[answId][2]); //answer
		} else {
			console.log('PlayExam.AutoAnswer missed'); //answer
		}


		if (answId==-1) {
			this.queNode.style.backgroundColor = this.RED_COLOR_LIGHT; //No stored answer..
			return answId;
		} else {
			this.queNode.style.backgroundColor = this.GREEN_COLOR_LIGHT; //I have the answer! Continue
		}

		if (this.solutionType==this.SOLTYPE_RB) {
			let rb = this.Answers[answId][2]

			if (!RB_alreadySet())
				RB_set(rb);
		} //SOLTYPE_RB

		if (this.solutionType==this.SOLTYPE_EDIT) {
			let editNode = document.querySelector('div.t-pseudo-content span')
			console.log('PlayExam.AutoAnswer edit', editNode)

			if (editNode) editNode.innerText = this.Answers[answId][2]

		} //SOLTYPE_EDIT

		if (this.solutionType==this.SOLTYPE_BADGES) {

		} //SOLTYPE_BADGES


		return answId;
	} //AutoAnswer()


} //PlayExam
