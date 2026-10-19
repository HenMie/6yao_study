<script setup>
import { ref, useId } from 'vue'

defineProps({ exercise: { type: Object, required: true } })
const selected = ref(null)
const checked = ref(false)
const groupName = useId()
function choose(index) { selected.value = index; checked.value = false }
</script>

<template>
  <section class="lesson-exercise" aria-label="单元自测">
    <div class="kicker">学后自测 · 本站编题</div>
    <h3>{{ exercise.prompt }}</h3>
    <fieldset>
      <legend class="tiny muted">选择一项，再核对解析</legend>
      <label v-for="(option, index) in exercise.options" :key="index" :class="{ chosen: selected === index }">
        <input type="radio" :name="groupName" :value="index" :checked="selected === index" @change="choose(index)">
        <span>{{ option }}</span>
      </label>
    </fieldset>
    <button class="check-answer" :disabled="selected === null" @click="checked = true">核对答案与解析</button>
    <div v-if="checked" class="lesson-feedback" :class="{ correct: selected === exercise.answer }" role="status" aria-live="polite">
      <strong>{{ selected === exercise.answer ? '✓ 判断一致' : '× 应为：' + exercise.options[exercise.answer] }}</strong>
      <p>{{ exercise.explanation }}</p>
    </div>
  </section>
</template>

<style scoped>
.lesson-exercise { margin-top: 32px; padding: 22px 24px; background: var(--paper-2); border: 1px solid var(--rule); }
h3 { font-size: 17px; margin: 8px 0 14px; }
fieldset { border: 0; padding: 0; margin: 0 0 16px; min-width: 0; }
legend { margin-bottom: 8px; }
label { display: flex; align-items: baseline; gap: 10px; border-left: 2px solid transparent; padding: 8px 10px; cursor: pointer; font-size: 14px; }
label.chosen { border-left-color: var(--ink); }
input { accent-color: var(--ink); }
.check-answer { background: var(--paper); border: 1px solid var(--rule-2); padding: 7px 14px; font: inherit; font-size: 13px; color: var(--ink); cursor: pointer; }
.check-answer:disabled { color: var(--ink-3); cursor: default; }
.check-answer:focus-visible, input:focus-visible { outline: 2px solid var(--ink); outline-offset: 3px; }
.lesson-feedback { margin-top: 18px; padding-left: 14px; border-left: 3px solid var(--bad); font-size: 14px; line-height: 1.85; }
.lesson-feedback strong { color: var(--bad); font-weight: 500; }
.lesson-feedback.correct { border-color: var(--good); }
.lesson-feedback.correct strong { color: var(--good); }
.lesson-feedback p { margin: 8px 0 0; }
</style>
