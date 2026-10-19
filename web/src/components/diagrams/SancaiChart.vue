<script setup>
/* ============================================================
 * SancaiChart  三才配对
 * 下卦初二三、上卦四五上；地＝初四，人＝二五，天＝三上。
 * ============================================================ */
const ROWS = [
  { y: 240, l: '初', r: '四', lYin: false, rYin: true, c: '地' },
  { y: 188, l: '二', r: '五', lYin: true, rYin: false, c: '人' },
  { y: 136, l: '三', r: '上', lYin: false, rYin: true, c: '天' }
]
</script>

<template>
  <svg class="dgm" viewBox="0 0 720 306" role="img" aria-label="三才配对：初四为地、二五为人、三上为天">
    <text x="245" y="66" text-anchor="middle" class="s f-ink" font-size="15">下卦 · 内</text>
    <text x="245" y="84" text-anchor="middle" class="m f-ink3" font-size="10">初 二 三</text>
    <text x="475" y="66" text-anchor="middle" class="s f-ink" font-size="15">上卦 · 外</text>
    <text x="475" y="84" text-anchor="middle" class="m f-ink3" font-size="10">四 五 上</text>

    <g v-for="r in ROWS" :key="r.c">
      <!-- 配对连线 -->
      <line x1="306" :y1="r.y" x2="414" :y2="r.y" stroke="var(--accent)" stroke-width="1" stroke-dasharray="3 4" opacity=".6" />
      <rect x="338" :y="r.y - 20" width="44" height="18" fill="#fff" />
      <text x="360" :y="r.y - 6" text-anchor="middle" class="s f-acc" font-size="12">{{ r.c }}</text>

      <!-- 下卦 -->
      <text :x="172" :y="r.y + 4" text-anchor="end" class="m f-ink3" font-size="11">{{ r.l }}</text>
      <rect v-if="!r.lYin" x="190" :y="r.y - 2.5" width="110" height="5" rx="1" fill="var(--ink)" />
      <template v-else>
        <rect x="190" :y="r.y - 2.5" width="48" height="5" rx="1" fill="var(--ink)" />
        <rect x="252" :y="r.y - 2.5" width="48" height="5" rx="1" fill="var(--ink)" />
      </template>

      <!-- 上卦 -->
      <text :x="542" :y="r.y + 4" text-anchor="start" class="m f-ink3" font-size="11">{{ r.r }}</text>
      <rect v-if="!r.rYin" x="420" :y="r.y - 2.5" width="110" height="5" rx="1" fill="var(--ink)" />
      <template v-else>
        <rect x="420" :y="r.y - 2.5" width="48" height="5" rx="1" fill="var(--ink)" />
        <rect x="482" :y="r.y - 2.5" width="48" height="5" rx="1" fill="var(--ink)" />
      </template>
    </g>

    <text x="24" y="286" class="m f-ink3" font-size="10.5">比较的是对应位：地＝初／四　人＝二／五　天＝三／上</text>
  </svg>
</template>
