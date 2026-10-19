<script setup>
/* ============================================================
 * SixShen  六神起法矩阵
 * 日干定初爻起哪一位神，再按固定次序向上轮转。
 * ============================================================ */
const ROWS = [
  { gz: '甲 乙', s: ['青龙', '朱雀', '勾陈', '螣蛇', '白虎', '玄武'] },
  { gz: '丙 丁', s: ['朱雀', '勾陈', '螣蛇', '白虎', '玄武', '青龙'] },
  { gz: '戊', s: ['勾陈', '螣蛇', '白虎', '玄武', '青龙', '朱雀'] },
  { gz: '己', s: ['螣蛇', '白虎', '玄武', '青龙', '朱雀', '勾陈'] },
  { gz: '庚 辛', s: ['白虎', '玄武', '青龙', '朱雀', '勾陈', '螣蛇'] },
  { gz: '壬 癸', s: ['玄武', '青龙', '朱雀', '勾陈', '螣蛇', '白虎'] }
]
const POS = ['初', '二', '三', '四', '五', '上']
defineProps({
  highlight: { type: Number, default: 4 }
})
</script>

<template>
  <div class="ss">
    <div class="ss-head">
      <span>日干</span>
      <span v-for="p in POS" :key="p" class="m">{{ p }}爻</span>
    </div>
    <div v-for="(r, i) in ROWS" :key="r.gz" class="ss-row" :class="{ on: i === highlight }">
      <span class="ss-gz m">{{ r.gz }}</span>
      <span v-for="(s, j) in r.s" :key="j" class="ss-cell s">{{ s }}</span>
    </div>
    <div class="ss-note m">
      先按日干定初爻起神，再按 青龙 → 朱雀 → 勾陈 → 螣蛇 → 白虎 → 玄武 向上排；
      高亮行为辛日起卦的例子。
    </div>
  </div>
</template>

<style scoped>
.ss { font-size: 13px; }
.ss-head, .ss-row {
  display: grid; grid-template-columns: 72px repeat(6, 1fr);
  align-items: center;
}
.ss-head {
  padding: 0 0 6px; border-bottom: 1px solid var(--rule-2);
  font-family: var(--mono); font-size: 9.5px; letter-spacing: .14em; color: var(--ink-3);
}
.ss-head span { text-align: center; }
.ss-head span:first-child { text-align: left; }

.ss-row { border-bottom: 1px solid #F1ECE1; border-left: 2px solid transparent; }
.ss-row:last-of-type { border-bottom: 0; }
.ss-row.on {
  background: var(--accent-wash); border-left-color: var(--accent);
  padding-left: 8px; margin-left: -10px;
}
.ss-gz { font-size: 11px; color: var(--ink-3); letter-spacing: .06em; }
.ss-row.on .ss-gz { color: var(--accent); }
.ss-cell { text-align: center; font-size: 14px; color: var(--ink-2); padding: 9px 0; }
.ss-row.on .ss-cell { color: var(--ink); }

.ss-note { margin-top: 10px; font-size: 10px; line-height: 1.7; color: var(--ink-4); }
</style>
