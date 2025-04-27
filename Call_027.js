function CL27_onBtnClick(e) {
	let choice = CL27_SendToServer();
	
	//Remove listeners
	if (choice!=-1) {
		document.removeEventListener("keydown", CL27_onCtrlEnter);
	
		let completeBtn = document.querySelector("#completeBtn");
		completeBtn.removeEventListener("click", CL27_onBtnClick);	
	}
}

function CL27_onCtrlEnter(e) {
	if (e.ctrlKey && (e.keyCode == 13 || e.keyCode == 10)) {
		//console.log('--CL27 finish: CtrlEnter--');
		let choice = CL27_SendToServer();
		
		//Remove listeners
		if (choice!=-1) {
			document.removeEventListener("keydown", CL27_onCtrlEnter);
	
			let completeBtn = document.querySelector("#completeBtn");
			completeBtn.removeEventListener("click", CL27_onBtnClick);	
		}
	}	
}

function CL27_SendToServer() {

	let reason_fin = CL27_GetFinalReason();
	if (reason_fin==null) return -1;
	
	
	
/*	
	let payload = {
		task: 'cl27',
		text: 'rt',
		reason_ini: 'abc',
		reason_fin: 'abc',		
	};	
	
	console.log('GiC_SendToServer: ', payload);
	
	let json = JSON.stringify(payload);
	
	$.post('http://localhost:8000/tw', json, function(data){
		console.log('GiC_SendToServer:', data);
	});
	
	return user_choice;
*/	
}

function CL27_GetFinalReason() {
	
	//Check 'Yes' option
	const btn_yes = document.querySelector("#klecks-app > tui-root > div > task > flex-view > flex-common-view > div.tui-container.tui-container_adaptive.flex-common-view__main > div > main > flex-element > flex-container > flex-element:nth-child(7) > flex-selection-tree > flex-selection-tree-children > div:nth-child(1) > div");
	
	
	
	
	return null;
}

/*
const reasons = [
{reason: 'Непонятно, зачем звонят', value: 0},
{reason: 'Звонят с каким-то опросом', value: 1},
{reason: 'Звонят по доставке', value: 2},
{reason: 'Звонят по такси', value: 3},
{reason: 'Звонят что-то продать', value: 4},
{reason: 'Звонят сообщить код', value: 5},
{reason: 'Перезванивают, потому что клиент когда-то обращался к звонящему (заявка, обращение, etc.)', value: 6},
{reason: 'Другая причина', value: 7}
]
*/

const reasons = [
'Непонятно, зачем звонят', //0
'Звонят с каким-то опросом', //1
'Звонят по доставке', //2
'Звонят по такси', //3
'Звонят что-то продать', //4
'Звонят сообщить код', //5
'Перезванивают, потому что клиент когда-то обращался к звонящему (заявка, обращение, etc.)', //6
'Другая причина', //7
]

const bad_words = [
'угу',
]

function DoCall027() {
	
	//buttons
	const btn_yes = document.querySelector("#klecks-app > tui-root > div > task > flex-view > flex-common-view > div.tui-container.tui-container_adaptive.flex-common-view__main > div > main > flex-element > flex-container > flex-element:nth-child(7) > flex-selection-tree > flex-selection-tree-children > div:nth-child(1) > div");

	if (btn_yes==null) return null;
	
	//Расшифровка и причина звонка
	const nodes = document.querySelectorAll('tui-editor-socket');
	//console.log('DoCall027', nodes);
	
	let call = {text: nodes[1].innerText, reason: nodes[2].innerText};
	//console.log('DoCall027', call);

	//Check the desinion
	let guess = CL27_GuessReason(call.text);
	//console.log('DoCall027-guess', guess);
				
	const GREEN_COLOR = '#ccffcc';	
	const RED_COLOR = '#ffcccc';
				
	if (guess!=null) {	
		if (guess==call.reason) {
			//btn_yes.click();
			CL27_HighlightReason(nodes[2], GREEN_COLOR);		
		} else {
			CL27_HighlightReason(nodes[2], RED_COLOR);		
		}
	}
	
	btn_yes.click();
	
	return call;
}

function CL27_GuessReason(call_text) {
	call_text = call_text.replaceAll('добрый день', '');
	
	let words = call_text.split(' ');
	
	//Удаляем не-значимые слова
	const words_to_delete = ['алло', 'здравствуйте', '-'];
	
	words = words.filter(function(item, index, array) {
		// если `true` -- элемент добавляется к results и перебор продолжается
		// возвращается пустой массив в случае, если ничего не найдено
		return ( !( words_to_delete.includes(item) || (item.length<=2) ) );	
		});
		
	console.log('CL27_GuessReason:', words);
	
	const MIN_COUNT_REASONABLE_WORDS = 3;
	if (words.length<=MIN_COUNT_REASONABLE_WORDS) return reasons[0]; //Непонятно зачем

	let flag = false;
	
	flag = call_text.includes('доставк');
	if (flag) return reasons[2]; //Доставка
	
	flag = call_text.includes('последние цифры номера');
	if (flag) return reasons[5]; //Код
	
	return null;
}

function CL27_HighlightReason(node, color) {
	
	node.innerHTML = `<span style="background-color:${color};">${node.textContent}</span>`;
	
}
