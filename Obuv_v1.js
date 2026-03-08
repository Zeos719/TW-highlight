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
	//console.log('Toggle autoRun');

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
		//console.log('Obuv.onCtrlEnter: CtrlEnter--');

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

	//console.log('Obuv.onCtrlEnter-key', e.key, e.keyCode, e.code);

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

	//Open links
	if (e.ctrlKey && (e.code == "KeyM")) { //Ctrl + M
		let links = Obuv_GetMainLinks();
		
		preview.OpenPreviewTabs(links[0].href, links[1].href);
	}

	//1..4 -> Radio buttons
	const RB_keys  = ["Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "Digit9"];
	const NP_keys  = ["Numpad1", "Numpad2", "Numpad3", "Numpad4", "Numpad5", "Numpad6", "Numpad7", "Numpad8", "Numpad9"];
	let RB_selected = -1;
	
	if (!e.shiftKey && !e.ctrlKey) {
		for (let i=0;i<RB_keys.length;i++) {
			if (e.code==RB_keys[i] || e.code==NP_keys[i]) {
				RB_set(i);
				RB_selected = i;
				break;
			}
		} //for(RB_keys[])
	}

	//Double check RB setiings
	if ( (RB_selected!=-1) && (RB_selected!=RB_get()) ) {
		console.error('Obuv.RB_set err', RB_selected);
	}
	
	//Tui badges
	if (!e.shiftKey && !e.ctrlKey) {
		if (e.code=="KeyC") {RB_set(1); ClickTuiBadge('Цвет');}
		if (e.code=="KeyD") {RB_set(1); ClickTuiBadge('Диагональ');}
		
	} //badges
		
}

//********************* class PreviewWindows ********************************

class PreviewWindows {
  //constructor(name) { this.name = name; }
  //sayHi() { alert(this.name); }

	constructor() {
		//console.log('PreviewWindows.constructor');

		this.linkTabs = [];
		this.epoch = 0;
	} //constructor


	//Close preview tabs
	ClosePreviewTabs() {
		//Close last pre-view tabs
		for (let i=this.linkTabs.length-1;i>=0;i--) {
			let item = this.linkTabs[i]

			let closed_0 = ((item[0].tab!=null) && item[0].tab.closed) || (item[0].tab==null)
			let closed_1 = ((item[1].tab!=null) && item[1].tab.closed) || (item[1].tab==null)

			if ( (item[0].tab!=null) && !item[0].tab.closed ) item[0].tab.close(); //better before splice because item then will be deleted
			if ( (item[1].tab!=null) && !item[1].tab.closed ) item[1].tab.close();

			if ( closed_0 && closed_1 ) { //delete closed
				this.linkTabs.splice(i,1); //remove closed
				continue;
			}
		} //for

		//Delete old 'hanging' items
		const OLD_TRESHOLD = 10

		for (let i=this.linkTabs.length-1;i>=0;i--) {
			let item_age = this.linkTabs[i][2]

			if ((this.epoch-item_age)>OLD_TRESHOLD) {
				this.linkTabs.splice(i,1); //remove very old
				//console.log('Obuv.OpenPreviewTabs delete hanging')
			}

			} //for

		return;
	} //ClosePreviewTabs()


	//Open links in preview tabs
	OpenPreviewTabs(link0, link1) {
		/*
		if (!Object.hasOwn(this, 'linkTabs')) {
			this.linkTabs = [];
			this.epoch = 0;
		}
		*/

		//console.log('Obuv.OpenPreviewTabs start', this.linkTabs)

		// May new links are already in list?
		for (let i=0;i<this.linkTabs.length;i++) {
			let item = this.linkTabs[i]

			if ((item[0].href==link0) && (item[1].href==link1)) {
				return false;
				}
		} //for

		//Add new item to list and open previews
		let v1 = {tab:GM_openInTab(link1), href: link1}
		let v0 = {tab:GM_openInTab(link0), href: link0}

		this.linkTabs.push( [v0, v1, this.epoch] );
		this.epoch++;

		console.log('Obuv.OpenPreviewTabs', this.linkTabs.length);
		return;
	} //OpenPreviewTabs()


} //PreviewWindows

var preview = new PreviewWindows();


function Obuv_SendToServer() {

	let titles = document.getElementsByClassName('name');
	let brands = document.getElementsByClassName('brand');
	let category = document.getElementsByClassName('category');

	let links = Obuv_GetMainLinks();

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
		choice: user_choice,
		category: category[0].textContent
	};

	console.log('Obuv.SendToServer-1: ', payload);

	let json = JSON.stringify(payload);

	/*
	$.post('http://localhost:8000/tw', json, function(data){
		console.log('Obuv.SendToServer-2:', data);
	});
	*/
		
	http_POST('http://localhost:8000/tw', json);

	return user_choice;
}


// Convert <table> to a list of rows. tbl is a node! tbl = node.firstElementChild
function Parse_table(tbl) {

	//console.log('Obuv.Parse_table', tbl);	

	if (tbl==null) {
		console.log('Obuv.Parse_table null!');
		return [];
	}

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

function GetTaskId() {
	function StripVendorCode(str) {
		let ipos = str.indexOf('?vendorCode=');
		if (ipos>=0) str = str.slice(0, ipos);

		return str;
	}

	let links = Obuv_GetMainLinks();
	
	return StripVendorCode(links[0].href) + StripVendorCode(links[1].href);
} //GetTaskId()

//Извлекаем две основных ссылки на товары - в новой версии задания на странице несколько ссылок
function Obuv_GetMainLinks() {
		let ret;
		
		if (document.links.count==2) //первоначальная версия задания
			ret = document.links
		else {		
			let links = document.querySelectorAll('a.url');		
			ret = [links[0], links[1]] //первавя попытка - просто первые две
		}
		
		console.log('Obuv.GetMainLinks', ret);
			
		return ret;
	} //GetMainLinks



//********************* Два товара (обувь)	********************************

let obv = null;

function DoObuv(taskVesrion, exam) {

	console.log('DoObuv() starts');

	if (obv==null) obv = new Obuv();

	if (document.links.length>=2) {
		obv.Run();
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

 const TV_brands = ['LG', 'Hyundai', 'Asano', 'Digma', 
	'Xiaomi', 'Harper', 'TCL', 'Sony', 
	'Sber', 'Samsung', 'Grundig', 'YaGPT', 
	'Haier', 'Supra', 'Toshiba', 'Panasonic', 
	'Thomson', 'Hisense']

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

function Items_groups(items) {
  let prev_v = null

  if (items.length == 0) return []

  groups = [{ same: items[0], from: 0, count: 1 }]

  for (i = 1; i < items.length; i++) {
    if (items[i] == groups[groups.length - 1].same)
      groups[groups.length - 1].count += 1
    else
      groups.push({ same: items[i], from: i, count: 1 })
  } // for

  return groups
} //Items_groups

function ColorizeByChar(A, B) {
  
  function Add_color(str, groups) {
    const RED_COLOR_DARK = '#ffcccc'
    const RED_COLOR_LIGHT= '#ffefef'

    let colorized = str

    if (groups.length==1 && groups[0].same==false) {
      colorized = `<span style="background-color:${RED_COLOR_DARK};">${str}</span>`      
    }

    if (groups.length>1) {
      let from = 0

      for (let i=groups.length-1; i>=0; i--) {
        let from = groups[i].from
        let till = groups[i].from + groups[i].count
        let prefix = colorized.slice(0, from)
        let suffix = colorized.slice(till)
        let middle = groups[i].value

        let color = RED_COLOR_DARK
        if (groups[i].same) color = RED_COLOR_LIGHT

        colorized = `${prefix}<span style="background-color:${color};">${middle}</span>${suffix}`
      }

    }

    return colorized
  } //Add_color()

	function Expand_dgt_group(A, diff) {  
	  let enforce

	  for(i=0;i<A.length;i++) {
		if (!IsDigit(A[i])) {
		  enforce = false
		} else {
		  //If digit
		  if (!diff[i]) enforce = true
		  if (enforce) diff[i] = false
		  }
	  } //for(0->lenght)

	  for (i=A.length-1; i>=0; i--) {
		if (!IsDigit(A[i])) { 
		  enforce = false
		} else {
		  //If digit
		  if (!diff[i]) enforce = true
		  if (enforce) diff[i] = false
		}
	  } //for(0->lenght)

	  return diff
	} //Expand_dgt_group(




  // Difference map
  let diffs_A = new Array(A.length).fill(false)
  let diffs_B = new Array(B.length).fill(false)

  let min_len = Math.min(A.length, B.length)

	//let Aa = A.replace('/\d/g', '5')
	//let Bb = A.replace('/\d/g', '5')

  for(let i=0;i<min_len;i++) {
    diffs_A[i] = diffs_B[i] = (A[i]==B[i])
  }
    
  diffs_A = Expand_dgt_group(A, diffs_A)
  diffs_B = Expand_dgt_group(B, diffs_B)

  // Grouping differences
  let grps_A = Items_groups(diffs_A)
  let grps_B = Items_groups(diffs_B)

  //console.log(grps_A)
  //console.log(grps_B)

  // Add strings to maps
  let from

  from = 0
  for (let i = 0; i<grps_A.length;i++) {
    let till = from + grps_A[i].count
    grps_A[i].value = A.slice(from, till)
    from = till
  }

  from = 0
  for (let i = 0; i < grps_B.length; i++) {
    let till = from + grps_B[i].count
    grps_B[i].value = B.slice(from, till)
    from = till
  }

  //Add colors to string
  let colorized_A = Add_color(A, grps_A)
  let colorized_B = Add_color(B, grps_B)

  //console.log(colorized_A)
  //console.log(colorized_B)
  
	return [colorized_A, colorized_B]
} //ColorizeByChar

function Is_modelId(str) {
  const pattern_all = /^[\.\-\dA-Z]+$/
  const pattern_AZ = /[A-Z]/
  const pattern_09 = /\d+/

  return Boolean( str.match(pattern_all) && 
			str.match(pattern_AZ) && str.match(pattern_09) && 
			str.length>2 && !str.startsWith('DVB-') &&
			str!='50Hz' && str!='60Hz')
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

	for (let i=0; i<matchesArr.length; i++) {
		let match = matchesArr[i];

		for (let anchor of anchors) {
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

// Извлекаем подстроку строку с размером из описания вида
//'abc 123/8 Gb defg'
//'abc 123+8 Гб defg'
//'abc 123Гб defg'
//
// returns [start, end] or null
/*
function Parse_MemSize(str) {
  str = str.toUpperCase();

  const GB_marks = ['GB ', 'TB ', 'ГБ ', 'ТБ '];
  let gb_pos = -1;

  for (mrk of GB_marks) {
    gb_pos = str.indexOf(mrk);
    if (gb_pos!=-1)
      break;
  } //for(mrk)

  if (gb_pos==-1) return null;

  let end = gb_pos+2; //2 = length('GB')

  let dgts_end = gb_pos;
  let start = str.lastIndexOf(' ', gb_pos);
  if (start == (gb_pos-1)) { // если пробел перед 'GB': '123 GB'
    dgts_end = gb_pos-1;
    start = str.lastIndexOf(' ', start-1);

    if (start==-1)
      return null;
  }

  start += 1; //skip space

  // between [start,end] only gidits or '/' and '+'
  let sizeStr = str.slice(start, dgts_end);
  if (sizeStr.match( /([\d\+\/]+)/gm )==null)
    return null;

  return [start, end];
}
*/

/*
Примеры строк:

abc 12/256Gb def
abc 12/256 Gb def
abc 12+256 ГБ def
abc 256GB def
*/
function Parse_MemSize(str) {
	//let regExp = /\s(\d+)[\/|\+]\s*(\d+)\s*(GB|ГБ)\s/gm;
	let regExp = /\s((\d+)[\/|\+]\s*)*(\d+)\s*(GB|ГБ)\s/gm;

	let matchAll = str.toUpperCase().matchAll(regExp);
	matchAll = Array.from(matchAll);

	//console.log('Obuv.Parse_MemSize', str, matchAll);

	if (matchAll.length==0) {
		return null;
	} else {
		let start = matchAll[0].index+1; //1 - for leading space
		let end = start + (matchAll[0][0].length-2) //2 - for leading and trailing space

		let pref = str.slice(0, start);
		let memSize = str.slice(start, end);
		let suff = str.slice(end);

		//console.log('Obuv.Parse_MemSize', str, start, end);

		return [pref, memSize, suff];
	}

} //Parse_MemSize



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
		console.log('ValidBrands.SaveServerAnswer', data.length, url);

		//Parse url: https://www.phonewarez.ru/files/TW/brands/Letu/А-Я.cp1251.txt
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

		let rootUrl = 'https://www.phonewarez.ru/files/TW/brands/';

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
const OT_ELECTRONICS = 3;

class Obuv {
  //constructor(name) { this.name = name; }
  //sayHi() { alert(this.name); }

	constructor() {
			//console.log('Obuv.constructor');
			this.GREEN_COLOR_LIGHT = '#ccffcc';

			// Preload brands
			this.brands = new ValidBrands();
			this.brands.Load_TXT();

			this.taskId = '?';
			this.clicked = false;


		}

	Run() {
		// Attach handlers to track exit
		let completeBtn = document.querySelector("#completeBtn");
		completeBtn.addEventListener("click", Obuv_onBtnClick);

		document.addEventListener("keydown", Obuv_onCtrlEnter);

		//Preset default
		this.links = Obuv_GetMainLinks();
		
		this.Reset();
		this.SelectDecision([1,7]); //Decision by default
		//this.SelectDecision(2);
		
		this.subTask = this.DetectSubTask();
		//console.log('Obuv subTask:', this.subTask);

		//Reset for new task
		let newTaskId = GetTaskId();
		//console.log('Obuv.GetTaskId', this.taskId==newTaskId, this.clicked);

		if (this.taskId!=newTaskId) {
			this.taskId = newTaskId;
			this.clicked = false;

			preview.ClosePreviewTabs();
		}

		DrawAutoIndicator(autoRun);

		//Scrool to view main part
		let bound = this.links[0].getBoundingClientRect();
		const REQUIRED_TOP = 600; //600
		//console.log('Tw bound:', bound.top);
		if (window.pageYOffset==0) {
			window.scroll(0, (bound.top-REQUIRED_TOP));
			}
	
		//Main
		this.attr = this.Parse_Attributes();
		//console.log('Obuv.attr', this.attr);
		
		this.attrEx = [ ];

		for (let idx=0;idx<2;idx++)
			if (this.links[idx].href.startsWith('https://www.letu.ru/'))
				this.Letu_add_sku(idx);

		this.Compare_href_byParts(this.links);

		this.Compare_Titles();
		this.Compare_Brands();
		this.Compare_VendorCode();

		//Auto-select
		let choice = this.AutoDecision_v2();
		console.log('Obuv.AutoDecision: ', choice, this.clicked);
		this.AutoDecision_choice = choice; //For UpdateMyInfo

		if (choice!=-1) {
			if (autoRun && !this.clicked) {
				this.clicked = true;

				setTimeout(function (choice){
					let reminder = this.links[0].href.slice(-20);
					console.log("Obuv.AutoDecision fired:", choice, reminder);
					
					RB_set(choice);

					let completeBtn = document.querySelector("#completeBtn");
					completeBtn.focus();
					completeBtn.click();
					
					obv.clicked = false; //!not this! (inside callbak)
					//obv.this.taskId = '?';

				}, "2000", choice);
			} //if(autoRun)
		}// if(choice)

		//Display
		this.UpdateMyInfo();

		//Auto select for https://superstep.ru - 'недостаточно данных' и выход
		/*
		if (this.links[0].href.includes('superstep.ru') &&
		   (this.links[0].href==this.links[1].href) ) {

			RB_set(3); //Данных недостаточно

			let completeBtn = document.querySelector("#completeBtn");
			completeBtn.click();
		   } // superstep.ru
		*/

	return;
	} //Run()

	//choice = 0,1,2 (see Obuv_AutoDecision() ) or array of choices '[1,7]'
	SelectDecision(choice) {
		if (RB_alreadySet()) { return }

		if (typeof(choice)=='number')
			choice = [choice];

		choice.forEach(function(ch) {RB_set(ch)});
		
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

			links[0].innerHTML = colored_text1;
			links[1].innerHTML = colored_text2;
		}
	} //Compare_href_byParts()


	Compare_Titles() {
		let titles = document.getElementsByClassName('name');

		let title1 = titles[0];
		let title2 = titles[1];

		let mem1 = Parse_MemSize(title1.textContent);
		let mem2 = Parse_MemSize(title2.textContent);
		if (mem1 && mem2)
		{
			this.attrEx.push( {id:'memSize', values:[mem1[1], mem2[1]]} );
		}

		if (title1.innerHTML.includes('<span')) return; //Already done

		let colorized1, colorized2;


		// Special for 'Телевизор'
		if (title1.textContent.toLowerCase().includes('телевизор')) {		
			let words1 = title1.textContent.split(' ');
			let words2 = title2.textContent.split(' ');
			
			words1 = words1.filter( Is_modelId )
			words2 = words2.filter( Is_modelId )

			console.log('Obuv.tv-models1', words1)
			console.log('Obuv.tv-models2', words2)
			
			colorized1 = title1.textContent
			colorized2 = title2.textContent
			
			if (words1.length==1 && words2.length==1) {
				[colorized1, colorized2] = ColorizeByChar(words1[0], words2[0])						
				
				title1.innerHTML = title1.textContent.replace(words1[0], colorized1)
				title2.innerHTML = title2.textContent.replace(words2[0], colorized2)				
				
				return				
			}						
		} // 'Телевизор'

		//I am here - apply normal scheme					
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
		//console.log('Compare_VendorCode', this.vendorCodes);

		//Compare and colorize
		//if ((this.vendorCodes[0]==null) || (this.vendorCodes[1]==null)) return;
		for(let i=0;i<2;i++)
			this.vendorCodes[i] = this.vendorCodes[i] || '?';

		let colorized = Strings_CompareAndColor(this.vendorCodes[0], this.vendorCodes[1], null, this.GREEN_COLOR_LIGHT, /\-|\./);
		//console.log('Compare_VendorCode_table clr:', colorized);

		let nodes = document.getElementsByClassName('attributes');

		if ( nodes[0].innerHTML.includes(colorized[0]) ) // already done
			return;

		nodes[0].innerHTML = nodes[0].innerHTML.replaceAll(this.vendorCodes[0].value, colorized[0]);
		nodes[1].innerHTML = nodes[1].innerHTML.replaceAll(this.vendorCodes[1].value, colorized[1]);

	}//Compare_VendorCode()


	Reset() {
		//console.log('Obuv.Reset()');

		//for (const image of document.images) {
		//} //for

		//Insert myInfo fileds
		const infos = document.querySelectorAll('.twinfo');	//select by class

		if (infos.length==0)
			for (let i=0;i<this.links.length;i++) {
				let newNode = document.createElement("div");
				//newNode.textContent = '*** my info 2 ***';
				newNode.className = "twinfo";

				this.links[i].parentNode.prepend(newNode);
			} //for

		//Reset vars
		this.vendorCodes = [];
		this.subTask = -1;
		this.attr = null;


	} //Reset()


	// For format tbl_data see Subset_of_attr()
	tableCreate(parent_node, tbl_data) {

		function AppendRows(tbdy, data) {

			for (let i = 0; i<data.length; i++) {
				let tr = document.createElement('tr');

				let td;
				td = document.createElement('td');
				td.appendChild(document.createTextNode(data[i].id));
				td.style.color = 'DarkGray'; //'silver';
				tr.appendChild(td);


				for (let j = 0; j < 2; j++) {
					td = document.createElement('td');
					td.appendChild(document.createTextNode(data[i].values[j]));
					tr.appendChild(td);
				} //for(j)

				tbdy.appendChild(tr);
			} //for(i)

			return tbdy;
		} //AppendRows()

		let tbl = document.createElement('table');
		tbl.style.width = '100%';
		tbl.setAttribute('border', '1')
		tbl.className = 'z-info-table';

		  //Table header
		let thdr = document.createElement('thead');
		let tr = document.createElement('tr');

		let th = document.createElement('th');
		th.width = '25%';
		//th.appendChild(document.createTextNode('');
		tr.appendChild(th);

		for (let j = 0; j < 2; j++) {
			th = document.createElement('th')
			th.appendChild(document.createTextNode( this.links[j].host ));
			tr.appendChild(th);
		}
		thdr.appendChild(tr);
		tbl.appendChild(thdr);

		//Build table
		let tbdy = document.createElement('tbody');

		AppendRows(tbdy, tbl_data);
		AppendRows(tbdy, this.attrEx);


		tbl.appendChild(tbdy);
		parent_node.appendChild(tbl)

	} //tableCreate

	// Return list of elem like: {id:'vendorCode', values:['123', '159']};
	Subset_of_attr(id_list) {
		
		if (this.attr.length<2) return  null;

		let val_list = [];

		id_list.forEach((id)=>{
			let id_str = id;

			let values = ['', ''];
			for (let i=0;i<2;i++)
				this.attr[i].forEach(function (elem){
					if (typeof(id)=='string') {						
						if (elem[0].startsWith(id)) values[i]=elem[1]
					}
					
					if (typeof(id)=='object') { //regular expression - 
						/* !!! rewrite
						плохо - если в списке аттрибутов более одного срабатывания, то в список добавляется последний 
						*/
					
						if (elem[0].match(id)) {
							id_str = elem[0];					
							values[i]=elem[1];
							console.log('Obuv.Subset_of_attr.1', i, id, elem);
						}											
					} //if(regExp)				
				
				});
			
				if (values[0] || values[1]) {
					val_list.push({id:id_str, values:values});
				}

		}) //forEach()
		
		console.log('Obuv.Subset_of_attr.2', val_list);

		return val_list;
	} //Subset_of_attr()

	Attr_NoSizeNorColor() {	
		const id_list = ['Цвет', 'Размер'];
		let val_list = this.Subset_of_attr(id_list);
		if (!val_list) return true;
		
		if (val_list.length==0) return true; //ytn djj,ot 

		let hasValues = new Array(val_list).fill(false);
		
		for (let i=0;i<id_list.length;i++) {
			for (let val of val_list) {
				if (val.id==id_list[i]) 
					hasValues[i] = Boolean(val.values[0]) && Boolean(val.values[1]);
			}
		}

		console.log('Obuv.Attr_NoSizeNorColor', hasValues);	
		
		for (let hasItem of hasValues) {
			if (hasItem) return false; //Есть что-то для обеих товаров
		}
				
		return true;		
	} //Attr_NoSizeNorColor()


	UpdateMyInfo() {
		const infos = document.querySelectorAll('.twinfo');	//select by class

		// Проверяем, что таблица уже существует и данные в attrEx не изменились
		/*
		if (infos[0].firstElementChild && (infos[0].firstElementChild.tagName=='TABLE')) { //Table Already exists
			return;
		}
		*/

		let tableExists = (document.querySelectorAll('table.z-info-table').length>0)



		if (tableExists)
			return;

		//Create table
		//const id_list = ['vendorCode', 'Оттенок', 'Цвет', 'Тон', 'Объем', 'Размер', 'SSD', 'Частота', 'Разрешение', 'Диагональ', /\s(сим|СИМ|sim|SIM)\W/gm];
		const id_list = ['vendorCode', 'Оттенок', 'Цвет', 'Тон', 'Объем', 'Размер', 'SSD', 'Частота', 'Разрешение', 'Диагональ', 
			'Тип SIM', 'Количество SIM',
			'Тип сим', 'Количество слотов для SIM'];

		let tbl_rows = this.Subset_of_attr(id_list);
		if (!tbl_rows) return;
		this.tableCreate(infos[0], tbl_rows);

		//Auto decision
		if(autoRun) {
			let txt, color;

			if(this.AutoDecision_choice==-1) {
				txt = `Auto: PAUSED ${this.AutoDecision_choice}`;
				color = 'Crimson'; // see https://colorscheme.ru/html-colors.html
			} else {
				txt = `Auto: RUN ${this.AutoDecision_choice+1}`;
				color = 'ForestGreen'; // see https://colorscheme.ru/html-colors.html
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
		
		//На сайте ссылка не меняется при изменении размера! Ответ - "Недостаточно данных"
		const sitesNoSize = [
			'https://kanzler-style.ru/',
			'https://lacoste.ru/',
			'https://bungly.ru/',
			'https://ralf.ru/',
		]
		
		
		let ret;
		let links = this.links;

		if (links.length!=2 ) {return -1};

		if ( Links_start_with(links, 'https://www.detmir.ru/') )
			return this.DecideBy_Size_VCode(true );
			//return this.DetMir_special();

		if ( Links_start_with(links, 'https://sport-marafon.ru/') )
			return this.DecideBy_Size_VCode(false );

		if ( Links_start_with(links, 'https://campioshop.ru/') )
			return this.DecideBy_Size_VCode(false );

		//if ( (this.subTask==OT_OBUV) && Links_start_with(links, 'https://www.letu.ru/') )
		if (  Links_start_with(links, 'https://www.letu.ru/') )
			return this.Letu_special();

		if ( Links_start_with(links, 'https://petrovich.ru/') ) {
			ret = this.Petrovich_special();
			console.log('Obuv.Petrovich_special', ret);
		}

		//На сайте ссылка не меняется при изменении размера! Ответ - "Недостаточно данных"
		for (let lnk of sitesNoSize) {
			if ( Links_start_with(links, lnk) ) 
					if (this.Attr_NoSizeNorColor())	return 3; 
		}

		if (links[0].href==links[1].href) {
			ret = this.DecideBy_Size();
			if (ret!=-1)
			{
				//console.log('Obuv.DecideBy_Size', ret);
				return ret;
			}
		}


		if (this.subTask==OT_CLOTHES)
			return this.DecideBy_Brand();


		if (links[0].href!=this.links[1].href) { return -1}; //After special cases!
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

		//console.log('Obuv.checkBox', checkBox[0].textContent, '^');

		let ret = -1;
		let checkText = checkBox[0].textContent.trim();

		st_marks.forEach(  function(elem) { if (checkText==elem.mark) ret=elem.value } );

		return ret;
	} //DetectSubTask


	//Comparte by sizes and vendor codes
	DecideBy_Size_VCode(noData_if_noSize) {
		let titles = document.getElementsByClassName('name');

		let sizes = [	this.Parse_size( titles[0].textContent ),
						this.Parse_size( titles[1].textContent )	];

		console.log('Obuv.DecideBy_Size_VCode:', sizes);

		//Failed to extract size
		if ((sizes[0]=='') || (sizes[1]=='')) {
			if (noData_if_noSize) {
				return 3; //'Недостаточно данных для принятия решения' - DetMir, в этом случае здесь вместо числового размера опция 'выберите размер'
			} else {
				return -1; //Непонятно, что делать
			}
		}

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

		//console.log('Obuv.DecideBy_Brand:', brand1, brand2, this.brands.Includes(brand1), this.brands.Includes(brand2));

		if ( !( this.brands.Includes(brand1) && this.brands.Includes(brand2) ) ) {
			console.log('DecideBy_Brand: unknown brand(s)');
			return -1;
			};

		//Ok, verified brands
		if (brand1!=brand2) {
			//console.log('Obuv.DecideBy_Brand: ABS DIFF');
			return 2; //Abs diff
		}

		return -1;
	} //DecideBy_Brand

	DecideBy_Size() {
		//console.log('Obuv.DecideBy_Size', this.attr);
		if (!this.attr || this.attr.length<2) return -1;		

		let sizes = ['', ''];
		for (let i=0;i<2;i++)
			this.attr[i].forEach((elem)=>{if (elem[0].startsWith('Размер')) sizes[i]=elem[1]} );

		let ret = -1;
		if (sizes[0] && sizes[1]) {
			if (sizes[0]==sizes[1]) {
				ret = 0; //Совпадают
			} else {
				ret = 1; //Отличаются
			}
		}

		return ret;
	} //DecideBy_Size()


	Parse_Attributes() {

		let nodes = document.getElementsByClassName('attributes');
		if (nodes.length!=2) return [];

		let tbls = [
			nodes[0].querySelector('table'),
			nodes[1].querySelector('table')
		];

		//console.log('Obuv.Parse_Attributes', nodes);

		//if (nodes[0].firstElementChild &&
		//	Object.hasOwn(nodes[0].firstElementChild, 'nodeName') &&
		//	(nodes[0].firstElementChild.nodeName=='TABLE')) {

		//if (nodes[0].innerHTML.includes('<table')) {
		if (tbls[0] && tbls[0]) {						
			//return [Parse_table(nodes[0].firstElementChild), Parse_table(nodes[1].firstElementChild)]
			return [Parse_table(tbls[0]), Parse_table(tbls[1])]			
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


	Letu_add_sku(idx) {
		if (!this.attr || this.attr.length<2) return;
		
		//console.log('Obuv.Letu_add_sku', idx);
		if (this.links[idx].href.includes('vendorCode')) //Already done
			return;

		let vCode = null;
		this.attr[idx].forEach((elem)=>{if (elem[0]=='vendorCode') vCode=elem[1]} );

		if (vCode)
		{
			this.links[idx].href = this.links[idx].href + '?vendorCode=' + vCode;
			this.links[idx].textContent = this.links[idx].href;
		}

	} //Letu_add_sku()

	Letu_special() {

		function Compare_links_prefs(hrefArr) {

			let prefs = ['', ''];
			for(let i=0;i<2;i++) {
				let ipos = hrefArr[i].indexOf('sku');
				if (ipos==-1)
				  return false;

				prefs[i] = hrefArr[i].slice(0, ipos);
			} //for(i)

			return (prefs[0]==prefs[1]);
		} //Compare_links_pre

		//console.log('Obuv.Letu_special', this.vendorCodes);

		//На всякий случай сравним префиксы до подстроки 'sku'
		if (!Compare_links_prefs( [this.links[0].href, this.links[1].href] ))
			return -1;

		//valid vendorCodes sholud be available
		if (!this.vendorCodes || !this.vendorCodes[0] || !this.vendorCodes[1])
			return -1;

		//Decision
		if (this.vendorCodes[0]==this.vendorCodes[1]) {
			return 0
		} else {
			return 1
		}

		return -1;
	} //Letu_special


	Petrovich_special() {
		let titles = document.getElementsByClassName('name');
		titles = [ titles[0].textContent, titles[1].textContent ];

		if (titles[0]==titles[1])
			return 0; //Полностью совпадают

		/*
		'Костюм рабочий мужской утепленный ГК Спецобъединение КМ-10 48-50 рост 170-176 см темно-синий/васильковый'
		*/
		const regExp = /^(.+)\s(\d+-\d+ рост \d+-\d+ см)\s(.+)$/gm
		
		let matches = [null, null];
		for(let i=0;i<titles.length;i++) {
			let match = titles[i].matchAll(regExp);
			match = Array.from(match);
			if (match.length==0)
				return -1; //some error

			matches[i] = match[0]; //запоминаем первое совпадение с regExp
		} //for(i)

		//console.log(matches);

		//Compare and decide
		if (matches[0][1]!=matches[1][1]) {
			return 2; //Абсолютно разные модели
		} else {
			//Модель одна и та же, сравниваем размер и цвет
			if ((matches[0][2]==matches[1][2]) && //размер
				(matches[0][3]==matches[1][3])) {//цвет
				return 0; //Полное совпадение; уже было - в начале функции
			} else {
				return 1; //Частиное совпадение
			}
		} //if

  return -1;	} //Petrovich_special

/*
  Выделяет размер из строки описания. Примеры:

  abc:110
  abc:XL
  abc:120-140

  abc р.43

  abc (120-140)
*/

	Parse_size(descr) {
		let words;
		let size = '';
		let ipos;

		//Случай 'abc:120'
		ipos = descr.lastIndexOf(':');
		if ((ipos >= 0) && (descr.length-ipos)<10)
			size = descr.slice(ipos+1);

		//Случай 'abc р. 125'
		ipos = descr.lastIndexOf('р.');
		if (size=='' && ipos>=0)
			size = descr.slice(ipos+2).trim();

		//Случай 'abc (130)'
		if (size=='' && descr.endsWith(')')) {
			ipos = descr.lastIndexOf('(');
			if (ipos>=0)
				size = descr.slice(ipos+1, descr.length-1);

			ipos = size.indexOf(','); //'(XL, black)'
			if (ipos>=0)
				size = size.slice(0, ipos);		
		}

		// Случай 'abc размер 43 def' и 'abc р. 125'
		if (size == '') {
		  let words = descr.split(' ');
		  for (let i=0;i<words.length-1;i++) {//Ok for '>.descrlenght-1'
			if ((words[i] == 'р.') || (words[i] == 'размер')) {
				size = words[i+1];
				break;
			}
		  } //for
		}

		//console.log('Obuv.Parse_size size', size);

		//Проверяем формат size
		if (size != '') {
			//Цифры в начале строки '120' или '120-140'
			if (size.match(/^[\d-]+/mg))
			  return size;

			//Символы S,M,XL
			if (size.match(/^X*[SML]+$/mg))
			  return size;

			return ''; //fail
		}

		//Если я здесь - неудача
		return '';

	} //Parse_size()



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

