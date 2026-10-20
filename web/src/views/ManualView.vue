<script setup>
import { computed } from 'vue'
import { NButton } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import { MANUAL_CHAPTERS } from '../content/data'
import ContentBlocks from '../components/ContentBlocks.vue'
import LessonExercise from '../components/LessonExercise.vue'

const route = useRoute()
const router = useRouter()

const chs = computed(() => MANUAL_CHAPTERS)

const cur = computed(() => chs.value.find(c => c.id === route.params.id) || chs.value[0])
const idx = computed(() => chs.value.indexOf(cur.value))
const titleOf = (c) => c.mt || c.t
</script>

<template>
  <div class="wrap">
    <div class="page-head">
      <div class="kicker">Manual</div>
      <h1>断卦手册</h1>
      <p class="lede">{{ chs.length }} 个条目：18 章正文、四时旺相补章、3 篇附章与1篇导读。与学习单元共用完整讲解，可逐章对照。</p>
    </div>

    <div style="display:grid;grid-template-columns:240px minmax(0,1fr);gap:32px;align-items:start" class="manual-grid">
      <div style="position:sticky;top:80px;max-height:calc(100vh - 100px);overflow:auto">
        <a
          v-for="c in chs" :key="c.id"
          :href="'#/manual/' + c.id"
          style="display:flex;gap:10px;align-items:center;min-height:40px;padding:6px 10px;border-radius:2px;text-decoration:none"
          :style="c.id === cur.id ? 'background:var(--paper-2);border-left:2px solid var(--accent)' : 'border-left:2px solid transparent'"
        >
          <span class="mono tiny muted" style="width:44px;flex:none">{{ c.label }}</span>
          <span style="font-size:14px" :style="{ color: c.id === cur.id ? 'var(--ink)' : 'var(--ink-2)' }">{{ titleOf(c) }}</span>
        </a>
      </div>

      <div class="manual-body" style="max-width:68ch">
        <div class="mono tiny muted" style="letter-spacing:.1em">{{ cur.label }} · {{ cur.volTitle }}</div>
        <h2 style="font-size:26px;margin:6px 0 20px">{{ titleOf(cur) }}</h2>

        <p class="serif" style="font-size:16px;line-height:1.9">{{ cur.p }}</p>
        <div style="height:1px;background:var(--rule);margin:16px 0" />
        <div class="tiny muted" style="letter-spacing:.12em;margin-bottom:8px">本章抓手</div>
        <ul style="font-size:15px;line-height:1.9;padding-left:18px;color:var(--ink-2)">
          <li v-for="k in cur.keys" :key="k">{{ k }}</li>
        </ul>
        <ContentBlocks :blocks="cur.d" />
        <LessonExercise v-if="cur.exercise" :key="cur.id" :exercise="cur.exercise" />
        <p class="tiny muted" style="margin-top:20px">本站依课程内容整理转述，演算与自测为本站编写。附章沿用课程顺序，不为重号擅补章次。</p>

        <div style="margin-top:28px;height:56px;background:var(--paper-2);border-radius:2px;display:flex;align-items:center;justify-content:space-between;padding:0 16px">
          <span style="font-size:14px;color:var(--ink-2)">这一章可以这样练</span>
          <n-button size="small" quaternary @click="router.push('/cast')">装卦台试一次 →</n-button>
        </div>

        <div style="display:flex;justify-content:space-between;margin-top:24px">
          <router-link v-if="idx > 0" :to="'/manual/' + chs[idx - 1].id" style="font-size:14px">← {{ titleOf(chs[idx - 1]) }}</router-link>
          <span v-else />
          <router-link v-if="idx < chs.length - 1" :to="'/manual/' + chs[idx + 1].id" style="font-size:14px">{{ titleOf(chs[idx + 1]) }} →</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 手册正文保持 68ch 阅读宽度；图示允许借右侧栏宽，避免 SVG 缩得过小 */
.manual-body :deep(.dia) {
  width: calc(100% + 120px);
  max-width: 720px;
}
@media (max-width: 900px) {
  .manual-body :deep(.dia) { width: 100%; }
}
@media (max-width: 1239px) {
  .manual-grid { grid-template-columns: 1fr !important; }
  .manual-grid > :first-child { position: static !important; max-height: none !important; display: flex; gap: 4px; overflow-x: auto !important; padding-bottom: 8px; }
  .manual-grid > :first-child a { flex: 0 0 auto; }
}
</style>
