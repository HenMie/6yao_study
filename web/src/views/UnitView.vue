<script setup>
import { computed } from 'vue'
import { NCard, NButton } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import { VOLS, STAMPS } from '../content/data'
import { toggleDone, isDone } from '../core/store'
import VideoRef from '../components/VideoRef.vue'

const route = useRoute()
const router = useRouter()

const units = computed(() => {
  const out = []
  VOLS.forEach(v => v.chapters.forEach(c => out.push({ ...c, vol: v.id, volTitle: v.title })))
  return out
})
const i = computed(() => Math.max(0, units.value.findIndex(u => u.id === route.params.id)))
const u = computed(() => units.value[i.value])
</script>

<template>
  <div class="wrap" style="max-width:820px">
    <div class="page-head">
      <div class="kicker">§{{ String(i + 1).padStart(2, '0') }} · P{{ u.vol.slice(1) }} {{ u.volTitle }}</div>
      <h1>{{ u.t }}</h1>
      <p class="lede" style="display:flex;gap:12px;align-items:center">
        <VideoRef :vid="u.vol" :t="STAMPS[u.id] || 0" />
        <span>单元 {{ i + 1 }} / {{ units.length }}</span>
      </p>
    </div>

    <n-card style="margin-bottom:20px">
      <p style="font-size:15px;line-height:1.9">{{ u.p }}</p>
      <div style="height:1px;background:var(--rule);margin:16px 0" />
      <div class="tiny muted" style="letter-spacing:.1em;margin-bottom:8px">这一节的抓手</div>
      <ul style="margin:0;padding-left:20px;font-size:13px;color:var(--ink-2)">
        <li v-for="k in u.keys" :key="k" style="margin-bottom:4px">{{ k }}</li>
      </ul>
    </n-card>

    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <n-button :type="isDone(u.id) ? 'default' : 'primary'" @click="toggleDone(u.id, u.t)">
        {{ isDone(u.id) ? '标记为未学' : '标记为已学' }}
      </n-button>
      <n-button quaternary @click="router.push('/cast')">去装卦台试一次 →</n-button>
      <n-button v-if="i > 0" quaternary @click="router.push('/unit/' + units[i - 1].id)">← 上一单元</n-button>
      <n-button v-if="i < units.length - 1" quaternary @click="router.push('/unit/' + units[i + 1].id)">下一单元 →</n-button>
    </div>
  </div>
</template>
