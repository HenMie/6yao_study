/* ============================================================
 * 判卷引擎  quiz.js
 * 题面生成（两模式 × 三档）、闭包隐藏、逐格判定、24 字错因文案。
 * 规范依据 DESIGN.md §判卷反馈 / §判卷范围与难度阶梯 / §单爻精练。
 * ============================================================ */
import { paipan, toss, NAME, GUA, GUA_ORDER, ZHI, GAN, LIU_SHEN, NAJIA, xunKong } from './paipan.js'

/* ---------- 基础表 ---------- */
const POS_ZH = ['初', '二', '三', '四', '五', '上']
const QINS = ['父母', '兄弟', '子孙', '妻财', '官鬼']
const WXS = ['木', '火', '土', '金', '水']
const GONGS = ['乾', '坎', '艮', '震', '巽', '离', '坤', '兑']
const SHENS = LIU_SHEN
const XUN_PAIRS = ['子丑', '戌亥', '申酉', '午未', '辰巳', '寅卯'] // 六旬空亡（甲子~甲寅）
const ALL_NAMES = Object.keys(NAME).flatMap(u => Object.values(NAME[u]))
const TYPE_LB = ['本宫卦', '一世卦', '二世卦', '三世卦', '四世卦', '五世卦', '游魂卦', '归魂卦']
const SHI_RULE = ['首卦世在上', '一世世在初', '二世世在二', '三世世在三', '四世世在四', '五世世在五', '游魂世在四', '归魂世在三']

// 六神起法：甲乙起青龙，丙丁朱雀，戊勾陈，己螣蛇，庚辛白虎，壬癸玄武
const SHEN_START_TXT = ['甲乙起青龙', '丙丁起朱雀', '戊起勾陈', '己起螣蛇', '庚辛起白虎', '壬癸起玄武']
const SHEN_START_IDX = [0, 0, 1, 1, 2, 3, 4, 4, 5, 5]

// 六亲五句固定规则表述（DESIGN 规定不得改写）
const QIN_RULE = { 兄弟: '同我者兄弟', 子孙: '我生者子孙', 妻财: '我克者妻财', 官鬼: '克我者官鬼', 父母: '生我者父母' }

const TYPE_LABEL = ['本宫卦', '一世卦', '二世卦', '三世卦', '四世卦', '五世卦', '游魂卦', '归魂卦']

function naJiaRule(guaName, isInner) {
  const arr = NAJIA[guaName]
  const gan = arr[isInner ? 0 : 3][0]
  const zhis = (isInner ? arr.slice(0, 3) : arr.slice(3, 6)).map(s => s[1]).join('')
  return `${guaName}纳${gan}${zhis}`
}

function xunOf(dayGanIdx, dayZhiIdx) {
  const shouZhi = ((dayZhiIdx - dayGanIdx) % 12 + 12) % 12
  return '甲' + ZHI[shouZhi]
}

const DONG_RULE = ['零背老阴，动', '一背少阳，静', '两背少阴，静', '三背老阳，动']

/* ---------- 档位定义 ---------- */
// 每档：判什么字段、预填什么、单爻考什么
export const LEVELS = {
  1: { label: '入门', fullYao: ['qin'], singleYao: ['qin'], prefilled: ['zhi', 'wx', 'gong'] },
  2: { label: '进阶', fullYao: ['nj', 'wx', 'qin', 'shen', 'dong'], singleYao: ['nj', 'wx', 'qin', 'shen'], prefilled: ['gong'] },
  3: { label: '完整', fullYao: ['nj', 'wx', 'qin', 'shen', 'dong'], singleYao: ['nj', 'wx', 'qin', 'shen'], prefilled: [] }
}

/* ---------- 出题 ---------- */
/**
 * @param {object} opts { lv, kind:'single'|'full', date }
 * @returns quiz 对象：p 排盘、yaoSrc 摇卦原值、slots 格子、hiddenCols 列隐藏、prefilled
 */
export function makeQuiz(opts) {
  const lv = opts.lv || 1
  const kind = opts.kind || 'single'
  const date = opts.date || new Date()

  // 完整档单爻需要动爻（考变爻字段），保证六爻中至少一爻动
  let yaoSrc = [0, 1, 2, 3, 4, 5].map(() => toss())
  if (kind === 'single' && lv >= 3 && !yaoSrc.some(v => v === 0 || v === 3)) {
    yaoSrc[Math.floor(Math.random() * 6)] = Math.random() < 0.5 ? 0 : 3
  }
  const p = paipan(yaoSrc, date)

  const gz = p.ganzhi
  const dayGanIdx = GAN.indexOf(gz.dayGan)
  const dayZhiIdx = ZHI.indexOf(gz.dayZhi)
  const xunName = xunOf(dayGanIdx, dayZhiIdx)
  const L = LEVELS[lv]

  const slots = []
  let sid = 0
  const push = (field, label, yao, answer, options, rule, vid, opts2) => {
    slots.push({ id: 's' + (sid++), field, label, yao, answer, options, rule, vid, ...(opts2 || {}) })
  }

  const dongList = yaoSrc.map(v => (v === 0 || v === 3))

  if (kind === 'single') {
    // 单爻精练：卦名 + 世 + 应 + 目标爻字段（DESIGN：格数 = 1+2+该档该爻字段数）
    let target
    if (lv >= 3) {
      const dongIdx = dongList.map((d, i) => d ? i : -1).filter(i => i >= 0)
      target = dongIdx[Math.floor(Math.random() * dongIdx.length)]
    } else {
      target = Math.floor(Math.random() * 6)
    }
    push('name', '卦名', null, p.ben.name, ALL_NAMES, `${p.ben.upper}上${p.ben.lower}下`, 'p02')
    push('shi', '世爻', null, POS_ZH[p.shi - 1] + '爻', POS_ZH.map(z => z + '爻'), SHI_RULE[TYPE_LB.indexOf(p.ben.type)], 'p02')
    push('ying', '应爻', null, POS_ZH[p.ying - 1] + '爻', POS_ZH.map(z => z + '爻'), '恒隔三位', 'p02')
    for (const f of L.singleYao) yaoSlot(push, p, yaoSrc, target, f, gz, dayGanIdx, xunName)
    if (lv >= 3 && dongList[target]) {
      push('bianZhi', '变爻纳甲', target, p.yao[target].bian.zhi, ZHI, naJiaRule(p.bian.lower, target < 3), 'p02', { bian: true })
      push('bianQin', '变爻六亲', target, p.yao[target].bian.qin, QINS, '六亲从本卦宫', 'p02', { bian: true })
    }
    const hiddenCols = {}
    if (L.singleYao.includes('qin') || L.singleYao.includes('wx') || L.singleYao.includes('nj')) {
      // 闭包：六亲/五行/纳甲 链式可互推（DESIGN §单爻精练隐藏集合）
      hiddenCols.zhi = L.singleYao.includes('nj')
      hiddenCols.wx = L.singleYao.includes('nj') || L.singleYao.includes('wx')
      hiddenCols.qin = true
      hiddenCols.shen = L.singleYao.includes('shen')
    }
    return { mode: 'single', lv, kind, date, p, yaoSrc, target, slots, hiddenCols, prefilled: L.prefilled.filter(k => !hiddenCols[k]) }
  }

  // 完整装一卦
  push('name', '卦名', null, p.ben.name, ALL_NAMES, `${p.ben.upper}上${p.ben.lower}下`, 'p02')
  push('shi', '世爻', null, POS_ZH[p.shi - 1] + '爻', POS_ZH.map(z => z + '爻'), SHI_RULE[TYPE_LB.indexOf(p.ben.type)], 'p02')
  push('ying', '应爻', null, POS_ZH[p.ying - 1] + '爻', POS_ZH.map(z => z + '爻'), '恒隔三位', 'p02')
  if (lv >= 2) push('bianName', '变卦', null, p.bian ? p.bian.name : '无动爻', ALL_NAMES.concat(['无动爻']), '阴阳反变', 'p02')
  if (lv >= 3) {
    push('gong', '卦宫', null, p.ben.gong + '宫', GONGS.map(g => g + '宫'), '上下卦组合归宫', 'p02')
    push('xunkong', '旬空', null, gz.xunKong, XUN_PAIRS, `${xunName}旬空${gz.xunKong}`, 'p06')
    push('yuejian', '月建', null, gz.monthZhi, ZHI, '月建以节气定', 'p05')
    push('richen', '日辰', null, gz.day, allDayGZ(), '据起卦时间查历', 'p05')
  }
  for (const f of L.fullYao) for (let i = 0; i < 6; i++) yaoSlot(push, p, yaoSrc, i, f, gz, dayGanIdx, xunName)
  if (lv >= 3 && p.fuShen.length) {
    for (const f of p.fuShen) {
      const ans = `${f.qin}${f.zhi}伏${POS_ZH[f.pos - 1]}爻`
      const opts = p.fuShen.map(x => `${x.qin}${x.zhi}伏${POS_ZH[x.pos - 1]}爻`)
      push('fushen', '伏神', f.pos - 1, ans, opts, '本宫同位', 'p02')
    }
  }
  if (lv >= 3 && p.bian) {
    p.yao.forEach((y, i) => {
      if (!y.dong) return
      push('bianZhi', '变爻纳甲', i, y.bian.zhi, ZHI, naJiaRule(p.bian.lower, i < 3), 'p02', { bian: true })
      push('bianQin', '变爻六亲', i, y.bian.qin, QINS, '六亲从本卦宫', 'p02', { bian: true })
    })
  }
  return { mode: 'full', lv, kind, date, p, yaoSrc, target: null, slots, hiddenCols: {}, prefilled: L.prefilled }
}

function allDayGZ() {
  const out = []
  const GANS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
  for (const g of GANS) for (const z of ZHI) {
    if ((ZHI.indexOf(z) - GANS.indexOf(g)) % 2 === 0) out.push(g + z)
  }
  return out // 60 甲子
}

/* 单爻字段格（纳甲/五行/六亲/六神/动爻） */
function yaoSlot(push, p, yaoSrc, i, f, gz, dayGanIdx, xunName) {
  const y = p.yao[i]
  const posTxt = POS_ZH[i] + '爻'
  if (f === 'nj') push('nj', '纳甲', i, y.zhi, ZHI, naJiaRule(i < 3 ? p.ben.lower : p.ben.upper, i < 3), 'p02', { posTxt })
  else if (f === 'wx') push('wx', '五行', i, y.wx, WXS, '地支五行固定', 'p01', { posTxt })
  else if (f === 'qin') push('qin', '六亲', i, y.qin, QINS, QIN_RULE[y.qin], 'p02', { posTxt })
  else if (f === 'shen') push('shen', '六神', i, y.shen, SHENS, SHEN_START_TXT[SHEN_START_IDX[dayGanIdx]], 'p02', { posTxt })
  else if (f === 'dong') push('dong', '动爻', i, yaoSrc[i] === 0 || yaoSrc[i] === 3 ? '动' : '静', ['动', '静'], DONG_RULE[yaoSrc[i]], 'p02', { posTxt })
}

/* ---------- 判定与错因 ---------- */
/**
 * 逐格判卷。返回每个格的状态与错因行。
 * 状态：'right' | 'wrong' | 'unanswered'
 */
export function grade(quiz, ans) {
  const out = []
  let filled = 0, right = 0
  for (const s of quiz.slots) {
    const v = ans[s.id]
    if (v === undefined || v === null || v === '') {
      out.push({ slot: s, state: 'unanswered' })
      continue
    }
    filled++
    if (String(v) === String(s.answer)) { right++; out.push({ slot: s, state: 'right' }) }
    else {
      out.push({ slot: s, state: 'wrong', text: missText(s, v) })
    }
  }
  return { rows: out, filled, right, total: quiz.slots.length }
}

/* 错因行：× {字段}：{爻位}「{错值}」→ 应为「{正确值}」（{规则}） */
export function missText(slot, wrong) {
  const where = slot.posTxt ? `${slot.posTxt}` : ''
  return `× ${slot.label}${where ? '·' + where : ''}：「${wrong}」→ 应为「${slot.answer}」（${slot.rule}）`
}

export { QINS, WXS, GONGS, SHENS, ALL_NAMES, POS_ZH }
