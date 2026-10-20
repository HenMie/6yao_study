import { createRouter, createWebHashHistory } from 'vue-router'
import { VOLS, MANUAL_CHAPTERS } from './content/data'

import PathView from './views/PathView.vue'
import UnitView from './views/UnitView.vue'
import CastView from './views/CastView.vue'
import WalkView from './views/WalkView.vue'
import CasesView from './views/CasesView.vue'
import RefView from './views/RefView.vue'
import ManualView from './views/ManualView.vue'

// hash 模式：部署到任意静态托管都不用改服务器配置
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/path' },
    { path: '/path', name: 'path', component: PathView, meta: { title: '学习路径', nav: true } },
    { path: '/unit/:id', name: 'unit', component: UnitView },
    { path: '/cast', name: 'cast', component: CastView, meta: { title: '装卦台', nav: true } },
    { path: '/walk', name: 'walk', component: WalkView, meta: { title: '断卦走查', nav: true } },
    { path: '/cases/:id?', name: 'cases', component: CasesView, meta: { title: '案例', nav: true } },
    { path: '/ref', name: 'ref', component: RefView, meta: { title: '速查', nav: true } },
    { path: '/manual/:id?', name: 'manual', component: ManualView, meta: { title: '断卦手册', nav: true } }
  ],
  scrollBehavior() { return { top: 0 } }
})

const unitTitle = (id) => {
  for (const v of VOLS) {
    const c = v.chapters.find(x => x.id === id)
    if (c) return c.t
  }
  return ''
}
const manualTitle = (id) => {
  const c = MANUAL_CHAPTERS.find(x => x.id === id)
  return c ? (c.mt || c.t) : ''
}

router.afterEach((to) => {
  let title = to.meta.title
  if (to.name === 'unit') title = unitTitle(to.params.id) || title
  if (to.name === 'manual' && to.params.id) title = manualTitle(to.params.id) || title
  document.title = (title ? title + ' · ' : '') + '六爻研习社'
})

export default router
