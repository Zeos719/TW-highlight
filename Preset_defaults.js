function DoCallType() {
	console.log('DoCallType() begin')
	
	const radio_btns = document.querySelectorAll('input[type=radio]');
	//console.log('DoCallType() btns:', radio_btns.length)
	
	let anyChecked = false;
	for (const btn of radio_btns) 
		{anyChecked = anyChecked || btn.checked }
	
	if (anyChecked) return; //выбор уже сделан	
	
	radio_btns[1].parentNode.click(); //'личные сообщения'
	radio_btns[14].parentNode.click(); //'невозможно определить'

	window.scroll(0, -30);
	
	return;
};

/*
function DoCheckImage() {
	console.log('DoCheckImage() begin')
	
	const radio_btns = document.querySelectorAll('input[type=radio]');
	
	let anyChecked = false;
	for (const btn of radio_btns) 
		{anyChecked = anyChecked || btn.checked }
	
	if (anyChecked) return; //выбор уже сделан	
	
	radio_btns[0].parentNode.click(); //'безопасно'
	
	return;
}	
*/

function DoCheckImage() {
	Preset_RB(0);
	return;
}	

// Preset RadioButtons
// Usage: Preset_RB(0) or Preset_RB([1,10])
function Preset_RB(choice) {
	console.log(`Preset_RB(${choice.toString()}) begin`);
	
	const radio_btns = document.querySelectorAll('input[type=radio]');

	let anyChecked = false;
	for (const btn of radio_btns) 
		{anyChecked = anyChecked || btn.checked }
	
	if (anyChecked) return; //выбор уже сделан	

	if (typeof(choice)=='number') choice = [choice];
	
	for(let ch in choice) {
		radio_btns[ch].parentNode.click();
		
	} //for(ch)
	
	return;
}
