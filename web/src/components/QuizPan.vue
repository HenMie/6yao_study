<script setup>
/* 判卷面板：动态列题面 + 三种格子状态 + 错因三件套（DESIGN §判卷反馈） */
import { ref, watch, computed } from 'vue'
import { NButton, NSelect } from 'naive-ui'
import { grade } from '../core/quiz.js'
import VideoRef from './VideoRef.vue'

const props = defineProps({
  quiz: { type: Object, required: true },
  levelLabel: { type: String, default: '' }
})
const emit = defineEmits(['graded', 'redo'])

const ans = ref({})
const checked = ref(false)
const reveal = ref(false)
const result = ref(null)

watch(() => props.quiz, () => { ans.value = {}; checked.value = false; reveal.value = false; result.value = null }, { immediate: true })

const LV_LABEL = { 1: '入门', 2: '进阶', 3: '完整' }
const POS = ['初', '二', '三', '四', '五', '上']
const SRC_LABEL = ['三背', '一背', '两背', '零背']

/* ---- 动态列 ---- */
const COLW = { pos: 28, src: 40, zhi: 58, wx: 46, qin: 86, shen: 86, nj: 62, dong: 60, bian: 150 }
const cols = computed(() => {
  const lv = props.quiz.lv
  const pre = props.quiz.prefilled || []
  const h = props.quiz.hiddenCols || {}
  if (props.quiz.mode === 'single') {
    const c = ['pos', 'src']
    if (!h.zhi) c.push('zhi')
    if (!h.wx) c.push('wx')
    c.push('qin')
    if (lv >= 2) c.push('ask')   // 目标爻其余字段（纳甲/五行/六神）合并一列，逐行只出现一个
    return c
  }
  const c = ['pos', 'src']
  if (lv === 1) {
    if (pre.includes('zhi')) c.push('zhi')
    if (pre.includes('wx')) c.push('wx')
    c.push('qin')
  } else {
    c.push('nj', 'wx', 'qin', 'shen', 'dong')
    if (lv >= 3) c.push('bian')
  }
  return c
})
const gridStyle = computed(() => ({ gridTemplateColumns: cols.value.map(k => COLW[k] + 'px').join(' ') }))
const colTitle = { pos: '爻位', src: '摇卦', zhi: '纳甲·给定', wx: '五行·给定', qin: '六亲', shen: '六神', nj: '纳甲', dong: '动静', bian: '变爻纳甲/六亲', ask: '目标爻字段' }

/* ---- slot 与状态 ---- */
const slotOf = (field, i) => props.quiz.slots.find(s => s.field === field && s.yao === i)
const askSlotOf = (i) => props.quiz.slots.find(s => s.yao === i && ['nj', 'wx', 'shen'].includes(s.field))
const globalSlots = computed(() => props.quiz.slots.filter(s => s.yao === null && s.field !== 'fushen'))
const fushenSlots = computed(() => props.quiz.slots.filter(s => s.field === 'fushen'))
const dongCount = computed(() => props.quiz.yaoSrc.filter(v => v === 0 || v === 3).length)

function gradeNow() {
  const r = grade(props.quiz, ans.value)
  checked.value = true
  result.value = r
  emit('graded', { right: r.right, total: r.total, filled: r.filled, lv: props.quiz.lv, kind: props.quiz.mode, t: Date.now() })
}

const stateOf = (s) => {
  if (!checked.value || !s) return null
  const r = result.value.rows.find(x => x.slot.id === s.id)
  return r ? r.state : null
}
const errText = (s) => {
  if (!checked.value || !s) return ''
  const r = result.value.rows.find(x => x.slot.id === s.id)
  return r && r.state === 'wrong' ? r.text : ''
}
const rowCls = (i) => {
  if (!checked.value) return 'st-none'
  const sts = result.value.rows.filter(r => r.slot.yao === i).map(r => r.state)
  if (sts.includes('wrong')) return 'st-wrong'
  if (sts.length && sts.every(s => s === 'right')) return 'st-right'
  return 'st-none'
}
const rows = computed(() => [5, 4, 3, 2, 1, 0].map(i => ({ i, pos: POS[i], src: props.quiz.yaoSrc[i] })))
</script>

<template>
  <div class="qp">
    <!-- 汇总条 -->
    <div class="qp-bar">
      <span class="qp-bar-l">
        <b>{{ quiz.mode === 'single' ? '单爻精练' : '完整装卦' }} · {{ levelLabel || LV_LABEL[quiz.lv] }}</b>
        <template v-if="checked">　已判 <b class="mono">{{ result.filled }}</b>/{{ result.total }} 格 · 全对 <b class="mono">{{ result.right }}</b></template>
        <template v-else>　共 <b class="mono">{{ quiz.slots.length }}</b> 格</template>
      </span>
      <span class="qp-bar-r">
        <n-button size="tiny" quaternary @click="reveal = !reveal">{{ reveal ? '收起答案' : '看答案' }}</n-button>
        <n-button size="tiny" secondary @click="emit('redo')">重做</n-button>
      </span>
    </div>

    <!-- 题面给定信息 -->
    <div class="qp-given mono">
      {{ quiz.p.ganzhi.year }}年 {{ quiz.p.ganzhi.month }}月 {{ quiz.p.ganzhi.day }}日 {{ quiz.p.ganzhi.hour }}时
      　{{ dongCount ? dongCount + ' 爻动' : '静卦' }}
    </div>

    <!-- 全局格 -->
    <div class="qp-global">
      <div v-for="s in globalSlots" :key="s.id" class="qp-gitem" :class="'gst-' + (stateOf(s) || 'none')">
        <span class="qp-glabel" :class="{ bad: stateOf(s) === 'wrong' }">{{ s.label }}</span>
        <n-select
          v-if="!checked && !reveal" :value="ans[s.id] || null" size="tiny" filterable placeholder="—"
          :options="s.options.map(o => ({ label: o, value: o }))"
          @update:value="v => (ans[s.id] = v)" :style="{ width: s.field === 'name' || s.field === 'bianName' ? '150px' : '92px' }"
        />
        <span v-else class="qp-val" :class="{ 'is-reveal': reveal && !checked }">{{ ans[s.id] || '—' }}</span>
        <span v-if="checked && reveal" class="qp-ans mono">{{ s.answer }}</span>
      </div>
    </div>
    <div v-for="s in globalSlots" :key="'ge' + s.id">
      <div v-if="errText(s)" class="fb-line">
        <span class="x">×</span>{{ errText(s).replace(/^× /, '') }}
        <VideoRef :vid="s.vid" style="margin-left:8px" />
      </div>
    </div>

    <!-- 表头 -->
    <div class="qp-head" :style="gridStyle">
      <div v-for="c in cols" :key="c">{{ colTitle[c] }}</div>
    </div>

    <!-- 六爻行 -->
    <template v-for="r in rows" :key="r.i">
      <div class="qp-row" :class="[rowCls(r.i), { 'is-target': quiz.mode === 'single' && quiz.target === r.i }]" :style="gridStyle">
        <div class="c-pos serif">{{ r.pos }}</div>
        <div class="c-src mono">{{ SRC_LABEL[r.src] }}</div>

        <template v-for="c in cols.slice(2)" :key="c">
          <!-- 预填（灰字给定，无边框） -->
          <div v-if="c === 'zhi'" class="pre mono">{{ quiz.p.yao[r.i].zhi }}</div>
          <div v-else-if="c === 'wx'" class="pre">{{ quiz.p.yao[r.i].wx }}</div>

          <!-- 单爻：隐藏列画 · -->
          <div v-else-if="c === 'qin' || c === 'ask'" class="cell">
            <template v-if="(c === 'qin' && slotOf('qin', r.i))">
              <n-select v-if="!checked && !reveal" :value="ans[slotOf('qin', r.i).id] || null" size="tiny" placeholder="—"
                :options="slotOf('qin', r.i).options.map(o => ({ label: o, value: o }))"
                @update:value="v => (ans[slotOf('qin', r.i).id] = v)" />
              <span v-else class="qp-val" :class="{ 'is-reveal': reveal && !checked }">{{ ans[slotOf('qin', r.i).id] || '—' }}</span>
            </template>
            <template v-else-if="c === 'ask' && askSlotOf(r.i)">
              <n-select v-if="!checked && !reveal" :value="ans[askSlotOf(r.i).id] || null" size="tiny" placeholder="—"
                :options="askSlotOf(r.i).options.map(o => ({ label: o, value: o }))"
                @update:value="v => (ans[askSlotOf(r.i).id] = v)" />
              <span v-else class="qp-val" :class="{ 'is-reveal': reveal && !checked }">{{ ans[askSlotOf(r.i).id] || '—' }}</span>
            </template>
            <span v-else class="dot">·</span>
          </div>

          <!-- 完整模式各列 -->
          <div v-else-if="c === 'nj' || c === 'wx' || c === 'qin' || c === 'shen' || c === 'dong'" class="cell">
            <template v-if="slotOf(c, r.i)">
              <n-select v-if="!checked && !reveal" :value="ans[slotOf(c, r.i).id] || null" size="tiny" filterable placeholder="—"
                :options="slotOf(c, r.i).options.map(o => ({ label: o, value: o }))"
                @update:value="v => (ans[slotOf(c, r.i).id] = v)" />
              <span v-else class="qp-val" :class="{ 'is-reveal': reveal && !checked }">{{ ans[slotOf(c, r.i).id] || '—' }}</span>
            </template>
            <span v-else class="dot">·</span>
          </div>

          <!-- 变爻列（L3，仅动爻行有格） -->
          <div v-else-if="c === 'bian'" class="cell">
            <template v-if="slotOf('bianZhi', r.i)">
              <n-select v-if="!checked && !reveal" :value="ans[slotOf('bianZhi', r.i).id] || null" size="tiny" filterable placeholder="变支"
                :options="slotOf('bianZhi', r.i).options.map(o => ({ label: o, value: o }))"
                @update:value="v => (ans[slotOf('bianZhi', r.i).id] = v)" style="width:64px" />
              <span v-else class="qp-val">{{ ans[slotOf('bianZhi', r.i).id] || '—' }}</span>
              <n-select v-if="!checked && !reveal" :value="ans[slotOf('bianQin', r.i).id] || null" size="tiny" placeholder="变亲"
                :options="slotOf('bianQin', r.i).options.map(o => ({ label: o, value: o }))"
                @update:value="v => (ans[slotOf('bianQin', r.i).id] = v)" style="width:76px;margin-left:4px" />
              <span v-else class="qp-val" style="margin-left:4px">{{ ans[slotOf('bianQin', r.i).id] || '—' }}</span>
            </template>
            <span v-else class="tiny muted">—</span>
          </div>
        </template>
      </div>

      <!-- 爻级错因行 -->
      <template v-for="f in ['nj', 'wx', 'qin', 'shen', 'dong', 'bianZhi', 'bianQin']" :key="f + r.i">
        <div v-if="errText(slotOf(f, r.i))" class="fb-line">
          <span class="x">×</span>{{ errText(slotOf(f, r.i)).replace(/^× /, '') }}
          <VideoRef :vid="slotOf(f, r.i).vid" style="margin-left:8px" />
        </div>
      </template>
    </template>

    <!-- 伏神 -->
    <template v-if="fushenSlots.length">
      <div class="qp-fushen">
        <span class="tiny muted">伏神（{{ fushenSlots.length }}）</span>
        <div v-for="s in fushenSlots" :key="s.id" style="display:flex;align-items:center;gap:8px">
          <n-select v-if="!checked && !reveal" :value="ans[s.id] || null" size="tiny" filterable placeholder="—"
            :options="s.options.map(o => ({ label: o, value: o }))"
            @update:value="v => (ans[s.id] = v)" style="width:170px" />
          <span v-else class="qp-val">{{ ans[s.id] || '—' }}</span>
          <span v-if="checked && reveal" class="qp-ans mono">{{ s.answer }}</span>
        </div>
      </div>
      <div v-for="s in fushenSlots" :key="'fe' + s.id">
        <div v-if="errText(s)" class="fb-line">
          <span class="x">×</span>{{ errText(s).replace(/^× /, '') }}
          <VideoRef :vid="s.vid" style="margin-left:8px" />
        </div>
      </div>
    </template>

    <!-- 动作 -->
    <div style="display:flex;gap:10px;margin-top:14px;align-items:center">
      <n-button size="small" type="primary" :disabled="checked" @click="gradeNow">判卷</n-button>
      <span class="tiny muted">没填的格子不计错，只记未作答。错因后的 ▸ 可回看对应讲解。</span>
    </div>
  </div>
</template>

<style scoped>
.qp-bar {
  display: flex; align-items: center; justify-content: space-between;
  background: var(--paper-2); padding: 8px 12px; margin-bottom: 12px;
  border-left: 2px solid var(--accent);
}
.qp-bar-l { font-size: 14px; }
.qp-given { font-size: 13px; color: var(--ink-2); margin-bottom: 10px; }
.qp-global { display: flex; flex-wrap: wrap; gap: 8px 14px; margin-bottom: 4px; }
.qp-gitem { display: flex; align-items: center; gap: 6px; min-width: 0; }
.qp-glabel { font-size: 13px; color: var(--ink-3); white-space: nowrap; }
.qp-glabel.bad { color: var(--bad); }
.gst-wrong { border-left: 3px solid var(--bad); padding-left: 5px; }
.gst-right { animation: fadeGood .8s ease-out forwards; }
@keyframes fadeGood { from { box-shadow: inset 2px 0 0 var(--good); } to { box-shadow: inset 2px 0 0 transparent; } }
.qp-val { font-size: 14px; color: var(--ink); }
.qp-val.is-reveal { color: var(--ink-3); }
.qp-ans { font-size: 12px; color: var(--ink-3); }

.qp-head, .qp-row {
  display: grid; align-items: center; gap: 6px;
  padding: 5px 8px; border-bottom: 1px solid var(--rule);
  font-size: 14px;
}
.qp-head { font-size: 12px; color: var(--ink-3); letter-spacing: .08em; border-bottom: 1px solid var(--rule-2); }
.qp-row.is-target { background: var(--paper-2); border-right: 2px solid var(--accent); }
.qp-row.st-wrong { border-left: 3px solid var(--bad); padding-left: 5px; }
.qp-row.st-right { animation: fadeGood .8s ease-out forwards; }
.c-pos { font-size: 13px; color: var(--ink-3); text-align: center; }
.c-src { font-size: 12px; color: var(--ink-3); }
.cell { min-width: 0; }
.pre { font-size: 14px; font-weight: 600; color: var(--ink-3); cursor: default; }
.dot { color: var(--ink-4); }

.fb-line {
  font-size: 14px; color: var(--ink-2); line-height: 1.78;
  padding: 4px 0 4px 8px; border-left: 2px solid var(--accent);
  margin: 2px 0 2px 8px; white-space: normal; overflow-wrap: anywhere;
}
.fb-line .x { color: var(--bad); font-family: var(--mono); margin-right: 6px; }
.qp-fushen { margin-top: 10px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
</style>
