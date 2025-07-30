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

