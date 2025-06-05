//Навигация DOM: https://learn.javascript.ru/dom-navigation


function Obuv_onBtnClick(e) {
	let choice = -1;

	if (SEND_TO_SERVER) {
		choice = Obuv_SendToServer()
	} else {
		choice = 0; //?!
	}

	//Remove listeners
	if (choice!=-1) {
		document.removeEventListener("keydown", Obuv_onCtrlEnter);

		let completeBtn = document.querySelector("#completeBtn");
		completeBtn.removeEventListener("click", Obuv_onBtnClick);
	}
}

function DrawAutoIndicator(isOn) {
	console.log('Toggle autoRun');

	let completeBtn = document.querySelector("#completeBtn");

	if (completeBtn && !Object.hasOwn(this, 'originalText')) this.originalText = completeBtn.textContent;

	if (isOn) {
		//completeBtn.style.background = 'solid 2px green';
		completeBtn.textContent = this.originalText + '\u00A0💥'; //☑ ▶💥😎✔✈
	} else {
		//completeBtn.style.background = '';
		completeBtn.textContent = this.originalText; //'Завершить задание';
	}

} //DrawAutoIndicator()

function Obuv_onCtrlEnter(e) {
	let choice = -1;

	//Ctrl-Enter
	if (e.ctrlKey && (e.keyCode == 13 || e.keyCode == 10)) {
		//console.log('Obuv_onCtrlEnter: CtrlEnter--');

		if (SEND_TO_SERVER) {
			choice = Obuv_SendToServer()
		} else {
			choice = 0; //?!
		}

		//Remove listeners
		if (choice!=-1) {
			document.removeEventListener("keydown", Obuv_onCtrlEnter);

			let completeBtn = document.querySelector("#completeBtn");
			completeBtn.removeEventListener("click", Obuv_onBtnClick);
		}
	}

	//Toggle AutoRun
	if (e.ctrlKey && (e.keyCode == 192)) { //Ctrl + ~
	//if (e.ctrlKey && e.altKey && (e.keyCode == 13 || e.keyCode == 10)) { //Ctrl + Alt + ENTER
		autoRun = !autoRun;
		DrawAutoIndicator(autoRun);
	}
	
	//Reset focus
	/*
	if (event.key == 'ArrowUp') { //Up
		//console.log('KeyUp');
		const radio_btns = document.querySelectorAll('input[type=radio]');
		if (radio_btns && radio_btns.length)
			radio_btns[0].focus();
	}
	*/
	
}

function Obuv_SendToServer() {

	let titles = document.getElementsByClassName('name');
	let brands = document.getElementsByClassName('brand');
	let links = document.links;

	//get user choice
	const radio_btns = document.querySelectorAll('input[type=radio]');

	let user_choice = -1;
	let i = 0
	for (const btn of radio_btns)
		{if (btn.checked) user_choice = i; i++}

	if (user_choice==-1) return -1;

	let payload = {
		task: 'obuv',
		links: [links[0].href, links[1].href],
		descr: [titles[0].textContent, titles[1].textContent],
		brand: [brands[0].textContent, brands[1].textContent],
		choice: user_choice
	};

	console.log('Obuv_SendToServer-1: ', payload);

	let json = JSON.stringify(payload);

	$.post('http://localhost:8000/tw', json, function(data){
		console.log('Obuv_SendToServer-2:', data);
	});

	return user_choice;
}


// Convert <table> to a list of rows. tbl is a node! tbl = node.firstElementChild
function Parse_table(tbl) {

		let tbl_list = [];
		for (let row of tbl.rows) {
			row_list = [];

			for(let cell of row.cells)
				row_list.push(cell.textContent.trim());

			tbl_list.push(row_list);
		} //for(row)

	return tbl_list;

} //Parse_table


//Parse string like '.. key1:value1. key2:value2. ' Delimiter = '. '
function Parse_text(txt, delim) {

	let items = txt.split(delim);
	//console.log('Parse_text', items);

	let pairs = [];
	for (let it of items) {
		let pos = it.indexOf(':');
		if (pos >= 0)
			pairs.push([it.slice(0, pos).trim(), it.slice(pos+1).trim()]);
	} //for(it)

	return pairs;
} //Parse_text


//********************* Два товара (обувь)	********************************

let obv = null;

function DoObuv() {

	console.log('DoObuv() starts');

	if (obv==null) obv = new Obuv();

	if (document.links.length==2) {
		obv.MainJob();
	}

	return;
}





/*** v2 ***/

//Размер не предустановлен

var Size_not_preset = [
//'https://www.shoppinglive.ru',
'https://ekonika.ru/',
'https://www.rendez-vous.ru/',
'https://zenden.ru/',
'https://respect-shoes.ru/',
'https://mascotte.ru/',
'https://nonconform.ru/',
'https://lacoste.ru/',
'https://www.noone.ru/',
'https://www.gulliver.ru/',
'https://thomas-muenz.ru/',
'https://www.noone.ru/',
'https://kamen.ltd/',
'https://ashrussia.ru/',
'https://allweneed.ru/',
'https://tom-tailor.ru/',
'https://loverepublic.ru/',
'https://akhmadullinadreams.com/'
]

//Размер установлен

var Size_is_set = [
'https://nuw.store',
'https://hb-happybaby.com/',
'https://wysh-brand.com/',
'https://brandshop.ru/',
'https://desport.ru/',
'https://kanzler-style.ru/',
'https://tamaris.ru/',
'https://parkanet.ru/',
'https://ru.benetton.com',
'https://sport-marafon.ru/'
]


/*
 Return:	-1 = unknown\
			0 = not defined
			1 = defined
*/
function Sort_sites(href){

	//console.log('href:', href);
	for (let site of Size_not_preset ) {
		if (href.startsWith(site)) return 0;
	}

	for (let site of Size_is_set ) {
		if (href.startsWith(site)) return 1;
	}

	return -1;
}

/* Return:
 -1 = unknown
 0 = equal
 1 = partialy equals
 2 = abs different
*/

function Links_start_with(links, pref) {
	let ret = true;
	for (let i=0;i<links.length;i++)
		ret = ret && links[i].href.startsWith(pref);

	return ret;
}


//*****************************
//	Mark string with colors
//
//var str1 = 'Aaaa	 CCC Bbbb (123-156) CCC:XL';
//var str2 = 'Aaaa	 Dddd  (123-156) CCC:S';
//
//[str1, str2] = Strings_CompareAndColor(str1, str2, colorRed='RED', colorGreen=null);
//
//console.log(str1 , '\n', str2, '\n');

function Strings_CompareAndColor(str1, str2, colorRed='#ff0000', colorGreen='#00ff00', delim=/\s|\(|\)|:|,/) {

	let words1 = Split_WordsAndPos(str1, delim);
	let words2 = Split_WordsAndPos(str2, delim);

	//Add member 'hasPair'
	words1.forEach(	 function(item) {item.hasPair = false} );
	words2.forEach(	 function(item) {item.hasPair = false} );

	//Compare
	for (let i=0;i<words1.length;i++) {
		for (let k=0;k<words2.length;k++) {
			if (words1[i].hasPair || words2[k].hasPair) continue;

			if (words1[i].word == words2[k].word) {
				words1[i].hasPair = true;
				words2[k].hasPair = true;
			}
		} //for (k)
	} //for (i)

	//Colorize
	let colorized1 = Strings_ApplyColors(str1, words1, colorRed, colorGreen);
	let colorized2 = Strings_ApplyColors(str2, words2, colorRed, colorGreen);

	//console.log('words1', words1);
	//console.log('words2', words2);
   return [colorized1, colorized2];
}


function Split_WordsAndPos(str, delim =	 /\s|\(|\)|:/) {
	//console.log('Split_WordsAndPos:', str, delim);
	let words = str.split(delim);

	words = words.filter( function(item) {return item!=''} ); //filter out empty items

	let startFrom = 0;
	for(let i=0;i<words.length;i++) {

		let pos = str.indexOf(words[i], startFrom);
		startFrom = pos + words[i].length;

		words[i] = {word: words[i], pos: pos};
	}
	//console.log(words);
	return words;
}

function Strings_ApplyColors(str, words, colorRed, colorGreen) {
	let colorized = str;

	for (let i=words.length-1; i>=0; i--) {
		let prefix = colorized.slice(0, words[i].pos);
		let suffix = colorized.slice(words[i].pos+words[i].word.length);

		let color = words[i].hasPair?colorGreen:colorRed;
		if (color==null) continue;

		colorized = `${prefix}<span style="background-color:${color};">${words[i].word}</span>${suffix}`;
	} //for (i--)

	//console.log(str, '\n', colorized, '\n');

	return colorized;
}

/*
	Accepts: txt = 'begin Code: ML-12-45 final', anchors = ['Code:', 'Articul:']
	Return: null if not found
		or	struct {anchor: 'Code:', anchorPos=11, value='ML-12-45', valuePos=17}
*/
function LocateAfterAnchor(txt, anchors) {
	const regExp = /(\S+)/gm; //words of non-space symbols

	let matches = txt.matchAll(regExp);
	let matchesArr = Array.from(matches);

	//console.log('LocateAfterAnchor:', matchesArr);

	for (let i=0; i<matchesArr.length; i++) {
		let match = matchesArr[i];

		for (let anchor of anchors) {
			//console.log('LocateAfterAnchor:', anchor, match[0]);
			if (anchor==match[0]) {
				let ret = {anchor: anchor, posAnchor: match.index};

				if (i<=(matchesArr.length-2)) {
					let machtNext = matchesArr[i+1];
					ret.value = machtNext[0];
					ret.posValue = machtNext.index;
				} //if ()

				return ret;
			} //if ()
		} //for(anchors)
	} //for(matches)

	return null;
}


//*****************************

function IsDigit(c) {
	let charCode = c.charCodeAt(0);
	return (charCode>=0x30) && (charCode>=0x3A);	
}

function IsCyrrilic(c) {
	c = c.toUpperCase()
	let charCode = c.charCodeAt(0);
	return (c=='Ё') || ((charCode>=0x0410) && (charCode<=0x42F));	
}

//********************* class ValidBrands  ********************************
var vbd_count = 0;

class ValidBrands {
  //constructor(name) { this.name = name; }
  //sayHi() { alert(this.name); }

	constructor() {
		//console.log('ValidBrands.constructor');
		this.brandsList = null;
	} //constructor

	HasData() {
		//let ret = (this.brandsList!=null);
		let ret = (this.brandsList && 
				this.brandsList.hasOwnProperty('letu') &&
				this.brandsList.hasOwnProperty('lamoda') );
				
		if (!ret)
				console.log('ValidBrands.HasData - no data loaded!');
				
		return ret;
	} //HasData

	Load_JSON() {
		//console.log('ValidBrands.Load_JSON');

		let myself = this;  //save 'this' for use inside callback!!!

		$.get('http://localhost:8000/brands', '', function(data){
			//console.log('ValidBrands.get', data);

			myself.brandsList = JSON.parse(data);

			//console.log('ValidBrands', myself.brandsList);

			myself.NamesToUpper();
			});

	} //Load_JSON
	
	SaveServerAnswer(url, data) {
		//console.log('ValidBrands.SaveServerAnswer', url, this.brandsList, data.slice(0,20));
		
		//Parse url: https://www.phonewarez.ru/files/TW-brands/Letu/А-Я.cp1251.txt
		let tokens = url.split('/');
		let fileNameWithExt  = tokens[ tokens.length-1 ];  // 'А-Я.cp1251.txt'
		let fileName  = fileNameWithExt.split('.')[0].toUpperCase(); // 'А-Я'
		
		let folder  = tokens[ tokens.length-2 ].toLowerCase(); // 'letu'
		
		//Split data to lines and pre-process them
		let dataLines = data.split('\r');
		
		for (let i=0;i<dataLines.length;i++)
			dataLines[i] = dataLines[i].trim().toUpperCase();
						
		let dataLines_notEmpty = [];
		//dataLines.forEach(function(s) {if(s) dataLines_notEmpty.push(s)});
		dataLines_notEmpty = dataLines.filter(function(s) {return (s!='')});
		
		
		//Attach to brandsList
		if (folder=='letu') {
			if (this.brandsList['letu']==undefined)
				this.brandsList['letu'] = {};
			
			this.brandsList['letu'][fileName] = dataLines_notEmpty;			
		} else {			
			this.brandsList[folder] = dataLines_notEmpty;
		}	
			
		return		
	} //SaveReceivedFile
	
	Load_TXT() {
		console.log('ValidBrands.Load_TXT');

		let myself = this;  //save 'this' for use inside callback!!!
		
		this.brandsList = {}; //Empty dictionary
				
		let rootUrl = 'https://www.phonewarez.ru/files/TW-brands/';
	
		//Lamoda
		let url = rootUrl + 'Lamoda/Lamoda-brands.txt';
		
		$.get(url, '', function(data){
				myself.SaveServerAnswer(this.url, data); //this.url ! 'this' referes settings of GET() function!
				vbd_count += 1;
		} );

		//Letu
		const CODE_A = 65;
		const CODE_Z = 90;
		
		let letu_files = ['0-9.txt', 'А-Я.cp1251.txt'];
		
		for (let charCode=CODE_A;charCode<=CODE_Z;charCode++) {
			let fileName  = String.fromCharCode(charCode) + '.txt'; 'A.txt'
			letu_files.push(fileName);			
		} //for(charCode)
				
		letu_files.forEach(function(fileName) {
			url = rootUrl + 'Letu/' + fileName;
			
			$.get(url, '', function(data){
					//console.log('Load_TXT-GET', this.url);
					myself.SaveServerAnswer(this.url, data); //this.url ! 'this' referes settings of GET() function!
					vbd_count += 1;
			} );
		} ); //forEach
		
	} //Load_TXT()
		

	NamesToUpper() {
		if (!this.HasData()) return;

		//To upper - Lamoda
		let list = this.brandsList['lamoda'];
		for(let i=0;i<list.length;i++) {
			list[i] = list[i].toUpperCase();
		}

		this.brandsList['lamoda'] = list;

		//To upper - Letu
		let letu = this.brandsList['letu'];
		for (const [key, list] of Object.entries(letu)) {
			for(let i=0;i<list.length;i++) {
				list[i] = list[i].toUpperCase();
			}

			letu[key] = list;
			}

		this.brandsList['letu'] = letu;
	  } //NamesToUpper

	Includes(name) {
		if (!this.HasData()) return false;

		name = name.toUpperCase();

		if ((name==null) || (name=='')) return false;

		let ret;
		
		//console.log('ValidBrands.Includes brandsList', this.brandsList, this.brandsList['letu']);
		
		//Check Letu
		let letu = this.brandsList['letu'];
		let first_ltr = name[0];

		if (letu.hasOwnProperty(first_ltr)) {
			ret = letu[first_ltr].includes(name);
			if (ret) return true;
			};

		if (letu.hasOwnProperty('0-9') && IsDigit(first_ltr)) {
			ret = letu['0-9'].includes(name);
			if (ret) return true;
			};

		if (letu.hasOwnProperty('А-Я') && IsCyrrilic(first_ltr)) {
			ret = letu['А-Я'].includes(name);
			if (ret) return true;
			};

		//Check Lamoda
		let lamoda = this.brandsList['lamoda'];
		ret = lamoda.includes(name);
		if (ret) return true;

		return false;
  } //Includes()


} // *** class ValidBrands ***


//********************* Class Obuv ********************************
const OT_OBUV = 0;
const OT_PARFUM = 1;
const OT_CLOTHES = 2;

class Obuv {
  //constructor(name) { this.name = name; }
  //sayHi() { alert(this.name); }

	constructor() {
			console.log('Obuv.constructor');
			this.GREEN_COLOR_LIGHT = '#ccffcc';

			// Preload brands
			this.brands = new ValidBrands();
			this.brands.Load_TXT();
		}

	MainJob() {
		// Attach handlers to track exit
		let completeBtn = document.querySelector("#completeBtn");
		completeBtn.addEventListener("click", Obuv_onBtnClick);

		document.addEventListener("keydown", Obuv_onCtrlEnter);

		//Preset default
		this.Reset();
		this.SelectDecision(2); //'Abs differ' by deffault
		this.subTask = this.DetectSubTask();
		console.log('Obuv subTask:', this.subTask);

		DrawAutoIndicator(autoRun);

		//Scrool to view main part
		let bound = document.links[0].getBoundingClientRect();
		const REQUIRED_TOP = 600; //80
		//console.log('Tw bound:', bound.top);
		if (window.pageYOffset==0) {
			window.scroll(0, (bound.top-REQUIRED_TOP));
			}

		//Main
		this.attr = this.Parse_Attributes();
		console.log('attr', this.attr);

		for (let idx=0;idx<2;idx++)
			if (document.links[idx].href.startsWith('https://www.letu.ru/'))
				this.Letu_add_sku(idx);

		this.Compare_href_byParts(document.links);

		this.Compare_Titles();
		this.Compare_Brands();
		this.Compare_VendorCode();

		//Auto-select
		let choice = this.AutoDecision_v2();
		console.log('AutoDecision: ', choice);
		this.AutoDecision_choice = choice; //For UpdateMyInfo

		if (choice!=-1) {

			//setTimeout(RB_set, 1000, choice);

			if (autoRun) {
				setTimeout((choice) => {
					//console.log("AutoDecision fired:", choice);
					RB_set(choice);

					let completeBtn = document.querySelector("#completeBtn");
					completeBtn.click();

				}, "2000", choice);
			} //if(autoRun)
		}// if(choice)

		//Display
		this.UpdateMyInfo();


		//Auto select for https://superstep.ru - 'недостаточно данных' и выход
		/*
		if (document.links[0].href.includes('superstep.ru') &&
		   (document.links[0].href==document.links[1].href) ) {

			RB_set(3); //Данных недостаточно

			let completeBtn = document.querySelector("#completeBtn");
			completeBtn.click();
		   } // superstep.ru
		*/

	return;
	} //MainJob

	//choice = 0,1,2 (see Obuv_AutoDecision() )
	SelectDecision(choice) {
		if (RB_alreadySet()) { return }

		RB_set(choice)
		window.scroll(0, 0); //scroll back to top
	} //SelectDecision()

	Compare_href_byParts(links) {
		if (links[0].innerHTML.includes('span')) {//already done
			return };

		let parts0 = links[0].href.split(/\/|\?/);
		let parts1 = links[1].href.split(/\/|\?/);

		let equals_till = 0
		for (let i = 0; i < Math.min(parts0.length, parts1.length); i++) {
			if (parts0[i]==parts1[i]) {
				equals_till = equals_till + parts0[i].length + 1
			} else {
				break };
		}

		if (equals_till>0) {
			let colored_text1 = ''.concat('<span style="background-color:', '#ddd', ';">', links[0].href.slice(0, equals_till), '</span>', links[0].href.slice(equals_till));
			let colored_text2 = ''.concat('<span style="background-color:', '#ddd', ';">', links[1].href.slice(0, equals_till), '</span>', links[1].href.slice(equals_till));
			//console.log('Tw color', colored_text2);

			links[0].innerHTML = colored_text1;
			links[1].innerHTML = colored_text2;
		}
	} //Compare_href_byParts()


	Compare_Titles() {
		let titles = document.getElementsByClassName('name');

		let title1 = titles[0];
		let title2 = titles[1];

		if (title1.innerHTML.includes('<span')) return; //Already done

		let colorized1, colorized2;
		[colorized1, colorized2] = Strings_CompareAndColor(title1.textContent, title2.textContent, '#ffcccc', null);

		title1.innerHTML = colorized1;
		title2.innerHTML = colorized2;

		return;
	} //Compare_Titles()


	DelicateCompareBrands(br1, br2) {
		//O'stin <-> O`stin
		br1 = br1.replace("'", "").replace("`", "").replace("&", "");
		br2 = br2.replace("'", "").replace("`", "").replace("&", "");

		//adidas == adidas original
		if ((br1!="") && (br2!="")) {
			if (br1.startsWith(br2) || br2.startsWith(br1)) return true;
		}

		return (br1==br2);
	} //DelicateCompareBrands

	Compare_Brands() {

		let brands = document.getElementsByClassName('brand');

		let brand1 = brands[0];
		let brand2 = brands[1];

		if (brand1.innerHTML.includes('<span')) return; //Already done

		let txt1 = brand1.textContent.toLowerCase();
		let txt2 = brand2.textContent.toLowerCase();

		if (!this.DelicateCompareBrands(txt1,txt2)) {
			const DIFF_COLOR = '#ff0000';

			brand1.innerHTML = `<span style="background-color:${DIFF_COLOR};">${brand1.textContent}</span>`;
			brand2.innerHTML = `<span style="background-color:${DIFF_COLOR};">${brand2.textContent}</span>`;
		}

		let choice = -1;
		if ((txt1!='') && (txt2!='') && (txt1!=txt2)) choice = 2; 'Abs differ'

		return choice;
	} //Compare_Brands


	Compare_VendorCode() {
		if (this.attr.length==0) return;
		
		//Get vendor codes
		this.vendorCodes = [null, null];
		
		for (let i=0;i<2;i++) {
			this.attr[i].forEach((elem)=>{if (elem[0]=='vendorCode') this.vendorCodes[i]=elem[1]} );			
		}		
		console.log('Compare_VendorCode', this.vendorCodes);
		
		//Compare and colorize
		//if ((this.vendorCodes[0]==null) || (this.vendorCodes[1]==null)) return;
		for(let i=0;i<2;i++)
			this.vendorCodes[i] = this.vendorCodes[i] || '?';
	
		let colorized = Strings_CompareAndColor(this.vendorCodes[0], this.vendorCodes[1], null, this.GREEN_COLOR_LIGHT, /\-|\./);
		//console.log('Compare_VendorCode_table clr:', colorized);

		let nodes = document.getElementsByClassName('attributes');

		nodes[0].innerHTML = nodes[0].innerHTML.replaceAll(this.vendorCodes[0].value, colorized[0]);
		nodes[1].innerHTML = nodes[1].innerHTML.replaceAll(this.vendorCodes[1].value, colorized[1]);
		
	}//Compare_VendorCode()
	
	
	Reset() {
		console.log('Obuv.Reset()');
		//console.log('Images:', document.images);

		//for (const image of document.images) {
		//} //for

		//Insert myInfo fileds
		const infos = document.querySelectorAll('.twinfo');	//select by class

		if (infos.length==0)
			for (let i=0;i<document.links.length;i++) {
				let newNode = document.createElement("div");
				//newNode.textContent = '*** my info 2 ***';
				newNode.className = "twinfo";

				document.links[i].parentNode.prepend(newNode);
			} //for

		//Reset vars
		this.vendorCodes = [];
		this.subTask = -1;
		this.attr = null;


	} //Reset()

/*
	UpdateMyInfo() {
		const infos = document.querySelectorAll('.twinfo');	//select by class

		let txt;
		//Vendor codes
		txt = 'vendor: ' + (this.vendorCodes[0]  || '?')  + ' / ' + (this.vendorCodes[1]  || '?');
		this.MyInfo_AddLine(txt);
		
		//Оттенок
		let color = [null, null];
		for (let i=0;i<2;i++) 
			this.attr[i].forEach((elem)=>{if (elem[0]=='Оттенок') color[i]=elem[1]} );			
		
		if (color[0] || color[1]){
			txt = 'Оттенок: ' + (color[0]  || '?')  + ' / ' + (color[1]  || '?');
			this.MyInfo_AddLine(txt);
		}
		
		//Объем
		let vol = [null, null];
		for (let i=0;i<2;i++) 
			this.attr[i].forEach((elem)=>{if (elem[0].startsWith('Объем')) vol[i]=elem[1]} );			
		
		if (vol[0] || vol[1]){
			txt = 'Объем: ' + (vol[0]  || '?')  + ' / ' + (vol[1]  || '?');
			this.MyInfo_AddLine(txt);
		}

		//Auto desicion
		if(autoRun) {
			if(this.AutoDecision_choice=-1) {
				txt=`Auto: <span style="color:#ff0000;">PAUSED</span>`; //background-color
			} else {
				txt=`Auto: <span style="color:#00ff00;">RUN</span>`;
			}
			this.MyInfo_AddLine(txt);
				
		}

		
		//this.MyInfo_AddLine('<strong>Line 2</strong>');
		
	} //UpdateMyInfo
*/

	// For format tbl_data see Subset_of_attr()
	tableCreate(parent_node, tbl_data) {
	  
		let tbl = document.createElement('table');
		tbl.style.width = '100%';
		tbl.setAttribute('border', '1');
			  
		  //Table header
		let thdr = document.createElement('thead');
		let tr = document.createElement('tr');
		
		let th = document.createElement('th');
		th.width = '25%';
		//th.appendChild(document.createTextNode('');			
		tr.appendChild(th);
		
		for (let j = 0; j < 2; j++) {
			th = document.createElement('th')
			th.appendChild(document.createTextNode( document.links[j].host ));			
			tr.appendChild(th);
		}
		thdr.appendChild(tr);
		tbl.appendChild(thdr);
		  
		  
		  //Table rows
		let tbdy = document.createElement('tbody');
			  
		for (let i = 0; i<tbl_data.length; i++) {
			let tr = document.createElement('tr');
			
			let td;
			td = document.createElement('td');
			td.appendChild(document.createTextNode(tbl_data[i].id));			
			td.style.color = 'DarkGray'; //'silver';
			tr.appendChild(td);
			
			
			for (let j = 0; j < 2; j++) {
				td = document.createElement('td');
				td.appendChild(document.createTextNode(tbl_data[i].values[j]));			
				tr.appendChild(td);
			} //for(j)
				
			tbdy.appendChild(tr);
		} //for(i)
				
		tbl.appendChild(tbdy);
		parent_node.appendChild(tbl)
		
	} //tableCreate
	  
	// Return list of elem like: {id:'vendorCode', values:['123', '159']};  
	Subset_of_attr() {
		
		let id_list = ['vendorCode', 'Оттенок', 'Цвет', 'Тон', 'Объем', 'Размер'];
		
		let val_list = [];
		
		id_list.forEach((id)=>{
			let values = ['', ''];
			for (let i=0;i<2;i++) 
				this.attr[i].forEach((elem)=>{if (elem[0].startsWith(id)) values[i]=elem[1]} );			
					if (values[0] || values[1])
						val_list.push({id:id, values:values});
			
		}) //forEach()
		
		return val_list;
	} //Subset_of_attr()


	UpdateMyInfo() {
		const infos = document.querySelectorAll('.twinfo');	//select by class

		if (infos[0].firstElementChild && (infos[0].firstElementChild.tagName=='TABLE')) { //Table Already exists
			return;
		}

		//Create table
		let tbl_rows = this.Subset_of_attr();
		this.tableCreate(infos[0], tbl_rows);
		
		//Auto desicion
		if(autoRun) {
			let txt, color;
			
			if(this.AutoDecision_choice=-1) {
				txt = 'Auto: PAUSED'; 
				color = 'Crimson'; // see https://colorscheme.ru/html-colors.html
			} else {
				txt = 'Auto: RUN';
				color = 'Lime'; // see https://colorscheme.ru/html-colors.html
			}
			
			let tn = document.createElement('div');
			tn.appendChild( document.createTextNode(txt) );			
			tn.style.color = color;
			infos[0].appendChild(tn);									
		}

		//Normalize height of infos[0]
		let div = document.createElement('div');
		div.style.height = infos[0].offsetHeight + 'px';
		//console.log('offsetHeight', infos[0].offsetHeight);
		infos[1].appendChild(div);

	} //UpdateMyInfo


	AutoDecision_v2() {
		let links = document.links;

		if (links.length!=2 ) {return -1};

		if ( Links_start_with(links, 'https://www.detmir.ru/') )
			return this.DecideBy_Size_VCode( /:(\d+)$/ug );
			//return this.DetMir_special();

		if ( Links_start_with(links, 'https://sport-marafon.ru/') )
			return this.DecideBy_Size_VCode( /р\.\s(\S+)$/ug );

		if ( Links_start_with(links, 'https://campioshop.ru/') )
			return this.DecideBy_Size_VCode( /\((.+)\)$/ug );


		if (this.subTask==OT_CLOTHES)
			return this.DecideBy_Brand();


		if (links[0].href!=document.links[1].href) { return -1}; //After special cases!
	/*
		let site_type = Sort_sites(links[0].href);
		if (site_type==0) return 1; //if size is not defined
		if (site_type==1) return 0; //if is not defined
	*/
		return -1;
	} //buv_AutoDecision_v2

	DetectSubTask() {

		const st_marks = [
			{mark:'Не обувь', value:OT_OBUV},
			{mark:'Не красота', value:OT_PARFUM},
			{mark:'Не одежда', value:OT_CLOTHES}
		];


		const checkBox = document.querySelectorAll('flex-checkbox');

		if (checkBox.length==0) return OT_CLOTHES; //В режиме 'Одежда' нет checkbox'a

		//console.log('Obuv-checkBox', checkBox[0].textContent, '^');

		let ret = -1;
		let checkText = checkBox[0].textContent.trim();

		st_marks.forEach(  function(elem) { if (checkText==elem.mark) ret=elem.value } );

		return ret;
	} //DetectSubTask


	//Comparte by sizes and vendor codes
	DecideBy_Size_VCode(regEx) {
		let titles = document.getElementsByClassName('name');

		let title1 = titles[0].textContent;
		let title2 = titles[1].textContent;

		//let re = /р\.\s(\S+)$/ug;
		//let re = new RegExp('р\.\s(\S+)$', 'ug');

		let mt1 = title1.matchAll(regEx);
		let mt2 = title2.matchAll(regEx);

		let ar1 = Array.from(mt1);
		let ar2 = Array.from(mt2);
		//console.log('DecideBy_Size_VCode ar:', ar1, ar2);

		if (!ar1.length || !ar2.length) return -1; //Failed to extract size

		let sizes = [ar1[0][1], ar2[0][1]];

		console.log('DecideBy_Size_VCode:', sizes);

		if (!this.vendorCodes || (this.vendorCodes[0]!=this.vendorCodes[1]) ) return -1;

		if (sizes[0]==sizes[1]) {
			return 0; //Идентичны
		} else {
			return 1; //Частично отличаются
		}

		return -1;
	} //DecideBy_Size_VCode

	DecideBy_Brand() {

		let nodes = document.getElementsByClassName('brand');
		if (nodes.length!=2) return -1;

		let brand1 = nodes[0].textContent.toUpperCase();
		let brand2 = nodes[1].textContent.toUpperCase();

		//console.log('DecideBy_Brand:', brand1, brand2, this.brands.Includes(brand1), this.brands.Includes(brand2));

		if ( !( this.brands.Includes(brand1) && this.brands.Includes(brand2) ) ) {
			console.log('DecideBy_Brand: unknown brand(s)');
			return -1;
			};

		//Ok, verified brands
		if (brand1!=brand2) {
			//console.log('DecideBy_Brand: ABS DIFF');
			return 2; //Abs diff
		}

		return -1;
	} //DecideBy_Brand

	Parse_Attributes() {

		let nodes = document.getElementsByClassName('attributes');
		if (nodes.length!=2) return null;

		console.log('Parse_Attributes', nodes);		

		//if (nodes[0].firstElementChild &&
		//	Object.hasOwn(nodes[0].firstElementChild, 'nodeName') && 
		//	(nodes[0].firstElementChild.nodeName=='TABLE')) {
			
		if (nodes[0].innerHTML.includes('<table')) {
			return [Parse_table(nodes[0].firstElementChild), Parse_table(nodes[1].firstElementChild)]
		} else {
			
			let delim;	
			if ((nodes[0].innerHTML.includes('<br>')) || (nodes[1].innerHTML.includes('<br>'))) {
				delim = /\<br\>/;
				return [Parse_text(nodes[0].innerHTML, delim), Parse_text(nodes[1].innerHTML, delim)]				
			} else {
				let delim = /\.\ /;			
				return [Parse_text(nodes[0].textContent, delim), Parse_text(nodes[1].textContent, delim)]				
			}
						
		}

	} //Parse_Attributes
	
	MyInfo_AddLine(innerHTML) {
		const infos = document.querySelectorAll('.twinfo');	//select by class
		
		if (infos[0].innerHTML.includes( innerHTML )) return;
		
		//let textNode = document.createTextNode(innerHTML + '</br>');
		let div = document.createElement('div');
		div.innerHTML = innerHTML;			
		infos[0].append(div);
		
		//div = div.cloneNode(true);
		div = document.createElement('div');
		div.innerHTML = '&nbsp'; //'*'; 			
		infos[1].append(div);

	} //MyInfo_AddLine()
	
	
	Letu_add_sku(idx) {
		//console.log('Letu_add_sku', idx);
		if (document.links[idx].href.includes('reqsku')) //Already done
			return;
				
		let vCode = null;
		this.attr[idx].forEach((elem)=>{if (elem[0]=='vendorCode') vCode=elem[1]} );			
		
		if (vCode)
		{
			document.links[idx].href = document.links[idx].href + '?reqsku=' + vCode;
			document.links[idx].textContent = document.links[idx].href;			
		}	
		
	} //Letu_add_sku()

} //class Obuv

/*
https://stackoverflow.com/questions/14643617/create-table-using-javascript

function tableCreate() {
  var body = document.getElementsByTagName('body')[0];
  var tbl = document.createElement('table');
  tbl.style.width = '100%';
  tbl.setAttribute('border', '1');
  var tbdy = document.createElement('tbody');
  for (var i = 0; i < 3; i++) {
    var tr = document.createElement('tr');
    for (var j = 0; j < 2; j++) {
      if (i == 2 && j == 1) {
        break
      } else {
        var td = document.createElement('td');
        td.appendChild(document.createTextNode('\u0020'))
        i == 1 && j == 1 ? td.setAttribute('rowSpan', '2') : null;
        tr.appendChild(td)
      }
    }
    tbdy.appendChild(tr);
  }
  tbl.appendChild(tbdy);
  body.appendChild(tbl)
}
tableCreate();
*/


function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}

function str2ab16(str) {
  var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i=0, strLen=str.length; i<strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

function str2ab8(str) {
  var buf = new ArrayBuffer(str.length); // 1 byte for each char
  var bufView = new Uint8Array(buf);
  for (var i=0, strLen=str.length; i<strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

