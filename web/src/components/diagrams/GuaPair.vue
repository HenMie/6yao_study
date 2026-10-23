<script setup>
/* ============================================================
 * GuaPair  本卦 → 变卦
 * 六爻自下而上绘制，动爻用朱砂标出并连到变卦同位。
 * focus 指定某一爻时，其余爻淡化，用于讲"变爻只作用本位"。
 * 手机：本卦在上、变卦在下，两卦之间用箭头连接同位的动爻。
 * ============================================================ */
import { computed } from 'vue'
import { uid } from './uid.js'
import { useNarrow } from '../../composables/useNarrow.js'

const props = defineProps({
  left: { type: Object, required: true },   // {name, sub, rows:[{yin}]}
  right: { type: Object, required: true },
  moves: { type: Array, default: () => [] },
  focus: { type: Number, default: null },
  mark: { type: String, default: '○' },
  note: { type: String, default: '' }
})

const id = uid('gp')
const POS = ['初', '二', '三', '四', '五', '上']
const narrow = useNarrow()

/* 桌面：两卦左右并排，六爻自下而上 */
const Y0 = 336
const STEP = 44
const LX = 146
const RX = 444
const W = 104
const yOf = (i) => Y0 - i * STEP

/* 手机：两卦上下排列，横画布 360。每卦内部仍自下而上。
 * 上卦占 y 62–370（初爻在下），下卦占 y 452–760。 */
const MW = 360
const MX = 92          // 爻线左端
const MWID = 128       // 爻线宽度
const MSTEP = 38
const TOP_Y0 = 340     // 本卦初爻基线
const BOT_Y0 = 766     // 变卦初爻基线（留出中间空隙放卦名）
const mTopY = (i) => TOP_Y0 - i * MSTEP
const mBotY = (i) => BOT_Y0 - i * MSTEP
const MN_H = 828

const dim = (i) => props.focus !== null && i !== props.focus
</script>

<template>
  <svg class="dgm" :viewBox="narrow ? `0 0 ${MW} ${MN_H}` : '0 0 720 410'" role="img" aria-label="本卦与变卦对照">
    <defs>
      <marker :id="id + 'a'" markerWidth="8" markerHeight="8" refX="7.4" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="#A6331F" />
      </marker>
    </defs>

    <!-- ================= 手机：上下两卦 ================= -->
    <template v-if="narrow">
      <!-- 本卦 -->
      <text x="16" y="30" class="s f-ink" font-size="19">{{ left.name }}</text>
      <text v-if="left.sub" x="20" y="48" class="m f-ink3" font-size="10.5">{{ left.sub }}</text>
      <text x="344" y="30" text-anchor="end" class="m f-ink4" font-size="10" letter-spacing="2">本 卦</text>

      <g v-for="(r, i) in left.rows" :key="'ml' + i" :opacity="dim(i) ? .26 : 1">
        <text :x="MX - 12" :y="mTopY(i) + 4" text-anchor="end" class="m f-ink3" font-size="11">{{ POS[i] }}</text>
        <rect v-if="!r.yin" :x="MX" :y="mTopY(i) - 2.5" :width="MWID" height="5" rx="1" :fill="moves.includes(i) ? 'var(--accent)' : 'var(--ink)'" />
        <template v-else>
          <rect :x="MX" :y="mTopY(i) - 2.5" width="56" height="5" rx="1" :fill="moves.includes(i) ? 'var(--accent)' : 'var(--ink)'" />
          <rect :x="MX + 72" :y="mTopY(i) - 2.5" width="56" height="5" rx="1" :fill="moves.includes(i) ? 'var(--accent)' : 'var(--ink)'" />
        </template>
        <text v-if="moves.includes(i)" :x="MX + MWID + 14" :y="mTopY(i) + 4.5" class="m f-acc" font-size="13">{{ mark }}</text>
      </g>

      <!-- 变卦 -->
      <text x="16" y="460" class="s f-ink" font-size="19">{{ right.name }}</text>
      <text v-if="right.sub" x="20" y="478" class="m f-ink3" font-size="10.5">{{ right.sub }}</text>
      <text x="344" y="460" text-anchor="end" class="m f-ink4" font-size="10" letter-spacing="2">变 卦</text>

      <!-- 中间连接箭头：画在卦名下方，避开文字 -->
      <g v-for="i in moves" :key="'mc' + i">
        <line
          :x1="MX + MWID / 2" :y1="mTopY(i) + 10" :x2="MX + MWID / 2" :y2="mBotY(i) - 22"
          stroke="#A6331F" stroke-width="1.1" stroke-dasharray="4 4"
          :marker-end="'url(#' + id + 'a)'" opacity=".75"
        />
      </g>

      <g v-for="(r, i) in right.rows" :key="'mr' + i" :opacity="dim(i) ? .26 : 1">
        <rect v-if="moves.includes(i)" :x="MX - 6" :y="mBotY(i) - 14" :width="MWID + 12" height="28" rx="2" fill="var(--accent-wash)" opacity=".55" />
        <text :x="MX - 12" :y="mBotY(i) + 4" text-anchor="end" class="m f-ink3" font-size="11">{{ POS[i] }}</text>
        <rect v-if="!r.yin" :x="MX" :y="mBotY(i) - 2.5" :width="MWID" height="5" rx="1" :fill="moves.includes(i) ? 'var(--accent)' : 'var(--ink)'" />
        <template v-else>
          <rect :x="MX" :y="mBotY(i) - 2.5" width="56" height="5" rx="1" :fill="moves.includes(i) ? 'var(--accent)' : 'var(--ink)'" />
          <rect :x="MX + 72" :y="mBotY(i) - 2.5" width="56" height="5" rx="1" :fill="moves.includes(i) ? 'var(--accent)' : 'var(--ink)'" />
        </template>
        <text v-if="moves.includes(i)" :x="MX + MWID + 14" :y="mBotY(i) + 4.5" class="m f-acc" font-size="13">{{ mark === '○' ? '阴' : '阳' }}</text>
      </g>

      <text x="16" y="816" class="m f-ink3" font-size="10.5">{{ note || '○ 老阳变阴 · × 老阴变阳 · 静爻照抄' }}</text>
    </template>

    <!-- ================= 桌面：左右并排 ================= -->
    <template v-else>
      <!-- 卦名 -->
      <text x="198" y="42" text-anchor="middle" class="s f-ink" font-size="19">{{ left.name }}</text>
      <text x="198" y="62" text-anchor="middle" class="m f-ink3" font-size="10.5">{{ left.sub }}</text>
      <text x="496" y="42" text-anchor="middle" class="s f-ink" font-size="19">{{ right.name }}</text>
      <text x="496" y="62" text-anchor="middle" class="m f-ink3" font-size="10.5">{{ right.sub }}</text>
      <text x="198" y="86" text-anchor="middle" class="m f-ink4" font-size="10" letter-spacing="2">本 卦</text>
      <text x="496" y="86" text-anchor="middle" class="m f-ink4" font-size="10" letter-spacing="2">变 卦</text>

      <!-- 动爻连线 -->
      <g v-for="i in moves" :key="'c' + i">
        <path
          :d="`M262,${yOf(i)} C320,${yOf(i)} 382,${yOf(i)} 438,${yOf(i)}`"
          fill="none" stroke="#A6331F" stroke-width="1.1" stroke-dasharray="4 4"
          :marker-end="'url(#' + id + 'a)'" opacity=".75"
        />
      </g>

      <!-- 变卦动爻底纹 -->
      <rect v-for="i in moves" :key="'bg' + i" :x="436" :y="yOf(i) - 14" width="126" height="28" rx="2" fill="var(--accent-wash)" opacity=".55" />

      <!-- 本卦六爻 -->
      <g v-for="(r, i) in left.rows" :key="'l' + i" :opacity="dim(i) ? .26 : 1">
        <text :x="128" :y="yOf(i) + 4" text-anchor="end" class="m f-ink3" font-size="11">{{ POS[i] }}</text>
        <rect v-if="!r.yin" :x="LX" :y="yOf(i) - 2.5" :width="W" height="5" rx="1" :fill="moves.includes(i) ? 'var(--accent)' : 'var(--ink)'" />
        <template v-else>
          <rect :x="LX" :y="yOf(i) - 2.5" width="45" height="5" rx="1" :fill="moves.includes(i) ? 'var(--accent)' : 'var(--ink)'" />
          <rect :x="LX + 59" :y="yOf(i) - 2.5" width="45" height="5" rx="1" :fill="moves.includes(i) ? 'var(--accent)' : 'var(--ink)'" />
        </template>
        <text v-if="moves.includes(i)" x="262" :y="yOf(i) + 4.5" class="m f-acc" font-size="13">{{ mark }}</text>
      </g>

      <!-- 变卦六爻 -->
      <g v-for="(r, i) in right.rows" :key="'r' + i" :opacity="dim(i) ? .26 : 1">
        <rect v-if="!r.yin" :x="RX" :y="yOf(i) - 2.5" :width="W" height="5" rx="1" :fill="moves.includes(i) ? 'var(--accent)' : 'var(--ink)'" />
        <template v-else>
          <rect :x="RX" :y="yOf(i) - 2.5" width="45" height="5" rx="1" :fill="moves.includes(i) ? 'var(--accent)' : 'var(--ink)'" />
          <rect :x="RX + 59" :y="yOf(i) - 2.5" width="45" height="5" rx="1" :fill="moves.includes(i) ? 'var(--accent)' : 'var(--ink)'" />
        </template>
        <text v-if="moves.includes(i)" x="570" :y="yOf(i) + 4.5" class="m f-acc" font-size="13">{{ mark === '○' ? '阴' : '阳' }}</text>
      </g>

      <!-- 底注 -->
      <text x="24" y="392" class="m f-ink3" font-size="10.5">{{ note || '○ 老阳变阴 · × 老阴变阳 · 静爻照抄' }}</text>
    </template>
  </svg>
</template>
