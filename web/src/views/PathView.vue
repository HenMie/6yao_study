<script setup>
import { ref, computed } from 'vue'
import { NCard, NButton, NProgress, NTag } from 'naive-ui'
import { useRouter } from 'vue-router'
import { VOLS, STAMPS } from '../content/data'
import { state, isDone } from '../core/store'
import VideoRef from '../components/VideoRef.vue'

const router = useRouter()

const units = computed(() => {
  const out = []
  VOLS.forEach(v => v.chapters.forEach(c => out.push({ ...c, vol: v.id, volTitle: v.title })))
  return out
})
const doneN = computed(() => units.value.filter(u => isDone(u.id)).length)
const pct = computed(() => Math.round(doneN.value / units.value.length * 100))
const next = computed(() => units.value.find(u => !isDone(u.id)) || units.value[units.value.length - 1])

const openVol = ref(next.value.vol)
const curVol = computed(() => VOLS.find(v => v.id === openVol.value) || VOLS[0])
const volDone = (v) => v.chapters.filter(c => isDone(c.id)).length
const quizTimes = computed(() => state.value.quiz.length)
</script>

<template>
  <div class="wrap">
    <div class="page-head">
      <div class="kicker">Study Path</div>
      <h1>学习路径</h1>
      <p class="lede">8 集视频，约 5 小时，整理为 {{ units.length }} 个学习单元。每节有规则讲解、自测解析与原片画面定位；按自己的节奏逐项练习。</p>
    </div>

    <n-card style="margin-bottom:24px;border-top:2px solid var(--accent)">
      <div class="kicker">§{{ String(units.findIndex(u => u.id === next.id) + 1).padStart(2, '0') }} · 当前单元</div>
      <h2 style="font-size:26px;margin:8px 0">{{ next.t }}</h2>
      <p style="color:var(--ink-2);font-size:15px;max-width:56ch">{{ next.p }}</p>
      <div style="display:flex;align-items:center;gap:12px;margin-top:16px">
        <span class="mono tiny muted">{{ state.last ? '上次停在 ' + state.last : '尚未开始' }}　·　{{ next.volTitle }}</span>
        <span style="flex:1" />
        <n-button type="primary" @click="router.push('/unit/' + next.id)">继续学习 →</n-button>
      </div>
    </n-card>

    <div style="display:flex;gap:32px;margin-bottom:16px">
      <div style="text-align:right">
        <div class="mono" style="font-size:22px">{{ doneN }}<span class="tiny muted">/{{ units.length }}</span></div>
        <div class="tiny muted">已学单元</div>
      </div>
      <div style="text-align:right">
        <div class="mono" style="font-size:22px">{{ pct }}%</div>
        <div class="tiny muted">总进度</div>
      </div>
      <div style="text-align:right">
        <div class="mono" style="font-size:22px">{{ quizTimes }}</div>
        <div class="tiny muted">判卷次数</div>
      </div>
    </div>
    <n-progress type="line" :percentage="pct" :show-indicator="false" style="margin-bottom:24px" />

    <div class="vol-cards">
      <div
        v-for="v in VOLS" :key="v.id" class="vol-card"
        :class="{ on: openVol === v.id }"
        role="button" tabindex="0"
        :aria-expanded="openVol === v.id"
        :aria-controls="`vol-${v.id}`"
        :aria-label="`${v.title}，${volDone(v)}/${v.chapters.length} 个单元已学，${openVol === v.id ? '收起' : '展开'}单元`"
        @click="openVol = openVol === v.id ? null : v.id"
        @keydown.enter.prevent="openVol = openVol === v.id ? null : v.id"
        @keydown.space.prevent="openVol = openVol === v.id ? null : v.id"
      >
        <div class="vc-top">
          <span class="vol-no">{{ v.vol }}</span>
          <span class="mono tiny muted">{{ v.dur }} · {{ v.chapters.length }} 单元</span>
          <span style="flex:1" />
          <span v-if="v.id === next.vol" class="seal">在这里</span>
        </div>
        <h3>{{ v.title }}</h3>
        <p class="vc-goal">{{ v.goal }}</p>
        <n-progress type="line" :percentage="Math.round(volDone(v) / v.chapters.length * 100)" :show-indicator="false" />
        <div class="vc-foot">
          <span class="mono tiny">{{ volDone(v) }}/{{ v.chapters.length }}</span>
          <span class="tiny muted">{{ openVol === v.id ? '收起 ↑' : '展开 ↓' }}</span>
        </div>
      </div>
    </div>

    <n-card v-if="openVol" :id="`vol-${curVol.id}`" style="margin-top:24px" :title="`P${curVol.vol} · ${curVol.title}`">
      <template #header-extra>
        <span class="tiny muted">{{ curVol.chapters.length }} 个单元　<VideoRef :vid="curVol.id" /></span>
      </template>
      <div
        v-for="(c, i) in curVol.chapters" :key="c.id"
        class="unit-row" :class="{ done: isDone(c.id) }"
      >
        <router-link class="unit" :class="{ done: isDone(c.id) }" :to="'/unit/' + c.id" :aria-label="`${c.t}${isDone(c.id) ? '，已学' : '，未学'}`">
          <div class="idx">{{ String(units.findIndex(u => u.id === c.id) + 1).padStart(2, '0') }}</div>
          <div>
            <div class="t">{{ c.t }}</div>
            <div class="p">{{ c.p }}</div>
            <div class="keys"><span v-for="k in c.keys" :key="k">{{ k }}</span></div>
          </div>
          <div class="tiny muted">{{ isDone(c.id) ? '已学' : '未学' }}</div>
        </router-link>
        <div class="unit-video"><VideoRef :vid="curVol.id" :t="STAMPS[c.id]" /></div>
      </div>
    </n-card>
  </div>
</template>
