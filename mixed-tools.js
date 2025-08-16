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

// 'ЗЕЛЕНЫй', 'голубой', 'розовая', 'черное' -> true
function IsAdjectiveRus(str) {
  if (str.length<3) return false;

  let suffix = str.slice(str.length-2).toLowerCase();
  return 'ой|ый|ая|ое|ые'.includes(suffix);
} //IsAdjectiveRus()
