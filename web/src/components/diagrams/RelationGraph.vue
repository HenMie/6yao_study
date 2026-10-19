<script setup>
/* ============================================================
 * RelationGraph  关系图
 * 中心节点 + 环绕节点 + 带方向的生克冲合连线。
 * 用于六亲、用神四神、世爻三力、四路生克、克处逢生、六神次序等。
 * 节点位置用极坐标（angle 角度，0=右，90=下），r 为半径。
 * ============================================================ */
import { computed } from 'vue'
import { uid } from './uid.js'

const props = defineProps({
  center: { type: Object, required: true },
  nodes: { type: Array, default: () => [] },
  edges: { type: Array, default: () => [] },
  legend: { type: Array, default: () => [] },
  height: { type: Number, default: 400 }
})

const id = uid('rg')
const CX = 360
const CY = computed(() => props.height / 2)
const CW = 150
const CH = 58
const NW = computed(() => props.nodes.some(n => n.wide) ? 132 : 116)
const NH = 52

const TONE = {
  good: { stroke: '#3F7D5A', fill: '#F6FAF7' },
  bad: { stroke: '#A6331F', fill: '#FDF6F3' },
  warn: { stroke: '#9A7B32', fill: '#FBF8EF' },
  muted: { stroke: '#C9BFA9', fill: '#fff' },
  plain: { stroke: '#DED6C4', fill: '#fff' }
}
const KIND = {
  sheng: { color: '#3F7D5A', cls: 'f-good', dash: '' },
  ke: { color: '#A6331F', cls: 'f-acc', dash: '' },
  chong: { color: '#A6331F', cls: 'f-acc', dash: '5 4' },
  he: { color: '#6B7076', cls: 'f-ink3', dash: '' },
  tong: { color: '#C9BFA9', cls: 'f-ink4', dash: '' },
  both: { color: '#6B7076', cls: 'f-ink3', dash: '3 4' },
  dong: { color: '#3D4348', cls: 'f-ink2', dash: '4 4' }
}

const placed = computed(() => {
  const m = {}
  for (const n of props.nodes) {
    const a = ((n.angle ?? 0) * Math.PI) / 180
    const r = n.r ?? 206
    m[n.id] = {
      ...n,
      x: CX + Math.cos(a) * r,
      y: CY.value + Math.sin(a) * r * 0.76
    }
  }
  return m
})

const centerRect = computed(() => ({ x: CX, y: CY.value, w: CW, h: CH }))
const nodeRect = (n) => ({ x: n.x, y: n.y, w: NW.value, h: NH })

/* 从矩形中心朝目标点，取边框交点 */
function anchor (rect, tx, ty) {
  const dx = tx - rect.x
  const dy = ty - rect.y
  const hw = rect.w / 2 + 5
  const hh = rect.h / 2 + 5
  const sx = dx === 0 ? Infinity : hw / Math.abs(dx)
  const sy = dy === 0 ? Infinity : hh / Math.abs(dy)
  const s = Math.min(sx, sy)
  return { x: rect.x + dx * s, y: rect.y + dy * s }
}

const paths = computed(() => props.edges.map(e => {
  const fr = e.from === 'c' ? centerRect.value : nodeRect(placed.value[e.from])
  const to = e.to === 'c' ? centerRect.value : nodeRect(placed.value[e.to])
  const p1 = anchor(fr, to.x, to.y)
  const p2 = anchor(to, fr.x, fr.y)
  const mx = (p1.x + p2.x) / 2
  const my = (p1.y + p2.y) / 2
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  const len = Math.hypot(dx, dy) || 1
  const bend = e.bend || 0
  const cx = mx - (dy / len) * bend
  const cy = my + (dx / len) * bend
  const d = bend
    ? `M${p1.x.toFixed(1)},${p1.y.toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`
    : `M${p1.x.toFixed(1)},${p1.y.toFixed(1)} L${p2.x.toFixed(1)},${p2.y.toFixed(1)}`
  const t = 0.42
  const lx = bend
    ? (1 - t) * (1 - t) * p1.x + 2 * (1 - t) * t * cx + t * t * p2.x
    : p1.x + t * (p2.x - p1.x)
  const ly = bend
    ? (1 - t) * (1 - t) * p1.y + 2 * (1 - t) * t * cy + t * t * p2.y
    : p1.y + t * (p2.y - p1.y)
  const k = KIND[e.kind] || KIND.he
  return { ...e, d, lx, ly, k }
}))
</script>

<template>
  <svg class="dgm" :viewBox="`0 0 720 ${height}`" role="img" :aria-label="center.t + '关系图'">
    <defs>
      <marker v-for="(k, name) in KIND" :key="name" :id="id + name" markerWidth="9" markerHeight="9" refX="8.2" refY="4.5" orient="auto">
        <path d="M0,0 L9,4.5 L0,9 Z" :fill="k.color" />
      </marker>
    </defs>

    <!-- 连线 -->
    <g v-for="(p, i) in paths" :key="'e' + i">
      <path
        :d="p.d" fill="none" :stroke="p.k.color" stroke-width="1.35"
        :stroke-dasharray="p.k.dash || undefined" opacity=".9"
        :marker-end="'url(#' + id + p.kind + ')'"
      />
      <template v-if="p.label">
        <rect :x="p.lx - (p.label.length * 11 + 10) / 2" :y="p.ly - 9" :width="p.label.length * 11 + 10" height="18" fill="#fff" />
        <text :x="p.lx" :y="p.ly + 4" text-anchor="middle" class="m" :class="p.k.cls" font-size="10.5">{{ p.label }}</text>
      </template>
    </g>

    <!-- 环绕节点 -->
    <g v-for="n in nodes" :key="n.id">
      <rect
        :x="placed[n.id].x - NW / 2" :y="placed[n.id].y - NH / 2" :width="NW" :height="NH" rx="2"
        :fill="(TONE[n.tone] || TONE.plain).fill" :stroke="(TONE[n.tone] || TONE.plain).stroke"
        :stroke-width="n.tone && n.tone !== 'plain' ? 1.6 : 1"
      />
      <text :x="placed[n.id].x" :y="placed[n.id].y + (n.sub ? -1 : 5.5)" text-anchor="middle" class="s f-ink" font-size="17">{{ n.t }}</text>
      <text v-if="n.sub" :x="placed[n.id].x" :y="placed[n.id].y + 15" text-anchor="middle" class="m f-ink3" font-size="10">{{ n.sub }}</text>
    </g>

    <!-- 中心 -->
    <rect :x="CX - CW / 2" :y="CY - CH / 2" :width="CW" :height="CH" rx="2" fill="var(--paper-2)" stroke="var(--rule-2)" stroke-width="1.2" />
    <text :x="CX" :y="CY + (center.sub ? -3 : 6)" text-anchor="middle" class="s f-ink" font-size="18">{{ center.t }}</text>
    <text v-if="center.sub" :x="CX" :y="CY + 15" text-anchor="middle" class="m f-ink3" font-size="10.5">{{ center.sub }}</text>

    <!-- 图例 -->
    <g v-if="legend.length" :transform="`translate(24, ${height - 14})`">
      <g v-for="(l, i) in legend" :key="i" :transform="`translate(${i * 108}, 0)`">
        <line x1="0" y1="-4" x2="20" y2="-4" :stroke="(KIND[l[0]] || KIND.he).color" stroke-width="1.35" :stroke-dasharray="(KIND[l[0]] || KIND.he).dash || undefined" />
        <text x="26" y="0" class="m f-ink3" font-size="10">{{ l[1] }}</text>
      </g>
    </g>
  </svg>
</template>
