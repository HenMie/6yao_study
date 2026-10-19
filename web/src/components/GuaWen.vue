<script setup>
/* 经文展示：卦辞 + 爻辞 + 彖/象（可折叠），数据来自 src/data/guaWen.json */
import { computed, ref } from 'vue'
import data from '../data/guaWen.json'

const props = defineProps({
  guaName: { type: String, required: true },   // 引擎四字名，如「天风姤」
  dong: { type: Array, default: () => [] }     // 动爻位（1..6）
})

const rec = computed(() => data[props.guaName] || null)
const trad = ref(false)
const showZhuan = ref(false)

const POS = ['初', '二', '三', '四', '五', '上']
const field = computed(() => (trad.value ? (r) => r : (r) => r.sc))
const guaCi = computed(() => rec.value ? (trad.value ? rec.value.guaCi : rec.value.sc.guaCi) : '')
const yaoRows = computed(() => {
  if (!rec.value) return []
  const src = trad.value ? rec.value.yaoCi : rec.value.sc.yaoCi
  // 爻题序：初九/初六 → 上九/上六（数据本身按初→上排列）
  return src.map((y, i) => ({
    label: POS[i],
    text: y.text,
    note: y.note || '',
    dong: props.dong.includes(i + 1)
  }))
})
const yong = computed(() => rec.value ? (trad.value ? rec.value.yong : rec.value.sc.yong) : '')
const tuan = computed(() => rec.value ? (trad.value ? rec.value.tuan : rec.value.sc.tuan) : [])
const xiangDa = computed(() => rec.value ? ((trad.value ? rec.value.xiang : rec.value.sc.xiang)[0] || '') : '')
const xiangXiao = computed(() => rec.value ? (trad.value ? rec.value.xiang : rec.value.sc.xiang).slice(1) : [])
const wenYan = computed(() => rec.value ? (trad.value ? rec.value.wenYan : rec.value.sc.wenYan) : [])
</script>

<template>
  <div v-if="rec" class="guawen">
    <div class="gw-head">
      <span class="kicker">经文</span>
      <span class="gw-title">{{ rec.guaName }} · 第{{ rec.number }}卦　{{ rec.upperSym }}{{ rec.lowerSym }}</span>
      <button class="gw-toggle" type="button" @click="trad = !trad">{{ trad ? '繁体' : '简体' }}</button>
    </div>

    <p class="gw-guaci">{{ guaCi }}</p>

    <div class="gw-yao" :class="{ trad }">
      <div v-for="y in yaoRows" :key="y.label" class="gw-line" :class="{ 'is-dong': y.dong }">
        <span class="gw-pos">{{ y.label }}</span>
        <span class="gw-text">{{ y.text }}<i v-if="y.note" class="gw-note">〔{{ y.note }}〕</i></span>
      </div>
      <div v-if="yong" class="gw-line">
        <span class="gw-pos">用</span><span class="gw-text">{{ yong }}</span>
      </div>
    </div>

    <button class="gw-more" type="button" @click="showZhuan = !showZhuan">
      {{ showZhuan ? '收起传文 ▲' : '彖曰 · 象曰' + (wenYan.length ? ' · 文言' : '') + ' ▼' }}
    </button>
    <div v-if="showZhuan" class="gw-zhuan">
      <p v-if="tuan.length"><b>彖曰</b>　{{ tuan.join('') }}</p>
      <p><b>大象</b>　{{ xiangDa }}</p>
      <p v-if="xiangXiao.length"><b>小象</b>　<span v-for="(x, i) in xiangXiao" :key="i">{{ x }} </span></p>
      <template v-if="wenYan.length">
        <p v-for="(x, i) in wenYan" :key="'w' + i"><b>文言</b>　{{ x }}</p>
      </template>
    </div>
  </div>
</template>

<style scoped>
.guawen { border-top: 1px solid var(--rule); padding: 14px 12px 10px; }
.gw-head { display: flex; align-items: baseline; gap: 10px; margin-bottom: 8px; }
.gw-title { font-family: var(--serif); font-size: 15px; color: var(--ink); }
.gw-toggle {
  margin-left: auto; font-size: 12px; padding: 3px 8px; cursor: pointer;
  border: 1px solid var(--rule); background: var(--paper-2); color: var(--ink-3); border-radius: 2px;
}
.gw-toggle:hover { color: var(--accent); border-color: var(--accent); }
.gw-guaci { margin: 0 0 10px; font-family: var(--serif); font-size: 15px; line-height: 1.9; color: var(--ink); }
.gw-yao { border-left: 2px solid var(--paper-3); padding-left: 10px; }
.gw-line { display: flex; gap: 10px; line-height: 1.95; font-size: 14px; }
.gw-line.is-dong .gw-text { color: var(--accent); }
.gw-pos { flex: 0 0 2em; font-family: var(--serif); color: var(--ink-3); }
.gw-line.is-dong .gw-pos { color: var(--accent); font-weight: 600; }
.gw-text { color: var(--ink-2); }
.gw-note { font-style: normal; font-size: 12px; color: var(--ink-4); }
.gw-more {
  margin-top: 10px; font-size: 12px; color: var(--ink-3); background: none;
  border: none; cursor: pointer; padding: 0; letter-spacing: .05em;
}
.gw-more:hover { color: var(--accent); }
.gw-zhuan { margin-top: 8px; padding: 10px 12px; background: var(--paper-2); font-size: 14px; line-height: 1.9; }
.gw-zhuan p { margin: 4px 0; color: var(--ink-2); }
.gw-zhuan b { font-family: var(--serif); color: var(--ink-3); margin-right: 4px; }
</style>
