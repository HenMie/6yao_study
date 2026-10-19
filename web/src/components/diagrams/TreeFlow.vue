<script setup>
/* ============================================================
 * TreeFlow  判断分叉图
 * 左根节点 → 中条件 → 右结果，两级肘形连线。
 * 用于日冲四格、暗动/日破、真空假空等"同一动作两种结局"。
 * ============================================================ */
import { computed } from 'vue'

const props = defineProps({
  root: { type: Object, required: true },
  branches: { type: Array, required: true }, // [{t, sub, tone, outcomes:[{t, sub, tone}]}]
  foot: { type: String, default: '' }
})

const TONE = {
  good: { stroke: '#3F7D5A', fill: '#F6FAF7' },
  bad: { stroke: '#A6331F', fill: '#FDF6F3' },
  warn: { stroke: '#9A7B32', fill: '#FBF8EF' },
  plain: { stroke: '#DED6C4', fill: '#fff' },
  key: { stroke: '#C9BFA9', fill: '#F4F0E6' }
}

const layout = computed(() => {
  const blocks = props.branches.map(b => Math.max(1, (b.outcomes || []).length) * 64 + 12)
  const total = blocks.reduce((a, b) => a + b, 0) + 18 * (blocks.length - 1)
  const H = Math.max(250, total + 64)
  const rootY = H / 2
  let y = (H - total) / 2
  const rows = props.branches.map((b, i) => {
    const bh = blocks[i]
    const by = y + bh / 2
    const outs = (b.outcomes || []).map((o, j) => ({
      ...o,
      y: y + 6 + j * 64 + 32
    }))
    const row = { ...b, y: by, outs, top: y }
    y += bh + 18
    return row
  })
  return { H, rootY, rows }
})
</script>

<template>
  <svg class="dgm" :viewBox="`0 0 720 ${layout.H}`" role="img" :aria-label="root.t">
    <!-- 连线 -->
    <g fill="none" stroke="var(--rule-2)" stroke-width="1.1">
      <path v-for="(b, i) in layout.rows" :key="'c' + i" :d="`M192,${layout.rootY} H218 V${b.y} H244`" />
      <template v-for="(b, i) in layout.rows" :key="'d' + i">
        <path v-for="(o, j) in b.outs" :key="j" :d="`M416,${b.y} H442 V${o.y} H470`" />
      </template>
    </g>

    <!-- 根节点 -->
    <g>
      <rect x="22" :y="layout.rootY - 29" width="170" height="58" rx="2" :fill="TONE.key.fill" :stroke="TONE.key.stroke" />
      <text x="107" :y="layout.rootY + (root.sub ? -4 : 5)" text-anchor="middle" class="s f-ink" font-size="17">{{ root.t }}</text>
      <text v-if="root.sub" x="107" :y="layout.rootY + 15" text-anchor="middle" class="m f-ink3" font-size="10">{{ root.sub }}</text>
    </g>

    <!-- 条件与结果 -->
    <g v-for="(b, i) in layout.rows" :key="'b' + i">
      <rect x="244" :y="b.y - 26" width="172" height="52" rx="2" :fill="(TONE[b.tone] || TONE.plain).fill" :stroke="(TONE[b.tone] || TONE.plain).stroke" :stroke-width="b.tone && b.tone !== 'plain' ? 1.5 : 1" />
      <text x="330" :y="b.y + (b.sub ? -2 : 5)" text-anchor="middle" class="s f-ink" font-size="15">{{ b.t }}</text>
      <text v-if="b.sub" x="330" :y="b.y + 15" text-anchor="middle" class="m f-ink3" font-size="9.5">{{ b.sub }}</text>

      <g v-for="(o, j) in b.outs" :key="j">
        <rect x="470" :y="o.y - 26" width="224" height="52" rx="2" :fill="(TONE[o.tone] || TONE.plain).fill" :stroke="(TONE[o.tone] || TONE.plain).stroke" :stroke-width="o.tone && o.tone !== 'plain' ? 1.5 : 1" />
        <text x="582" :y="o.y + (o.sub ? -2 : 5)" text-anchor="middle" class="s f-ink" font-size="15">{{ o.t }}</text>
        <text v-if="o.sub" x="582" :y="o.y + 15" text-anchor="middle" class="m f-ink3" font-size="9.5">{{ o.sub }}</text>
      </g>
    </g>

    <text v-if="foot" x="24" :y="layout.H - 12" class="m f-ink3" font-size="10.5">{{ foot }}</text>
  </svg>
</template>
