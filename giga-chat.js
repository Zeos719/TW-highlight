/* Usage:

	AskGiga(reqText).then(console.log);

*/
async function AskGiga(reqText) {

	let response;			
	let id = (new Date()).getTime();		
	let result = {'status': 'ok', 'request':reqText, 'answer': ''}

	//Post request
	let url = `http://127.0.0.1:8000/broker?id=${id}&task=ai&subtask=cli-post-req` 
	let data = { request: reqText}

	let timeStart = (new Date()).getTime();

	response = await fetch(url, {
		method: "POST",
		body: JSON.stringify(data),
		headers: {
			"Content-type": "application/json; charset=UTF-8"
		}
	})
	.catch(console.log)
		
	if (!response.ok) {
		result['status'] = 'error:network';
		
		let timeStop = (new Date()).getTime();
		result['elapsed-time'] = ((timeStop-timeStart)/1000).toFixed(1);
		
		return result;
		}

	//Wait for answer
	url = `http://127.0.0.1:8000/broker?id=${id}&task=ai&subtask=cli-get-answer`
	
	const MAX_TRY = 20;
	const GET_DELAY = 400;

	for(let tryCount=0; tryCount<MAX_TRY; tryCount++) {
		//send GET 
		
		response = await fetch(url)				
						.catch(console.log);
							
		if (!response.ok) {
			result['status']='error:network';			
			
			let timeStop = (new Date()).getTime();
			result['elapsed-time'] = ((timeStop-timeStart)/1000).toFixed(1);
							
			return result;
			
		} else { //GET succeeded								
		
			let json = await response.json();
			
			//console.log('for-data.2', tryCount, json);
					
			if (json.result=='ok') {		
				result['answer'] = json.answer;
				
				let timeStop = (new Date()).getTime();
				result['elapsed-time'] = ((timeStop-timeStart)/1000).toFixed(1);
									
				return result;
			}
		}
	
		//Delay before next try
		let promiseDelay = new Promise((resolve, reject) => {
			setTimeout(() => {
				resolve("delay-ends");
				}, GET_DELAY);
		});		
					
		await promiseDelay;

	} //for(tryCount)
	
	result['status'] = 'timeout';
	
	let timeStop = (new Date()).getTime();
	result['elapsed-time'] = ((timeStop-timeStart)/1000).toFixed(1);
			
	return result
}
