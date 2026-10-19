<script setup>
/* ============================================================
 * Ladder  力量层级
 * 动爻 > 旺相静爻 > 休囚静爻，用条形长度表示作用力大小。
 * ============================================================ */
const TIERS = [
  { k: '一', t: '动爻 生克 静爻', d: '力量显而大：动爻是卦里的变量，能生能克。', w: 100, tone: 'acc' },
  { k: '二', t: '旺相静爻 生克 休囚静爻', d: '全静之卦并非没有生克，只是缓而小。', w: 68, tone: 'warn' },
  { k: '三', t: '休囚静爻 对 旺相之爻', d: '基本构不成威胁，方向相反时更要看旺衰。', w: 36, tone: 'ink4' }
]
</script>

<template>
  <div class="ld">
    <div v-for="t in TIERS" :key="t.k" class="ld-row">
      <span class="ld-k m">{{ t.k }}</span>
      <div class="ld-main">
        <div class="ld-bar" :class="'ld-' + t.tone" :style="{ width: t.w + '%' }">
          <span class="s">{{ t.t }}</span>
        </div>
        <span class="ld-d">{{ t.d }}</span>
      </div>
    </div>
    <div class="ld-note m">条形长度只表示相对强弱，不是可加的分值。</div>
  </div>
</template>

<style scoped>
.ld { display: flex; flex-direction: column; gap: 12px; }
.ld-row { display: grid; grid-template-columns: 22px 1fr; gap: 10px; align-items: start; }
.ld-k { font-size: 11px; color: var(--ink-4); padding-top: 8px; }
.ld-main { min-width: 0; }
.ld-bar {
  min-width: 240px; height: 34px; border-radius: 2px;
  display: flex; align-items: center; padding: 0 12px;
}
.ld-bar span { font-size: 14.5px; color: #fff; white-space: nowrap; }
.ld-acc { background: var(--accent); }
.ld-warn { background: var(--warn); }
.ld-ink4 { background: var(--ink-4); }
.ld-d { display: block; margin-top: 5px; font-size: 12px; line-height: 1.7; color: var(--ink-3); }
.ld-note { font-size: 10px; color: var(--ink-4); }
</style>
