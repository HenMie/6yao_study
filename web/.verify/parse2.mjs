import fs from 'node:fs'

const raw = JSON.parse(fs.readFileSync('wiki_raw.json', 'utf8'))

function clean(s) {
  return s
    .replace(/-{([^}]*)}-/g, '$1')                             // 繁简转换标记
    .replace(/\{\{\*\|([^}]*)\}\}/g, '（一作$1）')               // 异文
    .replace(/\{\{另\|([^|}]*)\|([^|}]*)\}\}/g, '$1（一作$2）')
    .replace(/\{\{[^{}]*\}\}/g, '')                            // 其余模板
    .replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, '$1')          // wiki 链接
    .replace(/<span[^>]*>/g, '').replace(/<\/span>/g, '').replace(/<[^>]+>/g, '')
    .replace(/'''/g, '')
    .replace(/\s+/g, ' ').trim()
}

const YAO = /^(初九|九二|九三|九四|九五|上九|初六|六二|六三|六四|六五|上六|用九|用六)[：,，]\s*(.*)$/
const SEC = /^\*+(彖曰|象曰|文言曰|文言|繫辭上|繫辭下|說卦傳|序卦傳|雜卦傳)/

const out = {}
for (const [num, g] of Object.entries(raw)) {
  const h = { number: +num, name: g.name, title: '', guaCi: '', yaoCi: [], tuan: [], xiang: [], wenYan: [], yong: '' }
  let mode = null

  for (const line of g.wikitext.split('\n')) {
    if (!line.trim()) continue
    const t = line.trim()

    if (t.startsWith(';')) {                       // 卦名行
      const v = clean(t.slice(1))
      if (v && v.length <= 4 && !h.title) h.title = v
      continue
    }

    const c = clean(t)

    const mSec = c.match(SEC)
    if (mSec && /^\*/.test(t)) {
      mode = mSec[1] === '彖曰' ? 'tuan' : mSec[1] === '象曰' ? 'xiang' : 'wenYan'
      continue
    }
    if (c.includes('易經')) { mode = 'jing'; continue }   // 经文区开始

    if (!/^\*/.test(t)) continue

    const body = c.replace(/^\*+/, '').replace(/^#+/, '').trim()
    if (!body || body === ':' || /^[:：]+$/.test(body)) continue

    if (/^\*#/.test(t)) {
      if (mode === 'jing') {
        const m = body.match(YAO)
        if (m) {
          if (m[1] === '用九' || m[1] === '用六') h.yong = m[2]
          else h.yaoCi.push({ pos: m[1], text: m[2] })
          continue
        }
      }
      if (mode && h[mode]) h[mode].push(body)
      continue
    }
    if (/^\*\*/.test(t) && mode === 'jing') { h.guaCi = h.guaCi ? h.guaCi + body : body; continue }
    if (mode && h[mode] !== undefined) h[mode].push(body)
  }
  out[num] = h
}

fs.writeFileSync('parsed.json', JSON.stringify(out, null, 1))

const rep = []
for (const [n, h] of Object.entries(out)) {
  const is = []
  if (!h.title) is.push('无卦名')
  if (!h.guaCi) is.push('无卦辞')
  if (h.yaoCi.length !== 6) is.push('爻数' + h.yaoCi.length)
  if (is.length) rep.push(`#${h.number} ${h.name}: ${is.join(',')}`)
}
console.log('解析', Object.keys(out).length, '卦')
console.log(rep.length ? '⚠️\n' + rep.join('\n') : '✅ 64 卦卦名/卦辞/六爻全部完整')

const q = out['6']
console.log('\n--- 坤卦 ---'); console.log('卦名', q.title, '| 卦辞', q.guaCi, '| 用六', q.yong)
console.log('彖', q.tuan.length, '段 | 象', q.xiang.length, '段 | 文言', q.wenYan.length, '段')
console.log('\n--- 否卦卦辞 ---', out['12'].guaCi)
console.log('--- 履卦卦辞 ---', out['10'].guaCi)
console.log('--- 同人卦辞 ---', out['13'].guaCi)
console.log('--- 同人九四(异文) ---', out['13'].yaoCi.find(y=>y.pos==='九四').text)
