function GiC_onBtnClick(e) {
	let choice = GiC_SendToServer();
	
	//Remove listeners
	if (choice!=-1) {
		document.removeEventListener("keydown", GiC_onCtrlEnter);
	
		let completeBtn = document.querySelector("#completeBtn");
		completeBtn.removeEventListener("click", GiC_onBtnClick);	
	}
}

function GiC_onCtrlEnter(e) {
	if (e.ctrlKey && (e.keyCode == 13 || e.keyCode == 10)) {
		//console.log('--GiC finish: CtrlEnter--');
		let choice = GiC_SendToServer();
		
		//Remove listeners
		if (choice!=-1) {
			document.removeEventListener("keydown", GiC_onCtrlEnter);
	
			let completeBtn = document.querySelector("#completeBtn");
			completeBtn.removeEventListener("click", GiC_onBtnClick);	
		}
	}	
}

function GiC_SendToServer() {
	
//!!!!	
return;	
	
	let nodeA = document.querySelector(GiC_locators[GiC_task_version].locatorA);
	let nodeB = document.querySelector(GiC_locators[GiC_task_version].locatorB);

	if (nodeA.innerText.includes('backgroud')) {return -1}; //Already colorized

	let innerA = nodeA.innerText;	
	let innerB = nodeB.innerText;	

	idx = innerA.indexOf('Поиск товара');
	innerA = innerA.slice(0, idx).trim();

	idx = innerB.indexOf('Поиск товара');
	innerB = innerB.slice(0, idx).trim();

	//get user choice
    const radio_btns = document.querySelectorAll('input[type=radio]');
	
	let user_choice = -1;
	let i = 0
	for (const btn of radio_btns) 
		{if (btn.checked) user_choice = i; i++}
	
	if (user_choice==-1) return -1;
	
	let payload = {
		task: 'gic',
		links: [null,null],
		descr: [innerA, innerB],
		choice: user_choice		
	};	
	
	console.log('GiC_SendToServer: ', payload);
	
	let json = JSON.stringify(payload);
	
	$.post('http://localhost:8000/tw', json, function(data){
		console.log('GiC_SendToServer:', data);
	});
	
	return user_choice;
}

const GiC_locatorA_v1 = '#klecks-app main > flex-element > flex-container > flex-element:nth-child(2) > flex-text > tui-editor-socket';
const GiC_locatorB_v1 = '#klecks-app main > flex-element > flex-container > flex-element:nth-child(4) > flex-text > tui-editor-socket';

const GiC_locatorA_v2 = '#klecks-app main > flex-element > flex-container > flex-element:nth-child(3) > flex-text > tui-editor-socket';
//const GiC_locatorB_v2 = '#klecks-app main > flex-element > flex-container > flex-element:nth-child(8) > flex-text > tui-editor-socket';
const GiC_locatorB_v2 = '#klecks-app main > flex-element > flex-container > flex-element:nth-child(10) > flex-text > tui-editor-socket';

const GiC_locators = [ 
	{locatorA: GiC_locatorA_v1, locatorB: GiC_locatorB_v1},
	{locatorA: GiC_locatorA_v2, locatorB: GiC_locatorB_v2},
	];

var GiC_task_version;


function DoGoodsInCheck(task_version) {	
	console.log('DoGoodsInCheck() starts');

	GiC_task_version = task_version; //Save to global var

	//GiC_SendToServer();
	
	// Attach handlers to track exit 
	var completeBtn = document.querySelector("#completeBtn");
	//if (completeBtn.onclick==null) { completeBtn.onclick = GiC_SendToServer };
	completeBtn.addEventListener("click", GiC_onBtnClick);

	document.addEventListener("keydown", GiC_onCtrlEnter);
	
	//Main job
	var recommended_choice = -1;		
					
	var nodeA = document.querySelector(GiC_locators[task_version].locatorA);
	var nodeB = document.querySelector(GiC_locators[task_version].locatorB);

	if (nodeA.innerText.includes('backgroud')) {return -1}; //Already colorized
	
	//Same words in latin
	MarkSameLatin(nodeA, nodeB);
	
	//If did not find brand name in nodeB
	if (!nodeB.innerText.includes('backgroud')) {recommended_choice = MarkIfNoBrand(nodeB)};
	
	//Reformat if v2
	if (task_version==1) {
		GIC_ReformatPage(nodeA, nodeB);
		
		GIC_SelectDecision(0); // 0 = 'подходит', 1 = 'Совсем не подходит'		
		}

	//Scrool to view - should be after GIC_SelectDecision()
	var bound = document.links[0].getBoundingClientRect();
	const REQUIRED_TOP = 80;
	if (window.pageYOffset==0) {
            window.scroll(0, (bound.top-REQUIRED_TOP));
	}

	
	//Open search window for SOKOLOV
	SOKOLOV_special(nodeA, nodeB);
	
	return recommended_choice;	
} //DoGoodsInCheck

function GIC_SetMark(inner, match, index) {	

	const MARK_SAME_COLOR = '#ccffcc'; //defined in Obuv

	var colored_text = ''.concat(
							inner.slice(0, index), 
							'<span style="background-color:', '#ddd', ';">', 
							match, 
							'</span>', 
							inner.slice(index+match.length)
							);	
	colored_text = colored_text.replace('#ddd', MARK_SAME_COLOR);									
	
/*
	var colored_text = ''.concat(
							node.innerHTML.slice(0, index), 
							'{', 
							match, 
							'}', 
							node.innerHTML.slice(index+match.length)
							);	
*/	
							
	//console.log('colored:', colored_text);

	return colored_text;
};

//Разместить копию nodeB сразу под nodeA
function GIC_ReformatPage(nodeA, nodeB){
	let title = document.querySelector("#klecks-app > tui-root > div > task > flex-view > flex-common-view > div.tui-container.tui-container_adaptive.flex-common-view__main > div > main > flex-element > flex-container > flex-element:nth-child(5)")
		
	let pic = document.querySelector("#klecks-app > tui-root > div > task > flex-view > flex-common-view > div.tui-container.tui-container_adaptive.flex-common-view__main > div > main > flex-element > flex-container > flex-element:nth-child(6)");
	
	//Before radio buttons
	let dest_point = document.querySelector("#klecks-app > tui-root > div > task > flex-view > flex-common-view > div.tui-container.tui-container_adaptive.flex-common-view__main > div > main > flex-element > flex-container > flex-element:nth-child(13)");
	
	if ((title==null) || (pic==null) || (dest_point==null)) return;

	//Move titel and pic before dest_point	
	/*
	dest_point.parentNode.insertBefore(pic, dest_point);	
	dest_point.parentNode.insertBefore(title, pic);	
	*/
	console.log('GIC_ReformatPage-after');
	
	
}

function GIC_SelectDecision(choice) {
	const radio_btns = document.querySelectorAll('input[type=radio]');
	
	var anyChecked = false;
	for (const btn of radio_btns) 
		{anyChecked = anyChecked || btn.checked }
		
	if (anyChecked) {
		console.log('GIC_SelectDecision: already done');
		return;
	}
	
	console.log('GIC_SelectDecision: before click()');
    //radio_btns[choice].checked = true;	
	//radio_btns[choice].click();
	
	radio_btns[choice].parentNode.click();
	window.scroll(0, 0); //scroll back to top
 	
}
	


function MarkSameLatin(nodeA, nodeB) {
	
	var innerA = nodeA.innerText;	
	var innerB = nodeB.innerText;	
	
	var idx, hasAmp;
	idx = innerA.indexOf('Поиск товара');
	if (idx!=-1) innerA = innerA.slice(0, idx);

	idx = innerB.indexOf('Поиск товара');
	if (idx!=-1) innerB = innerB.slice(0, idx);
	
	var innerA0 = innerA; //backup original (not colored) value
	var innerB0 = innerB; //backup original (not colored) value
		
	//Split to words (only digits and latin chars)
	//const regexp = /([a-zA-Z0-9]+)/g;	
	const regexp = /[&\w]\w*/g;	
	var matchesA  = innerA.matchAll(regexp);
	var matchesB  = innerB.matchAll(regexp);	
	
	// Copy to array
	var Ar=[]; 
	for (const m of matchesA) Ar.push( {match: m[0], index: m.index, marked: false} );	
	
	var Br=[]; 
	for (const m of matchesB) Br.push( {match: m[0], index: m.index, marked: false} );	
		
	Ar = Ar.filter((item) => !item.match.startsWith('&'));
	Br = Br.filter((item) => !item.match.startsWith('&'));
				
	//console.log('Ar:', Ar);		
	//console.log('Br:', Br);	

	//for (var m of Br) console.log('Bt.index:', m.index);

	//Compare and mark - Br	
	for (let j = Br.length-1; j>=0; j--) 
		for (let i = Ar.length-1; i>=0; i--) {
			if (Ar[i].match.toUpperCase()==Br[j].match.toUpperCase()) {		
				
				/*if (!Ar[i].marked) {
					GIC_SetMark(nodeA, Ar[i].match, Ar[i].index);
					Ar[i].marked = true;
				}*/
				
				if (!Br[j].marked) {
					innerB = GIC_SetMark(innerB, Br[j].match, Br[j].index);
					Br[j].marked = true;
				} 
				
			} //for
		} //for

	//console.log('innerB:', innerB);

	//idx = nodeB.innerHTML.indexOf('<a href');
	//nodeB.innerHTML = innerB + nodeB.innerHTML.slice(idx);	
	nodeB.innerHTML = ''.concat(innerB,
								'<a href="https://yandex.ru/search/?text=',
								escapeHtml(innerB0),
								'"> Поиск товара</a>');
		
	//Compare and mark - Ar
	for (let i = Ar.length-1; i>=0; i--) 
		for (let j = Br.length-1; j>=0; j--) {
			if (Ar[i].match.toUpperCase()==Br[j].match.toUpperCase()) {		
				
				if (!Ar[i].marked) {
					innerA = GIC_SetMark(innerA, Ar[i].match, Ar[i].index);
					Ar[i].marked = true;
				}
				
				/*if (!Br[j].marked) {
					GIC_SetMark(nodeB, Br[j].match, Br[j].index);
					Br[j].marked = true; 
				} */
				
			} //for
		} //for

	//hasAmp = nodeA.innerText.indexOf(Ar[0].match);
	//console.log('innerA:', innerA);

	//idx = nodeA.innerHTML.indexOf('<a href');
	//nodeA.innerHTML = innerA + nodeA.innerHTML.slice(idx);	
	
	nodeA.innerHTML = ''.concat(innerA,
								'<a href="https://yandex.ru/search/?text=',
								escapeHtml(innerA0),
								'"> Поиск товара</a>');
	
	return;	
}

function MarkIfNoBrand(nodeB) {

	const DIFF_COLOR = '#ffcccc';

	var innerB = nodeB.innerText;

	var innexB, idx;
	idx = innerB.indexOf('Поиск товара');
	innerB = innerB.slice(0, idx);

	var words = innerB.split(' ');
	
	var hasBrand = false;
	var isFirst = true;
	for (var w of words) {
		if (w.match(/(^[A-Z|a-z]+)/gm)) {
			hasBrand = true;  // 'PUMA'
			//console.log('MarkIfNoBrand-F:', w);
		}
		
		if (!isFirst && w.match(/([А-Я]+[а-я]*)/gm)) {
			hasBrand = true; // 'Соколов'
			//console.log('MarkIfNoBrand-Я:', w);
		}
		
		isFirst = false;
	}
	
	//console.log('MarkIfNoBrand', hasBrand);
	
	if (!hasBrand) {
		nodeB.innerHTML = `<span style="background-color:${DIFF_COLOR};">${innerB}</span><a href="https://yandex.ru/search/?text='${escapeHtml(innerB)}'"> Поиск товара</a>`;		
	}	
		
	return -1;
}

//*****
const entityMap = {
  //'&': '&amp;',
  '&': '%26',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};
function escapeHtml(string) {
  return String(string).replaceAll(/[&<>"'`=\/]/g, (s) => entityMap[s]);
}

/*
	NodeA: '94031896: подвеска мусульманская из серебра с зелеными и синим фианитами (9108217691644)'
	Nodeb: 'Серебряное обручальное парное кольцо SOKOLOV 94110002'
*/	
function SOKOLOV_special(nodeA, nodeB){
	if (!nodeB.textContent.includes('SOKOLOV')) return;
	
	var id = nodeA.textContent.split(':')[0];
	//var url = `https://www.google.ru/search?q=site%3Asokolov.ru+${id}`
	var url = `https://sokolov.ru/jewelry-catalog/product/${id}/`
	
	// console.log('SOKOLOV_special', url);
	
    GM_openInTab(url);
};