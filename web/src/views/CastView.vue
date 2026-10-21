<script setup>
import { ref, computed, watch } from 'vue'
import { NCard, NButton, NInput, NSelect, NRadioGroup, NRadioButton, NAlert, NProgress, useMessage } from 'naive-ui'
import { useRouter } from 'vue-router'
import { paipan, toss, toText } from '../core/paipan.js'
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
const tossProgress = computed(() => yao.value.filter(v => v !== null).length)
const nextTossIndex = computed(() => yao.value.findIndex(v => v === null))

const gz = computed(() => paipan([1, 1, 1, 1, 1, 1], dateObj.value).ganzhi)

function doToss(i) { yao.value[i] = toss(); if (yao.value.every(v => v !== null)) build() }
function tossAll() { yao.value = [0, 1, 2, 3, 4, 5].map(() => toss()); build() }
function clearAll() { yao.value = [null, null, null, null, null, null]; pan.value = null }
function build() {
  if (yao.value.some(v => v === null)) return message.warning('六爻都要选')
  pan.value = paipan(yao.value.slice(), dateObj.value)
}
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
      <div class="kicker">Casting Table</div>
      <h1>装卦台</h1>
      <p class="lede">摇卦或手动录入六爻，自动排出本卦、变卦、纳甲、六亲、六神、世应与旬空。也可以切到判卷，自己装一次再对答案——错因会告诉你该回看哪条规则。</p>
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
            <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px">
              <p class="tiny muted" style="margin:0">三枚铜钱，自下而上摇六次。</p>
              <span class="mono tiny" aria-live="polite">{{ tossProgress }}/6</span>
            </div>
            <n-progress type="line" :percentage="tossProgress / 6 * 100" :show-indicator="false" style="margin-bottom:10px" />
            <div v-for="(v, i) in yao" :key="i" class="toss-row" :class="{ next: i === nextTossIndex }">
              <span class="tiny muted" style="width:38px">{{ ['初爻','二爻','三爻','四爻','五爻','上爻'][i] }}</span>
              <span class="mono tiny" :style="{ color: v === 0 || v === 3 ? 'var(--accent)' : 'var(--ink)' }">{{ v === null ? '—' : YAO_LABEL[v] }}</span>
              <span style="flex:1" />
              <n-button size="tiny" :type="i === nextTossIndex ? 'primary' : 'tertiary'" @click="doToss(i)">{{ v === null ? '摇这一爻' : '重摇' }}</n-button>
            </div>
            <n-alert v-if="tossProgress === 0" type="default" :bordered="false" class="cast-tips" style="margin-top:12px;font-size:14px">先摇初爻，完成一爻后继续下一爻。<span class="say-col">每一步都会保留在左侧记录中。</span><span class="say-row">每一步都会保留在上方记录中。</span></n-alert>
            <n-alert v-else-if="tossProgress === 6" type="success" :bordered="false" class="cast-tips" style="margin-top:12px;font-size:14px">
              六爻已完成，<span class="say-col">右侧</span><span class="say-row">下方</span>卦盘已生成。可以先查看卦盘，再进入断卦走查。
              <n-button size="tiny" quaternary @click="router.push('/walk')">去断卦走查 →</n-button>
            </n-alert>
            <div class="cast-actions" style="display:flex;gap:8px;margin-top:12px">
              <n-button size="small" quaternary @click="tossAll">连摇六次</n-button>
              <n-button size="small" quaternary @click="clearAll">清空</n-button>
            </div>
          </template>

          <!-- 手动 -->
          <template v-else-if="mode === 'manual'">
            <p class="tiny muted" style="margin-bottom:10px">自下而上，依次选择每一爻。</p>
            <div v-for="(v, i) in yao" :key="i" style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
              <span class="tiny muted" style="width:38px">{{ ['初爻','二爻','三爻','四爻','五爻','上爻'][i] }}</span>
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
            <p class="tiny muted" style="margin-bottom:10px">难度自动升档：判满 10 次进进阶，完整装卦全对 10 卦进完整档。</p>
            <n-radio-group v-model:value="quizKind" size="small" style="margin-bottom:12px">
              <n-radio-button value="single">单爻精练</n-radio-button>
              <n-radio-button value="full">完整装一卦</n-radio-button>
            </n-radio-group>
            <n-alert
              v-if="quizKind === 'single'" type="default" :bordered="false"
              style="margin-bottom:12px;font-size:14px"
            >
              只考一爻。要填的字段整列隐藏——否则同列五个已知，第六个能靠排除法抄出来。
            </n-alert>
            <n-alert v-else type="default" :bordered="false" style="margin-bottom:12px;font-size:14px">
              整卦 34~45 格，约 15~30 分钟。预填随档位收缩，完整档全部自己装。
            </n-alert>
            <p class="tiny muted">当前档位：<b>{{ lvLabel }}</b></p>
          </template>
        </n-card>

        <n-card size="small">
          <div class="tiny muted" style="letter-spacing:.1em;margin-bottom:8px">起卦时间</div>
          <n-input v-model:value="dt" type="datetime-local" size="small" />
          <div class="mono tiny" style="margin-top:10px;color:var(--ink-2);line-height:1.7">
            {{ gz.year }}年 {{ gz.month }}月 {{ gz.day }}日 {{ gz.hour }}时<br />
            <span class="muted">月建 {{ gz.monthZhi }}　日辰 {{ gz.dayZhi }}　旬空 {{ gz.xunKong }}</span>
          </div>
          <p class="tiny muted" style="margin:8px 0 0">干支与节气由 lunar-javascript 精确计算，不再用近似值。</p>
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
          <div v-if="!pan" style="padding:32px 12px;text-align:center" class="muted tiny">还没有起卦。先<span class="say-col">在左侧</span><span class="say-row">在上方</span>完成六次逐爻操作，卦盘会在第六爻完成后自动生成。</div>
          <template v-else>
            <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px">
              <strong class="serif" style="font-size:17px">{{ pan.ben.name }}</strong>
              <span class="muted" v-if="pan.bian">之</span>
              <strong class="serif" style="font-size:17px" v-if="pan.bian">{{ pan.bian.name }}</strong>
              <span class="seal plain">{{ pan.ben.gong }}宫 · {{ pan.ben.type }}</span>
              <span v-if="pan.ben.chong" class="seal">六冲</span>
              <span v-if="pan.ben.he" class="seal">六合</span>
            </div>
            <div class="mono tiny muted" style="margin-bottom:14px">
              {{ pan.ganzhi.year }}年 {{ pan.ganzhi.month }}月 {{ pan.ganzhi.day }}日 {{ pan.ganzhi.hour }}时
              　旬空 {{ pan.ganzhi.xunKong }}　月建 {{ pan.ganzhi.monthZhi }}　日辰 {{ pan.ganzhi.dayZhi }}
            </div>
            <GuaPan :p="pan" />
            <div style="margin-top:14px">
              <n-button size="small" quaternary @click="copyPan">复制卦盘文本</n-button>
            </div>
          </template>
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
.toss-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
  border-bottom: 1px solid #EFEADF;
}
.toss-row.next { background: var(--accent-wash); }
.mode-switch { margin-bottom: 16px; }
/* 双栏时"左/右"，单栏时"上/下"——默认显示桌面措辞 */
.say-row { display: none; }

@media (max-width: 1239px) {
  .cast-grid { grid-template-columns: 1fr !important; }
  .say-col { display: none; }
  .say-row { display: inline; }
}

/* ---------- 手机端 ---------- */
@media (max-width: 640px) {
  /* minmax(520px,1fr) 在弹性布局里会把单列撑到 520px，必须换成 minmax(0,1fr) */
  .cast-grid { grid-template-columns: minmax(0, 1fr) !important; gap: 16px; }
  .toss-row { gap: 8px; padding: 8px 0; }
  .toss-row :deep(.n-button) { min-height: 44px; min-width: 84px; flex: none; }
  /* 摇卦／手动／判卷三个切换按钮做成整行等分，单手好点 */
  .mode-switch { display: flex; width: 100%; margin-bottom: 16px; }
  .mode-switch :deep(.n-radio-button) { flex: 1; text-align: center; min-height: 44px; }
  .mode-switch :deep(.n-radio-button__state-border),
  .mode-switch :deep(.n-radio-button__border) { display: none; }
  .mode-switch :deep(.n-radio-button__label) { display: flex; align-items: center; justify-content: center; height: 100%; }
  .cast-actions :deep(.n-button) { min-height: 44px; }
  .cast-tips { font-size: 13px; }
}
</style>
