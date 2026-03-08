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
	
		//1..4 -> Radio buttons
		const RB_keys  = ["Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "Digit9"];
		const NP_keys  = ["Numpad1", "Numpad2", "Numpad3", "Numpad4", "Numpad5", "Numpad6", "Numpad7", "Numpad8", "Numpad9"];
		let RB_selected = -1;
		
		if (!e.shiftKey && !e.ctrlKey) {
			for (let i=0;i<RB_keys.length;i++) {
				if (e.code==RB_keys[i] || e.code==NP_keys[i]) {
					RB_set(i);
					RB_selected = i;
					break;
				}
			} //for(RB_keys[])
		}
		
/*
		//Toggle AutoRun
		if (e.ctrlKey && (e.keyCode == 192)) { //Ctrl + ~
			console.log('SameCard.onCtrlEnter: AutoRun');
			autoRun = !autoRun;
			this.DrawAutoIndicator(autoRun);
		}
*/
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
		let previewBtn = document.querySelector('#previewBtn');
		if (!previewBtn)
			previewBtn = this.InsertPreviewBtn();

		//Main
		let id = this.GetTaskId();
		console.log('SameCard.id', id);		
		
		if (id==this.taskId) {
			console.log('SameCard-already done');			
		} else {
			//new task
			console.log('SameCard-new task');						
			this.taskId = id;
			this.preview.ClosePreviewTabs();
		}

		//Links
		let links = this.GetLinks();
		if (links[0].includes('www.rendez-vous.ru') && !links[0].includes('twinId')) {		
			this.Links_AddTwinId();
		}


		//Defaults
		RB_set(1);
		
		let rb = document.querySelector('input[type=radio]');
		if (rb) rb.focus();		
		
		let img = document.querySelector('img');
		if (img) img.scrollIntoView();
			
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
		
		//Insert point
		//let dest_point = document.querySelector('flex-header');
		let dest_point = document.querySelector('tui-editor-socket a');
		if (!dest_point) return;
		
		//Create button
		let btn = document.createElement('button');
		btn.id = 'previewBtn';
		btn.style.width = "120px";
		btn.style.height = "40px";
		btn.innerHTML = "Open links";
		btn.onclick = this.PreviewBtn_onclick;
		//dest_point.parentNode.insertBefore(btn, dest_point);			
		dest_point.after(btn);
		
		return btn;
	} //InsertPreviewBtn

	PreviewBtn_onclick() {
		let links = same_card.GetLinks();
		//console.log('SameCard.PreviewBtn_onclick', links);
		
		if (links.length!=2) return;			
		
		same_card.preview.OpenPreviewTabs(links[0], links[1]);				
	}

	RendesVous(links) {
		//console.log('SameCard.RendesVous');
		
		//Wait a broker
		let url;
		let id;
		
		id = StringHash(links[0]);
		url = `http://localhost:8000/broker?id=${id}&task=rendez-vous`;		
		WaitBrokerAnswer(url).then(this.InterpretAnswer);
/*		
		id = StringHash(links[1]);
		url = `http://localhost:8000/broker?id=${id}&task=rendez-vous`;
		WaitBrokerAnswer(url).then(this.InterpretAnswer);
*/


/*		
		
		//Compare answers
		let baseArts = [];
		for (let lk of links) {
            let splited = lk.href.split('-');
            let art = splited.pop();
            art = art.replace('/', '');
			
			baseArts.push(art);
		}

		let articules = [answ1['articuls'], answ2['articuls']];
		
		let sameCard = articules[0].includes(baseArts[1]);
		console.log('SameCard.RendesVous', sameCard);
*/		
	} //RendesVous
	
	InterpretAnswer(answ) {
		console.log('SameCard.InterpretAnswer', answ);
		return answ;				
	} //InterpretAnswer
	
/*	
	RendesVous_modifyLinks(links) {
		let artcs = [];
		
		for (let lk of links) {
			artcs.push( this.Get_RV_sku( lk ) );
		}
		
		links[0] = `${links[0]}?art=${artcs[1]}`;
		links[1] = `${links[1]}?art=${artcs[0]}`;

		console.log('RendesVous_modifyLinks', links);

		return links;
	} //RendesVous_modifyLinks
*/

	Links_AddTwinId() {
		//Get link nodes
		let links = document.querySelectorAll('tui-editor-socket a');
		
		let nodes = [];
		for (let lk of links) {
			//console.log('SameCard.GetLinks', lk.parentNode);						
			
			if(lk.parentNode && lk.parentNode.innerText.includes('Страница товара на сайте магазина:'))
				nodes.push(lk);
		}
		
		if (nodes.length!=2) return;
		
		//Extact base articules
		let artcs = [];
		for (let nd of nodes) {
			artcs.push( this.Get_RV_sku( nd.href ) );
		}

		//Modify nodes
		let new_url;
		new_url = `${nodes[0].href}?twinId=${artcs[1]}`
		nodes[0].href = new_url;
		nodes[0].textContent = new_url;
		
		new_url = `${nodes[1].href}?twinId=${artcs[0]}`
		nodes[1].href = new_url;
		nodes[1].textContent = new_url;
		
		return;
	} //Links_AddTwinId

	// Extract main SKU (last digits of url):
	// 'https://www.rendez-vous.ru/catalog/female/lofery/tendance_ys_2299k_x20_svetlo_bezhevyy-4751856/'  -> '4751856'
	Get_RV_sku(url) {
		let sku = url.split('-').pop().replace('/', '');		
		return sku;
	}

	
} //SameCard
