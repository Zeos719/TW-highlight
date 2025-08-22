
let ctgGoods = null;

function DoCtgGoods() {

	console.log('DoCtgGoods() starts');

	if (ctgGoods==null) ctgGoods = new CategoryOfGoods();

	ctgGoods.Run();

	return;
}


//******************** class CtgGoods ********************
class CategoryOfGoods {
  //constructor(name) { this.name = name; }
  //sayHi() { alert(this.name); }

	constructor() {
		//console.log('CtgGoods.constructor');

		this.prevName = null;
		this.forServer = {};
		
		this.substDescr = [
			['блуза', 'блузки'],
			['гель', 'лаки'], // 'гель-лак'
			['люстра', 'светильник'],			
			['бра', 'светильник'],			
						
		];



	} //constructor
	
	//*** Events ***
	handleEvent(e) {
				//Ctrl-Enter
				if (e.type=="keydown") {
					this.onCtrlEnter(e);
					}

				if (e.type=="click") {
					this.onBtnClick(e);
					}

			}//handleEvent

	onCtrlEnter(e) {
		let choice = -1;

		//Ctrl-Enter
		if (e.ctrlKey && (e.keyCode == 13 || e.keyCode == 10)) {
			console.log('PlayExam.onCtrlEnter: CtrlEnter--');

			if (SEND_TO_SERVER) {
				choice = this.SendToServer();
			} else {
				choice = 0; //?!
			}

			//Remove listeners
			if (choice!=-1) {
				document.removeEventListener("keydown", this);

				let completeBtn = document.querySelector("#completeBtn");
				completeBtn.removeEventListener("click", this);
			}
		}

		//console.log('Obuv.onCtrlEnter-key', e.key, e.keyCode, e.code);

	} //onCtrlEnter()

	onBtnClick(e) {
		console.log('PlayExam.onOkClick');
		let choice = -1;

		if (SEND_TO_SERVER) {
			choice = this.SendToServer()
		} else {
			choice = 0; //?!
		}

		//Remove listeners
		if (choice!=-1) {
			document.removeEventListener("keydown", this);

			let completeBtn = document.querySelector("#completeBtn");
			completeBtn.removeEventListener("click", this);
		}
	} //onBtnClick()

	SendToServer() {
		//Get categories
		const labels = document.querySelectorAll('label');

		let categories = new Array(labels.length);
		for (let i=0;i<labels.length;i++) categories[i] = labels[i].innerText;

		//Get solution
		const checkboxes = document.querySelectorAll('input[type=checkbox]');

		let choices = new Array(checkboxes.length);
			choices[i] = checkboxes[i].checked;

		//Prepare payload
		let payload = {
			task: 'catofgoods',
			categories: categories,
			choices: choices,
			name: forServer.name.replaceAll('\n', '\\\\n'),
			descr: forServer.descr.replaceAll('\n', '\\\\n'),
		};

		console.log('PlayExam.SendToServer-1: ', payload);
return;		

		let json = JSON.stringify(payload);

		$.post('http://localhost:8000/tw', json, function(data){
			console.log('PlayExam.SendToServer-2:', data);
		});

		return;		
	} //SendToServer()
	
	
	
	//*** Main ***
	Run() {			
		console.log('CtgGoods.Run');
		
		//Reset
		let name_short = '';
		let descr = '';

		// Attach handlers to track exit
		let completeBtn = document.querySelector("#completeBtn");
		completeBtn.addEventListener("click", this);

		document.addEventListener("keydown", this);	
				
		//Preload elements
		let flex_elm_list = document.querySelectorAll('flex-container > flex-element');
		
		let name_grp = GetFlexPair(flex_elm_list, 'Наименование товара');			
		let image_grp = GetFlexPair(flex_elm_list, 'Изображение товара');
		
		let descr_grp = GetFlexPair(flex_elm_list, 'Описание товара');
		//let descr_grp = GetFlexPair(flex_elm_list, 'Особенности:');

		//Get description				
		let descr_node = null;
		if (descr_grp[0]!=null) { //v1
			descr_node = descr_grp[0].querySelector('div[data-type]');
		} else { //v2
			descr_node = document.querySelectorAll('tui-editor-socket')[1];
		}
		descr = descr_node.innerHTML;										
		console.log('CtgGoods.descr', descr);				

		
		let help_grp = GetFlexPair(flex_elm_list, 'Список категорий для товара');		
		//console.log('CtgGoods.test', name_grp, descr_grp, image_grp, help_grp);
							
		//Get name 
		let name_node = name_grp[1].querySelector('tui-editor-socket');
	
		if (name_node.innerHTML.includes('<a')) {
			console.log('CtgGoods.Run - already done!');
			return;						
		}
		
		name_short = name_node.innerHTML;
		console.log('CtgGoods.name', name_short);				

		//Save description for server
		this.forServer.name = name_short;
		this.forServer.descr = descr;

		//'Наименование товара' -> делаем из текста ссылку
		if (name_node) {			
			let url = `https://ya.ru/search/?text=${name_short}`;
			let urlObj = new URL(url); //To encodeUrl
		
			name_node.innerHTML = `<a href="${urlObj}">${name_short}</a>`;
		}
	
		//Hide 'Выберите ВСЕ категории..'
		help_grp[0].style.display = 'none';
		help_grp[1].style.display = 'none';		
						
		//Scroll till image
		if (image_grp[1]  && !image_grp[1].hasOwnProperty('already_scrolled')) {
			
			setTimeout(function() {
				image_grp[1].already_scrolled = true;						
				image_grp[1].scrollIntoView();				
			}, 500);
		}
		
		//Auto selection - best before 'Change order'
		if (name_short.includes('Arlight')) name_short = 'светодиод';
		
		this.AutoGuess(name_short, descr);
		
		//Перемещаем 'Наименование товара' и 'Описание товара' после image
		/*
		image_grp[1].after( name_grp[1] );
		image_grp[1].after( name_grp[0] );
		
		name_grp[1].after( descr_grp[1] );
		name_grp[1].after( descr_grp[0] );
		*/
		
				
		return;
	}//Run()
	
	AutoGuess(name_short, descr) {
		
		const checkboxes = document.querySelectorAll('input[type=checkbox]');
		const labels = document.querySelectorAll('label');
		if (checkboxes.length!=labels.length) {
			console.log('CtgGoods.AutoGuess check.len!=lbl.len');
			return;
		}

		let categories = new Array(labels.length);
		for (let i=0;i<labels.length;i++) {
			categories[i] = labels[i].innerText.toLowerCase();
			
			//Example: 'Дом и дача -> Текстиль -> Ковры и ковровые дорожки'
			categories[i] = categories[i].replaceAll('->', '@');
			categories[i] = categories[i].split('@').pop().trim();			
		} //for(i)
		//console.log('CtgGoods.categories', categories);

		//Sex
		let sex_marks = this.GetSexMarks(name_short, descr);
		
		let anySex = false;
		for(let m of sex_marks) anySex = anySex || m.present;
		
		//console.log('CtgGoods.sex', sex_marks);

		//Choice
		let advise;
		if (this.BadName(name_short)) {
			advise = this.Guess_catWords(descr, categories);
			
		} else {
			advise = this.Guess_byOneWord(name_short, categories);				
		}
				
		//console.log('CtgGoods.advise', advise);

		//Select checkboxes		
		for (let i=0;i<categories.length;i++) {
			let ctg = categories[i];
			
			//special cases
			if (ctg.includes('новорожденных')) continue;								
					
			if (advise[i]) {								
			
				//filter out sex
				if (anySex) {
					let skipCx = false;
					
					for(let m of sex_marks) 
						if (ctg.includes(m.key) && !m.present) skipCx = true;
					
					if (skipCx) continue;
				} //if(anySex)		
			
				if (!checkboxes[i].checked)	labels[i].click();
				//console.log('CtgGoods.AutoGuess.lbl-click', labels[i].innerText);
				
			}
			//console.log('CtgGoods.AutoGuess.lbl', labels[i].innerText);
		} //for
				
		return;		
	} //AutoGuess()

	GetSexMarks(name_short, descr) {
		let sex_marks = [
			{'key':'девоч', 'present':false},
			{'key':'мальчик', 'present':false},
			{'key':'женск', 'present':false},
			{'key':'мужск', 'present':false},
		];

		for (let m of sex_marks) {
			m.present = m.present || name_short.toLowerCase().includes(m.key);
		}//for(m)
		for (let m of sex_marks) {
			m.present = m.present || descr.includes(m.key);
		}//for(m)

		//Special: ' юбк' -> женское
		sex_marks[2].present = sex_marks[2].present || descr.includes(' юбк');
		
		return sex_marks;
	};
	
	// Плохое имя - если солстоит только из латиницы
	
	BadName(name_short) {
		let words = name_short.toLowerCase().split(/[., ;-]/);
		words = words.filter((word) => word.length > 0);
		
		let ret = true;
		for (let w of words) ret = ret && IsLatinOrDigit(w);
		
		//console.log('CtgGoods.BadName', ret, name_short);
		return ret;		
	} //BadName()
	
	/* 
	Используем первое существительное (пропускаем прилагательный и латиницу) для поиска 
	среди категорий. Ключевое слово укорачиваем на 1 букву для коррекции множеств./единственого числа 
	*/
	Guess_byOneWord(str, categories) {
		
		let ret = Array(categories.length).fill(false);
				
		//Prepare name
		str = str.replaceAll('&nbsp;', ' ');
		let words = str.toLowerCase().split(/ |-|,/);	
		
		//Пропускаем прилагательные и латиницу
		let key_word = null;
		for (let i=0;i<words.length;i++) {
			let w = words[i];
			if ( !IsLatin(w) && !IsAdjectiveRus(w)) {
				key_word = w;
				break;
			}
		} //for
			
		if (!key_word)	return ret; 		
		
		//Коррекции		
		let key_word_short = key_word.slice(0, key_word.length-1); // Delete last char; 'рубашка' <-> 'рубашки'
				
		for(let i=0;i<this.substDescr.length;i++) {
			if (key_word==this.substDescr[i][0]) { //Сравниваем с key_word!
				key_word_short = this.substDescr[i][1];
				break;
			}			
		} //for
				
		console.log('CtgGoods.AutoGuess.key_word', key_word_short);
		
		//Проверяем категории
		for (let i=0;i<categories.length;i++) {
			ret[i] = categories[i].toLowerCase().includes(key_word_short);						
		} //for(i)
				
		return ret
	}
	
	/*
	Делим categories на отдельные слова и ищем их в str.
	Прилагательные и существительные корректируются!
	*/
	Guess_catWords(str, categories) {
		//split to words
		let cat_words = Array(categories.length);
		
		for (let i=0;i<categories.length;i++) {
			let ctg = categories[i].replaceAll('->', '');
			
			let words = ctg.toLowerCase().split(/[., ;-]/);
			words = words.filter((word) => word.length > 3);
						
			//Correction
			for(let k=0;k<words.length;k++)
				{ 
					let w = words[k];
					let toDel=1; 
					if (IsAdjectiveRus(w)) toDel=2;
					words[k] = w.slice(0, w.length-toDel); 
				};
						
			cat_words[i] = words;
		} //for
		console.log('CtgGoods.Guess_catWords', cat_words);
		
		//Search
		str = str.toLowerCase();
		
		let ret = Array(categories.length).fill(false);
				
		for (let i=0;i<categories.length;i++) {
			let words = cat_words[i];
			for (const w of words) {
				ret[i] = ret[i] || str.includes(w);				
			} //for(k)						
		} //for(i)
		
		return ret;
	} //Guess_byOneWord
	
	
} //CtgGoods	