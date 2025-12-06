function DoCallType(taskVesrion, exam) {
	console.log('DoCallType() begin (Presets.js)')
	
	const radio_btns = document.querySelectorAll('input[type=radio]');
	//console.log('DoCallType() btns:', radio_btns.length)
	
	let anyChecked = false;
	for (const btn of radio_btns) 
		{anyChecked = anyChecked || btn.checked }
	
	if (anyChecked) return; //выбор уже сделан	
	
	radio_btns[1].parentNode.click(); //'личные сообщения'
	radio_btns[14].parentNode.click(); //'невозможно определить'

	window.scroll(0, -30);
	console.log('DoCallType() after scroll')
	
	return;
};

/*
function DoCheckImage(taskVesrion, exam) {
	//console.log('DoCheckImage() begin')
	
	const radio_btns = document.querySelectorAll('input[type=radio]');
	
	let anyChecked = false;
	for (const btn of radio_btns) 
		{anyChecked = anyChecked || btn.checked }
	
	if (anyChecked) return; //выбор уже сделан	
	
	radio_btns[0].parentNode.click(); //'безопасно'
	
	return;
}	
*/

function DoCheckImage(taskVesrion, exam) {
	//console.log('DoCheckImage ver:', taskVersion)
	if (!RB_alreadySet()) {
		if (taskVersion==0) {  //Безопасная картинка
		RB_set(0);
		} 	
		if (taskVersion==1) { //Обнаженные органы
		RB_set(1);
		} 	
		
	}	
	
	return;
}	

