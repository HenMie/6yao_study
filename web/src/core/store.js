import { ref, watch } from 'vue'

const KEY = 'ly6.progress.v2'
const blank = { done: {}, last: null, quiz: [], single: [] }

function load() {
  try { return { ...blank, ...JSON.parse(localStorage.getItem(KEY) || '{}') } }
  catch (e) { return { ...blank } }
}

export const state = ref(load())
watch(state, (v) => { try { localStorage.setItem(KEY, JSON.stringify(v)) } catch (e) {} }, { deep: true })

export function toggleDone(id, title) {
  const d = state.value.done
  if (d[id]) delete d[id]; else d[id] = true
  state.value.last = title
}
export function isDone(id) { return !!state.value.done[id] }

export function addQuiz(rec) {
  state.value.quiz.push(rec)
  state.value.quiz = state.value.quiz.slice(-60)
}
export function addSingle(rec) {
  state.value.single.push(rec)
  state.value.single = state.value.single.slice(-60)
}
export function quizStats() {
  const q = state.value.quiz
  return { times: q.length, correct: q.reduce((a, b) => a + (b.right || 0), 0) }
}
// 完整装卦全对数（DESIGN：完整档升档条件「装卦正确 ≥10 卦」）
export function fullCorrectCount() {
  return state.value.quiz.filter(r => r.kind === 'full' && r.right === r.total).length
}
export function resetAll() { state.value = { ...blank } }
