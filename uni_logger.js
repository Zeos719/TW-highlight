var same_card = null;

function DoUniLogger(taskVersion, exam){
	
	console.log('UniLogger.DoUniLogger start');	
	
	let isExam = (exam==2); // ==le_EXAM
	
	if (!same_card)	same_card = new UniLogger();

	try {
		same_card.Run(taskVersion, isExam)
	} catch(err) {
		console.log('DoUniLogger', err)
	}
	};


//******************** class UniLogger ********************
class UniLogger {
  //constructor(name) { this.name = name; }
  //sayHi() { alert(this.name); }

	constructor() {
		console.log('UniLogger.constructor');
		
		this.TaskParsers = [this.ParseHotelRooms, ];
		this.IdBuilders = [this.IdHotelRooms, ];
		
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
			console.log('UniLogger.onCtrlEnter: CtrlEnter--');

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

	} //onCtrlEnter()

	onBtnClick(e) {
		console.log('UniLogger.onOkClick');
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
		let json = this.ParseTask(this.taskVersion);		
		if (!json) return -1;
		
		http_POST('http://localhost:8000/tw', json);		
		return 0;
	} //SendToServer()

	//**** Main ****
	Run(taskVersion, isExam) {

		/*		
		//check 'Done' mark
		if (document.querySelector('div.z-done-mark')) {
			console.log('UniLogger-already done');
			return;
		}
		*/

		this.taskVersion = taskVersion;
		this.isExam = isExam;

		// Attach handlers to track exit
		let completeBtn = document.querySelector("#completeBtn");
		completeBtn.addEventListener("click", this);

		document.addEventListener("keydown", this);

		// Parse task		
		let json = this.ParseTask(this.taskVersion);
		console.log('UniLogger.json', json);
		if (!json) {
			console.log('UniLogger: failed to parse');
			return;
		}

		let id = this.GetTaskId(this.taskVersion, json);
		console.log('UniLogger.id', id);		
		
		if (id==this.taskId) {
			//console.log('UniLogger-already done');			
		} else {
			//new task
			console.log('UniLogger-new task');						
			this.taskId = id;
		}
		
		//Default
		//RB_set(1);

		//Append 'Done' marker
/*		
		{ 
			let doneMark = document.createElement('div');
			doneMark.className = 'z-done-mark';
			
			let parentNode = document.querySelector('.tui-text_h6');
			console.log('UniLogger.parentNode', parentNode);
			
			parentNode.appendChild(doneMark);			
		}
*/
		
	} //Run()
	
	
	ParseTask(taskVersion) {
		let parser;
				
		if (taskVersion>=0 && taskVersion<this.TaskParsers.length) {
			parser = this.TaskParsers[taskVersion];
		} else {
			return null;
		}
		
		return parser();				
	} //ParseTask
	
	ParseHotelRooms() {		
		let json = {task:'hotel-rooms',};
		
		//Requests
		let reqs = document.querySelectorAll('tui-radio-list .t-item');
		let req_lbls = [];
		for (let r of reqs) {
			req_lbls.push(r.innerText);			
		}
		
		json['room-requests'] = req_lbls;
		json['room-requests-choice'] = RB_get();
		
		//Offer - look for 1st node after h6-title	
		let headerNode = null;
		let offerNode = null;		
				
		let nodes = document.querySelectorAll('flex-element');
		
		//debugger;
		
		for (let nd of nodes) {
			if (nd.innerText=='Предложение:') {
				headerNode = nd;
				continue;
				}
			
			if (headerNode) { //I am at NEXT node after header! Got it
				offerNode = nd; 
				break;				
			}			
		} //for(nd)
		
		if (offerNode)
			json['room-offer'] = offerNode.innerText;
				
		return json;
	} //ParseHotelRooms
	
	
	GetTaskId(taskVersion, json) {		
		let idBuilder;
				
		if (taskVersion>=0 && taskVersion<this.TaskParsers.length) {
			idBuilder = this.IdBuilders[taskVersion];
			return idBuilder(json);
		}
		
		//default
		let json_text = JSON.stringify(json);
		
		return StringHash(json_text);
	} //GetTaskId


	IdHotelRooms(json) {
		let json_text = json['room-requests'].join('|');
		json_text += '|' + json['room-offer'];
		
		return StringHash(json_text);
	} //IdHotelRooms

	ReleaseNodes() {
	}


} //UniLogger
