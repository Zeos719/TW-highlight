var same_card = null;

function DoSameCard(taskVersion, exam){
	
	console.log('SameCard.DoSameCard start');	
	
	let isExam = (exam==2); // ==le_EXAM
	
	if (!same_card)	same_card = new SameCard();

	try {
		same_card.Run(isExam)
	} catch(err) {
		console.log('SameCard.DoSameCard', err)
	}
	};


//******************** class SameCard ********************
class SameCard {
  //constructor(name) { this.name = name; }
  //sayHi() { alert(this.name); }

	constructor() {
		console.log('SameCard.constructor');
		
		this.preview = new PreviewWindows();

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
			console.log('SameCard.onCtrlEnter: CtrlEnter--');

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
		}
		
		//Open links
		if (e.ctrlKey && (e.code == "KeyM")) { //Ctrl + M		
			let links = this.GetLinks();
			console.log('SameCard.onCtrlEnter: ctrl-M', links);
			
			if (links.length!=2) return;			
			
			this.preview.OpenPreviewTabs(links[0], links[1]);
		}
		
		

		//Toggle AutoRun
		if (e.ctrlKey && (e.keyCode == 192)) { //Ctrl + ~
			console.log('SameCard.onCtrlEnter: AutoRun');
			autoRun = !autoRun;
			this.DrawAutoIndicator(autoRun);
		}

	} //onCtrlEnter()

	onBtnClick(e) {
		console.log('SameCard.onOkClick');
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
		return null;
	} //SendToServer()

	DrawAutoIndicator(isOn) {
		console.log('SameCard.DrawAutoIndicator');

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
	Run(isExam) {

		/*		
		//check 'Done' mark
		if (document.querySelector('div.z-done-mark')) {
			console.log('SameCard-already done');
			return;
		}
		*/

		this.isExam = isExam;

		// Attach handlers to track exit
		let completeBtn = document.querySelector("#completeBtn");
		completeBtn.addEventListener("click", this);

		document.addEventListener("keydown", this);

		// Insert a Button
		let btn = document.querySelector('#previewBtn');
		if (!btn)
			this.InsertPreviewBtn();

		//Main
		//let links = this.GetLinks();
		//console.log('SameCard.links', links);

		let id = this.GetTaskId();
		console.log('SameCard.id', id);		
		
		if (id==this.taskId) {
			console.log('SameCard-already done');			
		} else {
			//new task
			console.log('SameCard-new task');						
			this.taskId = id;
			preview.ClosePreviewTabs();
		}
		


		//Default
		RB_set(1);

		//Append 'Done' marker
/*		
		{ 
			let doneMark = document.createElement('div');
			doneMark.className = 'z-done-mark';
			
			let parentNode = document.querySelector('.tui-text_h6');
			console.log('SameCard.parentNode', parentNode);
			
			parentNode.appendChild(doneMark);			
		}
*/
		
	} //Run()

/*
	GetUniqueTaskId() {
		let id = `${this.header_main}|${this.header_2nd}|${this.que}`;	
		let hash = StringHash(id);
		hash = Math.abs( hash );
		
		return (hash).toString(16).toUpperCase();
	} //GetUniqueTaskId
*/	

	GetLinks() {
		let links = document.querySelectorAll('tui-editor-socket a');
		
		let ret = [];
		for (let lk of links) {
			//console.log('SameCard.GetLinks', lk.parentNode);						
			
			if(lk.parentNode && lk.parentNode.innerText.includes('Страница товара на сайте магазина:'))
				ret.push(lk.href);
		}
		
		return ret;
	} //GetLinks
	
	
	GetTaskId() {
		let links = this.GetLinks();
		if (links.length!=2) return null;
		
		return StringHash(links[0] + links[1]);
	} //GetTaskId
	
	
	ReleaseNodes() {
	}


	InsertPreviewBtn() {
		//console.log('SameCard.InsertPreviewBtn');
		let dest_point = document.querySelector('flex-header');
		if (!dest_point) return;
		
		let btn = document.createElement('button');
		btn.id = 'previewBtn';
		btn.style.width = "120px";
		btn.style.height = "40px";
		btn.innerHTML = "Open links";
		btn.onclick = this.PreviewBtn_onclick;
		dest_point.parentNode.insertBefore(btn, dest_point);			
	} //InsertPreviewBtn

	PreviewBtn_onclick() {
		let links = same_card.GetLinks();
		//console.log('SameCard.PreviewBtn_onclick', links);
		
		if (links.length!=2) return;			
		
		same_card.preview.OpenPreviewTabs(links[0], links[1]);		
	}

} //SameCard
