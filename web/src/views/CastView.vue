<script setup>
import { ref, computed, watch } from 'vue'
import { NCard, NButton, NInput, NSelect, NRadioGroup, NRadioButton, NAlert, NProgress, useMessage } from 'naive-ui'
import { useRouter } from 'vue-router'
import { paipan, toss, toText, ZHI, ZHI_WX } from '../core/paipan.js'
import { makeQuiz } from '../core/quiz.js'
import { addQuiz, quizStats, fullCorrectCount } from '../core/store.js'
import GuaPan from '../components/GuaPan.vue'
import QuizPan from '../components/QuizPan.vue'

const message = useMessage()
const router = useRouter()
const mode = ref('toss')
const quizKind = ref('single')

/* ---------- 起卦 ---------- */
const now = new Date()
const pad = (n) => String(n).padStart(2, '0')
const dt = ref(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`)
const dateObj = computed(() => (dt.value ? new Date(dt.value) : new Date()))

const yao = ref([null, null, null, null, null, null])
const pan = ref(null)
/* 每爻的落笔序号：重摇同一爻时递增，驱动爻线重画动画 */
const seq = ref([0, 0, 0, 0, 0, 0])
const tossProgress = computed(() => yao.value.filter(v => v !== null).length)
const nextTossIndex = computed(() => yao.value.findIndex(v => v === null))
/* 记录按卦序排列：上爻在上、初爻在下，六线成卦的方向与卦盘一致 */
const recordRows = computed(() => yao.value.map((v, i) => ({ v, i })).reverse())

const gz = computed(() => paipan([1, 1, 1, 1, 1, 1], dateObj.value).ganzhi)
const wxOf = (zhi) => ZHI_WX[ZHI.indexOf(zhi)] || ''

function doToss(i) { seq.value[i]++; yao.value[i] = toss(); if (yao.value.every(v => v !== null)) build() }
function tossAll() { yao.value = [0, 1, 2, 3, 4, 5].map(() => toss()); build() }
function clearAll() { yao.value = [null, null, null, null, null, null]; pan.value = null }
function build() {
  if (yao.value.some(v => v === null)) return message.warning('六爻都要选')
  pan.value = paipan(yao.value.slice(), dateObj.value)
}
const YAO_POS = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻']
const YAO_LABEL = ['老阴 ×（动）', '少阳 —', '少阴 --', '老阳 ○（动）']
watch(dt, () => { if (pan.value) build() })

function copyPan() {
  if (!pan.value) return
  navigator.clipboard.writeText(toText(pan.value)).then(() => message.success('已复制'))
}

/* ---------- 判卷 ---------- */
// 难度自动升档：入门起步；判满 10 次进进阶；完整装卦全对 ≥10 卦进完整档
function level() {
  if (fullCorrectCount() >= 10) return 3
  if (quizStats().times >= 10) return 2
  return 1
}
const quiz = ref(null)
function newQuiz() {
  quiz.value = makeQuiz({ lv: level(), kind: quizKind.value, date: dateObj.value })
}
watch(quizKind, newQuiz)
// 切到判卷模式时必须立刻出题，否则右栏是空的
watch(mode, (m) => { if (m === 'quiz' && !quiz.value) newQuiz() })

const lvLabel = computed(() => ({ 1: '入门', 2: '进阶', 3: '完整' })[quiz.value?.lv || 1])

function onGraded(rec) {
  addQuiz(rec)
  message.success(`已判 ${rec.filled}/${rec.total} 格，全对 ${rec.right}`)
}
</script>

<template>
  <div class="wrap">
    <div class="page-head">
      <h1>装卦台</h1>
      <span class="page-side" aria-hidden="true"><i>以钱</i><i>代蓍</i></span>
      <p class="lede">摇卦或手动录入六爻，自动排出完整卦盘。也可切到判卷，自己装一次再对答案，错因附规则出处。</p>
    </div>

    <div style="display:grid;grid-template-columns:300px minmax(520px,1fr);gap:24px;align-items:start" class="cast-grid">
      <div>
        <n-card style="margin-bottom:16px">
          <n-radio-group v-model:value="mode" size="small" class="mode-switch">
            <n-radio-button value="toss">摇卦</n-radio-button>
            <n-radio-button value="manual">手动</n-radio-button>
            <n-radio-button value="quiz">判卷</n-radio-button>
          </n-radio-group>

          <!-- 摇卦 -->
          <template v-if="mode === 'toss'">
            <n-button type="primary" class="toss-cta" :disabled="tossProgress === 6" @click="doToss(nextTossIndex)">
              {{ tossProgress === 6 ? '六爻已成' : '摇' + YAO_POS[nextTossIndex] }}
            </n-button>
            <div class="toss-meta">
              <span class="tiny muted">三枚铜钱，自下而上摇六次</span>
              <span class="mono tiny" aria-live="polite">{{ tossProgress }}/6</span>
            </div>
            <n-progress type="line" :percentage="tossProgress / 6 * 100" :show-indicator="false" class="toss-prog" />
            <div class="toss-list">
              <div v-for="r in recordRows" :key="r.i" class="toss-row" :class="{ next: r.i === nextTossIndex }">
                <span class="tiny muted toss-pos">{{ YAO_POS[r.i] }}</span>
                <div
                  v-if="r.v !== null" :key="'y' + r.i + '-' + seq[r.i]"
                  class="yao toss-yao" :class="(r.v === 1 || r.v === 3) ? 'yang' : 'yin'"
                  aria-hidden="true"
                ><i /><i v-if="r.v === 0 || r.v === 2" /></div>
                <span v-else class="yao-slot" aria-hidden="true" />
                <span class="mono tiny toss-res" :class="{ 'is-dong': r.v === 0 || r.v === 3 }">
                  {{ r.v === null ? (r.i === nextTossIndex ? '待摇' : '—') : YAO_LABEL[r.v] }}
                </span>
                <span v-if="r.v === 0 || r.v === 3" class="toss-dong mono" aria-hidden="true">{{ r.v === 3 ? '○' : '×' }}</span>
                <span class="toss-fill" />
                <n-button v-if="r.v !== null" size="tiny" quaternary @click="doToss(r.i)">重摇</n-button>
              </div>
            </div>
            <n-alert v-if="tossProgress === 6" type="success" :bordered="false" class="cast-tips">
              卦盘已生成。
              <n-button size="tiny" quaternary @click="router.push('/walk')">去断卦走查 →</n-button>
            </n-alert>
            <div class="cast-actions">
              <n-button size="small" quaternary @click="tossAll">连摇六次</n-button>
              <n-button size="small" quaternary @click="clearAll">清空</n-button>
            </div>
          </template>

          <!-- 手动 -->
          <template v-else-if="mode === 'manual'">
            <p class="tiny muted" style="margin-bottom:10px">自下而上，依次选择每一爻。</p>
            <div v-for="(v, i) in yao" :key="i" style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
              <span class="tiny muted" style="width:38px">{{ YAO_POS[i] }}</span>
              <n-select
                :value="v" size="small" style="flex:1" placeholder="—"
                :options="[
                  { label: '老阳 ○（三背，动）', value: 3 },
                  { label: '少阳 —（一背）', value: 1 },
                  { label: '少阴 --（二背）', value: 2 },
                  { label: '老阴 ×（零背，动）', value: 0 }
                ]"
                @update:value="(val) => (yao[i] = val)"
              />
            </div>
            <n-button size="small" type="primary" style="width:100%;margin-top:8px" @click="build">排盘</n-button>
          </template>

          <!-- 判卷设置 -->
          <template v-else>
            <p class="tiny muted" style="margin:0 0 10px">难度自动升档：判满 10 次进阶，完整卦全对 10 次进完整档。</p>
            <n-radio-group v-model:value="quizKind" size="small" style="margin-bottom:12px">
              <n-radio-button value="single">单爻精练</n-radio-button>
              <n-radio-button value="full">完整装一卦</n-radio-button>
            </n-radio-group>
            <n-alert v-if="quizKind === 'single'" type="default" :bordered="false" class="cast-tips" style="margin-bottom:12px">
              只考一爻；其余五爻同项隐藏，排除法抄不出答案。
            </n-alert>
            <n-alert v-else type="default" :bordered="false" class="cast-tips" style="margin-bottom:12px">
              整卦约 34–45 格；档位越高预填越少，完整档全靠自己装。
            </n-alert>
            <p class="tiny muted">当前档位：<b>{{ lvLabel }}</b></p>
          </template>
        </n-card>

        <n-card size="small">
          <div class="tiny muted" style="letter-spacing:.1em;margin-bottom:8px">起卦时间</div>
          <n-input v-model:value="dt" type="datetime-local" size="small" />
          <div class="mono tiny gz-line">
            {{ gz.year }}年 {{ gz.month }}月 {{ gz.day }}日 {{ gz.hour }}时<br />
            <span class="muted">月建 <b :class="'wx-' + wxOf(gz.monthZhi)">{{ gz.monthZhi }}</b>　日辰 <b :class="'wx-' + wxOf(gz.dayZhi)">{{ gz.dayZhi }}</b>　旬空 <b :class="'wx-' + wxOf(gz.xunKong[0])">{{ gz.xunKong[0] }}</b><b :class="'wx-' + wxOf(gz.xunKong[1])">{{ gz.xunKong[1] }}</b></span>
          </div>
        </n-card>
      </div>

      <div>
        <!-- 排盘结果 -->
        <n-card v-if="mode !== 'quiz'">
          <template #header>
            <span class="tiny muted">卦盘</span>
          </template>
          <template #header-extra>
            <span class="tiny mono muted">{{ pan ? pan.ben.name + (pan.bian ? ' 之 ' + pan.bian.name : '') : '' }}</span>
          </template>
          <div v-if="!pan" class="pan-empty muted">
            尚未起卦——<span class="say-col">在左侧</span><span class="say-row">在上方</span>摇卦或录入六爻，卦盘自动生成。
          </div>
          <div v-else class="pan-body">
            <div class="pan-title">
              <strong class="serif">{{ pan.ben.name }}</strong>
              <span class="muted" v-if="pan.bian">之</span>
              <strong class="serif" v-if="pan.bian">{{ pan.bian.name }}</strong>
              <span class="seal plain">{{ pan.ben.gong }}宫属<b :class="'wx-' + pan.ben.wx">{{ pan.ben.wx }}</b> · {{ pan.ben.type }}</span>
              <span v-if="pan.ben.chong" class="seal">六冲</span>
              <span v-if="pan.ben.he" class="seal">六合</span>
            </div>
            <div class="mono tiny muted pan-gz">
              {{ pan.ganzhi.year }}年 {{ pan.ganzhi.month }}月 {{ pan.ganzhi.day }}日 {{ pan.ganzhi.hour }}时
              　旬空 <b :class="'wx-' + wxOf(pan.ganzhi.xunKong[0])">{{ pan.ganzhi.xunKong[0] }}</b><b :class="'wx-' + wxOf(pan.ganzhi.xunKong[1])">{{ pan.ganzhi.xunKong[1] }}</b>
              　月建 <b :class="'wx-' + wxOf(pan.ganzhi.monthZhi)">{{ pan.ganzhi.monthZhi }}</b>
              　日辰 <b :class="'wx-' + wxOf(pan.ganzhi.dayZhi)">{{ pan.ganzhi.dayZhi }}</b>
            </div>
            <GuaPan :p="pan" />
            <div style="margin-top:14px">
              <n-button size="small" quaternary @click="copyPan">复制卦盘文本</n-button>
            </div>
          </div>
        </n-card>

        <!-- 判卷 -->
        <n-card v-else-if="quiz">
          <template #header>
            <span class="tiny muted">判卷</span>
          </template>
          <QuizPan :quiz="quiz" :level-label="lvLabel" @graded="onGraded" @redo="newQuiz" />
        </n-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 摇卦：一个主按钮走完全程，下方逐爻画线成卦 */
.toss-cta { width: 100%; height: 40px; letter-spacing: .08em; }
.toss-meta { display: flex; justify-content: space-between; align-items: baseline; margin: 12px 0 6px; }
.toss-prog { margin-bottom: 4px; }
.toss-list { margin-top: 8px; }
.toss-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 8px;
  border-bottom: 1px solid #EFEADF;
}
.toss-row.next { background: var(--accent-wash); }
.toss-pos { width: 34px; flex: none; }
.toss-res { color: var(--ink); }
.toss-res.is-dong { color: var(--accent); }
.toss-fill { flex: 1; }
/* 记录行里的爻线：窄幅版爻象，落笔时从左画出 */
.toss-yao { width: 48px; height: 4px; gap: 5px; flex: none; }
.toss-yao i { transform-origin: left center; animation: draw-yao .26s cubic-bezier(.16, 1, .3, 1) both; }
.toss-yao.yin i:last-child { animation-delay: .07s; }
@keyframes draw-yao { from { transform: scaleX(0); } }
.yao-slot { width: 48px; height: 4px; flex: none; position: relative; }
.yao-slot::before {
  content: ''; position: absolute; left: 0; right: 0; top: 2px;
  border-top: 1px dashed var(--rule-2);
}
.toss-dong { display: none; color: var(--accent); font-size: 13px; flex: none; }
/* 成卦瞬间：卦盘轻落 */
.pan-body { animation: pan-rise .24s cubic-bezier(.16, 1, .3, 1) both; }
@keyframes pan-rise { from { opacity: 0; transform: translateY(6px); } }
.cast-actions { display: flex; gap: 8px; margin-top: 12px; }
.cast-tips { margin-top: 12px; font-size: 14px; }
.gz-line { margin-top: 10px; color: var(--ink-2); line-height: 1.7; }
.pan-empty { padding: 36px 12px; text-align: center; font-size: 13px; line-height: 1.8; }
.pan-title { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 12px; }
.pan-title strong { font-size: 17px; }
.pan-gz { margin-bottom: 14px; }
.mode-switch { margin-bottom: 16px; }
/* 双栏时"左/右"，单栏时"上/下"——默认显示桌面措辞 */
.say-row { display: none; }

@media (prefers-reduced-motion: reduce) {
  .toss-yao i { animation: none; }
  .pan-body { animation: pan-fade .18s ease-out both; }
  @keyframes pan-fade { from { opacity: 0; } }
}

@media (max-width: 1239px) {
  .cast-grid { grid-template-columns: 1fr !important; }
  .say-col { display: none; }
  .say-row { display: inline; }
}

/* ---------- 手机端 ---------- */
@media (max-width: 640px) {
  /* minmax(520px,1fr) 在弹性布局里会把单列撑到 520px，必须换成 minmax(0,1fr) */
  .cast-grid { grid-template-columns: minmax(0, 1fr) !important; gap: 16px; }
  .toss-cta { height: 48px; font-size: 16px; }
  .toss-row { gap: 8px; padding: 8px; }
  .toss-row :deep(.n-button) { min-height: 44px; min-width: 84px; flex: none; }
  /* 记录行以爻线为主：文字转屏幕阅读器专用，动爻以 ○/× 标出 */
  .toss-res {
    position: absolute; width: 1px; height: 1px; margin: -1px;
    padding: 0; border: 0; clip: rect(0 0 0 0); overflow: hidden; white-space: nowrap;
  }
  .toss-dong { display: inline; }
  .toss-pos { width: 30px; }
  .toss-yao, .yao-slot { width: 56px; }
  /* 摇卦／手动／判卷三个切换按钮做成整行等分，单手好点 */
  .mode-switch { display: flex; width: 100%; margin-bottom: 16px; }
  .mode-switch :deep(.n-radio-button) { flex: 1; text-align: center; min-height: 44px; }
  .mode-switch :deep(.n-radio-button__state-border),
  .mode-switch :deep(.n-radio-button__border) { display: none; }
  .mode-switch :deep(.n-radio-button__label) { display: flex; align-items: center; justify-content: center; height: 100%; }
  .cast-actions { display: flex; }
  .cast-actions :deep(.n-button) { min-height: 44px; flex: 1; }
  .cast-tips { font-size: 13px; }
}
</style>
