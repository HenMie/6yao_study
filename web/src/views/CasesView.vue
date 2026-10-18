<script setup>
import { computed } from 'vue'
import { NCard, NButton, NAlert } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import { CASES } from '../content/data'
import { paipan, GAN, ZHI } from '../core/paipan'
import GuaPan from '../components/GuaPan.vue'
import VideoRef from '../components/VideoRef.vue'

const route = useRoute()
const router = useRouter()

const cur = computed(() => CASES.find(c => c.id === route.params.id) || CASES[0])

function parseGz(s) {
  const m = s.match(/([甲乙丙丁戊己庚辛壬癸])([子丑寅卯辰巳午未申酉戌亥])日/)
  const mm = s.match(/([子丑寅卯辰巳午未申酉戌亥])月/)
  return {
    dg: m ? GAN.indexOf(m[1]) : 0,
    dz: m ? ZHI.indexOf(m[2]) : 0,
    mz: mm ? mm[1] : '子'
  }
}

const p = computed(() => {
  const c = cur.value
  const g = parseGz(c.gz)
  return paipan(c.yao, new Date(), {
    day: { gan: g.dg, zhi: g.dz },
    gzText: { month: g.mz + '月', day: GAN[g.dg] + ZHI[g.dz] + '日' }
  })
})
</script>

<template>
  <div class="wrap">
    <div class="page-head">
      <div class="kicker">Cases</div>
      <h1>案例库</h1>
      <p class="lede">每张示例卦只练一两个规则。卦盘由排盘引擎按爻复算，解读是按课程规则作的推演，不是古籍原文。</p>
    </div>

    <div class="case-shell">
      <div>
        <div
          v-for="c in CASES" :key="c.id"
          style="padding:10px 12px;cursor:pointer;border-left:2px solid transparent"
          :style="c.id === cur.id ? 'background:var(--paper-2);border-left-color:var(--accent)' : ''"
          @click="router.push('/cases/' + c.id)"
        >
          <div class="mono tiny muted"><VideoRef :vid="c.src" /></div>
          <div style="font-size:13px;font-weight:500">{{ c.title }}</div>
          <div class="tiny muted">{{ c.focus }}</div>
        </div>
      </div>

      <div class="case-detail">
        <div>
          <n-card>
            <template #header><span class="tiny muted">卦象</span></template>
            <template #header-extra>
              <span class="mono tiny muted">{{ p.ganzhi.monthText }} {{ p.ganzhi.dayText }}</span>
            </template>
            <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px">
              <strong class="serif" style="font-size:17px">{{ p.ben.name }}</strong>
              <span class="seal plain">{{ p.ben.gong }}宫 · {{ p.ben.type }}</span>
              <span v-if="p.ben.chong" class="seal">六冲</span>
              <span v-if="p.ben.he" class="seal">六合</span>
            </div>
            <GuaPan :p="p" />
          </n-card>
        </div>

        <div>
          <h2 style="font-size:22px">{{ cur.title }}</h2>
          <p class="muted" style="font-size:14px;margin-top:4px">{{ cur.q }}</p>
          <span class="seal plain" style="margin:10px 0 18px;display:inline-block">{{ cur.focus }}</span>

          <div class="tiny muted" style="letter-spacing:.12em;margin-bottom:6px">示例解读</div>
          <p style="font-size:15px;line-height:1.95">{{ cur.an }}</p>

          <div style="height:1px;background:var(--rule);margin:16px 0" />
          <n-alert type="default" :bordered="false" style="font-size:12px">
            此卦为按课程规则构造的示例，用于演示判读路径；不是《增删卜易》原文，也不是课件板书摘录。
          </n-alert>

          <div style="display:flex;gap:10px;margin-top:16px">
            <n-button size="small" quaternary @click="router.push('/walk')">用走查器走一遍 →</n-button>
            <n-button size="small" quaternary @click="router.push('/manual')">去手册看这一章</n-button>
          </div>
          <div class="mono tiny muted" style="margin-top:14px">
            出自 <VideoRef :vid="cur.src" /> · {{ cur.zhang }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
