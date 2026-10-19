<script setup>
import { ref, computed } from 'vue'
import { NCard, NButton, NTag } from 'naive-ui'
import VideoRef from '../components/VideoRef.vue'

const STEPS = [
  { n: 1, t: '取用神', src: 'p03', zhang: '用神章第九', ask: '你问的是什么事？先定哪一爻代表它。',
    opts: [['问自身、运势、安危', '世爻'], ['问父母、长辈、文书、房子、车', '父母'], ['问钱财、工资、投资、女友', '妻财'], ['问工作、官职、疾病、丈夫', '官鬼'], ['问子女、晚辈、宠物、医药', '子孙'], ['问兄弟、朋友、同事、竞争者', '兄弟']],
    warn: '用神取错，后面全错。同一个卦问不同的事，用神完全不同。' },
  { n: 2, t: '看旺衰', src: 'p05', zhang: '月将章第十六 · 日辰章第十七', ask: '用神此刻有力还是无力？力量来自月建、日辰和动爻。',
    opts: [['临月建 / 临日辰', '旺相'], ['得日月生扶', '得扶'], ['休囚，无人生扶', '无力'], ['逢旬空，须合旺衰', '空'], ['与月建相冲，须查救应', '月破']],
    warn: '旺衰不看爻本身，看日月和动爻给了它多少力量。' },
  { n: 3, t: '看动爻', src: 'p05', zhang: '动静生克章第十四', ask: '卦里有哪几爻在动？它们对用神做了什么？',
    opts: [['有动爻生用神', '得生'], ['有动爻克用神', '受克'], ['动爻与用神相合', '被合'], ['无动爻（六爻安静）', '安静']],
    warn: '动爻优先级高于静爻，但静爻旺时一样能生克。' },
  { n: 4, t: '看动变', src: 'p05', zhang: '动变生克冲合章第十五', ask: '动爻变出了什么？变爻只作用本位那个动爻。',
    opts: [['化回头生', '得回头生'], ['化回头克', '受回头克'], ['化进神', '化进'], ['化退神', '化退'], ['化空 / 化破 / 化墓 / 化绝，须合旺衰', '状态待核'], ['反吟 / 伏吟', '反复或迟滞']],
    warn: '变爻不管别的爻，本位动爻也克不到变爻。' },
  { n: 5, t: '查特殊', src: 'p06', zhang: '章十九 ~ 章廿六 · P06–P08', ask: '这些结构里，有哪些在这一卦出现了？勾上它们。',
    list: ['旬空', '月破', '日破', '三合局', '六合', '六冲', '三刑', '伏神', '入墓'],
    warn: '特殊结构是加分项或减分项，不能单独定吉凶。' },
  { n: 6, t: '定吉凶', src: 'p05', zhang: '克处逢生章第十三', ask: '把前面五步合起来，最终落在用神身上的是生还是克？',
    opts: [['用神有气，生扶有效', '有利'], ['用神衰弱，受克无救', '不利'], ['受克但得有效生扶', '有救，需合看'], ['生扶来源又受制', '救应受损，待核'], ['尚未查清旺衰与救应', '证据不足']],
    warn: '生克按作用对象与有效性分析，不数个数，也不凭叙述先后推出先吉后凶。' }
]

const ans = ref({})
const spec = ref({})
const step = ref(0)
const specOpen = ref(false)

function pick(n, key, val) {
  ans.value[n] = val
  ans.value['k' + n] = key
  step.value = Math.max(step.value, n)
}
function toggleSpec(item) {
  if (spec.value[item]) delete spec.value[item]; else spec.value[item] = true
  step.value = Math.max(step.value, 4)
}
const specList = computed(() => Object.keys(spec.value))

const draft = computed(() => {
  const a = ans.value, p = []
  if (a[1]) p.push(`以${a[1]}为用神`)
  if (a[2]) p.push(`用神${a[2]}`)
  if (a[3]) p.push(`卦中${a[3]}`)
  if (a[4]) p.push(`变爻${a[4]}`)
  if (specList.value.length) p.push(`并见${specList.value.join('、')}`)
  if (a[6]) p.push(`断为${a[6]}`)
  return p.length ? p.join('，') + '。' : ''
})
const done = (n) => !!ans.value[n] || (n === 5 && specList.value.length > 0)
function reset() { ans.value = {}; spec.value = {}; step.value = 0 }
</script>

<template>
  <div class="wrap">
    <div class="page-head">
      <div class="kicker">Decision Walk</div>
      <h1>断卦走查</h1>
      <p class="lede">按课程教过的顺序走一遍：取用神 → 看旺衰 → 看动爻 → 看动变 → 查特殊 → 定吉凶 → 出结论。每一步都标了它出自哪一章、哪一集，结论可以倒查。</p>
    </div>

    <div style="display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:24px;align-items:start" class="walk-grid">
      <div>
        <n-card v-for="s in STEPS" :key="s.n" style="margin-bottom:14px">
          <div style="display:flex;align-items:baseline;gap:10px;margin-bottom:6px">
            <span class="mono tiny muted">0{{ s.n }}</span>
            <h3 style="font-size:16px">{{ s.t }}</h3>
            <span style="flex:1" />
            <span v-if="done(s.n)" class="seal">已判</span>
          </div>
          <div class="tiny muted" style="margin-bottom:14px">{{ s.ask }}</div>

          <div v-if="s.opts" style="display:flex;flex-wrap:wrap;gap:8px">
            <button
              v-for="o in s.opts" :key="o[1]"
              class="opt" :class="{ on: ans[s.n] === o[1] }"
              @click="pick(s.n, o[0], o[1])"
            >
              <div style="font-weight:500">{{ o[1] }}</div>
              <div style="color:var(--ink-3)">{{ o[0] }}</div>
            </button>
          </div>

          <div v-else>
            <div style="border:1px solid var(--rule);border-radius:2px;overflow:hidden">
              <div
                style="height:44px;display:flex;align-items:center;justify-content:space-between;padding:0 14px;cursor:pointer;background:var(--paper-2)"
                @click="specOpen = !specOpen"
              >
                <span style="font-size:14px;font-weight:500">特殊项</span>
                <span class="tiny muted">{{ specList.length ? '已勾 ' + specList.length + ' 项' : '未勾选' }} · {{ specOpen ? '收起' : '展开' }}</span>
              </div>
              <div v-if="specOpen">
                <label
                  v-for="item in s.list" :key="item"
                  style="height:40px;display:flex;align-items:center;gap:10px;padding:0 14px;border-top:1px solid var(--rule);cursor:pointer;font-size:13px"
                  @click.prevent="toggleSpec(item)"
                >
                  <span :style="{
                    width: '16px', height: '16px', border: '1px solid var(--rule-2)', borderRadius: '2px',
                    display: 'grid', placeItems: 'center', fontSize: '11px',
                    background: spec[item] ? 'var(--accent)' : 'transparent',
                    color: 'var(--paper)'
                  }">{{ spec[item] ? '✓' : '' }}</span>
                  {{ item }}
                </label>
              </div>
            </div>
          </div>

          <div v-if="s.warn" style="margin-top:12px;font-size:12px;color:var(--accent);background:var(--accent-wash);padding:6px 10px;border-radius:2px;border-left:2px solid var(--accent)">
            {{ s.warn }}
          </div>
          <div class="mono tiny" style="color:var(--ink-4);margin-top:10px">
            据 {{ s.zhang }} · <VideoRef :vid="s.src" />
          </div>
        </n-card>

        <n-card v-if="ans[6]" style="border-left:3px solid var(--accent)">
          <div class="kicker">结论草稿</div>
          <p class="serif" style="font-size:17px;margin:10px 0">{{ draft }}</p>
          <p class="tiny muted" style="margin:0 0 8px">这份草稿只用了课程讲过的判定步。课程没有应期专章，所以这里不给具体日期。</p>
          <p class="tiny" style="margin:0">想看应期怎么推，去 <router-link to="/cases">案例库</router-link> 看示例卦。</p>
        </n-card>
      </div>

      <div style="position:sticky;top:80px">
        <n-card title="草稿纸">
          <template #header-extra><n-button size="tiny" quaternary @click="reset">重来</n-button></template>
          <div v-if="!draft" class="tiny muted" style="padding:20px 0;text-align:center">选一项，这里会记下你的判断和它的出处。</div>
          <div v-else>
            <div v-for="s in STEPS" :key="s.n">
              <div v-if="s.list && specList.length" style="padding:8px 0;border-bottom:1px dashed var(--rule)">
                <div style="font-size:13px"><span class="tiny muted">0{{ s.n }} </span>特殊项：{{ specList.join('、') }}</div>
                <div class="mono tiny" style="color:var(--ink-4)">据 {{ s.zhang }}</div>
              </div>
              <div v-else-if="ans[s.n]" style="padding:8px 0;border-bottom:1px dashed var(--rule)">
                <div style="font-size:13px"><span class="tiny muted">0{{ s.n }} </span>{{ s.t }}：<b>{{ ans[s.n] }}</b></div>
                <div class="mono tiny" style="color:var(--ink-4)">据 {{ s.zhang }} · <VideoRef :vid="s.src" /></div>
              </div>
            </div>
            <div v-if="ans[6]" class="serif" style="margin-top:14px;font-size:15px">{{ draft }}</div>
          </div>
        </n-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.opt {
  text-align: left; padding: 8px 12px; border: 1px solid var(--rule-2);
  background: #fff; border-radius: 2px; cursor: pointer; font-size: 12px;
  line-height: 1.5; max-width: 100%; font-family: inherit; color: var(--ink);
}
.opt:hover { border-color: var(--ink); }
.opt.on { border-color: var(--accent); background: var(--accent-wash); }
@media (max-width: 1239px) { .walk-grid { grid-template-columns: 1fr !important; } }
</style>
