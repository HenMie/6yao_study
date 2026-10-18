import { makeQuiz, grade } from '../src/core/quiz.js'

for (const [kind, lv] of [['single',1],['single',2],['single',3],['full',1],['full',2],['full',3]]) {
  const q = makeQuiz({ lv, kind, date: new Date(2026, 9, 18, 12, 0) })
  const total = q.slots.length
  const g = grade(q, {})
  console.log(`${kind} L${lv}: ${total} 格 | 未作答 ${g.rows.filter(r=>r.state==='unanswered').length} | 预填[${q.prefilled}] | 隐藏列[${Object.entries(q.hiddenCols).filter(([,v])=>v).map(([k])=>k)}]`)
  if (kind === 'single') console.log('   目标爻:', ['初','二','三','四','五','上'][q.target])
}

// 错因文案样例与 24 字口径抽测
const q = makeQuiz({ lv: 3, kind: 'full', date: new Date(2026, 9, 18, 12, 0) })
const ans = {}
q.slots.forEach(s => { ans[s.id] = s.answer === '静' ? '动' : '错' })  // 全填错
const g = grade(q, ans)
console.log('\n=== 错因文案样例（全错）===')
g.rows.filter(r => r.state === 'wrong').slice(0, 14).forEach(r => {
  const n = [...r.text].length
  console.log(`${String(n).padStart(3)}字 ${r.text}`)
})
// 全对
const ans2 = {}
q.slots.forEach(s => { ans2[s.id] = s.answer })
const g2 = grade(q, ans2)
console.log(`\n全对: ${g2.right}/${g2.total} | 分母与格子数一致: ${g2.total === q.slots.length}`)
