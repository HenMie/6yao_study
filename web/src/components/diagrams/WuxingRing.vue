<script setup>
/* ============================================================
 * WuxingRing  五行生克环
 * 外圈顺时针为相生（竹青弧线），内五角为相克（朱砂虚线）。
 * 版式：节点用纸白圆 + 宋体单字，中心说明用纸色块压住穿心线。
 * ============================================================ */
import { computed } from 'vue'
import { uid } from './uid.js'

const props = defineProps({
  mode: { type: String, default: 'both' }, // both | sheng | ke
  focus: { type: String, default: '' }
})

const id = uid('wr')
const CX = 360
const CY = 206
const R = 126
const NODES = [
  { t: '木', ang: -90 },
  { t: '火', ang: -18 },
  { t: '土', ang: 54 },
  { t: '金', ang: 126 },
  { t: '水', ang: 198 }
]
const rad = d => (d * Math.PI) / 180
const at = (a, r) => [CX + Math.cos(rad(a)) * r, CY + Math.sin(rad(a)) * r]

const nodes = computed(() => NODES.map((n, i) => {
  const [x, y] = at(n.ang, R)
  return { ...n, i, x, y, on: props.focus === n.t }
}))

/* 相生：节点之间的外圈圆弧，箭头指向被生者 */
const sheng = computed(() => {
  if (props.mode === 'ke') return []
  return nodes.value.map((n, i) => {
    const next = nodes.value[(i + 1) % 5]
    const [x1, y1] = at(n.ang + 11, R + 34)
    const [x2, y2] = at(next.ang - 11, R + 34)
    const [lx, ly] = at(n.ang + 15, R + 52)
    return {
      d: `M${x1.toFixed(1)},${y1.toFixed(1)} A${R + 34},${R + 34} 0 0 1 ${x2.toFixed(1)},${y2.toFixed(1)}`,
      lx, ly
    }
  })
})

/* 相克：隔一位连直线，取两圆边缘之间的一段 */
const ke = computed(() => {
  if (props.mode === 'sheng') return []
  return nodes.value.map((n, i) => {
    const m = nodes.value[(i + 2) % 5]
    const dx = m.x - n.x
    const dy = m.y - n.y
    const len = Math.hypot(dx, dy)
    const ux = dx / len
    const uy = dy / len
    const x1 = n.x + ux * 30
    const y1 = n.y + uy * 30
    const x2 = m.x - ux * 30
    const y2 = m.y - uy * 30
    return {
      d: `M${x1.toFixed(1)},${y1.toFixed(1)} L${x2.toFixed(1)},${y2.toFixed(1)}`,
      lx: (x1 + x2) / 2 + uy * 13,
      ly: (y1 + y2) / 2 - ux * 13
    }
  })
})
</script>

<template>
  <svg class="dgm" viewBox="0 0 720 410" role="img" aria-label="五行生克环">
    <defs>
      <marker :id="id + 's'" markerWidth="9" markerHeight="9" refX="8.4" refY="4.5" orient="auto">
        <path d="M0,0 L9,4.5 L0,9 Z" fill="#3F7D5A" />
      </marker>
      <marker :id="id + 'k'" markerWidth="9" markerHeight="9" refX="8.4" refY="4.5" orient="auto">
        <path d="M0,0 L9,4.5 L0,9 Z" fill="#A6331F" />
      </marker>
    </defs>

    <!-- 相生外弧 -->
    <g v-for="(s, i) in sheng" :key="'s' + i">
      <path :d="s.d" fill="none" stroke="#3F7D5A" stroke-width="1.4" :marker-end="'url(#' + id + 's)'" />
    </g>

    <!-- 相克内线 -->
    <g v-for="(k, i) in ke" :key="'k' + i">
      <path :d="k.d" fill="none" stroke="#A6331F" stroke-width="1.1" stroke-dasharray="4 4" opacity=".72" :marker-end="'url(#' + id + 'k)'" />
      <rect :x="k.lx - 8" :y="k.ly - 8" width="16" height="16" fill="#fff" />
      <text :x="k.lx" :y="k.ly + 4" text-anchor="middle" class="m f-acc" font-size="10.5">克</text>
    </g>

    <!-- 中心说明放在环外，避免遮断五角连线 -->
    <text :x="CX" y="26" text-anchor="middle" class="s f-ink3" font-size="13.5">相邻相生 · 隔位相克</text>

    <!-- 五行节点 -->
    <g v-for="n in nodes" :key="n.t">
      <circle :cx="n.x" :cy="n.y" :r="n.on ? 29 : 27" :fill="n.on ? 'var(--accent-wash)' : '#fff'" :stroke="n.on ? 'var(--accent)' : 'var(--rule-2)'" :stroke-width="n.on ? 2 : 1.4" />
      <text :x="n.x" :y="n.y + 7.5" text-anchor="middle" class="s f-ink" font-size="21">{{ n.t }}</text>
    </g>

    <!-- 图例 -->
    <g transform="translate(28, 386)">
      <line x1="0" y1="-4" x2="26" y2="-4" stroke="#3F7D5A" stroke-width="1.4" />
      <text x="33" y="0" class="m f-ink3" font-size="10.5">顺时针相生</text>
      <line x1="132" y1="-4" x2="158" y2="-4" stroke="#A6331F" stroke-width="1.1" stroke-dasharray="4 4" />
      <text x="165" y="0" class="m f-ink3" font-size="10.5">隔位相克</text>
    </g>
  </svg>
</template>
