function http_POST(url, data) {
	console.log('Test_fetch_POST');

	fetch(url, {
		method: "POST",
		body: JSON.stringify(data),
		headers: {
			"Content-type": "application/json; charset=UTF-8"
		}	
	}).then(response => response.json()) 
	.catch(console.error);
	
};//http_POST

function http_GET(url, OnAnswer) {
	console.log('Test_fetch_GET');

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
	.then(data => {if (OnAnswer) OnAnswer(data)})		
	.catch(console.error);
	
}; //http_GET

function StringHash(str) {
	let hash = 0;
	
	for (let i = 0; i<str.length; i++) {
		const chr = str.charCodeAt(i);
		hash = ((hash << 5) - hash) + chr;
		hash |= 0; // Преобразовываем к 32-битному целому числу
	}
	//console.log('Hex', hash.toString(16));
	
	return hash;
}; //StringHash