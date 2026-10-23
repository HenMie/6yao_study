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
            <span class="brand-seal" aria-hidden="true">爻</span>
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

      <footer class="site-foot">
        <span class="site-foot-brand">六爻研习社</span>
        <span class="site-foot-credit">
          <span>作者 Chouann</span>
          <span class="site-foot-sep">·</span>
          <a href="https://github.com/HenMie/6yao_study" target="_blank" rel="noopener noreferrer">GitHub 项目</a>
        </span>
      </footer>
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
/* 品牌方印：朱砂底、纸色「爻」字、内缘细线，沿用 seal 语言 */
.brand-seal {
  width: 30px; height: 30px; flex: none;
  display: grid; place-items: center;
  background: var(--accent); color: var(--paper);
  font-family: var(--serif); font-weight: 900; font-size: 17px; line-height: 1;
  border-radius: 2px;
  box-shadow: inset 0 0 0 1.5px rgba(251, 249, 244, .3);
}
.brand-txt { font-family: var(--serif); font-size: 17px; font-weight: 600; letter-spacing: .06em; }
.nav { display: flex; gap: 2px; flex: 1; }
.nav a {
  padding: 6px 14px; border-radius: 2px; color: var(--ink-2); font-size: 14px;
  letter-spacing: .04em; text-decoration: none; position: relative;
}
.nav a:hover { background: var(--paper-2); }
.nav a.on { color: var(--ink); font-weight: 600; }
/* 当前项底线随路由滑动生长 */
.nav a::after {
  content: ''; position: absolute; left: 14px; right: 14px; bottom: -19px;
  height: 2px; background: var(--accent);
  transform: scaleX(0); transform-origin: left;
  transition: transform .18s cubic-bezier(.16, 1, .3, 1);
}
.nav a.on::after { transform: scaleX(1); }
.topbar-meta { font-family: var(--mono); font-size: 13px; color: var(--ink-3); white-space: nowrap; }

.site-foot {
  max-width: 1160px; margin: 0 auto;
  padding: 18px 24px 30px;
  border-top: 1px solid var(--rule);
  display: flex; align-items: baseline; justify-content: space-between; gap: 16px;
  font-family: var(--mono); font-size: 11px;
  letter-spacing: .1em; color: var(--ink-4);
}
.site-foot-brand {
  font-family: var(--serif); font-size: 12.5px;
  letter-spacing: .12em; color: var(--ink-3);
}
.site-foot-credit { display: flex; align-items: baseline; gap: 7px; }
.site-foot a {
  color: var(--ink-3); text-decoration: none;
  border-bottom: 1px solid var(--rule-2); padding-bottom: 1px;
}
.site-foot a:hover { color: var(--accent); border-bottom-color: var(--accent); }
.site-foot-sep { color: var(--rule-2); }

@media (max-width: 640px) {
  .site-foot { flex-direction: column; align-items: flex-start; gap: 6px; }
}

@media (max-width: 1239px) {
  .topbar-in { height: auto; flex-wrap: wrap; padding-bottom: 6px; gap: 12px; }
  .nav { order: 3; width: 100%; overflow-x: auto; }
  .nav a.on::after { bottom: -6px; }
  .topbar-meta { display: none; }
}

/* ---------- 手机端顶栏 ---------- */
@media (max-width: 640px) {
  .topbar { --topbar-h: 96px; }
  .topbar-in {
    max-width: none;
    padding: 0 16px;
    padding-top: env(safe-area-inset-top);
    gap: 0;
    flex-wrap: nowrap;
    flex-direction: column;
    align-items: stretch;
  }
  .brand { height: 52px; }
  .brand-txt { font-size: 16px; letter-spacing: .05em; }
  .brand-seal { width: 26px; height: 26px; font-size: 15px; }

  .nav {
    order: 0;
    width: auto;
    flex: 0 0 44px;
    height: 44px;
    min-height: 44px;
    gap: 0;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    /* 左右渐隐提示还有内容可滑 */
    mask-image: linear-gradient(to right, transparent 0, #000 10px, #000 calc(100% - 10px), transparent 100%);
  }
  .nav::-webkit-scrollbar { display: none; }
  .nav a {
    display: inline-flex;
    align-items: center;
    flex: none;
    height: 44px;
    padding: 0 12px;
    font-size: 14px;
    white-space: nowrap;
    border-radius: 0;
  }
  .nav a:first-child { padding-left: 0; }
  .nav a.on::after { left: 12px; right: 12px; bottom: 4px; }
  .nav a:first-child.on::after { left: 0; }

  .site-foot {
    max-width: none;
    padding: 16px 16px calc(20px + env(safe-area-inset-bottom));
  }
  .site-foot-credit { flex-wrap: wrap; }
}
</style>
