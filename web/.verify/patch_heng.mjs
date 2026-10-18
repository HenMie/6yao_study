import fs from 'node:fs'
const UA = 'liuyao-study/0.2 (educational research)'
const url = 'https://zh.wikisource.org/w/api.php?action=query&prop=revisions&rvprop=content&rvslots=main&format=json&formatversion=2&titles=' + encodeURIComponent('周易/恒')
const r = await fetch(url, { headers: { 'User-Agent': UA } })
const j = await r.json()
const p = j.query.pages[0]
const out = JSON.parse(fs.readFileSync('wiki_raw.json', 'utf8'))
out['32'] = { number: 32, name: '恆', wikitext: p.revisions[0].slots.main.content }
fs.writeFileSync('wiki_raw.json', JSON.stringify(out, null, 1))
console.log('补齐:', Object.keys(out).length, '/ 64')
console.log('字数:', out['32'].wikitext.length)
