<script setup>
/* ============================================================
 * Wheel12  十二位圆盘
 * 子位在正下，顺时针排列（与传统方位图一致：上南下北）。
 * 可画地支六合/六冲/三刑连线，也可作十二长生盘。
 * ============================================================ */
import { computed } from 'vue'
import { uid } from './uid.js'

const id = uid('wh')

const props = defineProps({
  labels: { type: Array, required: true }, // [{t, sub, tone}]
  chords: { type: Array, default: () => [] }, // [{a, b, kind}]
  center: { type: Object, default: () => ({ t: '', sub: '' }) },
  centerTop: { type: Boolean, default: false },
  highlight: { type: Array, default: () => [] },
  ring: { type: Boolean, default: false },
  start: { type: Number, default: 0 },
  legend: { type: Array, default: () => [] }
})

const CX = 360
const CY = 214
const R = 150
const NR = 22

const rad = d => (d * Math.PI) / 180
const at = (i, r) => {
  const a = rad(90 + (props.start + i) * 30)
  return [CX + Math.cos(a) * r, CY + Math.sin(a) * r]
}

const nodes = computed(() => props.labels.map((l, i) => {
  const [x, y] = at(i, R)
  return { ...l, i, x, y, on: props.highlight.includes(i) }
}))

const lines = computed(() => props.chords.map(c => {
  const [x1, y1] = at(c.a, R)
  const [x2, y2] = at(c.b, R)
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len
  const uy = dy / len
  const p = NR + 3
  return {
    ...c,
    x1: x1 + ux * p, y1: y1 + uy * p,
    x2: x2 - ux * p, y2: y2 - uy * p
  }
}))

const STYLE = {
  he: { stroke: '#6B7076', dash: '', width: 1, op: 0.75 },
  chong: { stroke: '#A6331F', dash: '', width: 1.1, op: 0.55 },
  xing: { stroke: '#9A7B32', dash: '4 4', width: 1.1, op: 0.8 },
  sanhe: { stroke: '#3F7D5A', dash: '', width: 1.4, op: 0.8 }
}
const TONE = {
  good: { stroke: '#3F7D5A', fill: '#F6FAF7' },
  bad: { stroke: '#A6331F', fill: '#FDF6F3' },
  warn: { stroke: '#9A7B32', fill: '#FBF8EF' },
  plain: { stroke: '#C9BFA9', fill: '#fff' }
}

/* 外圈顺行箭头：从 105° 画到 435°，留出下方缺口 */
const ringPath = computed(() => {
  const [sx, sy] = [CX + Math.cos(rad(105)) * (R + 38), CY + Math.sin(rad(105)) * (R + 38)]
  const [ex, ey] = [CX + Math.cos(rad(435)) * (R + 38), CY + Math.sin(rad(435)) * (R + 38)]
  return { d: `M${sx.toFixed(1)},${sy.toFixed(1)} A${R + 38},${R + 38} 0 1 1 ${ex.toFixed(1)},${ey.toFixed(1)}` }
})
</script>

<template>
  <svg class="dgm" viewBox="0 0 720 442" role="img" :aria-label="center.t || '十二位圆盘'">
    <defs>
      <marker :id="id + 'arrow'" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
        <path d="M0,0 L9,4.5 L0,9 Z" fill="#9AA0A6" />
      </marker>
    </defs>

    <!-- 外圈顺行 -->
    <g v-if="ring">
      <path :d="ringPath.d" fill="none" stroke="#9AA0A6" stroke-width="1.2" stroke-dasharray="5 5" :marker-end="'url(#' + id + 'arrow)'" />
      <text :x="CX" y="18" text-anchor="middle" class="m f-ink4" font-size="10.5">顺行</text>
    </g>

    <!-- 连线 -->
    <line
      v-for="(l, i) in lines" :key="'l' + i"
      :x1="l.x1" :y1="l.y1" :x2="l.x2" :y2="l.y2"
      :stroke="(STYLE[l.kind] || STYLE.he).stroke"
      :stroke-width="(STYLE[l.kind] || STYLE.he).width"
      :stroke-dasharray="(STYLE[l.kind] || STYLE.he).dash || undefined"
      :opacity="(STYLE[l.kind] || STYLE.he).op"
    />

    <!-- 中心 -->
    <g v-if="center.t && !centerTop">
      <rect :x="CX - 62" :y="CY - 27" width="124" height="54" rx="2" fill="var(--paper)" stroke="var(--rule)" />
      <text :x="CX" :y="CY - 3" text-anchor="middle" class="s f-ink" font-size="16">{{ center.t }}</text>
      <text v-if="center.sub" :x="CX" :y="CY + 16" text-anchor="middle" class="m f-ink3" font-size="10">{{ center.sub }}</text>
    </g>
    <text v-if="center.t && centerTop" :x="CX" y="20" text-anchor="middle" class="s f-ink3" font-size="13">
      {{ center.t }}<tspan v-if="center.sub" class="m f-ink4" font-size="10.5">　{{ center.sub }}</tspan>
    </text>

    <!-- 十二位节点 -->
    <g v-for="n in nodes" :key="n.i">
      <circle
        :cx="n.x" :cy="n.y" :r="NR"
        :fill="n.on ? 'var(--paper-3)' : (TONE[n.tone] || TONE.plain).fill"
        :stroke="n.on ? (n.tone && TONE[n.tone] ? TONE[n.tone].stroke : 'var(--accent)') : (TONE[n.tone] || TONE.plain).stroke"
        :stroke-width="n.on ? 2 : 1.2"
      />
      <text :x="n.x" :y="n.y + (n.sub ? 1 : 5.5)" text-anchor="middle" class="s f-ink" :font-size="n.t.length > 1 ? 13 : 17">{{ n.t }}</text>
      <text v-if="n.sub" :x="n.x" :y="n.y + 14" text-anchor="middle" class="m f-ink3" font-size="9">{{ n.sub }}</text>
    </g>

    <!-- 图例 -->
    <g v-if="legend.length" :transform="`translate(24, ${CY + 196})`">
      <g v-for="(l, i) in legend" :key="i" :transform="`translate(${i * 112}, 0)`">
        <line x1="0" y1="-4" x2="20" y2="-4" :stroke="(STYLE[l[0]] || STYLE.he).stroke" stroke-width="1.4" :stroke-dasharray="(STYLE[l[0]] || STYLE.he).dash || undefined" />
        <text x="26" y="0" class="m f-ink3" font-size="10">{{ l[1] }}</text>
      </g>
    </g>
  </svg>
</template>
