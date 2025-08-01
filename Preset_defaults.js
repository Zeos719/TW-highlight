function DoCallType() {
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
function DoCheckImage() {
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

function DoCheckImage(taskVersion) {
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

// Preset RadioButtons
// Usage: RB_set(0) or RB_set([1,10])
function RB_set(choice) {
	//console.log(`RB_set(${choice.toString()}) begin`);
	
	const radio_btns = document.querySelectorAll('input[type=radio]');
	//console.log('RB_set() rb:', radio_btns);

	if (typeof(choice)=='number') choice = [choice];
	
	for(let i=0; i<choice.length; i++) {
		radio_btns[ choice[i] ].parentNode.click();
	} //for(ch)
	
	return;
}


function RB_get() {
	//console.log('RB_get() begin');
	
	const radio_btns = document.querySelectorAll('input[type=radio]');

	for(let i=0; i<radio_btns.length; i++) 
		if (radio_btns[i].checked) 
			return i;			
	
	return -1;
}


function RB_alreadySet() {
	//console.log('RB_alreadySet() begin');
	
	const radio_btns = document.querySelectorAll('input[type=radio]');

	let anyChecked = false;
	for (const btn of radio_btns) 
		{anyChecked = anyChecked || btn.checked }
	
	return anyChecked;
}
