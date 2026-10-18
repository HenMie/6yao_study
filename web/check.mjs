import { paipan, GONG_TABLE, NAME } from './src/core/paipan.js'
// 火风鼎 = 上离下巽 -> bits [0,1,1,1,0,1] (初..上)
const ding = [2,1,1,1,2,1]
const p = paipan(ding, new Date(2026,9,18,3,13))
console.log('卦名:', p.ben.name, '| 宫:', p.ben.gong, '| 类型:', p.ben.type, '| 世:', p.shi, '| 应:', p.ying)
p.yao.forEach((y,i)=>console.log(` ${['初','二','三','四','五','上'][i]}爻 ${y.qin}${y.zhi} ${y.shi?'世':y.ying?'应':''}`))

// 全量校验：世位必须等于该卦型的固定世位
const SHI_OF_TYPE = [6,1,2,3,4,5,4,3]
let bad = 0
for (let n = 0; n < 64; n++) {
  const bits = [0,1,2,3,4,5].map(i => (n >> i) & 1)
  const info = GONG_TABLE[bits.join('')]
  const yao = bits.map(b => b ? 1 : 2)
  const q = paipan(yao, new Date(2026,9,18,3,13))
  const expect = SHI_OF_TYPE[['本宫卦','一世卦','二世卦','三世卦','四世卦','五世卦','游魂卦','归魂卦'].indexOf(info.type)]
  if (q.shi !== expect) { bad++; console.log('✗', q.ben.name, info.type, '世应为', expect, '实得', q.shi) }
}
console.log(bad ? `❌ ${bad} 卦世位错` : '✅ 64 卦世位全对')
