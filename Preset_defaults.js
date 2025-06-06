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

function SaveCanvas(cnv) {
	const dataUrl = cnv.toDataURL('image/png');
	const link = document.createElement('a');
	link.href = dataUrl;
	link.download = 'safe-pic.png'; // Это было бы по душе Пикассо 👍
	//link.innerText = '*** Save the picture ***';
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link); // Не забывайте подчищать после себя
}


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

		let canvas = document.getElementsByTagName('canvas');
		//console.log('SaveCanvas canv', canvas)
/*
		let im_1 = canvas[0].getContext('2d');
		console.log('SaveCanvas GetCont 0', im_1)

		im_1.moveTo(30,30); 
		im_1.lineTo(30,60); 
		im_1.lineTo(60,60); 
		im_1.lineTo(60,30); 
		im_1.lineTo(30,30);
		im_1.stroke(); 	

		im_1 = canvas[1].getContext('2d');
		console.log('SaveCanvas GetCont 1', im_1)

		im_1.moveTo(90,30); 
		im_1.lineTo(120,30); 
		im_1.lineTo(120,60); 
		im_1.lineTo(90,60); 
		im_1.lineTo(90,30);
		im_1.stroke(); 	
*/			
		//canvas[0].style.border = "solid 2px green";
		//canvas[1].style.border = "solid 4px red";			
			
		//SaveCanvas(canvas[1]);
			
		}  //version 0
		
		if (taskVersion==1) { //Обнаженные органы
		RB_set(1);
		} //version 1	
		
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

function RB_alreadySet() {
	//console.log('RB_alreadySet() begin');
	
	const radio_btns = document.querySelectorAll('input[type=radio]');

	let anyChecked = false;
	for (const btn of radio_btns) 
		{anyChecked = anyChecked || btn.checked }
	
	return anyChecked;
}
