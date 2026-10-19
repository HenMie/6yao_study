<script setup>
import { computed } from 'vue'
import GuaWen from './GuaWen.vue'
const props = defineProps({ p: { type: Object, required: true }, showBian: { type: Boolean, default: true } })

const rows = computed(() => {
  const out = []
  for (let i = 5; i >= 0; i--) out.push({ ...props.p.yao[i], pos: ['初', '二', '三', '四', '五', '上'][i] })
  return out
})
const dongPos = computed(() => props.p.yao.filter(y => y.dong).map(y => y.pos))
</script>

<template>
  <div class="pan">
    <div class="pan-head">
      <div>六神</div><div>六亲</div><div>纳甲</div><div>爻象</div><div>世应</div><div>动</div>
    </div>
    <div v-for="y in rows" :key="y.pos" class="pan-row" :class="{ 'is-shi': y.shi }">
      <div class="shen">{{ y.shen }}</div>
      <div>{{ y.qin }}<span class="muted" style="font-size:13px;margin-left:2px">{{ y.wx }}</span></div>
      <div class="nj">{{ y.gan }}{{ y.zhi }}{{ y.yy }}</div>
      <div>
        <div class="yao" :class="y.yang ? 'yang' : 'yin'"><i /><i v-if="!y.yang" /></div>
      </div>
      <div class="shiy">
        <b v-if="y.shi">世</b><b v-else-if="y.ying">应</b>
        <span v-if="y.kong" class="kong">空</span>
      </div>
      <div class="mark">{{ y.dong ? (y.yang ? '○' : '×') : '' }}</div>
    </div>

    <div v-if="showBian && p.bian" class="pan-row" style="background:var(--paper-2)">
      <div class="shen">变卦</div>
      <div style="grid-column:span 4;font-size:13px;color:var(--ink-3)">
        {{ p.bian.name }}　
        <span v-for="y in p.yao.filter(x => x.bian)" :key="y.pos">
          {{ ['初','二','三','四','五','上'][y.pos-1] }}爻→{{ y.bian.qin }}{{ y.bian.zhi }}　
        </span>
      </div>
    </div>

    <div v-if="p.fuShen && p.fuShen.length" class="fushen">
      伏神　<span v-for="(f, i) in p.fuShen" :key="i" style="margin-right:14px">
        <b style="color:var(--accent)">{{ f.qin }}{{ f.zhi }}</b> 伏于{{ ['初','二','三','四','五','上'][f.pos-1] }}爻
      </span>
    </div>

    <GuaWen :gua-name="p.ben.name" :dong="dongPos" />
  </div>
</template>
