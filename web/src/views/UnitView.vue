<script setup>
import { computed } from 'vue'
import { NButton } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import { VOLS, STAMPS } from '../content/data'
import { toggleDone, isDone } from '../core/store'
import VideoRef from '../components/VideoRef.vue'
import ContentBlocks from '../components/ContentBlocks.vue'

const route = useRoute()
const router = useRouter()

const units = computed(() => {
  const out = []
  VOLS.forEach(v => v.chapters.forEach(c => out.push({ ...c, vol: v.id, volTitle: v.title })))
  return out
})
const i = computed(() => Math.max(0, units.value.findIndex(u => u.id === route.params.id)))
const u = computed(() => units.value[i.value])
const hasDetail = computed(() => Array.isArray(u.value.d) && u.value.d.length > 0)
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

    <!-- 本节速览：概述 + 抓手 -->
    <section class="brief">
      <div class="sec-label">本节速览</div>
      <p class="brief-p">{{ u.p }}</p>
      <div class="brief-rule" />
      <div class="sec-label">这一节的抓手</div>
      <ul class="keys">
        <li v-for="k in u.keys" :key="k">{{ k }}</li>
      </ul>
    </section>

    <!-- 分节讲解 -->
    <ContentBlocks v-if="hasDetail" :blocks="u.d" />

    <!-- 无扩写的单元兜底提示（理论上 34 个单元都已扩写） -->
    <p v-else class="tiny muted" style="margin-top:20px">本单元暂无分节讲解，要点见上方速览。</p>

    <!-- 练习条 -->
    <div class="drill">
      <span class="drill-t">这一节可以这样练</span>
      <span class="drill-links">
        <n-button size="small" quaternary @click="router.push('/cast')">装卦台试一次 →</n-button>
        <n-button size="small" quaternary @click="router.push('/walk')">断卦走查走一遍 →</n-button>
        <n-button size="small" quaternary @click="router.push('/ref')">回速查卡补漏 →</n-button>
      </span>
    </div>

    <!-- 口径说明 -->
    <p class="tiny muted note">
      本页内容为课件要点的本站整理转述（按《增删卜易》原章次序），非板书逐字记录；老师原话请回视频听。
    </p>

    <!-- 底部操作 -->
    <div class="foot">
      <div class="foot-nav">
        <router-link v-if="i > 0" :to="'/unit/' + units[i - 1].id" class="fn-link">
          <span class="tiny muted">← 上一单元</span>
          <span class="fn-t">{{ units[i - 1].t }}</span>
        </router-link>
        <span v-else />
        <router-link v-if="i < units.length - 1" :to="'/unit/' + units[i + 1].id" class="fn-link fn-next">
          <span class="tiny muted">下一单元 →</span>
          <span class="fn-t">{{ units[i + 1].t }}</span>
        </router-link>
      </div>
      <div class="foot-act">
        <n-button :type="isDone(u.id) ? 'default' : 'primary'" @click="toggleDone(u.id, u.t)">
          {{ isDone(u.id) ? '标记为未学' : '标记为已学' }}
        </n-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ---------- 速览区 ---------- */
.brief {
  background: var(--paper-2);
  border: 1px solid var(--rule);
  border-radius: 2px;
  padding: 18px 22px 16px;
  margin-bottom: 10px;
}
.sec-label {
  font-family: var(--mono); font-size: 11px;
  letter-spacing: .18em; color: var(--ink-3);
  margin-bottom: 8px;
}
.brief-p { font-size: 15px; line-height: 1.9; color: var(--ink); margin: 0; }
.brief-rule { height: 1px; background: var(--rule-2); margin: 14px 0; }
.keys { margin: 0; padding: 0; list-style: none; }
.keys li {
  position: relative; padding: 0 0 5px 18px;
  font-size: 14px; line-height: 1.8; color: var(--ink-2);
}
.keys li::before {
  content: ''; position: absolute; left: 0; top: .9em;
  width: 9px; height: 2px; background: var(--accent);
}

/* ---------- 练习条 ---------- */
.drill {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; flex-wrap: wrap;
  height: 56px; padding: 0 18px;
  background: var(--paper-2); border-radius: 2px;
  margin-top: 26px;
}
.drill-t { font-size: 13px; color: var(--ink-2); flex: none; }
.drill-links { display: flex; gap: 2px; flex-wrap: wrap; }

.note { margin-top: 14px; line-height: 1.7; }

/* ---------- 底部导航 ---------- */
.foot {
  margin-top: 28px; padding-top: 18px;
  border-top: 1px solid var(--rule);
  display: flex; gap: 16px; align-items: flex-end; justify-content: space-between;
}
.foot-nav {
  flex: 1; display: flex; justify-content: space-between; gap: 16px;
  min-width: 0;
}
.fn-link { text-decoration: none; max-width: 46%; display: flex; flex-direction: column; gap: 2px; }
.fn-next { text-align: right; margin-left: auto; }
.fn-t {
  font-family: var(--serif); font-size: 14px; color: var(--ink);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.fn-link:hover .fn-t { color: var(--accent); }
.foot-act { flex: none; }
</style>
