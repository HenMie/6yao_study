import assert from 'node:assert/strict'
import { VOLS, MANUAL_CHAPTERS, STAMPS, CASES } from './src/content/data.js'
import { LESSONS, WORKED_EXAMPLES } from './src/content/lessons.js'
import { paipan, GONG_TABLE, NAJIA, xunKong, GAN, ZHI } from './src/core/paipan.js'

const units = VOLS.flatMap(v => v.chapters.map(c => ({ ...c, vol: v.id })))
assert.equal(units.length, 34)
assert.equal(new Set(units.map(u => u.id)).size, units.length)
assert.deepEqual(Object.keys(LESSONS).sort(), units.map(u => u.id).sort())
const durations = { p01:1148, p02:2361, p03:2168, p04:1862, p05:3536, p06:3232, p07:2578, p08:1586 }
for (const u of [...units, ...MANUAL_CHAPTERS]) {
  assert.ok(Number.isInteger(STAMPS[u.id]) && STAMPS[u.id] < durations[u.vol], u.id + ' video anchor')
  assert.ok(u.d.length >= 3 && u.keys.length >= 2, u.id + ' detail')
  for (const block of u.d) if (block.tbl) {
    for (const row of block.tbl.rows) assert.equal(row.length, block.tbl.head.length, u.id + ' table')
  }
  if (u.exercise) {
    const e = u.exercise
    assert.ok(e.prompt && e.explanation && e.options.length >= 2, u.id + ' exercise')
    assert.ok(Number.isInteger(e.answer) && e.answer >= 0 && e.answer < e.options.length)
    assert.equal(new Set(e.options).size, e.options.length)
  }
}
assert.equal(MANUAL_CHAPTERS.length, 23)
assert.equal(MANUAL_CHAPTERS.filter(c => c.label.startsWith('章')).length, 18)
assert.equal(MANUAL_CHAPTERS.filter(c => c.label === '附').length, 3)
assert.equal(MANUAL_CHAPTERS.findIndex(c => c.id === 'm01') + 1, MANUAL_CHAPTERS.findIndex(c => c.id === 'c21'))
for (const c of MANUAL_CHAPTERS.filter(c => c.id !== 'm01')) assert.equal(c.d, units.find(u => u.id === c.id).d)

// 寻世比较表对64卦逐一验证，避免只验证单个示例。
const comparison = WORKED_EXAMPLES.c09[0].tbl.rows
for (const [bits, info] of Object.entries(GONG_TABLE)) {
  const same = [0,1,2].map(i => bits[i] === bits[i+3] ? '同' : '异')
  const row = comparison.find(r => r.slice(0,3).every((s,i) => s === same[i]))
  const pos = ['初','二','三','四','五','上']
  assert.ok(row[3].endsWith(`${pos[info.shi-1]}／${pos[info.ying-1]}`), bits)
}
for (const row of WORKED_EXAMPLES.c10[0].tbl.rows) {
  assert.equal(row[1], NAJIA[row[0]].slice(0,3).join('、'))
  assert.equal(row[2], NAJIA[row[0]].slice(3).join('、'))
}
const expected = { v1:['泽风大过','火风鼎',4,[5,6]], v2:['水火既济','泽火革',3,[4]], v3:['风水涣','坎为水',5,[6]] }
for (const c of CASES) {
  const day = c.gz.match(/([甲乙丙丁戊己庚辛壬癸])([子丑寅卯辰巳午未申酉戌亥])日/)
  const gan = GAN.indexOf(day[1]), zhi = ZHI.indexOf(day[2])
  assert.ok(c.gz.includes(xunKong(gan,zhi).text), c.id + ' xunkong')
  const p = paipan(c.yao, new Date(2026,0,1), { day: { gan, zhi } })
  if (c.origin === 'course') {
    assert.deepEqual([p.ben.name,p.bian.name,p.shi,p.yao.filter(y=>y.dong).map(y=>y.pos)], expected[c.id])
    assert.ok(c.t < durations[c.src] && units.some(u=>u.id===c.unit))
  }
}
const v1 = paipan(CASES.find(c=>c.id==='v1').yao,new Date(2026,0,1))
assert.equal(v1.yao[3].qin+v1.yao[3].zhi, '父母亥')
assert.equal(v1.yao[4].qin+v1.yao[4].zhi, '官鬼酉')
const v2 = paipan(CASES.find(c=>c.id==='v2').yao,new Date(2026,0,1))
assert.equal(v2.yao[2].qin+v2.yao[2].zhi,'兄弟亥')
assert.equal(v2.yao[3].qin+v2.yao[3].zhi,'父母申')
console.log('PASS: 34单元/34自测/35画面定位/23手册条目/64卦寻世/8卦纳甲/8案例与旬空')
