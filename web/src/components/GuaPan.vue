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
    <!-- 桌面端：六列对照表 -->
    <div class="pan-scroll">
      <div class="pan-inner">
        <div class="pan-head">
          <div>六神</div><div>六亲</div><div>纳甲</div><div>爻象</div><div>世应</div><div>动</div>
        </div>
        <div v-for="y in rows" :key="y.pos" class="pan-row" :class="{ 'is-shi': y.shi }">
          <div class="shen">{{ y.shen }}</div>
          <div>{{ y.qin }}<b class="pan-wx" :class="'wx-' + y.wx">{{ y.wx }}</b></div>
          <div class="nj">{{ y.gan }}<b :class="'wx-' + y.wx">{{ y.zhi }}</b>{{ y.yy }}</div>
          <div>
            <div class="yao" :class="y.yang ? 'yang' : 'yin'"><i /><i v-if="!y.yang" /></div>
          </div>
          <div class="shiy">
            <b v-if="y.shi">世</b><b v-else-if="y.ying">应</b>
            <span v-if="y.kong" class="kong">空</span>
          </div>
          <div class="mark">{{ y.dong ? (y.yang ? '○' : '×') : '' }}</div>
        </div>

        <div v-if="showBian && p.bian" class="pan-row is-bian" style="background:var(--paper-2)">
          <div class="shen">变卦</div>
          <div style="grid-column:span 4;font-size:13px;color:var(--ink-3)">
            {{ p.bian.name }}　
            <span v-for="y in p.yao.filter(x => x.bian)" :key="y.pos">
              {{ ['初','二','三','四','五','上'][y.pos-1] }}爻→{{ y.bian.qin }}<b :class="'wx-' + y.bian.wx">{{ y.bian.zhi }}</b>　
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 手机端：每爻一张卡，纵向排列，不横滑 -->
    <div class="pan-cards">
      <div v-for="y in rows" :key="'c' + y.pos" class="pan-card" :class="{ 'is-shi': y.shi, 'is-dong': y.dong }">
        <div class="pc-top">
          <span class="pc-pos">{{ y.pos }}爻</span>
          <span class="yao" :class="y.yang ? 'yang' : 'yin'"><i /><i v-if="!y.yang" /></span>
          <span class="pc-mark">
            <b v-if="y.shi" class="pc-who">世</b>
            <b v-else-if="y.ying" class="pc-who">应</b>
            <span v-if="y.kong" class="kong">空</span>
            <span v-if="y.dong" class="pc-dong">{{ y.yang ? '○ 动' : '× 动' }}</span>
          </span>
        </div>
        <dl class="pc-fields">
          <dt>六神</dt><dd>{{ y.shen }}</dd>
          <dt>六亲</dt><dd>{{ y.qin }}<span class="muted"> · </span><b :class="'wx-' + y.wx">{{ y.wx }}</b></dd>
          <dt>纳甲</dt><dd class="nj">{{ y.gan }}<b :class="'wx-' + y.wx">{{ y.zhi }}</b>{{ y.yy }}</dd>
          <template v-if="showBian && y.bian">
            <dt>变爻</dt><dd class="nj">{{ y.bian.qin }}<b :class="'wx-' + y.bian.wx">{{ y.bian.zhi }}</b></dd>
          </template>
        </dl>
      </div>

      <div v-if="showBian && p.bian" class="pan-card is-bian">
        <div class="pc-top"><span class="pc-pos">变卦</span><strong class="serif">{{ p.bian.name }}</strong></div>
        <p class="pc-note">
          动爻：<span v-for="y in p.yao.filter(x => x.bian)" :key="y.pos">{{ ['初','二','三','四','五','上'][y.pos-1] }}→{{ y.bian.qin }}{{ y.bian.zhi }}　</span>
        </p>
      </div>
    </div>

    <div v-if="p.fuShen && p.fuShen.length" class="fushen">
      伏神　<span v-for="(f, i) in p.fuShen" :key="i" style="margin-right:14px">
        <b style="color:var(--accent)">{{ f.qin }}</b><b :class="'wx-' + f.wx">{{ f.zhi }}</b> 伏于{{ ['初','二','三','四','五','上'][f.pos-1] }}爻
      </span>
    </div>

    <div class="pan-legend" aria-label="五行配色">
      <span>五行</span>
      <i class="wx-木">木</i><i class="wx-火">火</i><i class="wx-土">土</i><i class="wx-金">金</i><i class="wx-水">水</i>
    </div>

    <GuaWen :gua-name="p.ben.name" :dong="dongPos" :bits="p.ben.bits" />
  </div>
</template>
