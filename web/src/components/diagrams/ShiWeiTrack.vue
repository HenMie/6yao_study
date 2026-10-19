<script setup>
/* ============================================================
 * ShiWeiTrack  八宫世位轨道
 * 每宫八卦：本宫 → 一世 … 五世 → 游魂 → 归魂。
 * 世位依次 6,1,2,3,4,5,4,3；应爻与世爻永远隔三位。
 * ============================================================ */
const props = defineProps({
  focus: { type: Array, default: () => [] }
})

const STEPS = [
  { n: '本宫', shi: 6 },
  { n: '一世', shi: 1 },
  { n: '二世', shi: 2 },
  { n: '三世', shi: 3 },
  { n: '四世', shi: 4 },
  { n: '五世', shi: 5 },
  { n: '游魂', shi: 4 },
  { n: '归魂', shi: 3 }
]
const CN = ['初', '二', '三', '四', '五', '上']
const X0 = 72
const DX = 84
const Y0 = 168
const DY = 14
const yOf = n => Y0 - (n - 1) * DY
const yingOf = shi => ((shi + 2) % 6) + 1
const dim = i => props.focus.length > 0 && !props.focus.includes(i)
const pts = STEPS.map((s, i) => `${X0 + i * DX},${yOf(s.shi)}`).join(' ')
</script>

<template>
  <svg class="dgm" viewBox="0 0 720 272" role="img" aria-label="八宫世位推进">
    <!-- 游魂归魂底纹 -->
    <g>
      <rect :x="X0 + 6 * DX - 32" y="78" width="64" height="112" fill="var(--paper-2)" />
      <rect :x="X0 + 7 * DX - 32" y="78" width="64" height="112" fill="var(--paper-2)" />
    </g>

    <!-- 世位轨迹 -->
    <polyline :points="pts" fill="none" stroke="var(--accent)" stroke-width="1.2" stroke-dasharray="4 4" opacity=".45" />

    <g v-for="(s, i) in STEPS" :key="s.n" :opacity="dim(i) ? .45 : 1">
      <!-- 六爻位点 -->
      <g v-for="k in 6" :key="k">
        <circle
          :cx="X0 + i * DX" :cy="yOf(k)" :r="k === s.shi ? 4.4 : 2.1"
          :fill="k === s.shi ? 'var(--accent)' : (k === yingOf(s.shi) ? '#fff' : 'var(--rule-2)')"
          :stroke="k === yingOf(s.shi) ? 'var(--ink-3)' : 'none'" stroke-width="1.2"
        />
      </g>
      <text :x="X0 + i * DX" y="198" text-anchor="middle" class="s f-ink" font-size="12">{{ s.n }}</text>
      <text :x="X0 + i * DX" y="216" text-anchor="middle" class="m f-ink3" font-size="9.5">
        世{{ CN[s.shi - 1] }} · 应{{ CN[yingOf(s.shi) - 1] }}
      </text>
    </g>

    <!-- 行标 -->
    <text x="26" y="102" class="m f-ink4" font-size="9.5">上</text>
    <text x="26" y="172" class="m f-ink4" font-size="9.5">初</text>
    <line x1="34" y1="98" x2="34" y2="170" stroke="var(--rule)" stroke-width="1" />

    <text x="24" y="254" class="m f-ink3" font-size="10.5">实心＝世爻　空心＝应爻　虚线＝世位推进</text>
  </svg>
</template>
