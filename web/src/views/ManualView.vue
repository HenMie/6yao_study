<script setup>
import { computed } from 'vue'
import { NCard, NButton } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import { VOLS, MANUAL_EXTRA } from '../content/data'
import VideoRef from '../components/VideoRef.vue'

const route = useRoute()
const router = useRouter()

/* 章号：正文 18 章（章九~章廿六）+ 四时旺相 + 附录 3 章 = 22 章
   注：课件里「旬空章」与「归魂游魂章」同标第二十六，属课件重号，本站按附录处理 */
const ZHANG = {
  c14: '章九', c15: '章十', c16: '章十一', c17: '章十二', c18: '章十三',
  c19: '章十四', c20: '章十五', c21: '章十六', c22: '章十七', c23: '章十八',
  c24: '章十九', c25: '章二十', c26: '章廿一', c27: '章廿二', c28: '章廿三',
  c29: '章廿四', c30: '章廿五', c31: '章廿六',
  m01: '附', c32: '附', c33: '附', c34: '附'
}

const chs = computed(() => {
  const out = []
  VOLS.slice(2).forEach(v => {
    v.chapters.forEach(c => {
      ;(MANUAL_EXTRA || []).filter(m => m.before === c.id).forEach(m => out.push({ ...m, volTitle: v.title }))
      out.push({ ...c, vol: v.id, volTitle: v.title })
    })
  })
  return out
})

const cur = computed(() => chs.value.find(c => c.id === route.params.id) || chs.value[0])
const idx = computed(() => chs.value.indexOf(cur.value))
const titleOf = (c) => c.mt || c.t
</script>

<template>
  <div class="wrap">
    <div class="page-head">
      <div class="kicker">Manual</div>
      <h1>断卦手册</h1>
      <p class="lede">《增删卜易》逐章精读的沉淀。22 章按原书章序排，每章都能回到视频里的那一段。</p>
    </div>

    <div style="display:grid;grid-template-columns:220px 1fr;gap:32px;align-items:start" class="manual-grid">
      <div style="position:sticky;top:80px;max-height:calc(100vh - 100px);overflow:auto">
        <a
          v-for="c in chs" :key="c.id"
          :href="'#/manual/' + c.id"
          style="display:flex;gap:10px;align-items:center;height:36px;padding:0 10px;border-radius:2px;text-decoration:none"
          :style="c.id === cur.id ? 'background:var(--paper-2);border-left:2px solid var(--accent)' : 'border-left:2px solid transparent'"
        >
          <span class="mono tiny muted" style="width:44px;flex:none">{{ ZHANG[c.id] || '' }}</span>
          <span style="font-size:13px" :style="{ color: c.id === cur.id ? 'var(--ink)' : 'var(--ink-2)' }">{{ titleOf(c) }}</span>
        </a>
      </div>

      <div style="max-width:68ch">
        <div class="mono tiny muted" style="letter-spacing:.1em">{{ ZHANG[cur.id] || '' }} · {{ cur.volTitle }}</div>
        <h2 style="font-size:26px;margin:6px 0 4px">{{ titleOf(cur) }}</h2>
        <div class="mono tiny muted" style="margin-bottom:20px">对应 <VideoRef :vid="cur.vol" /></div>

        <p class="serif" style="font-size:16px;line-height:1.9">{{ cur.p }}</p>
        <div style="height:1px;background:var(--rule);margin:16px 0" />
        <div class="tiny muted" style="letter-spacing:.12em;margin-bottom:8px">记住这两条</div>
        <ul style="font-size:14px;line-height:1.9;padding-left:18px;color:var(--ink-2)">
          <li v-for="k in cur.keys" :key="k">{{ k }}</li>
        </ul>

        <div style="margin-top:28px;height:56px;background:var(--paper-2);border-radius:2px;display:flex;align-items:center;justify-content:space-between;padding:0 16px">
          <span style="font-size:13px;color:var(--ink-2)">这一章可以这样练</span>
          <n-button size="small" quaternary @click="router.push('/cast')">装卦台试一次 →</n-button>
        </div>

        <div style="display:flex;justify-content:space-between;margin-top:24px">
          <router-link v-if="idx > 0" :to="'/manual/' + chs[idx - 1].id" style="font-size:13px">← {{ titleOf(chs[idx - 1]) }}</router-link>
          <span v-else />
          <router-link v-if="idx < chs.length - 1" :to="'/manual/' + chs[idx + 1].id" style="font-size:13px">{{ titleOf(chs[idx + 1]) }} →</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media (max-width: 1239px) { .manual-grid { grid-template-columns: 1fr !important; } }
</style>
