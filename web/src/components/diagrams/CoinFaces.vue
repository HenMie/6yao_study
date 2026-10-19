<script setup>
/* ============================================================
 * CoinFaces  三枚铜钱的四种结果
 * 实心圆 = 背面（阳），空心圆 = 字面（阴）；只数背面个数。
 * ============================================================ */
const PANELS = [
  { n: 0, name: '交', age: '老阴', move: '动', change: '变阳，记 ×', backs: [false, false, false] },
  { n: 1, name: '单', age: '少阳', move: '静', change: '不变', backs: [true, false, false] },
  { n: 2, name: '拆', age: '少阴', move: '静', change: '不变', backs: [true, true, false] },
  { n: 3, name: '重', age: '老阳', move: '动', change: '变阴，记 ○', backs: [true, true, true] }
]
const CX = [108, 288, 468, 648]
const COIN = [-48, 0, 48]
</script>

<template>
  <svg class="dgm" viewBox="0 0 720 248" role="img" aria-label="三枚铜钱的四种结果">
    <g v-for="(p, pi) in PANELS" :key="p.n">
      <text :x="CX[pi]" y="26" text-anchor="middle" class="m f-ink3" font-size="10.5" letter-spacing="1.5">
        {{ p.n }} 背
      </text>

      <g v-for="(isBack, ci) in p.backs" :key="ci" :transform="`translate(${CX[pi] + COIN[ci]}, 70)`">
        <circle r="19" :fill="isBack ? '#16191C' : '#fff'" :stroke="isBack ? '#16191C' : '#C9BFA9'" stroke-width="1.2" />
        <rect x="-4.5" y="-4.5" width="9" height="9" :fill="isBack ? '#fff' : '#FBF9F4'" :stroke="isBack ? '#16191C' : '#C9BFA9'" stroke-width=".8" />
      </g>

      <text :x="CX[pi]" y="132" text-anchor="middle" class="s f-ink" font-size="24">{{ p.name }}</text>
      <text :x="CX[pi]" y="154" text-anchor="middle" class="m f-ink2" font-size="10.5">{{ p.age }} · {{ p.change }}</text>

      <g :transform="`translate(${CX[pi] - 18}, 168)`">
        <rect width="36" height="18" rx="2" :fill="p.move === '动' ? 'var(--accent-wash)' : 'none'" :stroke="p.move === '动' ? 'var(--accent)' : 'var(--rule-2)'" />
        <text x="18" y="12.5" text-anchor="middle" class="m" :class="p.move === '动' ? 'f-acc' : 'f-ink3'" font-size="9.5">{{ p.move }}爻</text>
      </g>

      <line v-if="pi < 3" :x1="198 + pi * 180" y1="14" :x2="198 + pi * 180" y2="196" stroke="var(--rule)" stroke-width="1" />
    </g>

    <g transform="translate(24, 226)">
      <circle cx="4" cy="-4" r="4.5" fill="#16191C" />
      <text x="14" y="0" class="m f-ink3" font-size="10">背（阳）</text>
      <circle cx="86" cy="-4" r="4.5" fill="#fff" stroke="#C9BFA9" />
      <text x="96" y="0" class="m f-ink3" font-size="10">字（阴）</text>
      <text x="166" y="0" class="m f-ink4" font-size="10">三枚同摇，只数背面</text>
    </g>
  </svg>
</template>
