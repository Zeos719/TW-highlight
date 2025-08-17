
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
		this.substDescr = [
			['блуза', 'блузки'],
			['гель', 'лаки'], // 'гель-лак'
			['люстра', 'светильник'],			
			['бра', 'светильник'],			
			
		];



	} //constructor
	
	Run() {			
		console.log('CtgGoods.Run');	
				
		//Preload elements
		let flex_elm_list = document.querySelectorAll('flex-container > flex-element');
		
		let name_grp = GetFlexPair(flex_elm_list, 'Наименование товара');
		let descr_grp = GetFlexPair(flex_elm_list, 'Описание товара');
		let image_grp = GetFlexPair(flex_elm_list, 'Изображение товара');
		let help_grp = GetFlexPair(flex_elm_list, 'Список категорий для товара');		
		//console.log('CtgGoods.test', name_grp, descr_grp, image_grp, help_grp);
							
		//Save name and description	
		let name_node = name_grp[1].querySelector('tui-editor-socket');
		let name_short = name_node.innerHTML;
		console.log('CtgGoods.name', name_short);				

		let descr_node = descr_grp[0].querySelector('div[data-type]');
		let descr = descr_node.innerHTML;				
		console.log('CtgGoods.descr', descr);				
		
		/*if (this.prevName==name_short) {
			console.log('CtgGoods.Run - alreday done!');
			return;			
		}
		this.prevName = name_short;*/
		if (name_short.includes('<a')) {
			console.log('CtgGoods.Run - alreday done!');
			return;						
		}

		//'Наименование товара' -> делаем из текста ссылку
		if (name_node) {			
			name_node.innerHTML = `<a href="https://ya.ru/search/?text=${name_short}">${name_short}</a>`;
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
		image_grp[1].after( name_grp[1] );
		image_grp[1].after( name_grp[0] );
		
		name_grp[1].after( descr_grp[1] );
		name_grp[1].after( descr_grp[0] );
		
				
		return;
	}//Run()
	
	AutoGuess(name_short, descr) {
		
		const checkboxes = document.querySelectorAll('input[type=checkbox]');
		const labels = document.querySelectorAll('label');
		if (checkboxes.length!=labels.length) {
			console.log('CtgGoods.AutoGuess check.len!=lbl.len');
			return;
		}
				
		//Prepare name
		let words = name_short.toLowerCase().split(/ |-/);	
		
		//Пропускаем прилагательные и латиницу
		let key_word = null;
		for (let i=0;i<words.length;i++) {
			let w = words[i];
			if ( !IsLatin(w) && !IsAdjectiveRus(w)) {
				key_word = w;
				break;
			}
		} //for
			
		if (!key_word)	return; 		
		
		//Коррекции		
		let key_word_short = key_word.slice(0, key_word.length-1); // Deelete last char; 'рубашка' <-> 'рубашки'
				
		for(let i=0;i<this.substDescr.length;i++) {
			if (key_word==this.substDescr[i][0]) { //Сравниваем с key_word!
				key_word_short = this.substDescr[i][1];
				break;
			}			
		} //for
				
		console.log('CtgGoods.AutoGuess.key_word', key_word_short);

		//Sex
		let sex_marks = [
			{'key':' девоч', 'present':false},
			{'key':' мальчик', 'present':false},
			{'key':' жен', 'present':false},
			{'key':' муж', 'present':false},
		];

		for (let m of sex_marks) {
			m.present = m.present || name_short.includes(m.key);
		}//for(m)
		for (let m of sex_marks) {
			m.present = m.present || descr.includes(m.key);
		}//for(m)
		
		let anySex = false;
		for(let m of sex_marks) {
			anySex = anySex || m.present;
		}		
		console.log('CtgGoods.sex', sex_marks);

		//Select checkboxes		
		for (let i=0;i<labels.length;i++) {
			let lbl_text = labels[i].innerText.toLowerCase();
			
			//special cases
			if (lbl_text.includes('новорожденных')) continue;								
			
			
			
			if (lbl_text.includes(key_word_short)) {								
			
				//filter out sex
				if (anySex) {
					let skipCx = false;
					
					for(let m of sex_marks) 
						if (lbl_text.includes(m.key) && !m.present) skipCx = true;
					
					if (skipCx) continue;
				} //if(anySex)		
			
				if (!checkboxes[i].checked)	labels[i].click();
				//console.log('CtgGoods.AutoGuess.lbl-click', labels[i].innerText);
				
			}
			//console.log('CtgGoods.AutoGuess.lbl', labels[i].innerText);
		} //for
				
		return;		
	} //AutoGuess()
/*	
	GetSexMarks(descr) {
		let marks = [
			{'key':' девоч', 'present':false},
			{'key':' мальчик', 'present':false},
			{'key':' жен', 'present':false},
			{'key':' муж', 'present':false},
		];
			
		for (let m of marks) {
			m.present = descr.includes(m.key);
		}//for(m)
		
		return marks;
	};
*/	
	
	
} //CtgGoods	