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
function Parse_text(txt) {
		let attr = [];

		for(let i=0;i<nodes.length; i++) {

			let items = nodes[i].textContent.split(/\.\ /);

			let pairs = [];
			for (let it of items) {
				let pos = it.indexOf(':');
				if (pos >= 0)
					pairs.push([it.slice(0, pos).trim(), it.slice(pos+1).trim()]);
			} //for(it)

			attr[i] = pairs;

		} //for(i)

	return attr;
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



//********************* class ValidBrands  ********************************
class ValidBrands {
  //constructor(name) { this.name = name; }
  //sayHi() { alert(this.name); }

	constructor() {
		console.log('ValidBrands.constructor');
		this.brandsList = null;
	} //constructor

	HasData() {
	  return this.brandsList!=null;
	} //HasData

	Load() {
		//console.log('ValidBrands.Load');

		let myself = this;  //save 'this' for use inside callback!!!

		$.get('http://localhost:8000/brands', '', function(data){
			//console.log('ValidBrands.get', data);

			myself.brandsList = JSON.parse(data);

			//console.log('ValidBrands', myself.brandsList);

			myself.NamesToUpper();
			});

	} //Load

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

		let ret;

		name = name.toUpperCase();

		if ((name==null) || (name.length==0)) return false;

		//Check Letu
		let letu = this.brandsList['letu']
		let first_ltr = name[0];

		if (letu.hasOwnProperty(first_ltr)) {
			ret = letu[first_ltr].includes(name);
			if (ret) return true;
			};

		if (letu.hasOwnProperty('0-9')) {
			ret = letu['0-9'].includes(name);
			if (ret) return true;
			};

		if (letu.hasOwnProperty('А-Я')) {
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
			this.brands.Load();
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

		this.Compare_href_byParts(document.links);

		this.Compare_Titles();
		this.Compare_Brands();
		this.Compare_VendorCode();

		//Auto-select
		let choice = this.AutoDecision_v2();
		console.log('AutoDecision: ', choice);

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


	Compare_VendorCode_old(nodes) {
		const GREEN_COLOR = '#ccffcc';

		//Extract codes
		let codeSearch = [null, null];

		for (let nodeId=0; nodeId<2; nodeId++) {

			for (let node of nodes[nodeId].childNodes){

				if (node.hasOwnProperty('innerHTML') && node.innerHTML.includes('GREEN_COLOR')) return; //already done

				//console.log('Compare_VendorCode:', node.textContent);
				codeSearch[nodeId] = LocateAfterAnchor(node.textContent, ['vendorCode:', 'Code:', 'Артикул:', 'Артикул производителя:', 'артикул:']);

				if (codeSearch[nodeId]!=null) {
					codeSearch[nodeId].node = node;
					break;
					} //if()

				} //for(node)

			} //for(nodeId)

		if ((codeSearch[0]==null) || (codeSearch[1]==null)) return;
		if (!codeSearch[0].hasOwnProperty('value') || !codeSearch[1].hasOwnProperty('value')) return;

		//console.log('Compare_VendorCode:', codeSearch);

		//Show in myInfo
		this.vendorCodes = [codeSearch[0].value, codeSearch[1].value];
		this.UpdateMyInfo();


		//Compare and colorize
		let colorized = Strings_CompareAndColor(codeSearch[0].value, codeSearch[1].value, null, GREEN_COLOR, /\-|\./);

		nodes[0].innerHTML = nodes[0].innerHTML.replaceAll(codeSearch[0].value, colorized[0]);
		nodes[1].innerHTML = nodes[1].innerHTML.replaceAll(codeSearch[1].value, colorized[1]);

		return;
	} //Compare_VendorCode_old()


	Compare_VendorCode_table(nodes) {
		const GREEN_COLOR = '#ccffcc';

		//Extract codes
		let codeSearch = [null, null];

		for (let nodeId=0; nodeId<2; nodeId++) {
			let tbl = nodes[nodeId].children[0];

			//for (let i=0; i<tbl.rows.length;i++) {
			//	if (tbl.rows[i].textContent.includes('vendorCode'))

			for (let row of tbl.rows) {
				if (row.cells[0].textContent.includes('vendorCode')) {
					codeSearch[nodeId] = row.cells[1];
					//console.log('Compare_VendorCode_table td:', row.cells);
				}
			} //for(row)
		} //for(nodeId)

		if ((codeSearch[0]==null) || (codeSearch[1]==null)) return;
		//console.log('Compare_VendorCode_table cs:', codeSearch);

		//Show in myInfo
		this.vendorCodes = [codeSearch[0].textContent.trim(), codeSearch[1].textContent.trim()];
		this.UpdateMyInfo();

		//Compare and colorize
		let colorized = Strings_CompareAndColor(codeSearch[0].textContent.trim(), codeSearch[1].textContent.trim(), null, GREEN_COLOR, /\-|\./);
		//console.log('Compare_VendorCode_table clr:', colorized);

		codeSearch[0].innerHTML = colorized[0];
		codeSearch[1].innerHTML = colorized[1];

	} //Compare_VendorCode_table()

/*
	Compare_VendorCode() {

		// 'vendorCode: I029208.89.WI'	vendor|Code!!!
		let nodes = document.getElementsByClassName('attributes');

		//console.log('Compare_VendorCode attr', nodes[0].firstElementChild.tagName );

		if (nodes==null) return;

		//if (nodes[0].innerHTML.includes('<table')) {
		if (nodes[0].firstElementChild.tagName=='TABLE') {
			this.Compare_VendorCode_table(nodes)
		} else {
			this.Compare_VendorCode_old(nodes) };

	} //Compare_VendorCode()
*/

	Compare_VendorCode() {
		if (this.attr.length==0) return;
		
		//Get vendor codes
		let vendorCodes = [null, null];
		
		for (let i=0;i<2;i++) {
			this.attr[i].forEach((elem)=>{if (elem[0]=='vendorCode') vendorCodes[i]=elem[1]} );			
		}		
		console.log('Compare_VendorCode', vendorCodes)
		
		//Compare and colorize
		if ((vendorCodes[0]==null) || (vendorCodes[1]==null)) return;

		let colorized = Strings_CompareAndColor(vendorCodes[0], vendorCodes[1], null, this.GREEN_COLOR_LIGHT, /\-|\./);
		//console.log('Compare_VendorCode_table clr:', colorized);

		let nodes = document.getElementsByClassName('attributes');

		nodes[0].innerHTML = nodes[0].innerHTML.replaceAll(vendorCodes[0].value, colorized[0]);
		nodes[1].innerHTML = nodes[1].innerHTML.replaceAll(vendorCodes[1].value, colorized[1]);
		
		//Display
		this.UpdateMyInfo();
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
				newNode.textContent = '*** my info 2 ***';
				newNode.className = "twinfo";

				document.links[i].parentNode.prepend(newNode);
			} //for

		//Reset vars
		this.vendorCodes = [];
		this.subTask = -1;
		this.attr = null;


	} //Reset()


	UpdateMyInfo() {
		const infos = document.querySelectorAll('.twinfo');	//select by class

		let txt;
		//Vendor codes
		if (this.vendorCodes && (this.vendorCodes.length==2)) {
			txt = 'vendor: ' + this.vendorCodes[0] + ' / ' + this.vendorCodes[1];
			infos[0].textContent = txt;
			infos[1].textContent = txt;
		}
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

/*
	//https://www.detmir.ru
	//' Комплект PlayToday:салатовый:104' -> ['Комплект PlayToday', '104']
	ParseName_DetMir(txt) {
		let pos = txt.indexOf(':');
		if (pos==-1) return {name:txt.trim(), size:''};

		let name = txt.slice(0, pos);

		pos = txt.lastIndexOf(':');

		let sz = txt.slice(pos+1);
		return {name:name.trim(), sz:sz.trim()};
	}

	DetMir_special() {
		console.log('DetMir_special()');

		let titles = document.getElementsByClassName('name');

		let title1 = titles[0].textContent;
		let title2 = titles[1].textContent;

		let tvr1 = this.ParseName_DetMir(title1);
		let tvr2 = this.ParseName_DetMir(title2);

		console.log('DetMir_special tvr:', [tvr1, tvr2]);

		if (tvr1.name!=tvr2.name) return -1;

		if((tvr1.size='') || (tvr2.size='')) return 3; //Недостаточно данных для решения

		if(tvr1.sz==tvr2.sz) {
			return 0; //Идентичны
		} else {
			return 1; //Частично отличаются
		}

	} //DetMir_special()
*/

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

		//console.log('Parse_Attributes-isTable', nodes);		

		if (nodes[0].firstElementChild.nodeName=='TABLE') {
			return [Parse_table(nodes[0].firstElementChild), Parse_table(nodes[1].firstElementChild)]
		} else {
			return [Parse_text(nodes[0].textContent), Parse_text(nodes[1].textContent)]
		}

	} //Parse_Attributes

} //class Obuv
