/* Returns: 
	-1 = abs different
	0 = only diagonals differ
	1  = abs equals
*/
function TV_CompareModels(models) {

  const reg_09 = /\d+/g
  const reg_AZ = /[A-Z\.]+/g

  let parts_09 = [[], []]
  let parts_AZ = [[], []]

  //Split IDs to digital and alphabetical parts_09
  for (let i = 0; i < 2; i++) {
    for (let m of models[i].matchAll(reg_09)) {
      parts_09[i].push({ value: m[0], index: m.index })
    }
	
    for (let m of models[i].matchAll(reg_AZ)) {
      parts_AZ[i].push({ value: m[0], index: m.index })
	}	
  } //for(i)
	  
  // 1.compare lengths
  if (parts_09[0].length != parts_09[0].length) return -1 //abs differ
  if (parts_AZ[0].length != parts_AZ[0].length) return -1 //abs differ

  // 2.compare alphabetical parts
  for (let i = 0; i < parts_AZ[0].length; i++) {
    if (parts_AZ[0][i].index != parts_AZ[1][i].index)
      return -1 //abs differ

    if (parts_AZ[0][i].value != parts_AZ[1][i].value)
      return -1 //abs differ
  }

  // 3.compare digital parts - onle diagonal may differ
  const DIAGS = ['28', '32', '40', '43', '50', '55', '58', '65', '75', '77', '80', '85', '86', '90', '95']

  diag_diffs = []
  for (let i = 0; i < parts_AZ[0].length; i++) {
    if (parts_09[0][i].index != parts_09[1][i].index)
      return -1 //abs differ

    let isDiag = [
      DIAGS.includes(parts_09[0][i].value),
      DIAGS.includes(parts_09[1][i].value)
    ]

    if (isDiag[0] != isDiag[1]) return -1

    let same_09 = (parts_09[0][i].value == parts_09[1][i].value)

    if (isDiag[0]) {
      //Two diags
      if (!same_09) diag_diffs.push([parts_09[0][i].value, parts_09[1][i].value])
    } else {
      //Non-diags
      if (!same_09) return -1
    }
  } // for()

  //console.log(diag_diffs)
  if (diag_diffs.length==0) return 1; //equals
  if (diag_diffs.length==1) return 0; //only diagonals differ

  return -1 //too many differences, straneg
} //TV_CompareModels


// Returns array [ {value:'32', index:6}, ..]
function TV_GetDiagonal(model) {

  const regexp = /\d+/g
  const DIAGS = ['28', '32', '40', '43', '50', '55', '58', '65', '75', '77', '80', '85', '86', '90', '95']

  //let matchAll = [models[0].matchAll(regexp), 
  //                models[1].matchAll(regexp)]

  m0 = []
  for (let m of model.matchAll(regexp)) {
    let val = m[0]

    if (DIAGS.includes(val))
      m0.push({ value: val, index: m.index })
  } //for

  return m0
} //TV_GetDiagonal()	

/* Accepts two arrays [ {value:'32', index:6}, ..]
 Return -1 = abs differ, 0 = sub-models, 1 = same */
function TV_CompareDiags(m0, m1) {
  if (m0.length != m1.length) return -1

  let count = 0;
  for (i = 0; i < m0.length; i++) {
    if (m0[i].index != m1[i].index) return -1

    if (m0[i].value != m1[i].value) count += 1
  } //for()

  if (count == 0) return 1 //same
  if (count == 1) return 0 //only diags differ

  return -1
} //TV_CompareDiags



/*
function TV_GetDiagonal(models) {

  const regexp = /\d+/g
  const DIAGS = ['28', '32', '40', '43', '50', '55', '58', '65', '75', '77', '80', '85', '86', '90', '95']

  //let matchAll = [models[0].matchAll(regexp), 
  //                models[1].matchAll(regexp)]

  m0 = []
  for(let m of models[0].matchAll(regexp)) {
    m0.push( {value:m[0], index:m.index} )
  }

  m1 = []
  for (let m of models[1].matchAll(regexp)) {
    m1.push({ value: m[0], index: m.index })
  }

  if (m0.length!=m1.length) return null

  m_diff = []
  for(let i=0;i<m0.length;i++) {
    if (m0[i].index != m1[i].index) return null

    let val0 = m0[i].value
    let val1 = m1[i].value

    if (val0.length != 2 || val1.length != 2)  continue

    if (val0 != val1) m_diff.push([val0, val1] )
  }

  if (m_diff.length!=1) return null

  m_diff = m_diff[0]
  if (!DIAGS.includes(m_diff[0]) || !DIAGS.includes(m_diff[1]))
    return null

  return m_diff
}
*/

models = [
  ["55QNED80A6A", "43QNED80A6A"],
  ["55QNED82A6B", "50QNED82A6B"],
]

TV_CompareModels(models[0])


}

