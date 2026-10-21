<script setup>
/* ============================================================
 * DiagramBlock  图示块
 * 由 data.js 的 { dia: { type, cap, note, ...props } } 驱动。
 * 版式：纸色题头（图 + 说明）+ 白底图版 + 可选脚注。
 * ============================================================ */
import { computed } from 'vue'
import WuxingRing from './diagrams/WuxingRing.vue'
import RefScale from './diagrams/RefScale.vue'
import Wheel12 from './diagrams/Wheel12.vue'
import RelationGraph from './diagrams/RelationGraph.vue'
import CoinFaces from './diagrams/CoinFaces.vue'
import XunStrip from './diagrams/XunStrip.vue'
import YaoStack from './diagrams/YaoStack.vue'
import GuaPair from './diagrams/GuaPair.vue'
import SancaiChart from './diagrams/SancaiChart.vue'
import ShiWeiTrack from './diagrams/ShiWeiTrack.vue'
import SixShen from './diagrams/SixShen.vue'
import Ladder from './diagrams/Ladder.vue'
import TreeFlow from './diagrams/TreeFlow.vue'
import SeasonBand from './diagrams/SeasonBand.vue'
import ChangeFlow from './diagrams/ChangeFlow.vue'
import ChainFlow from './diagrams/ChainFlow.vue'
import SanheGrid from './diagrams/SanheGrid.vue'

const props = defineProps({
  spec: { type: Object, required: true }
})

const MAP = {
  wuxing: WuxingRing,
  refscale: RefScale,
  wheel: Wheel12,
  relation: RelationGraph,
  coin: CoinFaces,
  xun: XunStrip,
  yaostack: YaoStack,
  guapair: GuaPair,
  sancai: SancaiChart,
  shiwei: ShiWeiTrack,
  sixshen: SixShen,
  ladder: Ladder,
  tree: TreeFlow,
  season: SeasonBand,
  change: ChangeFlow,
  chain: ChainFlow,
  sanhe: SanheGrid
}

const comp = computed(() => MAP[props.spec.type])
const rest = computed(() => {
  const { type, cap, note, ...others } = props.spec
  return others
})

/* 手机端（≤640px）：横向多列图（本卦变卦对照、判断分叉、作用链、变化方向）
 * 在组件内按 360 单位窄画布重排，其余图等比缩放即可读。
 * 因此这里不再需要横向滚动容器与滑动提示。 */
</script>

<template>
  <figure v-if="comp" class="dia">
    <figcaption v-if="spec.cap" class="dia-cap">
      <span class="dia-tag">图</span>
      <span>{{ spec.cap }}</span>
    </figcaption>
    <div class="dia-body">
      <component :is="comp" v-bind="rest" />
    </div>
    <p v-if="spec.note" class="dia-note">{{ spec.note }}</p>
  </figure>
</template>

<style scoped>
/* 手机端：横向多列图已在组件内按窄画布重排，这里只保留内距 */
@media (max-width: 640px) {
  .dia-body { padding: 12px 12px 8px; }
}
</style>
