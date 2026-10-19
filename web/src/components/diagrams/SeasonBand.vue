<script setup>
/* ============================================================
 * SeasonBand  十二月建与旺相休囚死
 * 上排为十二月建（寅月起），下排按当月五行排出五档强弱。
 * ============================================================ */
const props = defineProps({
  month: { type: String, default: '寅' }
})

const MONTHS = [
  { b: '寅', w: '木' }, { b: '卯', w: '木' }, { b: '辰', w: '土' }, { b: '巳', w: '火' },
  { b: '午', w: '火' }, { b: '未', w: '土' }, { b: '申', w: '金' }, { b: '酉', w: '金' },
  { b: '戌', w: '土' }, { b: '亥', w: '水' }, { b: '子', w: '水' }, { b: '丑', w: '土' }
]
const LEVELS = {
  寅: [
    { k: '旺', wx: '木', rel: '同我 · 当令', w: 100, tone: 'acc' },
    { k: '相', wx: '火', rel: '我生', w: 78, tone: 'warn' },
    { k: '休', wx: '水', rel: '生我', w: 56, tone: 'ink3' },
    { k: '囚', wx: '金', rel: '克我', w: 38, tone: 'ink4' },
    { k: '死', wx: '土', rel: '我克', w: 22, tone: 'rule' }
  ]
}
const levels = LEVELS[props.month] || LEVELS['寅']
const WX = { 木: 'good', 火: 'acc', 土: 'warn', 金: 'ink3', 水: 'ink' }
</script>

<template>
  <div class="sb">
    <div class="sb-band">
      <div v-for="m in MONTHS" :key="m.b" class="sb-seg" :class="{ on: m.b === month }">
        <span class="sb-b s">{{ m.b }}</span>
        <span class="sb-w m" :class="'wx-' + WX[m.w]">{{ m.w }}</span>
      </div>
    </div>
    <div class="sb-axis m">
      <span>正月建寅</span>
      <span>按节气换月，不看农历初一</span>
    </div>

    <div class="sb-levels">
      <div v-for="l in levels" :key="l.k" class="sb-lv">
        <span class="sb-k s">{{ l.k }}</span>
        <span class="sb-bar">
          <span class="sb-fill" :class="'fill-' + l.tone" :style="{ width: l.w + '%' }">
            <b class="s">{{ l.wx }}</b>
          </span>
        </span>
        <span class="sb-rel m">{{ l.rel }}</span>
      </div>
    </div>
    <div class="sb-note m">以月建五行为基准；五档随月份重排，条形长度只示意强弱，不是分值。</div>
  </div>
</template>

<style scoped>
.sb { font-size: 13px; }
.sb-band { display: grid; grid-template-columns: repeat(12, 1fr); border: 1px solid var(--rule); border-radius: 2px; overflow: hidden; }
.sb-seg {
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  padding: 7px 0 6px; border-right: 1px solid var(--rule);
  background: #fff;
}
.sb-seg:last-child { border-right: 0; }
.sb-seg.on { background: var(--accent-wash); box-shadow: inset 0 -2px 0 var(--accent); }
.sb-b { font-size: 16px; color: var(--ink); line-height: 1.2; }
.sb-seg.on .sb-b { color: var(--accent); }
.sb-w { font-size: 9.5px; color: var(--ink-4); }
.wx-good { color: var(--good); }
.wx-acc { color: var(--accent); }
.wx-warn { color: var(--warn); }
.wx-ink3 { color: var(--ink-3); }
.wx-ink { color: var(--ink-2); }

.sb-axis {
  display: flex; justify-content: space-between;
  padding: 6px 2px 0; font-size: 9.5px; color: var(--ink-4);
}

.sb-levels { margin-top: 14px; display: flex; flex-direction: column; gap: 6px; }
.sb-lv { display: grid; grid-template-columns: 26px 1fr 92px; align-items: center; gap: 10px; }
.sb-k { font-size: 15px; color: var(--ink); text-align: center; }
.sb-bar { height: 24px; background: var(--paper-2); border-radius: 2px; overflow: hidden; }
.sb-fill { display: flex; align-items: center; padding-left: 9px; height: 100%; border-radius: 2px; }
.sb-fill b { font-weight: 600; font-size: 14px; color: #fff; }
.fill-acc { background: var(--accent); }
.fill-warn { background: var(--warn); }
.fill-ink3 { background: var(--ink-3); }
.fill-ink4 { background: var(--ink-4); }
.fill-rule { background: var(--rule-2); }
.fill-rule b { color: var(--ink-2); }
.sb-rel { font-size: 10px; color: var(--ink-3); }
.sb-note { margin-top: 10px; font-size: 10px; color: var(--ink-4); }
</style>
