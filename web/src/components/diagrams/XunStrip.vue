<script setup>
/* ============================================================
 * XunStrip  六十甲子按旬排开
 * 每旬十日，另有两支排不进本旬，即旬空。
 * ============================================================ */
defineProps({
  highlight: { type: String, default: '' }
})

const XUN = [
  { xun: '甲子旬', gz: ['甲子', '乙丑', '丙寅', '丁卯', '戊辰', '己巳', '庚午', '辛未', '壬申', '癸酉'], kong: ['戌', '亥'] },
  { xun: '甲戌旬', gz: ['甲戌', '乙亥', '丙子', '丁丑', '戊寅', '己卯', '庚辰', '辛巳', '壬午', '癸未'], kong: ['申', '酉'] },
  { xun: '甲申旬', gz: ['甲申', '乙酉', '丙戌', '丁亥', '戊子', '己丑', '庚寅', '辛卯', '壬辰', '癸巳'], kong: ['午', '未'] },
  { xun: '甲午旬', gz: ['甲午', '乙未', '丙申', '丁酉', '戊戌', '己亥', '庚子', '辛丑', '壬寅', '癸卯'], kong: ['辰', '巳'] },
  { xun: '甲辰旬', gz: ['甲辰', '乙巳', '丙午', '丁未', '戊申', '己酉', '庚戌', '辛亥', '壬子', '癸丑'], kong: ['寅', '卯'] },
  { xun: '甲寅旬', gz: ['甲寅', '乙卯', '丙辰', '丁巳', '戊午', '己未', '庚申', '辛酉', '壬戌', '癸亥'], kong: ['子', '丑'] }
]
</script>

<template>
  <div class="xs">
    <div class="xs-head">
      <span>旬</span>
      <span class="xs-h-gz">十日干支</span>
      <span class="xs-h-k">空</span>
    </div>
    <div v-for="r in XUN" :key="r.xun" class="xs-row" :class="{ on: r.xun === highlight }">
      <span class="xs-xun m">{{ r.xun }}</span>
      <span v-for="g in r.gz" :key="g" class="xs-gz m">{{ g }}</span>
      <span class="xs-arrow m">空</span>
      <span class="xs-kong">
        <b v-for="k in r.kong" :key="k" class="m">{{ k }}</b>
      </span>
    </div>
  </div>
</template>

<style scoped>
.xs { font-size: 12px; }
.xs-head, .xs-row {
  display: grid;
  grid-template-columns: 56px repeat(10, minmax(0, 1fr)) 24px 46px;
  gap: 4px; align-items: center;
}
.xs-head {
  padding: 0 0 6px; border-bottom: 1px solid var(--rule-2);
  font-family: var(--mono); font-size: 9.5px; letter-spacing: .14em; color: var(--ink-3);
}
.xs-h-gz { grid-column: 2 / 12; }
.xs-h-k { grid-column: 13 / 15; text-align: center; }

.xs-row {
  padding: 4px 0; border-bottom: 1px solid #F1ECE1;
  border-left: 2px solid transparent;
}
.xs-row:last-child { border-bottom: 0; }
.xs-row.on {
  background: var(--accent-wash);
  border-left-color: var(--accent);
  padding-left: 6px; margin-left: -8px;
}

.xs-xun { font-size: 11px; color: var(--ink-3); }
.xs-row.on .xs-xun { color: var(--accent); }
.xs-gz {
  font-size: 11px; color: var(--ink-2); text-align: center;
  background: var(--paper-2); border-radius: 2px; padding: 3px 0;
}
.xs-row.on .xs-gz { background: #fff; color: var(--ink); }
.xs-arrow { font-size: 9.5px; color: var(--ink-4); text-align: center; }
.xs-kong { display: flex; gap: 3px; justify-content: center; }
.xs-kong b {
  font-weight: 400; font-size: 11.5px; color: var(--accent);
  background: var(--accent-wash); border: 1px solid rgba(166, 51, 31, .3);
  border-radius: 2px; padding: 1px 5px;
}
</style>
