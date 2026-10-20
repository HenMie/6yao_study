<script setup>
import { NConfigProvider, NMessageProvider, zhCN, dateZhCN } from 'naive-ui'
import { themeOverrides } from './theme'
import { useRoute } from 'vue-router'
const route = useRoute()
const nav = [
  { to: '/path', label: '学习路径' },
  { to: '/cast', label: '装卦台' },
  { to: '/walk', label: '断卦走查' },
  { to: '/cases', label: '案例' },
  { to: '/ref', label: '速查' },
  { to: '/manual', label: '断卦手册' }
]
</script>

<template>
  <n-config-provider :theme-overrides="themeOverrides" :locale="zhCN" :date-locale="dateZhCN">
    <n-message-provider>
      <header class="topbar">
        <div class="topbar-in">
          <router-link to="/path" class="brand">
            <span class="brand-mark"><i /><i /><i /></span>
            <span class="brand-txt">六爻研习社</span>
          </router-link>
          <nav class="nav">
            <router-link
              v-for="n in nav" :key="n.to" :to="n.to"
              :class="{ on: route.path.startsWith(n.to) }"
            >{{ n.label }}</router-link>
          </nav>
          <span class="topbar-meta">增删卜易 · 逐章精读</span>
        </div>
      </header>

      <router-view />
    </n-message-provider>
  </n-config-provider>
</template>

<style scoped>
.topbar {
  position: sticky; top: 0; z-index: 50;
  background: rgba(251, 249, 244, .94); backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--rule);
}
.topbar-in {
  max-width: 1160px; margin: 0 auto; padding: 0 24px; height: 60px;
  display: flex; align-items: center; gap: 32px;
}
.brand { display: flex; align-items: center; gap: 10px; text-decoration: none; color: inherit; flex: none; }
.brand-mark { width: 26px; display: grid; gap: 3px; }
.brand-mark i { display: block; height: 3px; background: var(--ink); }
.brand-mark i:nth-child(2) { background: var(--accent); }
.brand-mark i:nth-child(4) { opacity: .25; }
.brand-txt { font-family: var(--serif); font-size: 17px; font-weight: 600; letter-spacing: .06em; }
.nav { display: flex; gap: 2px; flex: 1; }
.nav a {
  padding: 6px 14px; border-radius: 2px; color: var(--ink-2); font-size: 14px;
  letter-spacing: .04em; text-decoration: none; position: relative;
}
.nav a:hover { background: var(--paper-2); }
.nav a.on { color: var(--ink); font-weight: 600; }
.nav a.on::after {
  content: ''; position: absolute; left: 14px; right: 14px; bottom: -19px;
  height: 2px; background: var(--accent);
}
.topbar-meta { font-family: var(--mono); font-size: 13px; color: var(--ink-3); white-space: nowrap; }
@media (max-width: 1239px) {
  .topbar-in { height: auto; flex-wrap: wrap; padding-bottom: 6px; gap: 12px; }
  .nav { order: 3; width: 100%; overflow-x: auto; }
  .nav a.on::after { bottom: -6px; }
  .topbar-meta { display: none; }
}
</style>
