<script setup>
import { ref, computed } from 'vue'
import { NCard, NInput, NTag } from 'naive-ui'
import { CARDS, TABLES } from '../content/data'

const q = ref('')
const groups = computed(() => [...new Set(CARDS.map(c => c.g))])
const filtered = computed(() => (g) => CARDS.filter(c => c.g === g && (!q.value || (c.q + c.a).includes(q.value))))
const hasAny = computed(() => CARDS.some(c => !q.value || (c.q + c.a).includes(q.value)))
</script>

<template>
  <div class="wrap ref-wrap">
    <div class="page-head">
      <h1>速查</h1>
      <span class="page-side" aria-hidden="true"><i>按图</i><i>索骥</i></span>
      <p class="lede">{{ CARDS.length }} 张知识卡 + 对照表。断卦卡住的时候，先来这里查，不要回去翻课程。</p>
    </div>

    <n-input v-model:value="q" placeholder="搜：旬空 / 三合 / 世应 / 六神…" style="margin-bottom:20px" clearable />

    <template v-for="g in groups" :key="g">
      <template v-if="filtered(g).length">
        <div class="tiny muted" style="letter-spacing:.14em;margin:22px 0 10px">{{ g }}</div>
        <div class="card-grid">
          <n-card v-for="c in filtered(g)" :key="c.q" size="small">
            <div class="tiny" style="color:var(--accent);letter-spacing:.12em">{{ c.g }}</div>
            <div class="serif" style="font-size:16px;font-weight:600;margin:2px 0 6px">{{ c.q }}</div>
            <div class="tiny" style="color:var(--ink-2);line-height:1.75">{{ c.a }}</div>
          </n-card>
        </div>
      </template>
    </template>
    <div v-if="!hasAny" class="muted tiny" style="padding:40px;text-align:center">没有匹配的卡片。</div>

    <div class="tiny muted" style="letter-spacing:.14em;margin:36px 0 10px">对照表</div>
    <div class="tbl-grid">
      <n-card size="small" title="六合 / 六冲">
        <div style="display:flex;gap:16px">
          <div style="flex:1">
            <div class="tiny muted">六合</div>
            <div v-for="x in TABLES.liuhe" :key="x" class="mono tiny">{{ x }}</div>
          </div>
          <div style="flex:1">
            <div class="tiny muted">六冲</div>
            <div v-for="x in TABLES.liuchong" :key="x" class="mono tiny">{{ x }}</div>
          </div>
        </div>
      </n-card>

      <n-card size="small" title="三合局 / 三刑">
        <div v-for="x in TABLES.sanhe" :key="x" class="mono tiny">{{ x }}</div>
        <div style="height:1px;background:var(--rule);margin:10px 0" />
        <div v-for="x in TABLES.sanxing" :key="x" class="mono tiny">{{ x }}</div>
      </n-card>

      <n-card size="small" title="生旺墓绝">
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <thead><tr><th align="left">五行</th><th align="left">长生</th><th align="left">帝旺</th><th align="left">墓</th><th align="left">绝</th></tr></thead>
          <tbody>
            <tr v-for="m in TABLES.mu" :key="m.wx">
              <td>{{ m.wx }}</td><td class="mono">{{ m.cs }}</td><td class="mono">{{ m.wang }}</td><td class="mono">{{ m.mu }}</td><td class="mono">{{ m.jue }}</td>
            </tr>
          </tbody>
        </table>
      </n-card>

      <n-card size="small" title="旬空">
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tbody><tr v-for="m in TABLES.xunkong" :key="m.xun"><td class="mono">{{ m.xun }}</td><td class="mono">{{ m.kong }}</td></tr></tbody>
        </table>
      </n-card>

      <n-card size="small" title="六神起法">
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tbody>
            <tr><td>甲 乙</td><td>青龙</td></tr><tr><td>丙 丁</td><td>朱雀</td></tr>
            <tr><td>戊</td><td>勾陈</td></tr><tr><td>己</td><td>螣蛇</td></tr>
            <tr><td>庚 辛</td><td>白虎</td></tr><tr><td>壬 癸</td><td>玄武</td></tr>
          </tbody>
        </table>
        <p class="tiny muted" style="margin:8px 0 0">顺序：青龙 → 朱雀 → 勾陈 → 螣蛇 → 白虎 → 玄武</p>
      </n-card>

      <n-card size="small" title="八宫世应">
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tbody>
            <tr><td>本宫卦</td><td>世六 / 应三</td></tr><tr><td>一世</td><td>世初 / 应四</td></tr>
            <tr><td>二世</td><td>世二 / 应五</td></tr><tr><td>三世</td><td>世三 / 应六</td></tr>
            <tr><td>四世</td><td>世四 / 应初</td></tr><tr><td>五世</td><td>世五 / 应二</td></tr>
            <tr><td>游魂</td><td>世四 / 应初</td></tr><tr><td>归魂</td><td>世三 / 应六</td></tr>
          </tbody>
        </table>
      </n-card>
    </div>
  </div>
</template>

<style scoped>
.card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
.tbl-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 12px; }

/* ---------- 手机端 ---------- */
@media (max-width: 640px) {
  /* 280/320px 最小列宽在 430px 屏上只剩一列，但仍会被 320 撑出边距，直接单列 */
  .card-grid, .tbl-grid { grid-template-columns: 1fr; }
  .ref-wrap :deep(.n-card) { font-size: 15px; }
  .ref-wrap :deep(table) { display: block; overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .ref-wrap :deep(table) td { white-space: nowrap; }
  .ref-wrap :deep(table) td:first-child { white-space: normal; }
  .ref-wrap :deep(.n-input) { font-size: 16px; }
}
</style>
