<script setup>
/* ============================================================
 * SanheGrid  三合局四组
 * 申子辰水、亥卯未木、寅午戌火、巳酉丑金。
 * ============================================================ */
const GROUPS = [
  { z: ['申', '子', '辰'], wx: '水', cx: 182, cy: 96, tone: 'ink' },
  { z: ['亥', '卯', '未'], wx: '木', cx: 538, cy: 96, tone: 'good' },
  { z: ['寅', '午', '戌'], wx: '火', cx: 182, cy: 236, tone: 'acc' },
  { z: ['巳', '酉', '丑'], wx: '金', cx: 538, cy: 236, tone: 'ink3' }
]
const R = 62
const rad = d => (d * Math.PI) / 180
const pts = (cx, cy) => [-90, 30, 150].map(a => [cx + Math.cos(rad(a)) * R, cy + Math.sin(rad(a)) * R])
const TONE = { ink: '#3D4348', good: '#3F7D5A', acc: '#A6331F', ink3: '#6B7076' }
</script>

<template>
  <svg class="dgm" viewBox="0 0 720 356" role="img" aria-label="三合局四组">
    <g v-for="g in GROUPS" :key="g.wx">
      <polygon
        :points="pts(g.cx, g.cy).map(p => p.join(',')).join(' ')"
        :fill="TONE[g.tone]" fill-opacity=".04"
        :stroke="TONE[g.tone]" stroke-opacity=".45" stroke-width="1.1"
      />
      <g v-for="(p, i) in pts(g.cx, g.cy)" :key="i">
        <circle :cx="p[0]" :cy="p[1]" r="21" fill="#fff" stroke="var(--rule-2)" stroke-width="1.1" />
        <text :x="p[0]" :y="p[1] + 6.5" text-anchor="middle" class="s f-ink" font-size="17">{{ g.z[i] }}</text>
      </g>
      <text :x="g.cx" :y="g.cy + 8" text-anchor="middle" class="s" :fill="TONE[g.tone]" font-size="19">{{ g.wx }}局</text>
    </g>

    <text x="24" y="340" class="m f-ink3" font-size="10.5">三字齐见只是线索；先查参与爻的动静与成局结构，再论局五行对用神的生克。</text>
  </svg>
</template>
