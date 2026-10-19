<script setup>
/* ============================================================
 * ChainFlow  三节点作用链
 * 用于"忌神 → 元神 → 用神"这类连续相生：一条横链比放射图更直接。
 * ============================================================ */
import { uid } from './uid.js'

defineProps({
  nodes: { type: Array, required: true }, // [{t, sub, tone, note}]
  labels: { type: Array, default: () => [] },
  foot: { type: String, default: '' }
})
const id = uid('ch')
const CX = [112, 360, 608]
const BW = 170
const TONE = {
  good: { stroke: '#3F7D5A', fill: '#F6FAF7' },
  bad: { stroke: '#A6331F', fill: '#FDF6F3' },
  warn: { stroke: '#9A7B32', fill: '#FBF8EF' },
  key: { stroke: '#C9BFA9', fill: '#F4F0E6' },
  plain: { stroke: '#DED6C4', fill: '#fff' }
}
</script>

<template>
  <svg class="dgm" viewBox="0 0 720 196" role="img" aria-label="三节点作用链">
    <defs>
      <marker :id="id + 'a'" markerWidth="9" markerHeight="9" refX="8.2" refY="4.5" orient="auto">
        <path d="M0,0 L9,4.5 L0,9 Z" fill="#3F7D5A" />
      </marker>
    </defs>

    <!-- 连线 -->
    <g v-for="i in 2" :key="'l' + i">
      <line :x1="CX[i - 1] + BW / 2 + 6" y1="80" :x2="CX[i] - BW / 2 - 8" y2="80" stroke="#3F7D5A" stroke-width="1.4" :marker-end="'url(#' + id + 'a)'" />
      <rect :x="(CX[i - 1] + CX[i]) / 2 - 10" y="64" width="20" height="18" fill="#fff" />
      <text :x="(CX[i - 1] + CX[i]) / 2" y="77" text-anchor="middle" class="m f-good" font-size="10.5">{{ labels[i - 1] || '生' }}</text>
    </g>

    <!-- 节点 -->
    <g v-for="(n, i) in nodes" :key="i">
      <rect :x="CX[i] - BW / 2" y="50" :width="BW" height="60" rx="2" :fill="(TONE[n.tone] || TONE.plain).fill" :stroke="(TONE[n.tone] || TONE.plain).stroke" :stroke-width="n.tone && n.tone !== 'plain' ? 1.6 : 1" />
      <text :x="CX[i]" y="76" text-anchor="middle" class="s f-ink" font-size="18">{{ n.t }}</text>
      <text :x="CX[i]" y="96" text-anchor="middle" class="m f-ink3" font-size="10">{{ n.sub }}</text>
      <text v-if="n.note" :x="CX[i]" y="132" text-anchor="middle" class="m" :class="n.tone === 'key' ? 'f-acc' : 'f-ink3'" font-size="10">{{ n.note }}</text>
    </g>

    <text v-if="foot" x="24" y="174" class="m f-ink3" font-size="10.5">{{ foot }}</text>
  </svg>
</template>
