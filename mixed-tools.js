function http_POST(url, data) {
	console.log('http_POST');

	fetch(url, {
		method: "POST",
		body: JSON.stringify(data),
		headers: {
			"Content-type": "application/json; charset=UTF-8"
		}
	})
	.then(response => response.json())
	.then(console.log)

	.catch(console.error);

};//http_POST

function http_GET_JSON(url, OnAnswer, OnError=console.error) {
	console.log('http_GET_JSON', url);

/*
	fetch(url, {
		method: "GET",
		headers: {
			"Content-type": "text/plain; charset=UTF-8"
		}
	})
*/
	fetch(url)
		.then(response => response.json())
		//.then(data => console.log(data))
		.then(data => {if (OnAnswer) OnAnswer(data)})
		.catch(OnError);

}; //http_GET_JSON

function http_GET_text(url, OnAnswer, OnError=console.error) {
	console.log('http_GET_text');

/*
	fetch(url, {
		method: "GET",
		headers: {
			"Content-type": "text/plain; charset=UTF-8"
		}
	})
*/
	fetch(url)
		.then(response => response.text())
		.then(data => {if (OnAnswer) OnAnswer(data)})
		.catch(OnError);

}; //http_GET_text

function StringHash(str, hash=0) {
	//let hash = 0;

	for (let i = 0; i<str.length; i++) {
		const chr = str.charCodeAt(i);
		hash = ((hash << 5) - hash) + chr;
		hash |= 0; // Преобразовываем к 32-битному целому числу
	}
	//console.log('Hex', hash.toString(16));

	return hash;
}; //StringHash

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Преобразования типов для работы с image
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
//------------

function hasUnicode(s) {
    return /[^\u0000-\u007f]/.test(s);
}

 function CSVToArray(csv, delim = ',', quote = '"') {
  //List of delims and quotes
  let delims = [];
  let from = 0;
  while (from < csv.length) {
    let idx = csv.indexOf(delim, from);
    if (idx < 0)
      break;

    delims.push(idx);
    from = idx + 1
  } //while

  let quotes = [];
  from = 0;
  while (from < csv.length) {
    let idx = csv.indexOf(quote, from);
    if (idx < 0)
      break;

    quotes.push(idx);
    from = idx + 1
  } //while

  //Filter out delims
  delims = delims.filter(function (item, index, array) {
    for (let i = 0; i < quotes.length-1; i += 2) {
      if ((item > quotes[i]) && (item < quotes[i + 1]))
        return false;
    } //for

    return true;
  }); //filter

  //Add 0 and csv.length to unify splitting proces
  delims.unshift(0);
  delims.push(csv.length);

  //Final split
  cols = []
  for (let i = 0; i < delims.length-1; i++) {
    from = delims[i]+1;
    let till = delims[i+1];
    cols.push(csv.slice(from, till));
  }//for

  return cols;
}

//test1 = '1,2,"good one","complecated, oh"'
//test2 = '1,2,"все просто","увы, запятая"'
//console.log( CSVToArray(test2) )

function StripQuotes(str, quotes ='"') {
	if (typeof(str)=='string')
		return str.replaceAll(/^\"(.*)\"$/gm, '$1')
	else
		return str;
}

function IsLatin(str) {
  if (str.length==0) return false;

  for(let i=0;i<str.length;i++) {
    let c = str.charCodeAt(i);
    let isLatin = ((c >= 97) && (c <= 122)) || ((c >= 65) && (c <= 90)); //a..z A..Z
    if (!isLatin) return false;
  } //for

  return true;
} // IsLatin()

function IsLatinOrDigit(str) {
  if (str.length==0) return false;

  for(let i=0;i<str.length;i++) {
    let c = str.charCodeAt(i);
    let isLatin = ((c >= 97) && (c <= 122)) || ((c >= 65) && (c <= 90)); //a..z A..Z
    let isDigit = ((c >= 48) && (c <= 57)); //0..9
	
    if (!(isLatin || isDigit)) return false;
  } //for

  return true;
} // IsLatin()



// 'ЗЕЛЕНЫй', 'голубой', 'розовая', 'черное' -> true
function IsAdjectiveRus(str) {
  if (str.length<3) return false;

  let suffix = str.slice(str.length-2).toLowerCase();
  return 'ой|ый|ая|ое|ые|ие|ий|яя|ее'.includes(suffix);
} //IsAdjectiveRus()


/*
	flex_elm_list = document.querySelectorAll('flex-container > flex-element');
*/
function GetFlexPair(flex_elms, title_key, body_key=null) {
	
	let ret = [null, null];
	
	for (let i=0;i<flex_elms.length;i++) {
		let elm = flex_elms[i];
		if (elm.innerText.includes(title_key)) {
			ret[0] = elm;
			
			if (!body_key) { //Если body_key не задан, выбираем следующий за title элемент
				ret[1] = flex_elms[i+1];				
				return ret;
			}//if(!body_key)			
		}//if(title_key)
			
		if (ret[0] && body_key && elm.innerText.includes(body_key)) { //Если задан body_key
			ret[1] = elm;
			return ret;
		} //if(body_key)
		
	}//for
	
	return ret;	
}

/*
 '<div id="id_1" class="class_A class_B" param>' -> 

 [{tag:'div'}, {key:'id', value:'id_1'}, {key:'class', value:[class_A, class_B]}, {key:'param', value:''}]
*/ 
function ParseHtmlTag(tag) {
  tag = tag.slice(1, tag.length-1);

  let items = tag.match(/\w+\=['"][^'"]+['"]|\w+/g); //extract items 'id="id_1"'
  
  //tag
  let ret = [{'tag':items[0]}];

  //pairs
  for (let i=1;i<items.length;i++) {
    let item = items[i]; //id="id_1"

    let subitems = item.split(/['"=\s]/);
    subitems = subitems.filter((w)=>w.length>0);

    let key = subitems[0];
    let value = subitems.slice(1); //without subitems[0]
    if (value.length==0) value=''; //like 'param' -> empty value
    if (value.length==1) value = value[0]; //single value: id='id_1'

    ret.push({key, value})

    //console.log(key, value);
  }//for(items)

  return ret;
}//ParseHtmlTag

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

function RB_get_lbl() {
	//console.log('RB_get() begin');
	
	const radio_btns = document.querySelectorAll('input[type=radio]');

	for(let i=0; i<radio_btns.length; i++) 
		if (radio_btns[i].checked) 
			return radio_btns[i].parentElement.innerText;			
	
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
