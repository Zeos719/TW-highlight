
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

		this.prevDescr = null;
		this.substDescr = [
			['блуза', 'блузки'],
			['гель', 'лаки'], // 'гель-лак'
			
		];



	} //constructor
	
	Run() {			
		console.log('CtgGoods.Run');	
		
		//Preload elements
		//-1. headers
		let headers = document.querySelectorAll('.flex-header__content');
		let hdrNameOfGd = null;
		let hdrImgOfGd = null;
		
		for (const hdr of headers) {
			if (hdr.innerText=='Наименование товара') hdrNameOfGd=hdr;
			if (hdr.innerText=='Изображение товара') hdrImgOfGd=hdr;			
		} //for()
			
		//-2.editors
		// 0 - наименование товара, краткое
		// 1 - описание товара (под спойлером)
		// 2 - 'Выберите ВСЕ категории'
		let editors = document.querySelectorAll('.tui-editor-socket');

		//Save description	
		let descr = editors[0].innerText;
		
		if (this.prevDescr==descr) {
			console.log('CtgGoods.Run - alreday done!');
			return;			
		}
		this.prevDescr = descr;
		
		//Изменяем 'Наименование товара' на ссылку
		//editors[0].innerHTML = `<a href="https://ya.ru/search/?text=${descr}">${descr}</a>`;
		//console.log('CtgGoods.editors[0]', editors[0]);
			
		//Hide 'Выберите ВСЕ категории..'
		if (editors.length>3) {
			editors[2].style.display = 'none';
		}
						
		//Scroll till image
		if (hdrImgOfGd  && !hdrImgOfGd.hasOwnProperty('already_scrolled')) {
			
			setTimeout(function() {
				hdrImgOfGd.already_scrolled = true;						
				hdrImgOfGd.scrollIntoView();				
			}, 500);
		}
		
		//Перемещаем 'Наименование товара' перед 'Список категорий'
		let hdrElm = document.querySelector("#klecks-app > tui-root > div > task > flex-view > flex-common-view > div.tui-container.tui-container_adaptive.flex-common-view__main > div > main > flex-element > flex-container > flex-element:nth-child(2)");
		let txtElm = document.querySelector("#klecks-app > tui-root > div > task > flex-view > flex-common-view > div.tui-container.tui-container_adaptive.flex-common-view__main > div > main > flex-element > flex-container > flex-element:nth-child(3)")

		let destElm = document.querySelector("#klecks-app > tui-root > div > task > flex-view > flex-common-view > div.tui-container.tui-container_adaptive.flex-common-view__main > div > main > flex-element > flex-container > flex-element:nth-child(10)")

		//Auto selection - best before 'Change order'
		this.AutoGuess(descr);

		//!!!Change order of nodes!!!
		if (hdrElm.innerText=='Наименование товара') {
			//console.log('CtgGoods.Move');
			destElm.before(hdrElm);
			destElm.before(txtElm);
		}
		
		//Снова ищем описание - должно быть с индексрм 1
		editors = document.querySelectorAll('tui-editor-socket');
		//..и делаем из текста ссылку
		if ((editors.length>2) && (editors[1].innerText==descr)) {			
			editors[1].innerHTML = `<a href="https://ya.ru/search/?text=${descr}">${descr}</a>`;
		}
		
		
		
	}//Run()
	
	AutoGuess(descr) {
		
		const checkboxes = document.querySelectorAll('input[type=checkbox]');
		const labels = document.querySelectorAll('label');
		if (checkboxes.length!=labels.length) {
			console.log('CtgGoods.AutoGuess check.len!=lbl.len');
			return;
		}
				
		//Prepare descr
		let words = descr.toLowerCase().split(/ |-/);
		//console.log('CtgGoods.words', words);
				
		let key_word_long = words[0];
		
		//Проверка на прилагательное
		let suffix = key_word_long.slice(key_word_long.length-2); //last two chars
		let isAdjective = 'ой ый ая ое'.includes(suffix);
		if (isAdjective) key_word_long = words[1]; //если прилагательное - берем второе слово
		
		//Коррекции		
		let key_word = key_word_long.slice(0, key_word_long.length-1); // Deelete last char; 'рубашка' <-> 'рубашки'
				
		for(let i=0;i<this.substDescr.length;i++) {
			if (key_word_long==this.substDescr[i][0]) { //Сравниваем с key_word_full!
				key_word = this.substDescr[i][1];
				break;
			}			
		} //for
		
		console.log('CtgGoods.AutoGuess.key_word', key_word);

		//Select checkboxes		
		for (let i=0;i<labels.length;i++) {
			if (labels[i].innerText.toLowerCase().includes(key_word)) {
				if (!checkboxes[i].checked)	labels[i].click();
				//console.log('CtgGoods.AutoGuess.lbl-click', labels[i].innerText);
				
			}
			//console.log('CtgGoods.AutoGuess.lbl', labels[i].innerText);
		} //for
				
	} //AutoGuess()
	
	
} //CtgGoods	