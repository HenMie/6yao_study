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
