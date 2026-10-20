<script setup>
import { computed } from 'vue'
import { NCard, NButton, NAlert } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import { CASES } from '../content/data'
import { paipan, GAN, ZHI } from '../core/paipan'
import GuaPan from '../components/GuaPan.vue'

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
      <p class="lede">{{ CASES.length }} 则案例：课程卦例概要与本站练习示例分别标注。卦盘按爻复算，逐步读作用链。</p>
    </div>

    <div class="case-shell">
      <div>
        <div v-for="c in CASES" :key="c.id" class="case-entry">
          <router-link
            class="case-item"
            :class="{ on: c.id === cur.id }"
            :to="'/cases/' + c.id"
            :aria-current="c.id === cur.id ? 'page' : undefined"
            :aria-label="`${c.title}，${c.focus}${c.id === cur.id ? '，当前案例' : ''}`"
          >
            <div style="font-size:14px;font-weight:500">{{ c.title }}</div>
            <div class="tiny muted">{{ c.focus }}</div>
          </router-link>
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
          <p class="muted" style="font-size:15px;margin-top:4px">{{ cur.q }}</p>
          <span class="seal plain" style="margin:10px 0 18px;display:inline-block">{{ cur.focus }}</span>

          <div class="tiny muted" style="letter-spacing:.12em;margin-bottom:6px">{{ cur.origin === 'course' ? '课程卦例 · 本站概要' : '本站练习示例' }}</div>
          <p style="font-size:16px;line-height:1.95">{{ cur.an }}</p>

          <div style="height:1px;background:var(--rule);margin:16px 0" />
          <n-alert type="default" :bordered="false" style="font-size:14px">
            {{ cur.origin === 'course' ? '课程卦例为本站概要转述，便于对照规则。' : '本卦为本站构造的规则练习，用于熟悉判定步骤。' }}
          </n-alert>

          <div style="display:flex;gap:10px;margin-top:16px">
            <n-button size="small" quaternary @click="router.push('/walk')">用走查器走一遍 →</n-button>
            <n-button size="small" quaternary @click="router.push('/manual/' + (cur.unit || ({k1:'c14', k2:'c21', k3:'c24', k4:'c34', k5:'c13'}[cur.id])))">去手册看这一章</n-button>
          </div>
          <div class="mono tiny muted" style="margin-top:14px">
            {{ cur.origin === 'course' ? '课程卦例' : '规则练习' }} · {{ cur.zhang }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
