import fs from 'node:fs'

const NAMES = ['乾','坤','屯','蒙','需','訟','師','比','小畜','履','泰','否','同人','大有','謙','豫','隨','蠱','臨','觀','噬嗑','賁','剝','復','无妄','大畜','頤','大過','坎','離','咸','恆','遯','大壯','晉','明夷','家人','睽','蹇','解','損','益','夬','姤','萃','升','困','井','革','鼎','震','艮','漸','歸妹','豐','旅','巽','兌','渙','節','中孚','小過','既濟','未濟']
const UA = 'liuyao-study/0.2 (educational research)'

const pages = {}
for (let b = 0; b < 2; b++) {
  const grp = NAMES.slice(b * 32, b * 32 + 32).map(n => '周易/' + n)
  const url = 'https://zh.wikisource.org/w/api.php?action=query&prop=revisions&rvprop=content&rvslots=main&format=json&formatversion=2&titles=' + encodeURIComponent(grp.join('|'))
  const r = await fetch(url, { headers: { 'User-Agent': UA } })
  const txt = await r.text()
  if (!txt.trim().startsWith('{')) { console.error('非 JSON 响应:', txt.slice(0, 200)); process.exit(1) }
  const j = JSON.parse(txt)
  ;(j.query?.pages || []).forEach(p => { pages[p.title] = p.revisions?.[0]?.slots?.main?.content || '' })
  console.log(`批次 ${b + 1}: 累计 ${Object.keys(pages).length} 页`)
  if (b === 0) await new Promise(r => setTimeout(r, 3000))
}

const out = {}
NAMES.forEach((n, i) => {
  const wt = pages['周易/' + n]
  if (wt) out[i + 1] = { number: i + 1, name: n, wikitext: wt }
})
fs.writeFileSync('wiki_raw.json', JSON.stringify(out, null, 1))
console.log('匹配到卦数:', Object.keys(out).length, '/ 64')
console.log('缺失:', NAMES.filter((n, i) => !out[i + 1]).join(' ') || '无')
