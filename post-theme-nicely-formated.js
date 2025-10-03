function NF_GetRepetions(text) {
  /* Ищет последовательности одинаковых символов.
  Возвращает список из(char, begin_pos, length)) */
  
  let items = []

  let prev_c = null
  let seq_begin = -1

  let cpos = 0
  for(let c of text) {

    if (c==prev_c) { // sequence continue

      if (seq_begin==-1) // new sequence begins
        seq_begin = cpos - 1

    } else { // boundary
      if (seq_begin>=0) { // sequence ends
        count = cpos - seq_begin
        items.push( [prev_c, seq_begin, count] )
        seq_begin = -1
      }
    }  

    prev_c = c

    cpos += 1
} //for

    return items
}


function NF_GetSmiles(text) {
  /* Составляет список смайлов тексте.
  Для каждого найденного смайла добавляет в список элемент(smile_char, pos_in_text)
  */

  function IsSmile(c) {
	const NON_SMILES = '—«»';  
	
    let co = c.charCodeAt(0);
    let isCyrrilic = ((co>=1040) && (co<=1103)) || (c=='Ё') || (c=='ё');
	
    return co>255 && !isCyrrilic && !NON_SMILES.includes(c);
  }


  smiles = []
  let cpos = 0
  for (let c of text) {
    if (IsSmile(c)) {
      smiles.push( [c, cpos] )
    }

    cpos += 1
    } //for    

  return smiles
  }


//console.log(/^\d+([\.\,]\d+)?$/.test('1205') )

function NF_GetDigits(text) {
	/* 720  3,050 1055.2 - значение
	25.06 15.08.25 08.08.2025 2025 - дата
	1.5%, 25% - проценты
	15:00 17-00 - время
	*/

	function IsDate(s) {
		if (/^\d{4}$/.test(s)) { // '2025'
		  y = parseInt(s, 10)
		  return (y>=2020) && (y<=2030)
		}

		if (!/^\d{2}\.\d{2}(\.\d{2,4})?$/.test(s)) { // '22.09' '22.09.2025':
			return false
		}

		let dmy_s = s.split('.')
		//dmy = [int(a) for a in dmy]
		let dmy = []
		for (let a of dmy_s) dmy.push( parseInt(a, 10) )

		let ok = (dmy[0]<=31) && (dmy[1]<=12)

		if (dmy.length==3) {
			let y = dmy[2]
			let y2d = (y>=20) && (y<30)
			let y4d = (y>=2020) && (y<2030)
			ok = ok && (y2d || y4d)
		}

		return ok
	} //IsDate


	function IsCent(s) {
		return /^\d+([\.\,]\d+)?\%$/.test(s) 
	}

	function IsTime(s) {
		return /^\d{2}\:\d{2}$/.test(s)
	}

	function IsValue(s) {
		return /^\d+([\.\,]\d+)?$/.test(s)
	}

	items = []

	reg = /\b\d+([\.\,\:]\d+)?(\.\d+)?(\%|\b)/g

	let matchAll = text.matchAll(reg)

	for (let m of matchAll) {
		//console.log(m[0], m.index)
		let s = m[0]

		let item_type = null
		if (IsDate(s)) {
			item_type = 'date'
		} else if (IsCent(s)) {
			item_type = 'cent'    
		} else if (IsTime(s)) {
			item_type = 'time'
		} else if (IsValue(s)) {
			item_type = 'value'
		}

		if (item_type) {
			items.push( [s, m.index, item_type] )
		}      

	} //for
  
    return items
} // NF_GetDigits

function NF_GetTickers(text) {
	let items = []

	const reg = /\$\w+\b/g

	let matchAll = text.matchAll(reg)

	for (let m of matchAll) {
	  items.push( [m[0], m.index] )
	}

	return items
} //NF_GetTickers


function NF_summary(text) {

	function GetMediana(distances) {
		let mediana = 0.0

		if (distances.length>0) {
			distances.sort()

			if (distances.length%2 == 1) { // odd length
				let middle = (distances.length - 1)/2
				mediana = distances[middle]
			} else { // even length
				let middle = distances.length/2
				mediana = (distances[middle - 1] + distances[middle]) / 2.0
			} //if
		} //if

		return mediana
	  } //GetMediana

	let count
	let summary = {}

	// Paragraph - /n
	let m
	
	summary['nLf'] = 0
	m = text.match(/\n/g)
	if (m) summary['nLf'] = m.length //text.count('\n')
	
	summary['nLf2'] = 0
	m = text.match(/\n\n/g)
	if (m) summary['nLf2'] = m.length //text.count('\n\n')

	// Repetitions
	let items = NF_GetRepetions(text) //[(char, start, len)]

	const MINREPLEN = 5

	summary['lineSep'] = 0
	for (let it of items) {
		if (it[0].charCodeAt(0)<65 && it[2]>MINREPLEN) // 65 = ord('A')
			summary['lineSep'] += 1
	}

	// Smiles
	items = NF_GetSmiles(text) //[(char, pos)]
	summary['smiles-count'] = items.length

	//distances = [items[i + 1][1] - items[i][1] for i in range(len(items) - 1)]
	distances = []
	for (let i = 0; i<items.length-1; i++) distances.push( items[i+1][1] - items[i][1] )

	mediana = GetMediana(distances)
	summary['smiles-mediana'] = mediana

	summary['smiles-mediana-ratio'] = 0.0
	if (items.length>0) summary['smiles-mediana-ratio'] = mediana/(text.length/items.length)

	// Digits
	items = NF_GetDigits(text)
	summary['digits-count'] = items.length

	//distances = [items[i + 1][1] - items[i][1] for i in range(len(items) - 1)]
	distances = []
	for (let i=0; i<items.length-1; i++) distances.push(items[i + 1][1] - items[i][1])

	mediana = GetMediana(distances)
	summary['digits-mediana'] = mediana

	summary['digits-mediana-ratio'] = 0.0
	if (items.length>0) summary['digits-mediana-ratio'] = mediana/(text.length/items.length)

	// Digits - cents
	count = 0
	for (it of items) {
		//console.log(it)
		if (it[2]=='cent') count += 1
	}
	summary['digits-cent-count'] = count

	// Tickers
	items = NF_GetTickers(text)
	summary['tickers-count'] = items.length

	//distances = [items[i + 1][1] - items[i][1] for i in range(len(items) - 1)]
	distances = []
	for (let i=0; i<items.length-1; i++) distances.push(items[i + 1][1] - items[i][1])

	mediana = GetMediana(distances)
	summary['tickers-mediana'] = mediana

	summary['tickers-mediana-ratio'] = 0.0
	if (items.length>0) summary['tickers-mediana-ratio'] = mediana/(text.length/items.length)

	return summary
} //NF_summary


function NF_rating(summary) {
	//console.log('PalyExam.NF_rating.smr', summary)
	RATIO_MIN = 0.6;

	let rate = 0;	
	//rate = 2 * summary['nLf2'] + 2 * summary['lineSep'];

	if (summary['smiles-mediana-ratio'] > RATIO_MIN)
	  rate += 2*summary['smiles-count'];
  
	if (summary['digits-cent-count']>=2)
		rate += 5*summary['digits-cent-count'];
  
/*
	if (summary['digits-mediana-ratio'] > RATIO_MIN)
	  rate += summary['digits-count'];

	if (summary['tickers-mediana-ratio'] > RATIO_MIN)
	  rate += summary['tickers-count'];
*/

	//console.log('PalyExam.NF_rating.rate', rate)

	return rate;
} //NF_rating



/*
text = 'abd $SBER $CONT fer'
items = NF_GetTickers(text)
console.log(items)
*/

/*
text = "Флэт 3,00–3,03 — 50% . Играть от границ внутри коридора;" +
" подтверждение — повторные отказы от пробоев на 5-мин." +
"720  3,050 1055.2 - значение\n" +
"25.06 15.08.25 08.08.2025 2025 - дата\n" +
"1,5% 25% - проценты\n" +
"15:00 17-00 - время"
items = NF_GetDigits(text)
console.log(items)
*/

/*
text = "+++Первая строка\n==============\nSecond string and two LF\n\nThe end"
items = NF_GetRepetions(text)
console.log(items)
*/

/*
text = "🧠💰 ДОФАМИНОВАЯ ИГЛА: Как наш мозг влияет на финансы\n\n" +
       "Знаешь, почему после зарплаты деньги тают так быстро, будто их и не было?" +
       " 🍦☀️ Дело не просто в силе воли — это биохимия мозга!\n\n" +
       "🎯 Что происходит в голове"     
smiles = NF_GetSmiles(text)
console.log(smiles)
*/

/*
Американский концерн Boeing Co., один из крупнейших мировых производителей авиационной, космической и военной техники, резко увеличил чистый убыток во 2-м квартале и сократил выручку на 15%, причем скорректированный убыток и выручка оказались хуже прогнозов рынка.
При этом акции компании дорожают после заявлений руководства о прогрессе в укреплении системы контроля за качеством выпускаемых самолетов.
Как сообщается в пресс-релизе Boeing, чистый убыток в апреле-июне 2024 года составил $1,44 млрд, или $2,33 в расчете на акцию, по сравнению с убытком в размере $149 млн, или $0,25 на акцию, за аналогичный период предыдущего года.
Убыток без учета разовых факторов увеличился до $2,90 на акцию с $0,82.
Выручка снизилась на 15% - до $16,87 млрд.
Аналитики, опрошенные FactSet, в среднем ожидали, что компания получит скорректированный убыток на уровне $1,9 на акцию при выручке в $17,35 млрд.
"Несмотря на сложный квартал, мы видим значительный прогресс в укреплении нашей системы контроля за качеством и позиционировании нашей компании с прицелом на будущее", - сказал глава Boeing Дейв Калхун.
Выручка в сегменте гражданских самолетов в минувшем квартале упала на 32% и составила $6 млрд. Выручка подразделения оборонной и космической техники в минувшем квартале сократилась на 2% и составила $6,02 млрд.
Портфель заказов на конец второго квартала составлял $516 млрд и включал в себя свыше 5,4 тыс. самолетов.
Котировки акций Boeing растут на 1,8% в ходе предварительных торгов в среду. С начала года рыночная стоимость корпорации упала на 28,3%, до $115 млрд.
*/

/*
summary = NF_summary(text)
console.log(summary)
//console.log(NF_rating(summary))
*/
