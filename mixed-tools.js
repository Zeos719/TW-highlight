function http_POST(url, json_payload) {
	console.log('http_POST', url);

	fetch(url, {
		method: "POST",
		body: JSON.stringify(json_payload),
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
function RB_set(choice, scrollToView=true) {
	//console.log(`RB_set(${choice.toString()}) begin`);
	
	const radio_btns = document.querySelectorAll('input[type=radio]');	
//	if (radio_btns.length==0) 
//		radio_btns = document.querySelectorAll('input[tuiradiotype=radio]');
	if (radio_btns.length==0) return;		
	
	//console.log('RB_set() rb:', radio_btns);

	if (typeof(choice)=='number') choice = [choice];

	let rbtn;	
	for(let i=0; i<choice.length; i++) {
		if (choice[i]>=radio_btns.length) continue;
		
		rbtn = radio_btns[ choice[i] ];
		
		//rbtn.parentNode.click();
		triggerClick( rbtn );		
		if (scrollToView) rbtn.scrollIntoView();
	} //for(ch)
	
	if (scrollToView) {
		rbtn = radio_btns[ choice[0] ];
		
		if (rbtn && !isScrolledIntoView(rbtn)) {
		//isScrolledIntoView(rbtn);	{
			rbtn.scrollIntoView();
		}	
	}

	return;
}

function isScrolledIntoView(target) {
	  // Все позиции элемента
	  let targetPosition = {
		  top: window.pageYOffset + target.getBoundingClientRect().top,
		  left: window.pageXOffset + target.getBoundingClientRect().left,
		  right: window.pageXOffset + target.getBoundingClientRect().right,
		  bottom: window.pageYOffset + target.getBoundingClientRect().bottom
		};
		// Получаем позиции окна
		let windowPosition = {
		  top: window.pageYOffset,
		  left: window.pageXOffset,
		  right: window.pageXOffset + document.documentElement.clientWidth,
		  bottom: window.pageYOffset + document.documentElement.clientHeight
		};
		
		// console.log('target', targetPosition);
		// console.log('window', windowPosition);
		
		return (targetPosition.bottom > windowPosition.top && // Если позиция нижней части элемента больше позиции верхней чайти окна, то элемент виден сверху
			targetPosition.top < windowPosition.bottom && // Если позиция верхней части элемента меньше позиции нижней чайти окна, то элемент виден снизу
			targetPosition.right > windowPosition.left && // Если позиция правой стороны элемента больше позиции левой части окна, то элемент виден слева
			targetPosition.left < windowPosition.right);
	};
	
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

function RB_set_lbl(btnNo, lbl) {
	//console.log('RB_set_lbl() begin');
	
	//const radio_btns = document.querySelectorAll('input[type=radio]');
	const radio_lbls = document.querySelectorAll('div[automation-id=flex-radio-button__label]');

	if (btnNo<radio_lbls.length) {
		radio_lbls[btnNo].innerText = lbl;
	}
	
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

function RB_uncheckAll() {
	console.log('RB_uncheckAll() begin');
	
	const radio_btns = document.querySelectorAll('input[type=radio]');

	for (const btn of radio_btns) 
		{if (btn.checked) btn.checked = false}
	
	return;
}

function IsDigit(n) {return /\d+/.test(n)}

/*  Раскраска заданных слов

	let matches = text.matchAll(regExp);
	let matchesArr = Array.from(matches);
	textNode.innerHTML = ColorizeWords_matchAll(text, matchesArr, 'pink')				
*/
function ColorizeWords_matchAll(text, matchAll_array, color) {

	for(let i=matchAll_array.length-1;i>=0;i--) {
		let m = matchAll_array[i]
		//console.log('m', m[0], m.index)
		
		let pref = text.slice(0, m.index)
		let suff = text.slice(m.index+m[0].length)
		
		text = `${pref}<span style="background-color:${color};">${m[0]}</span>${suff}`
	} //for

	return text
} //ColorizeWords_matchAll

function triggerMouseUp(node) {
		console.log('triggerMouseUp');
        const event = new MouseEvent('mouseup', { bubbles: true });
        //document.getElementById('myDiv').dispatchEvent(event);
		node.dispatchEvent(event);
    }
		
function triggerClick(node) {
		console.log('triggerClick', node);
        const event = new MouseEvent('click', { bubbles: true });
        node.dispatchEvent(event);
    }

// compare_fn(x, y)
function BinarySearch(arr, el, compare_fn) {
	let low = 0;
	let top = arr.length - 1;
	while (low <= top) {
		let mid = (top + low) >> 1;
		let cmp = compare_fn(el, arr[mid]);
		if (cmp > 0) {
			low = mid + 1;
		} else if(cmp < 0) {
			top = mid - 1;
		} else {
			return mid;
		}
	}
	return -1;
} //BinarySearch

// To use with BinarySearch
function InflateSearchRange(arr, x, idx, compare_fn) {	
	if (idx<0) return null;
	
	//to bottom
	let bottom = idx;		
	while(bottom>=0 && compare_fn(x, arr[bottom])==0) --bottom;
	bottom++;

	//to top
	let top = idx;		
	while(top<arr.length && compare_fn(x, arr[top])==0) ++top;
	top--;
	
	return [bottom, top];
} //InflateRange

function UniqueSort(arr, compare_fn) {
	if (!compare_fn) compare_fn = function (x,y) {return x-y};
			
	if (arr.length<=1) return arr;		
	
	let sorted = arr;
	sorted.sort(compare_fn);
			
	let prev = sorted[0];
	let unique = [ prev ];
	
	for (let i=1;i<sorted.length;i++) {
		if(compare_fn(prev, sorted[i])!=0) {
			prev = sorted[i];
			unique.push(prev);			
		}		
	}//for
		
	return unique;
} //UniqueSort


function PlayAudio(soundSrc) {
	
	defaultSrc = 'https://www.phonewarez.ru/files/TW/sounds/zvukogram-iphone-text-message.mp3';
	
	if (!soundSrc) {
		soundSrc = defaultSrc
	} else {
		if (!soundSrc.includes('/')) {//Only name of sound file; add server path from default 
			let rmost_slash = defaultSrc.lastIndexOf ('/')
			soundSrc = defaultSrc.slice(0, rmost_slash) + soundSrc; 
			console.log('PlayAudio.soundSrc', soundSrc);
		}		
	}
		
	let audio = new Audio(soundSrc);
	
	try {
		audio.play(soundSrc);	
	}
	catch (err) {
		console.log('PlayAudio', err);		
	}
} //PlayAudio

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

//****************************
// Returns list: [ {'word':w, 'pos':p}...  ] where p - position of w in original str
function Split_WordsAndPos(str, delim =	 /\s|\(|\)|:/) {
	let words = str.split(delim);

	words = words.filter( function(item) {return item!=''} ); //filter out empty items

	let startFrom = 0;
	for(let i=0;i<words.length;i++) {

		let pos = str.indexOf(words[i], startFrom);
		startFrom = pos + words[i].length;

		words[i] = {word: words[i], pos: pos};
	}

	return words;
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

   return [colorized1, colorized2];
}

// str - string to color, words = [ {'word':w, 'pos':p, 'haspair':h}...  ]
function Strings_ApplyColors(str, words, colorRed, colorGreen) {
	let colorized = str;

	for (let i=words.length-1; i>=0; i--) {
		let prefix = colorized.slice(0, words[i].pos);
		let suffix = colorized.slice(words[i].pos+words[i].word.length);

		let color = words[i].hasPair?colorGreen:colorRed;
		if (color==null) continue;

		colorized = `${prefix}<span style="background-color:${color};">${words[i].word}</span>${suffix}`;
	} //for (i--)

	return colorized;
}
