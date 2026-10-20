/* ============================================================
 * 六爻排盘引擎  paipan.js
 * 纯函数实现，无依赖。规则依据《增删卜易》与课程 p01/p02 内容。
 * ============================================================ */
import lunarPkg from 'lunar-javascript'
const { Solar } = lunarPkg

  /* ---------- 基础常量 ---------- */
  const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const GAN_WX = ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水'];
  const ZHI_WX = ['水', '土', '木', '木', '土', '火', '火', '土', '金', '金', '土', '水'];
  const ZHI_YY = ['阳', '阴', '阳', '阴', '阳', '阴', '阳', '阴', '阳', '阴', '阳', '阴'];

  const WX_SHENG = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
  const WX_KE = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };

  // 六合 / 六冲（地支）
  const LIU_HE = ['子丑', '寅亥', '卯戌', '辰酉', '巳申', '午未'];
  const LIU_CHONG = ['子午', '丑未', '寅申', '卯酉', '辰戌', '巳亥'];

  /* ---------- 八卦 ---------- */
  // bits[0] = 初爻，1 为阳，0 为阴
  const GUA = {
    乾: { bits: [1, 1, 1], wx: '金', sym: '☰' },
    兑: { bits: [1, 1, 0], wx: '金', sym: '☱' },
    离: { bits: [1, 0, 1], wx: '火', sym: '☲' },
    震: { bits: [1, 0, 0], wx: '木', sym: '☳' },
    巽: { bits: [0, 1, 1], wx: '木', sym: '☴' },
    坎: { bits: [0, 1, 0], wx: '水', sym: '☵' },
    艮: { bits: [0, 0, 1], wx: '土', sym: '☶' },
    坤: { bits: [0, 0, 0], wx: '土', sym: '☷' }
  };
  const GUA_ORDER = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤'];

  // 纳甲：内卦三爻 + 外卦三爻
  const NAJIA = {
    乾: ['甲子', '甲寅', '甲辰', '壬午', '壬申', '壬戌'],
    坤: ['乙未', '乙巳', '乙卯', '癸丑', '癸亥', '癸酉'],
    震: ['庚子', '庚寅', '庚辰', '庚午', '庚申', '庚戌'],
    巽: ['辛丑', '辛亥', '辛酉', '辛未', '辛巳', '辛卯'],
    坎: ['戊寅', '戊辰', '戊午', '戊申', '戊戌', '戊子'],
    离: ['己卯', '己丑', '己亥', '己酉', '己未', '己巳'],
    艮: ['丙辰', '丙午', '丙申', '丙戌', '丙子', '丙寅'],
    兑: ['丁巳', '丁卯', '丁丑', '丁亥', '丁酉', '丁未']
  };

  // 卦名表：上卦 -> 下卦 -> 名
  const NAME = {
    乾: { 乾: '乾为天', 兑: '天泽履', 离: '天火同人', 震: '天雷无妄', 巽: '天风姤', 坎: '天水讼', 艮: '天山遁', 坤: '天地否' },
    兑: { 乾: '泽天夬', 兑: '兑为泽', 离: '泽火革', 震: '泽雷随', 巽: '泽风大过', 坎: '泽水困', 艮: '泽山咸', 坤: '泽地萃' },
    离: { 乾: '火天大有', 兑: '火泽睽', 离: '离为火', 震: '火雷噬嗑', 巽: '火风鼎', 坎: '火水未济', 艮: '火山旅', 坤: '火地晋' },
    震: { 乾: '雷天大壮', 兑: '雷泽归妹', 离: '雷火丰', 震: '震为雷', 巽: '雷风恒', 坎: '雷水解', 艮: '雷山小过', 坤: '雷地豫' },
    巽: { 乾: '风天小畜', 兑: '风泽中孚', 离: '风火家人', 震: '风雷益', 巽: '巽为风', 坎: '风水涣', 艮: '风山渐', 坤: '风地观' },
    坎: { 乾: '水天需', 兑: '水泽节', 离: '水火既济', 震: '水雷屯', 巽: '水风井', 坎: '坎为水', 艮: '水山蹇', 坤: '水地比' },
    艮: { 乾: '山天大畜', 兑: '山泽损', 离: '山火贲', 震: '山雷颐', 巽: '山风蛊', 坎: '山水蒙', 艮: '艮为山', 坤: '山地剥' },
    坤: { 乾: '地天泰', 兑: '地泽临', 离: '地火明夷', 震: '地雷复', 巽: '地风升', 坎: '地水师', 艮: '地山谦', 坤: '坤为地' }
  };

  /* ---------- 由六爻 bits 求上下卦名 ---------- */
  function guaOfBits(bits3) {
    for (const k of GUA_ORDER) {
      const b = GUA[k].bits;
      if (b[0] === bits3[0] && b[1] === bits3[1] && b[2] === bits3[2]) return k;
    }
    return null;
  }

  /* ---------- 八宫表（程序化生成，保证 64 卦唯一归属） ---------- */
  const GONG_TABLE = {}; // bitsKey -> {gong, wx, shi, ying, idx, type}
  const GONG_LIST = ['乾', '坎', '艮', '震', '巽', '离', '坤', '兑'];
  const TYPE_LABEL = ['本宫卦', '一世卦', '二世卦', '三世卦', '四世卦', '五世卦', '游魂卦', '归魂卦'];
  const SHI_OF_TYPE = [6, 1, 2, 3, 4, 5, 4, 3];

  function key(bits) { return bits.join(''); }

  (function buildGong() {
    for (const g of GONG_LIST) {
      const pure = GUA[g].bits.slice(); // 下卦 = 上卦 = g
      const full = pure.concat(pure); // 6 bits, 初->上
      let cur = full.slice();
      for (let t = 0; t < 8; t++) {
        if (t === 0) cur = full.slice();
        else if (t >= 1 && t <= 5) { cur = cur.slice(); cur[t - 1] = cur[t - 1] ? 0 : 1; }
        else if (t === 6) { cur = cur.slice(); cur[3] = cur[3] ? 0 : 1; }           // 游魂：四爻再变
        else if (t === 7) { cur = cur.slice(); cur[0] = pure[0]; cur[1] = pure[1]; cur[2] = pure[2]; } // 归魂：内卦复原
        const shi = SHI_OF_TYPE[t];
        GONG_TABLE[key(cur)] = {
          gong: g, wx: GUA[g].wx, shi: shi,
          ying: shi <= 3 ? shi + 3 : shi - 3,
          type: TYPE_LABEL[t], idx: t
        };
      }
    }
  })();

  /* ---------- 六亲 ---------- */
  function liuQin(gongWx, yaoWx) {
    if (gongWx === yaoWx) return '兄弟';
    if (WX_SHENG[gongWx] === yaoWx) return '子孙';   // 我生
    if (WX_KE[gongWx] === yaoWx) return '妻财';      // 我克
    if (WX_KE[yaoWx] === gongWx) return '官鬼';      // 克我
    if (WX_SHENG[yaoWx] === gongWx) return '父母';   // 生我
    return '?';
  }

  /* ---------- 六神 ---------- */
  const LIU_SHEN = ['青龙', '朱雀', '勾陈', '螣蛇', '白虎', '玄武'];
  function liuShenStart(dayGanIdx) {
    // 甲乙起青龙，丙丁起朱雀，戊起勾陈，己起螣蛇，庚辛起白虎，壬癸起玄武
    const map = [0, 0, 1, 1, 2, 3, 4, 4, 5, 5];
    return map[dayGanIdx];
  }

  /* ---------- 干支历（改用 lunar-javascript，精确节气，不再近似） ---------- */
  function lunarOf(date) {
    return Solar.fromDate(date).getLunar();
  }
  function gzParts(text) {
    return { gan: GAN.indexOf(text[0]), zhi: ZHI.indexOf(text[1]), text };
  }
  function dayGanZhi(date) {
    const l = lunarOf(date);
    const t = l.getDayInGanZhi();
    const gan = GAN.indexOf(t[0]);
    const zhi = ZHI.indexOf(t[1]);
    return { idx: (((zhi - gan) % 12) + 12) % 12, gan, zhi, text: t };
  }
  function yearGanZhi(date) { return gzParts(lunarOf(date).getYearInGanZhiExact()); }
  function monthGanZhi(date) { return gzParts(lunarOf(date).getMonthInGanZhiExact()); }
  function hourGanZhi(date) { return gzParts(lunarOf(date).getTimeInGanZhi()); }
  function jieQiOf(date) {
    try {
      const jq = lunarOf(date).getPrevJieQi();
      return jq ? (jq.getName ? jq.getName() : '') : '';
    } catch (e) { return ''; }
  }

  // 旬空：由日干支推（纯算术，且需支持卦例覆盖日干支）
  function xunKong(dayGan, dayZhi) {
    const a = ((dayZhi - dayGan + 10) % 12 + 12) % 12;
    const b = ((dayZhi - dayGan + 11) % 12 + 12) % 12;
    return { a: a, b: b, text: ZHI[a] + ZHI[b] };
  }

  /* ---------- 卦体属性（六冲 / 六合） ---------- */
  function guaTi(bits6) {
    const lower = guaOfBits(bits6.slice(0, 3));
    const upper = guaOfBits(bits6.slice(3, 6));
    const nj = NAJIA[lower].slice(0, 3).concat(NAJIA[upper].slice(3, 6));
    const zhis = nj.map(s => ZHI.indexOf(s[1]));
    let he = 0, chong = 0;
    for (let i = 0; i < 3; i++) {
      const pair = ZHI[zhis[i]] + ZHI[zhis[i + 3]];
      if (LIU_HE.indexOf(pair) >= 0 || LIU_HE.indexOf(pair[1] + pair[0]) >= 0) he++;
      if (LIU_CHONG.indexOf(pair) >= 0 || LIU_CHONG.indexOf(pair[1] + pair[0]) >= 0) chong++;
    }
    return { he: he === 3, chong: chong === 3, lower: lower, upper: upper, name: NAME[upper][lower] };
  }

  /* ---------- 主排盘 ---------- */
  /**
   * @param {number[]} yao  6 个数字，0..3，自初爻至上爻
   *        0 = 老阴(三面/交, 动, 变阳)  1 = 少阳(一背/单, 静)
   *        2 = 少阴(二背/拆, 静)        3 = 老阳(三背/重, 动, 变阴)
   * @param {Date} date
   */
  function paipan(yao, date, opts) {
    opts = opts || {};
    const bits = yao.map(v => (v === 1 || v === 3) ? 1 : 0);
    const dong = yao.map(v => (v === 0 || v === 3));

    const info = GONG_TABLE[key(bits)];
    const gongWx = info.wx;

    // 本卦纳甲
    const lower = guaOfBits(bits.slice(0, 3));
    const upper = guaOfBits(bits.slice(3, 6));
    const nj = NAJIA[lower].slice(0, 3).concat(NAJIA[upper].slice(3, 6));

    // 变卦
    const hasDong = dong.some(Boolean);
    const bianBits = bits.map((b, i) => dong[i] ? (b ? 0 : 1) : b);
    let bian = null;
    if (hasDong) {
      const bLower = guaOfBits(bianBits.slice(0, 3));
      const bUpper = guaOfBits(bianBits.slice(3, 6));
      const bNj = NAJIA[bLower].slice(0, 3).concat(NAJIA[bUpper].slice(3, 6));
      bian = {
        bits: bianBits, lower: bLower, upper: bUpper,
        name: NAME[bUpper][bLower],
        yao: bNj.map((z, i) => ({
          zhi: z[1], gan: z[0], wx: ZHI_WX[ZHI.indexOf(z[1])],
          qin: liuQin(gongWx, ZHI_WX[ZHI.indexOf(z[1])])
        }))
      };
    }

    // 年月日时（opts.day 可覆盖日干支，用于复算古籍卦例）
    const yGZ = yearGanZhi(date);
    const mGZ = monthGanZhi(date, yGZ.gan);
    const dGZ = dayGanZhi(date);
    const hGZ = hourGanZhi(date, dGZ.gan);
    const ov = opts.day || null;
    const dGan = ov ? ov.gan : dGZ.gan;
    const dZhi = ov ? ov.zhi : dGZ.zhi;
    const xk = xunKong(dGan, dZhi);

    const shenStart = liuShenStart(dGan);

    const yaoList = nj.map((z, i) => {
      const zi = ZHI.indexOf(z[1]);
      const wx = ZHI_WX[zi];
      const kong = (zi === xk.a || zi === xk.b);
      return {
        pos: i + 1,
        gan: z[0], zhi: z[1], wx: wx,
        yy: ZHI_YY[zi],
        qin: liuQin(gongWx, wx),
        shen: LIU_SHEN[(shenStart + i) % 6],
        yang: bits[i] === 1,
        dong: dong[i],
        shi: info.shi === i + 1,
        ying: info.ying === i + 1,
        kong: kong,
        bian: bian ? (dong[i] ? bian.yao[i] : null) : null
      };
    });

    // 伏神：本卦六亲不全，取本宫首卦同位之爻为伏
    const present = {};
    yaoList.forEach(y => present[y.qin] = true);
    const need = ['父母', '兄弟', '子孙', '妻财', '官鬼'].filter(q => !present[q]);
    const fuShen = [];
    if (need.length) {
      const pureBits = GUA[info.gong].bits.concat(GUA[info.gong].bits);
      const pLower = guaOfBits(pureBits.slice(0, 3));
      const pUpper = guaOfBits(pureBits.slice(3, 6));
      const pNj = NAJIA[pLower].slice(0, 3).concat(NAJIA[pUpper].slice(3, 6));
      pNj.forEach((z, i) => {
        const zi = ZHI.indexOf(z[1]);
        const q = liuQin(gongWx, ZHI_WX[zi]);
        if (need.indexOf(q) >= 0) {
          fuShen.push({ pos: i + 1, qin: q, zhi: z[1], gan: z[0], wx: ZHI_WX[zi], kong: (zi === xk.a || zi === xk.b) });
        }
      });
    }

    const ti = guaTi(bits);

    return {
      date: date,
      ganzhi: {
        year: yGZ.text, month: mGZ.text, day: dGZ.text, hour: hGZ.text,
        monthZhi: ZHI[mGZ.zhi], dayZhi: ZHI[dZhi], dayGan: GAN[dGan],
        xunKong: xk.text,
        // 卦例复算时用外部给定的显示串
        dayText: opts.gzText && opts.gzText.day || (GAN[dGan] + ZHI[dZhi] + '日'),
        monthText: opts.gzText && opts.gzText.month || (GAN[mGZ.gan] + ZHI[mGZ.zhi] + '月'),
        yearText: opts.gzText && opts.gzText.year || (yGZ.text + '年')
      },
      ben: { name: ti.name, lower: lower, upper: upper, bits: bits, wx: gongWx, gong: info.gong, type: info.type, chong: ti.chong, he: ti.he },
      bian: bian ? { name: bian.name, lower: bian.lower, upper: bian.upper } : null,
      yao: yaoList,
      fuShen: fuShen,
      shi: info.shi, ying: info.ying,
      hasDong: hasDong
    };
  }

  /* ---------- 摇卦：模拟三枚铜钱 ---------- */
  function toss() {
    let bei = 0;
    for (let i = 0; i < 3; i++) if (Math.random() < 0.5) bei++;
    // 背=阳：0背=老阴(0) 1背=少阳(1) 2背=少阴(2) 3背=老阳(3)
    return bei;
  }

  /* ---------- 文本摘要（供复制/存档） ---------- */
  function toText(p) {
    const L = [];
    L.push(`起卦时间：${p.date.toLocaleString('zh-CN')}`);
    L.push(`${p.ganzhi.year}年 ${p.ganzhi.month}月 ${p.ganzhi.day}日 ${p.ganzhi.hour}时 (旬空：${p.ganzhi.xunKong})`);
    L.push(`本卦：${p.ben.name}（${p.ben.gong}宫${p.ben.type}）${p.ben.chong ? ' 六冲' : ''}${p.ben.he ? ' 六合' : ''}`);
    if (p.bian) L.push(`变卦：${p.bian.name}`);
    L.push('六神  六亲  纳甲   世应  动');
    for (let i = 5; i >= 0; i--) {
      const y = p.yao[i];
      L.push(`${y.shen} ${y.qin}${y.wx} ${y.gan}${y.zhi}${y.yy} ${y.shi ? '世' : y.ying ? '应' : '  '} ${y.dong ? (y.yang ? '○→阴' : '×→阳') : ''}${y.kong ? ' 空' : ''}`);
    }
    if (p.fuShen.length) L.push('伏神：' + p.fuShen.map(f => `${f.qin}${f.zhi}伏于${f.pos}爻`).join('，'));
    return L.join('\n');
  }

export {
  paipan, toss, toText, GAN, ZHI, GAN_WX, ZHI_WX, ZHI_YY,
  WX_SHENG, WX_KE, LIU_SHEN, GUA, NAME, GONG_TABLE, liuQin, NAJIA,
  dayGanZhi, xunKong, guaTi, jieQiOf, GUA_ORDER
};
