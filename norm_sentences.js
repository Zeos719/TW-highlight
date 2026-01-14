var	norm_sent = null;

function DoNormSent(taskVersion, exam){
	
	console.log('DoNormSent start');	
		
	if (norm_sent==null) {
		norm_sent = new NormSent();
	}

	try {
		norm_sent.Run()
	} catch(err) {
		console.log('NormSent.DoQueAnsw', err)
	}
	

};

//******************** class NormSent ********************
class NormSent {
  //constructor(name) { this.name = name; }
  //sayHi() { alert(this.name); }

	constructor() {
		console.log('NormSent.constructor');

		this.queNodes = null; //for Auto

	} //constructor

	Run() {
		
		let editors = document.querySelectorAll('tui-editor-socket');
		if (editors.length!=6) return;
		
		this.queNodes = [];
		for (let i=1; i<6; i+=2) this.queNodes.push( editors[i] );		
		
		//console.log('NormSent.queNodes', this.queNodes);
		
		this.CompareQues();
		

		
	} //Run

	CompareQues() {
		
	let queOrig = this.queNodes[0].innerText;
	let que1 = this.queNodes[1].innerText;
	let que2 = this.queNodes[2].innerText;
	
	const charToDelete = /[\.\,\?\:\;\"]/g;
	queOrig = queOrig.replace(charToDelete, '')
	que1 = que1.replace(charToDelete, '')
	que2 = que2.replace(charToDelete, '')

	//console.log('NormSent.CompareQues', queOrig, que1, que2);
	
	//Полное совпадение
	if (que1==que2) {
		console.log('NormSent.CompareQues-same');
		this.queNodes[1].style.backgroundColor = 'LightCyan';
		this.queNodes[2].style.backgroundColor = 'LightCyan';
		
		RB_set(2, false);
	
		return;
	}
		
	const colorRed = '#ffd6cc';
	const colorGreen = 'LightCyan';
		
	let colorized = Strings_CompareAndColor(this.queNodes[1].innerText, this.queNodes[2].innerText, colorRed, colorGreen);
	this.queNodes[1].innerHTML = colorized[0];
	this.queNodes[2].innerHTML = colorized[1];
	
	return;
	} //CompareQues
	


} //NormSent