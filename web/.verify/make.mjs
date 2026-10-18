/* ============================================================
 * 生成 64 卦经文数据  ->  src/data/guaWen.json
 *
 * 底本一：维基文库《周易》          卦辞、爻辞、彖传、大象、小象、文言
 * 底本二：武英殿本《御纂周易折中》  384 条爻辞（带逐爻影像出处）
 *
 * 方针：
 *   - 两源逐爻比对，异体/版本用字按等价类归一键比对
 *   - 某备选用字与殿本字面相同者，优先采用殿本用字（更贴合《折中》）
 *   - 真分歧从殿本（殿本与王弼注疏主流文本一致），并单独记录
 * ============================================================ */
import fs from 'node:fs'
import { NAME, GUA, GUA_ORDER } from '../src/core/paipan.js'
import OpenCC from 'opencc-js'

const wiki = JSON.parse(fs.readFileSync('parsed.json', 'utf8'))
const wuying = JSON.parse(fs.readFileSync('wuying.json', 'utf8'))
const t2s = OpenCC.Converter({ from: 'tw', to: 'cn' })

const SEQ = ['乾为天','坤为地','水雷屯','山水蒙','水天需','天水讼','地水师','水地比','风天小畜','天泽履','地天泰','天地否','天火同人','火天大有','地山谦','雷地豫','泽雷随','山风蛊','地泽临','风地观','火雷噬嗑','山火贲','山地剥','地雷复','天雷无妄','山天大畜','山雷颐','泽风大过','坎为水','离为火','泽山咸','雷风恒','天山遁','雷天大壮','火地晋','地火明夷','风火家人','火泽睽','水山蹇','雷水解','山泽损','风雷益','泽天夬','天风姤','泽地萃','地风升','泽水困','水风井','泽火革','火风鼎','震为雷','艮为山','风山渐','雷泽归妹','雷火丰','火山旅','巽为风','兑为泽','风水涣','水泽节','风泽中孚','雷山小过','水火既济','火水未济']

/* 异体 / 版本用字等价类（仅用于两源比对，不改写正文） */
const EQUIV_GROUPS = [
  ['无','無'],['爲','為'],['衆','眾'],['彚','彙'],['羣','群'],['于','於'],
  ['車','轝','輿'],['輹','輻','腹'],['窺','闚'],['荼','徐'],['僮','童'],['敺','驅'],
  ['得','德'],['詳','祥'],['包','苞'],['庸','墉'],['啕','咷'],['尫','彭'],['佑','祐'],
  ['戠','簪'],['昔','腊'],['祇','祗','禔'],['告','牿'],['朵','朶'],['尊','樽'],['内','納'],
  ['差','嗟'],['震','振'],['矢','失'],['涂','塗'],['惟','維'],['祀','已'],['系','繫'],
  ['資','咨'],['享','亨'],['蔾','藜'],['瓮','甕'],['冽','洌'],['刑','形'],['裂','列'],
  ['閽','薰'],['孚','序'],['觌','覿'],['它','他'],['既','幾'],['𧤊','掣']
]
const EQUIV = {}
for (const g of EQUIV_GROUPS) for (const c of g) EQUIV[c] = g[0]

const YAO_T = /^(?:初九|九二|九三|九四|九五|上九|初六|六二|六三|六四|六五|上六|用九|用六)[：,，]?/
const stripPunc = s => String(s).replace(/（[^）]*）/g, '').replace(/[，。、；：,.;:！？\s]/g, '')
const canon = s => [...stripPunc(s)].map(c => EQUIV[c] || c).join('')
const lit = s => stripPunc(s)
const T0 = s => unifyTrad(tidy(s))
const unifyTrad = s => String(s).replace(/无/g, "無")
const tidy = s => String(s).replace(/\s+/g, ' ').replace(/\s+([，。、；：！」』）])/g, '$1').replace(/([（『「])\s+/g, '$1').trim()
const toSC = s => { try { return t2s(s) } catch (e) { return s } }

/* 拆解正文里的「X（一作Y）」：全部按码位扫描，兼容非 BMP 字 */
function parseVariants(text) {
  const PUNCT = /[\s，。、；：！」『（）』]/
  const cps = [...text]
  const items = []
  for (let i = 0; i < cps.length; i++) {
    if (cps[i] !== "（") continue
    if (cps[i + 1] !== "一" || cps[i + 2] !== "作") continue
    let j = i + 3
    while (j < cps.length && cps[j] !== "）") j++
    if (j >= cps.length) continue
    const alt = cps.slice(i + 3, j).join("")
    const need = Math.max(1, [...alt].length)
    const tail = []
    for (let k = i - 1; k >= 0 && tail.length < need; k--) {
      if (PUNCT.test(cps[k])) break
      tail.unshift(cps[k])
    }
    items.push({ origStart: i - tail.length, orig: tail.join(""), alt, endCp: j + 1 })
  }
  const pairs = []
  let body = "", cursor = 0
  for (const it of items) {
    if (it.origStart < cursor) continue
    body += cps.slice(cursor, it.origStart).join("") + it.orig
    pairs.push([it.orig, it.alt])
    cursor = it.endCp
  }
  body += cps.slice(cursor).join("")
  return { body, pairs }
}

/* 枚举「一作」备选替换的全部组合，并记录实际替换了哪些 */
function candsOf(body, pairs) {
  let out = [{ text: body, used: [] }]
  for (const [orig, alt] of pairs) {
    const next = []
    for (const c of out) {
      next.push(c)
      const p = c.text.indexOf(orig)
      if (p >= 0) next.push({ text: c.text.slice(0, p) + alt + c.text.slice(p + orig.length), used: c.used.concat([[orig, alt]]) })
    }
    out = next
  }
  return out
}

const fmt = (a, b) => (a.length > 1 || b.length > 1) ? `「${a}」，一作「${b}」` : `${a}，一作${b}`
const noteOfPairs = pairs => pairs.map(([o, a]) => fmt(o, a)).join('；')
const noteOfUsed = used => used.map(([o, a]) => fmt(a, o)).join('；')

/* 人工裁定的两处真分歧（殿本与王弼注疏主流文本一致，文库正文多出字） */
const ADJUDICATED = {
  '大畜|九三': { text: '良馬逐，利艱貞，曰閑輿衛，利有攸往。', why: '殿本无「吉」，「日」作「曰」' },
  '渙|初六': { text: '用拯馬壯，吉。', why: '殿本无「悔亡」' }
}

/* 个别注解的回退锚点校对（回退取字取错时手工指定） */
const ANCHOR_FIX = { '屯|初九': '磐', '中孚|六四': '既' }

const FIX_NAME = { '无妄': '無妄' }
const wMap = Object.fromEntries(wuying.hexagrams.map(h => [h.name, h]))
const wOf = nm => wMap[nm] || wMap[FIX_NAME[nm]] || null

const log = { ok: 0, fromWuying: 0, diverged: [], adopted: [] }
const hexagrams = {}

for (let i = 0; i < 64; i++) {
  const num = i + 1, nm = SEQ[i]
  let up = null, lo = null
  for (const u of GUA_ORDER) for (const l of GUA_ORDER) if (NAME[u][l] === nm) { up = u; lo = l }
  const w = wiki[String(num)], d = wOf(w.name)

  const rows = w.yaoCi.map((y, k) => {
    const raw = tidy(y.text)
    const { body, pairs: pairs0 } = parseVariants(raw)
    const af = ANCHOR_FIX[`${w.name}|${y.pos}`]
    const pairs = af ? pairs0.map(p => [af, p[1]]) : pairs0
    const dCanon = d ? canon(d.lines[k].replace(YAO_T, '')) : ''
    const dLit = d ? lit(d.lines[k].replace(YAO_T, '')) : ''

    /* 1) 两源归一后一致 */
    if (dCanon && canon(body) === dCanon) {
      log.ok++
      // 有「一作」且某备选与殿本字面相同 -> 采用殿本用字
      let pick = body, note = pairs.length ? noteOfPairs(pairs) : ''
      if (pairs.length) {
        for (const c of candsOf(body, pairs)) {
          if (c.used.length && lit(c.text) === dLit) {
            pick = c.text; note = noteOfUsed(c.used); log.fromWuying++
            log.adopted.push(`#${num} ${w.name} ${y.pos}：${body} → ${c.text}`)
            break
          }
        }
      }
      return { pos: y.pos, text: unifyTrad(pick), note }
    }

    /* 2) 归一后仍不等：试以「一作」备选凑殿本 */
    let chosen = null, used = []
    for (const c of candsOf(body, pairs)) if (canon(c.text) === dCanon) { chosen = c.text; used = c.used; break }
    if (chosen !== null) {
      log.fromWuying++
      log.adopted.push(`#${num} ${w.name} ${y.pos}：${body} → ${chosen}`)
      return { pos: y.pos, text: unifyTrad(chosen), note: noteOfUsed(used) }
    }

    /* 3) 真分歧：优先取人工裁定文本，否则从殿本 */
    log.diverged.push(`#${num} ${w.name} ${y.pos}｜文库：${raw}｜殿本：${d ? d.lines[k] : '（缺）'}`)
    const adj = ADJUDICATED[`${w.name}|${y.pos}`]
    if (adj) return { pos: y.pos, text: adj.text, note: '两本异文：' + adj.why }
    const t = d ? tidy(d.lines[k].replace(YAO_T, '')) : body
    return { pos: y.pos, text: t, note: '此从武英殿本，文库正文有出入' }
  })

  const T = s => unifyTrad(tidy(s))
  const rec = {
    name: nm, number: num, guaName: w.name,
    upper: up, lower: lo, upperSym: GUA[up].sym, lowerSym: GUA[lo].sym,
    guaCi: T(w.guaCi), yaoCi: rows,
    tuan: w.tuan.map(T), xiang: w.xiang.map(T), wenYan: w.wenYan.map(T), yong: w.yong ? T(w.yong) : ''
  }
  rec.sc = {
    guaCi: toSC(rec.guaCi),
    yaoCi: rec.yaoCi.map(y => ({ pos: y.pos, text: toSC(y.text), note: toSC(y.note) })),
    yong: toSC(rec.yong), tuan: rec.tuan.map(toSC), xiang: rec.xiang.map(toSC), wenYan: rec.wenYan.map(toSC)
  }
  hexagrams[nm] = rec
}

fs.mkdirSync('../src/data', { recursive: true })
fs.writeFileSync('../src/data/guaWen.json', JSON.stringify(hexagrams, null, 1))
console.log(`逐爻核对 384：一致 ${log.ok}｜采用殿本用字 ${log.fromWuying}｜真分歧 ${log.diverged.length}`)
if (log.adopted.length) console.log('\n采用殿本读法：\n  ' + log.adopted.join('\n  '))
if (log.diverged.length) console.log('\n真分歧：\n  ' + log.diverged.join('\n  '))
console.log(`\n已写出 src/data/guaWen.json（${(fs.statSync('../src/data/guaWen.json').size / 1024).toFixed(1)} KB）`)
