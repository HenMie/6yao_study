<script setup>
/* ============================================================
 * ChangeFlow  变化方向图
 * 从（本卦 / 动爻）→ 到（变卦 / 变爻），中间写作用方向。
 * 用于化来化去、反吟伏吟等"方向不能混"的章节。
 * ============================================================ */
import { uid } from './uid.js'

defineProps({
  rows: { type: Array, required: true } // [{from:{t,sub}, to:{t,sub}, verdict, tone}]
})
const id = uid('cf')
const H = n => n * 86 + 40
</script>

<template>
  <svg class="dgm" :viewBox="`0 0 720 ${H(rows.length)}`" role="img" aria-label="变化方向">
    <defs>
      <marker :id="id + 'a'" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
        <path d="M0,0 L9,4.5 L0,9 Z" fill="#6B7076" />
      </marker>
    </defs>

    <g v-for="(r, i) in rows" :key="i" :transform="`translate(0, ${40 + i * 86})`">
      <!-- 从 -->
      <rect x="34" y="-28" width="176" height="56" rx="2" fill="var(--paper-2)" stroke="var(--rule-2)" />
      <text x="122" :y="r.from.sub ? -3 : 6" text-anchor="middle" class="s f-ink" font-size="19">{{ r.from.t }}</text>
      <text v-if="r.from.sub" x="122" y="16" text-anchor="middle" class="m f-ink3" font-size="10">{{ r.from.sub }}</text>

      <!-- 箭头 -->
      <line x1="220" y1="0" x2="458" y2="0" stroke="#C9BFA9" stroke-width="1.2" :marker-end="'url(#' + id + 'a)'" />
      <text x="340" y="-9" text-anchor="middle" class="m" :class="r.tone === 'good' ? 'f-good' : r.tone === 'warn' ? 'f-warn' : r.tone === 'bad' ? 'f-acc' : 'f-ink3'" font-size="10.5">{{ r.verdict }}</text>

      <!-- 到 -->
      <rect x="470" y="-28" width="216" height="56" rx="2" :fill="r.tone === 'bad' ? 'var(--accent-wash)' : '#fff'" :stroke="r.tone === 'bad' ? 'var(--accent)' : r.tone === 'good' ? 'var(--good)' : 'var(--rule-2)'" :stroke-width="r.tone === 'bad' || r.tone === 'good' ? 1.5 : 1" />
      <text x="578" :y="r.to.sub ? -3 : 6" text-anchor="middle" class="s f-ink" font-size="19">{{ r.to.t }}</text>
      <text v-if="r.to.sub" x="578" y="16" text-anchor="middle" class="m f-ink3" font-size="10">{{ r.to.sub }}</text>
    </g>
  </svg>
</template>
