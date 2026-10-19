<script setup>
/* ============================================================
 * RefScale  参照物决定阴阳
 * 同一条温度轴，50° 对 40° 是阳，对 100° 是阴。
 * ============================================================ */
const AX = 96
const AY = 178
const A2 = 624
const X = v => AX + ((v - 30) / 80) * (A2 - AX)
const pts = [
  { v: 40, x: X(40) },
  { v: 50, x: X(50) },
  { v: 100, x: X(100) }
]
</script>

<template>
  <svg class="dgm" viewBox="0 0 720 256" role="img" aria-label="阴阳随参照物改变">
    <!-- 比较一：50 对 40 -->
    <g>
      <path :d="`M${pts[1].x},108 V84 H${pts[0].x} V108`" fill="none" stroke="var(--good)" stroke-width="1.2" />
      <text :x="(pts[0].x + pts[1].x) / 2" y="76" text-anchor="middle" class="s f-good" font-size="13">对 40° 而言：50° 为阳</text>
      <text :x="(pts[0].x + pts[1].x) / 2" y="94" text-anchor="middle" class="m f-ink3" font-size="10">40° 为阴</text>
    </g>

    <!-- 比较二：50 对 100 -->
    <g>
      <path :d="`M${pts[1].x},146 V122 H${pts[2].x} V146`" fill="none" stroke="var(--accent)" stroke-width="1.2" />
      <text :x="(pts[1].x + pts[2].x) / 2" y="114" text-anchor="middle" class="s f-acc" font-size="13">对 100° 而言：50° 为阴</text>
      <text :x="(pts[1].x + pts[2].x) / 2" y="132" text-anchor="middle" class="m f-ink3" font-size="10">100° 为阳</text>
    </g>

    <!-- 温度轴 -->
    <line :x1="AX" :y1="AY" :x2="A2" :y2="AY" stroke="var(--rule-2)" stroke-width="1" />
    <g v-for="p in pts" :key="p.v">
      <line :x1="p.x" :y1="AY - 6" :x2="p.x" :y2="AY + 6" stroke="var(--ink-3)" stroke-width="1" />
      <text :x="p.x" :y="AY + 26" text-anchor="middle" class="m f-ink2" font-size="12">{{ p.v }}°</text>
    </g>
    <circle :cx="pts[1].x" :cy="AY" r="4.5" fill="var(--accent)" />
    <text :x="pts[1].x" :y="AY - 16" text-anchor="middle" class="m f-acc" font-size="10.5">同一杯水</text>

    <!-- 轴尾说明 -->
    <text :x="AX" :y="AY + 56" class="s f-ink3" font-size="12">温度本身没有阴阳；先确定跟谁比，才有阴阳。</text>
    <text :x="A2" :y="AY + 56" text-anchor="end" class="m f-ink4" font-size="10">示意图</text>
  </svg>
</template>
