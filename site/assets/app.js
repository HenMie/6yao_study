/* ============================================================
 * 六爻研习社 · 应用层
 * ============================================================ */
(function () {
  'use strict';
  const P = window.Paipan, D = window.DATA;

  /* ---------------- 存储 ---------------- */
  const KEY = 'ly6.progress.v1';
  const store = {
    get() {
      try { return JSON.parse(localStorage.getItem(KEY)) || { done: {}, last: null, quiz: [] }; }
      catch (e) { return { done: {}, last: null, quiz: [] }; }
    },
    set(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} }
  };
  let ST = store.get();

  /* ---------------- 工具 ---------------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function toast(msg) {
    let t = $('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('on');
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 1800);
  }

  /* ---------------- 视频 ---------------- */
  const VNAME = {
    p01: '基础知识', p02: '起卦', p03: '增删一', p04: '增删二',
    p05: '增删三', p06: '增删四', p07: '增删五', p08: '增删六'
  };
  const VFILE = id => `../视频/六爻零基础 I 增删喂饭级教程，用力讲大白话——建议收藏 ${id} ${VNAME[id]} - 云野卦馆 (1080p, av01.0.00M.10.0.110.01.01.01.0, BiliBili) via VidBee.mp4`;

  function videoRef(id, t) {
    let stamp = '';
    if (t) {
      const m = Math.floor(t / 60), s = Math.round(t % 60);
      stamp = ` ${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    const label = `▸ P${id.slice(1)} ${VNAME[id]}` + stamp;
    return `<a class="vref" href="#" data-vid="${id}" data-t="${t || 0}" title="跳转到视频大概位置（粗定位 ±2 分钟）">${label}</a>`;
  }
  function openVideo(id, t) {
    const src = encodeURI(VFILE(id));
    let m = $('#videoModal');
    if (!m) {
      m = document.createElement('div');
      m.id = 'videoModal'; m.className = 'modal';
      m.innerHTML = `<div class="modal-in"><div class="modal-hd"><h3>P${id.slice(1)} · ${esc(VNAME[id])}</h3>
        <button class="btn ghost sm" data-close>关闭</button></div><div class="modal-bd" id="vbody"></div></div>`;
      document.body.appendChild(m);
      m.addEventListener('click', e => {
        if (e.target === m || e.target.hasAttribute('data-close')) { m.classList.remove('on'); $('#vbody').innerHTML = ''; }
      });
    }
    m.querySelector('.modal-hd h3').textContent = `P${id.slice(1)} · ${VNAME[id]}`;
    $('#vbody').innerHTML = `<video controls autoplay src="${src}"></video>
      <p class="tiny muted" style="margin-top:12px">若浏览器无法播放（AV1 编码），请直接用本地播放器打开：<br>
      <span class="mono" style="word-break:break-all">视频/${esc(VFILE(id).replace('../视频/', ''))}</span></p>`;
    const v = $('#vbody video');
    v.addEventListener('loadedmetadata', () => { if (t) v.currentTime = t; });
    v.addEventListener('error', () => {
      $('#vbody').innerHTML = `<div class="empty" style="padding:40px 20px">
        <p>浏览器无法直接解码这个文件（AV1）。</p>
        <p class="tiny">文件位置：<br><span class="mono" style="word-break:break-all">视频/${esc(VFILE(id).replace('../视频/', ''))}</span></p>
        <button class="btn ghost sm" id="copyPath">复制文件路径</button></div>`;
      $('#copyPath').onclick = () => { navigator.clipboard.writeText(VFILE(id)).then(() => toast('路径已复制')); };
    });
    m.classList.add('on');
  }
  document.addEventListener('click', e => {
    const a = e.target.closest('.vref');
    if (a) { e.preventDefault(); openVideo(a.dataset.vid, Number(a.dataset.t) || 0); }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { const m = $('#videoModal'); if (m) m.classList.remove('on'); }
  });

  /* ---------------- 卦盘渲染 ---------------- */
  function glyph(yang, dong) {
    return `<div class="yao-glyph ${yang ? 'yang' : 'yin'}"><div class="yao-line"><i></i>${yang ? '' : '<i></i>'}</div></div>`;
  }
  function renderPan(p, opt) {
    opt = opt || {};
    const rows = [];
    for (let i = 5; i >= 0; i--) {
      const y = p.yao[i];
      const mark = y.dong ? (y.yang ? '○' : '×') : '';
      rows.push(`<div class="pan-row ${y.shi ? 'is-shi' : ''}">
        <div class="shen">${y.shen}</div>
        <div class="qin">${y.qin}<span style="margin-left:2px;color:var(--ink-3);font-size:var(--f12)">${y.wx}</span></div>
        <div class="nj">${y.gan}${y.zhi}${y.yy}</div>
        <div>${glyph(y.yang, y.dong)}</div>
        <div class="shiy">${y.shi ? '<b>世</b>' : y.ying ? '<b>应</b>' : ''}${y.kong ? '<span class="kong">空</span>' : ''}</div>
        <div class="mark">${mark}</div>
      </div>`);
    }
    let bianHtml = '';
    if (p.bian) {
      bianHtml = `<div class="pan-row" style="background:var(--paper-2);border-top:1px solid var(--rule)">
        <div class="shen">变卦</div>
        <div class="qin" style="grid-column:span 4;font-size:var(--f12);color:var(--ink-3)">${esc(p.bian.name)}　${p.yao.filter(y => y.bian).map(y => `${['初','二','三','四','五','上'][y.pos - 1]}爻→${y.bian.qin}${y.bian.zhi}`).join('　')}</div>
      </div>`;
    }
    let fu = '';
    if (p.fuShen.length) {
      fu = `<div class="fushen">伏神　${p.fuShen.map(f => `<b>${f.qin}${f.zhi}</b> 伏于${['初','二','三','四','五','上'][f.pos - 1]}爻`).join('　·　')}</div>`;
    }
    return `<div class="pan-head"><div>六神</div><div>六亲</div><div>纳甲</div><div>爻象</div><div>世应</div><div>动</div></div>
      <div class="pan">${rows.join('')}</div>${bianHtml}${fu}`;
  }

  function panSummary(p) {
    const tags = [];
    tags.push(`<span class="seal plain">${p.ben.gong}宫 · ${p.ben.type}</span>`);
    if (p.ben.chong) tags.push('<span class="seal">六冲</span>');
    if (p.ben.he) tags.push('<span class="seal">六合</span>');
    return `<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px">
      <strong style="font-family:var(--font-title);font-size:17px">${esc(p.ben.name)}</strong>
      ${p.bian ? `<span class="muted">之</span> <strong style="font-family:var(--font-title);font-size:17px">${esc(p.bian.name)}</strong>` : ''}
      ${tags.join('')}</div>
      <div class="tiny mono muted" style="margin-bottom:14px">
        ${p.ganzhi.year}年 ${p.ganzhi.month}月 ${p.ganzhi.day}日 ${p.ganzhi.hour}时
        <span style="margin-left:10px">旬空 ${p.ganzhi.xunKong}</span>
        <span style="margin-left:10px">月建 ${p.ganzhi.monthZhi}</span>
        <span style="margin-left:10px">日辰 ${p.ganzhi.dayZhi}</span>
      </div>`;
  }

  /* ---------------- 路由 ---------------- */
  const VIEWS = {};
  let current = '';
  function go(hash) { location.hash = hash; }
  function router() {
    const h = (location.hash || '#/path').replace(/^#/, '');
    const [path, qs] = h.split('?');
    const name = path.split('/')[1] || 'path';
    const fn = VIEWS[name] || VIEWS.path;
    $$('.nav a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#/' + name));
    current = name;
    const root = $('#app');
    root.innerHTML = '';
    fn(root, new URLSearchParams(qs || ''));
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', router);

  /* ---------------- 学习路径（两级：8 集地图 → 单元列表） ---------------- */
  function allUnits() {
    const out = [];
    D.VOLS.forEach(v => v.chapters.forEach(c => out.push({ ...c, vol: v.id, volNo: v.vol, volTitle: v.title })));
    return out;
  }
  let OPENVOL = null;

  VIEWS.path = function (root) {
    const units = allUnits();
    const doneN = units.filter(u => ST.done[u.id]).length;
    const pct = Math.round(doneN / units.length * 100);
    const next = units.find(u => !ST.done[u.id]) || units[units.length - 1];
    const nextVol = next.vol;
    if (OPENVOL === null) OPENVOL = nextVol;

    const cards = D.VOLS.map(v => {
      const vd = v.chapters.filter(c => ST.done[c.id]).length;
      const vp = Math.round(vd / v.chapters.length * 100);
      const on = OPENVOL === v.id;
      return `<div class="vol-card ${on ? 'on' : ''}" data-vol="${v.id}">
        <div class="vc-top">
          <span class="vol-no">${v.vol}</span>
          <span class="tiny mono muted">${v.dur} · ${v.chapters.length} 单元</span>
          ${v.id === nextVol ? '<span class="seal" style="margin-left:auto">在这里</span>' : ''}
        </div>
        <h3>${esc(v.title)}</h3>
        <p class="vc-goal">${esc(v.goal)}</p>
        <div class="pbar"><i style="width:${vp}%"></i></div>
        <div class="vc-foot"><span class="tiny mono">${vd}/${v.chapters.length}</span>
          <span class="tiny muted">${vd === v.chapters.length ? '已学完' : on ? '收起 ↑' : '展开 ↓'}</span></div>
      </div>`;
    }).join('');

    const ov = D.VOLS.find(v => v.id === OPENVOL) || D.VOLS[0];
    const unitRows = ov.chapters.map(c => {
      const idx = units.findIndex(u => u.id === c.id) + 1;
      const done = !!ST.done[c.id];
      return `<div class="unit ${done ? 'done' : ''}" data-unit="${c.id}">
        <div class="idx">${String(idx).padStart(2, '0')}</div>
        <div>
          <div class="t">${esc(c.t)}</div>
          <div class="p">${esc(c.p)}</div>
          <div class="keys">${c.keys.map(k => `<span>${esc(k)}</span>`).join('')}</div>
          <div style="margin-top:8px">${videoRef(ov.id, (D.STAMPS || {})[c.id])}</div>
        </div>
        <div class="act">${done ? '已学' : '未学'}</div>
      </div>`;
    }).join('');

    root.innerHTML = `<div class="wrap">
      <div class="page-head">
        <div class="kicker">Study Path</div>
        <h1>学习路径</h1>
        <p class="lede">8 集视频拆成 34 个知识点，平均每个 9 分钟——一次坐下就能完成一个。先看全图，再点开某一集。</p>
      </div>

      <div class="card" style="padding:24px 28px;border-left:3px solid var(--accent);margin-bottom:32px">
        <div class="tiny mono" style="color:var(--accent);letter-spacing:.12em">§${String(units.findIndex(u => u.id === next.id) + 1).padStart(2, '0')} · 当前单元</div>
        <h2 style="margin-top:8px;font-size:26px">${esc(next.t)}</h2>
        <p style="margin-top:8px;max-width:56ch;color:var(--ink-2);font-size:14px">${esc(next.p)}</p>
        <div style="display:flex;align-items:center;gap:12px;margin-top:18px;flex-wrap:wrap">
          <span class="tiny mono muted">${ST.last ? '上次停在 ' + esc(ST.last) : '尚未开始'}　·　${esc(next.volTitle)}</span>
          <span style="flex:1"></span>
          <button class="btn accent" id="continueBtn">继续学习 →</button>
        </div>
      </div>

      <div class="path-head">
        <div class="path-stat">
          <div><b>${doneN}<span style="font-size:13px;color:var(--ink-4)">/${units.length}</span></b><span>已学单元</span></div>
          <div><b>${pct}%</b><span>总进度</span></div>
          <div><b>${D.CARDS.length}</b><span>知识卡</span></div>
          <div><b>${(ST.quiz || []).length}</b><span>判卷次数</span></div>
        </div>
      </div>
      <div class="pbar" style="margin-bottom:24px"><i style="width:${pct}%"></i></div>

      <div class="vol-cards">${cards}</div>

      <div class="card" style="margin-top:24px">
        <div class="card-hd">
          <h3>P${ov.vol} · ${esc(ov.title)}</h3>
          <span class="tiny muted">${ov.chapters.length} 个单元　${videoRef(ov.id)}</span>
        </div>
        <div style="padding:6px 8px 8px">${unitRows}</div>
      </div>

      <div class="footer"><p>视频是本地素材，点击「▸ P0x」会用站内播放器打开 视频/ 目录下对应文件；若浏览器无法解码 AV1，按提示用本地播放器打开。</p></div>
    </div>`;

    $('#continueBtn').onclick = () => go('#/unit/' + next.id);
    $$('.vol-card').forEach(el => el.onclick = () => {
      OPENVOL = (OPENVOL === el.dataset.vol) ? null : el.dataset.vol;
      VIEWS.path($('#app'));
    });
    $$('.unit').forEach(el => el.onclick = () => go('#/unit/' + el.dataset.unit));
  };

  /* ---------------- 单元详情 ---------------- */
  VIEWS.unit = function (root, qs) {
    const id = location.hash.split('/')[2];
    const units = allUnits();
    const i = units.findIndex(u => u.id === id);
    const u = units[i] || units[0];
    const done = !!ST.done[u.id];
    root.innerHTML = `<div class="wrap" style="max-width:820px">
      <div class="page-head">
        <div class="kicker">§${String(i + 1).padStart(2, '0')} · P${u.vol.slice(1)} ${esc(u.volTitle)}</div>
        <h1>${esc(u.t)}</h1>
        <p class="lede">${videoRef(u.vol, (D.STAMPS || {})[u.id])}　·　单元 ${i + 1} / ${units.length}</p>
      </div>
      <div class="card card-pad" style="margin-bottom:20px">
        <p style="font-size:15px;line-height:1.9">${esc(u.p)}</p>
        <div class="divider"></div>
        <div class="tiny muted" style="letter-spacing:.1em;margin-bottom:8px">这一节的抓手</div>
        <ul style="margin:0;padding-left:20px;font-size:13px;color:var(--ink-2)">
          ${u.keys.map(k => `<li style="margin-bottom:4px">${esc(k)}</li>`).join('')}
        </ul>
      </div>
      <div class="row" style="gap:10px">
        <button class="btn ${done ? 'ghost' : 'accent'}" id="markBtn">${done ? '标记为未学' : '标记为已学'}</button>
        <button class="btn ghost" id="toPaipan">去装卦台试一次 →</button>
        ${i > 0 ? `<button class="btn ghost" id="prev">← 上一单元</button>` : ''}
        ${i < units.length - 1 ? `<button class="btn ghost" id="nextBtn">下一单元 →</button>` : ''}
      </div>
      <div class="footer"><p>视频为本地素材，若浏览器无法解码 AV1，请用本地播放器打开 视频/ 目录下对应文件。</p></div>
    </div>`;

    $('#markBtn').onclick = () => {
      ST.done[u.id] = !ST.done[u.id];
      if (!ST.done[u.id]) delete ST.done[u.id];
      ST.last = u.t;
      store.set(ST); router();
    };
    $('#toPaipan').onclick = () => go('#/paipan');
    if ($('#prev')) $('#prev').onclick = () => go('#/unit/' + units[i - 1].id);
    if ($('#nextBtn')) $('#nextBtn').onclick = () => go('#/unit/' + units[i + 1].id);
  };

  /* ---------------- 装卦台 ---------------- */
  let PAN = null;      // 当前卦盘
  let YAO = [null, null, null, null, null, null];
  let QUIZ = null;     // 判卷状态

  VIEWS.paipan = function (root) {
    root.innerHTML = `<div class="wrap">
      <div class="page-head">
        <div class="kicker">Casting Table</div>
        <h1>装卦台</h1>
        <p class="lede">摇卦或手动录入六爻，自动排出本卦、变卦、纳甲、六亲、六神、世应与旬空。也可以切到判卷模式，自己装一次再对答案。</p>
      </div>
      <div class="pan-grid">
        <div>
          <div class="card" style="margin-bottom:16px">
            <div class="card-hd"><h3>起卦</h3>
              <div class="seg" id="modeSeg">
                <button data-mode="toss" class="on">摇卦</button>
                <button data-mode="manual">手动</button>
                <button data-mode="quiz">判卷</button>
              </div>
            </div>
            <div class="card-pad" id="caster"></div>
          </div>
          <div class="card card-pad">
            <div class="tiny muted" style="letter-spacing:.1em;margin-bottom:8px">起卦时间</div>
            <input type="datetime-local" id="dt" style="width:100%">
            <div id="gzEcho" class="mono tiny" style="margin-top:10px;color:var(--ink-2);line-height:1.6"></div>
            <p class="tiny muted" style="margin-top:8px;margin-bottom:0">月建按节气近似（误差 ≤1 天）。断卦以日辰为主，月建为辅。</p>
          </div>
        </div>
        <div>
          ${(() => {
            const q = ST.quiz || [];
            const correct = q.reduce((a, b) => a + (b.score || 0), 0);
            const done = correct >= 60;
            return `<div class="mile ${done ? 'done' : ''}">
              <span>已判卷 <b>${q.length}</b> 次 · 累计装对 <b>${correct}</b> 爻</span>
              <span style="flex:1"></span>
              <span>${done ? '装卦已通，可以进案例库了' : correct >= 30 ? '再装几卦就稳了' : ''}</span>
            </div>`;
          })()}
          <div class="card" id="panCard">
            <div class="card-hd"><h3>卦盘</h3><span class="tiny muted" id="panMeta"></span></div>
            <div class="card-pad" id="panBody"><div class="empty">还没有起卦。点左边的「摇一爻」，或切到判卷模式练一次。</div></div>
          </div>
        </div>
      </div>
    </div>`;

    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    $('#dt').value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
    updateGzEcho();
    $('#dt').onchange = () => { updateGzEcho(); refreshPan(); };

    let mode = 'toss';
    $$('#modeSeg button').forEach(b => b.onclick = () => {
      $$('#modeSeg button').forEach(x => x.classList.remove('on'));
      b.classList.add('on'); mode = b.dataset.mode; renderCaster(mode);
    });
    renderCaster('toss');
  };

  function getDate() {
    const v = $('#dt') ? $('#dt').value : '';
    return v ? new Date(v) : new Date();
  }

  // 起卦时间回显：先看到年月日时干支与旬空，再决定摇不摇
  function updateGzEcho() {
    const el = $('#gzEcho');
    if (!el) return;
    const g = P.paipan([1, 1, 1, 1, 1, 1], getDate()).ganzhi;
    el.innerHTML = `${g.year}年 ${g.month}月 ${g.day}日 ${g.hour}时<br>
      <span style="color:var(--ink-3)">月建 ${g.monthZhi}　日辰 ${g.dayZhi}　旬空 ${g.xunKong}</span>`;
  }

  function renderCaster(mode) {
    const box = $('#caster');
    if (mode === 'quiz') {
      QUIZ = makeQuiz();
      box.innerHTML = `<p class="tiny muted" style="margin-bottom:12px">下面这张卦盘，六亲与世应被隐去了。自己装一遍，再点判卷。</p>
        <div id="quizPan"></div>
        <button class="btn accent sm" id="checkBtn" style="margin-top:12px">判卷</button>
        <button class="btn ghost sm" id="newQuiz" style="margin-top:12px">换一卦</button>
        <div id="quizResult" style="margin-top:12px"></div>`;
      drawQuiz();
      $('#checkBtn').onclick = checkQuiz;
      $('#newQuiz').onclick = () => renderCaster('quiz');
      return;
    }
    if (mode === 'manual') {
      box.innerHTML = `<div class="tiny muted" style="margin-bottom:10px">自下而上，依次选择每一爻。</div>
        ${[0, 1, 2, 3, 4, 5].map(i => `<div class="field"><label>${['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'][i]}</label>
          <select data-i="${i}">
            <option value="">—</option>
            <option value="3">老阳 ○（三背，动）</option>
            <option value="1">少阳 —（一背）</option>
            <option value="2">少阴 --（二背）</option>
            <option value="0">老阴 ×（零背，动）</option>
          </select></div>`).join('')}
        <button class="btn accent sm" id="castBtn" style="width:100%;margin-top:8px">排盘</button>`;
      $$('#caster select').forEach(s => s.onchange = () => {
        YAO[Number(s.dataset.i)] = s.value === '' ? null : Number(s.value);
      });
      $('#castBtn').onclick = () => {
        if (YAO.some(v => v === null)) return toast('六爻都要选');
        refreshPan();
      };
      return;
    }
    // 摇卦
    box.innerHTML = `<div class="tiny muted" style="margin-bottom:10px">三枚铜钱，背为阳、面为阴。自下而上摇六次。</div>
      <div id="tossRows">${[0, 1, 2, 3, 4, 5].map(i => `
        <div class="pan-row" style="grid-template-columns:54px 1fr 92px;padding-left:0;padding-right:0">
          <div class="shen">${['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'][i]}</div>
          <div id="tr${i}" class="mono" style="font-size:12px;color:var(--ink-4)">—</div>
          <button class="btn ghost sm" data-toss="${i}">摇</button>
        </div>`).join('')}</div>
      <div class="row" style="margin-top:12px;gap:8px">
        <button class="btn ghost sm" id="tossAll">连摇六次</button>
        <button class="btn ghost sm" id="resetAll">清空</button>
      </div>`;
    $$('[data-toss]').forEach(b => b.onclick = () => {
      const i = Number(b.dataset.toss);
      const v = P.toss(); YAO[i] = v;
      const txt = ['老阴 ×（动）', '少阳 —', '少阴 --', '老阳 ○（动）'][v];
      $('#tr' + i).textContent = txt;
      $('#tr' + i).style.color = (v === 0 || v === 3) ? 'var(--accent)' : 'var(--ink)';
      if (YAO.every(x => x !== null)) refreshPan();
    });
    $('#tossAll').onclick = () => {
      for (let i = 0; i < 6; i++) { YAO[i] = P.toss(); }
      renderCaster('toss');
      refreshPan();
    };
    $('#resetAll').onclick = () => { YAO = [null, null, null, null, null, null]; PAN = null; renderCaster('toss'); $('#panBody').innerHTML = '<div class="empty">还没有起卦。</div>'; };
  }

  function refreshPan() {
    if (YAO.some(v => v === null)) return;
    PAN = P.paipan(YAO.slice(), getDate());
    $('#panBody').innerHTML = panSummary(PAN) + renderPan(PAN) +
      `<div class="divider"></div><button class="btn ghost sm" id="copyTxt">复制卦盘文本</button>`;
    $('#panMeta').textContent = PAN.ben.name + (PAN.bian ? ' 之 ' + PAN.bian.name : '');
    $('#copyTxt').onclick = () => {
      navigator.clipboard.writeText(P.toText(PAN)).then(() => toast('已复制'));
    };
  }

  /* ---------------- 判卷 ---------------- */
  // 判卷反馈的"规则"字段：必须 ≤14 字，能独立成立
  const QIN_RULE = { 兄弟: '同我者兄弟', 子孙: '我生者子孙', 妻财: '我克者妻财', 官鬼: '克我者官鬼', 父母: '生我者父母' };
  const QINS = ['父母', '兄弟', '子孙', '妻财', '官鬼'];
  const SHENS = ['青龙', '朱雀', '勾陈', '螣蛇', '白虎', '玄武'];
  const ZHIS = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

  // 难度阶梯：按历史自动升级，不让用户选（选难度是决策负担，零基础必选错档）
  function quizLevel() {
    const q = ST.quiz || [];
    const correct = q.reduce((a, b) => a + (b.score || 0), 0);
    if (correct >= 60) return 3;   // 完整：+ 卦名
    if (q.length >= 10) return 2;  // 进阶：+ 纳甲 + 六神
    return 1;                      // 入门：预填纳甲，只判六亲 + 世应
  }
  const LV_NAME = { 1: '入门', 2: '进阶', 3: '完整' };
  // 入门档不判纳甲，但必须"给出"纳甲——六亲靠地支五行推，藏起来第一题就做不出
  // 通则：一旦某字段成为判定项，它的下游派生值就不能再预填（进阶判纳甲，则五行也必须自己填）
  const LV_FIELDS = {
    1: ['qin', 'shiy'],
    2: ['nj', 'wx', 'shen', 'qin', 'shiy'],
    3: ['nj', 'wx', 'shen', 'qin', 'shiy']
  };

  function makeQuiz() {
    const yao = [0, 1, 2, 3, 4, 5].map(() => P.toss());
    const p = P.paipan(yao, getDate());
    return { p: p, ans: {}, checked: false, level: quizLevel(), name: '', gong: '', kong: '' };
  }

  function drawQuiz() {
    const p = QUIZ.p;
    const lv = QUIZ.level;
    const askNj = lv >= 2, showShen = lv >= 2, askName = true, showGong = lv < 3;
    const cols = `38px 42px 58px ${showShen ? '62px' : ''} 1fr 54px`;
    const head = `<div>爻位</div><div>爻象</div><div>纳甲</div>${showShen ? '<div>六神</div>' : ''}<div>六亲</div><div>世应</div>`;

    let html = '';
    if (askName) {
      const names = [];
      Object.keys(P.NAME).forEach(u => Object.keys(P.NAME[u]).forEach(d => names.push(P.NAME[u][d])));
      const okName = QUIZ.checked && QUIZ.name === p.ben.name;
      html += `<div class="quiz-slot" style="grid-template-columns:70px 1fr;padding-bottom:10px">
        <div class="shen">卦名</div>
        <select id="nameSel" ${QUIZ.checked ? 'disabled' : ''}>
          <option value="">—</option>
          ${names.map(n => `<option value="${n}" ${QUIZ.name === n ? 'selected' : ''}>${n}</option>`).join('')}
        </select></div>`;
      if (QUIZ.checked && !okName) html += `<div class="quiz-slot" style="grid-template-columns:1fr;padding-top:0;border-bottom:1px solid var(--rule)"><div class="fb">${QUIZ.name ? `<span class="x">×</span>卦名：<span style="color:var(--ink-2)">「${esc(QUIZ.name)}」</span>→ 应为「<b>${p.ben.name}</b>」` : '<span style="color:var(--ink-3)">卦名：未作答</span>'}</div></div>`;
    }

    html += `<div class="pan-head" style="grid-template-columns:${cols}">${head}</div>`;

    for (let i = 5; i >= 0; i--) {
      const y = p.yao[i];
      const pos = ['初', '二', '三', '四', '五', '上'][i];
      const sel = QUIZ.ans[i] || {};
      let cls = '';
      if (QUIZ.checked) {
        cls = LV_FIELDS[lv].every(f => sel[f] === valOf(y, f)) ? 'right' : 'wrong';
      }
      html += `<div class="quiz-slot ${cls}" style="grid-template-columns:${cols}">
        <div class="shen">${pos}爻</div>
        <div>${glyph(y.yang)}</div>
        ${askNj
          ? selectHtml('nj', i, sel.nj)
          : `<div class="mono tiny" style="color:var(--ink-2);font-weight:600">${y.gan}${y.zhi}<span style="margin-left:3px">${y.wx}</span></div>`}
        ${showShen ? selectHtml('shen', i, sel.shen) : ''}
        ${selectHtml('qin', i, sel.qin)}
        ${selectHtml('shiy', i, sel.shiy)}
      </div>`;
      if (QUIZ.checked) html += `<div class="quiz-slot" style="grid-template-columns:1fr;border-bottom:1px solid var(--rule);padding-top:0"><div class="fb">${fbLine(y, sel, LV_FIELDS[lv])}</div></div>`;
    }

    $('#quizPan').innerHTML = `<div class="tiny mono muted" style="margin-bottom:8px">
      ${QUIZ.checked ? p.ben.name : '？'}　${p.ganzhi.day}日　旬空${p.ganzhi.xunKong}　
      ${showGong ? `<span style="color:var(--ink-2)">卦宫：${p.ben.gong}宫（${p.ben.wx}）</span>` : '<span style="color:var(--ink-3)">卦宫：？</span>'}　
      <span class="seal plain" style="font-size:10px">${LV_NAME[lv]} · ${LV_FIELDS[lv].length * 6 + (askName ? 1 : 0)} 格</span></div>` + html;

    if ($('#nameSel')) $('#nameSel').onchange = e => { QUIZ.name = e.target.value; };
    $$('#quizPan select[data-q]').forEach(s => s.onchange = () => {
      const i = Number(s.dataset.q);
      QUIZ.ans[i] = QUIZ.ans[i] || {};
      QUIZ.ans[i][s.dataset.k] = s.value;
    });
  }

  function valOf(y, f) {
    if (f === 'qin') return y.qin;
    if (f === 'shiy') return y.shi ? '世' : y.ying ? '应' : '';
    if (f === 'shen') return y.shen;
    if (f === 'nj') return y.zhi;
    if (f === 'wx') return y.wx;
    return '';
  }

  const FIELD_NAME = { qin: '六亲', shiy: '世应', shen: '六神', nj: '纳甲', wx: '五行' };

  function selectHtml(f, i, cur) {
    const list = f === 'qin' ? QINS : f === 'shen' ? SHENS : f === 'nj' ? ZHIS : f === 'wx' ? ['木', '火', '土', '金', '水'] : ['', '世', '应'];
    return `<select data-q="${i}" data-k="${f}" ${QUIZ.checked ? 'disabled' : ''}>
      <option value="">—</option>
      ${list.filter(Boolean).map(v => `<option value="${v}" ${cur === v ? 'selected' : ''}>${v}</option>`).join('')}
    </select>`;
  }

  // 错因行：只对"填错"报错（带 ×）；"没填"是未作答，不报错、不飘红
  function fbLine(y, sel, fields) {
    const parts = [];
    fields.forEach(f => {
      const want = valOf(y, f);
      const got = sel[f] || '';
      if (got === want) return;
      if (!got) { parts.push(`<span style="color:var(--ink-3)">${({ qin: '六亲', shiy: '世应', shen: '六神', nj: '纳甲' })[f]}：未作答</span>`); return; }
      const rule = f === 'qin' ? QIN_RULE[want] : f === 'shiy' ? `${QUIZ.p.ben.gong}宫${QUIZ.p.ben.type}` : '';
      parts.push(`<span class="x">×</span>${({ qin: '六亲', shiy: '世应', shen: '六神', nj: '纳甲' })[f]}：<span style="color:var(--ink-2)">「${esc(got)}」</span>→ 应为「<b>${want || '无'}</b>」${rule ? `<span class="rule">（${rule}）</span>` : ''}`);
    });
    if (!parts.length) return '<span class="ok">全对 ✓</span>';
    return parts.join('　');
  }

  function checkQuiz() {
    QUIZ.checked = true;
    drawQuiz();
    const p = QUIZ.p;
    const fields = LV_FIELDS[QUIZ.level];
    const askName = true;
    const total = fields.length * 6 + 1;
    let filled = 0, right = 0;
    for (let i = 0; i < 6; i++) {
      const a = QUIZ.ans[i] || {};
      fields.forEach(f => {
        if (a[f]) { filled++; if (a[f] === valOf(p.yao[i], f)) right++; }
      });
    }
    if (askName && QUIZ.name) { filled++; if (QUIZ.name === p.ben.name) right++; }
    ST.quiz = ST.quiz || [];
    ST.quiz.push({ t: Date.now(), score: right, total: total, filled: filled, level: QUIZ.level });
    ST.quiz = ST.quiz.slice(-40);
    store.set(ST);

    const rate = filled ? Math.round(right / filled * 100) : 0;
    const judge = !filled ? '一格没填，先装两爻试试'
      : rate >= 90 ? '这一卦装得稳'
      : rate >= 60 ? '大方向对，错处看下面'
      : '错因在下面，逐行看一遍再换一卦';
    $('#quizResult').innerHTML = `<div class="card card-pad" style="background:var(--paper-2)">
      <div style="font-family:var(--font-title);font-size:17px">已判 <b class="mono">${filled}</b>/${total} 格 · 全对 <b class="mono">${right}</b> 格</div>
      <p class="tiny" style="margin:6px 0 0;color:var(--ink-2)">${judge}。${p.fuShen.length ? '这一卦缺六亲，还要取伏神。' : ''}</p>
      <p class="tiny muted" style="margin:4px 0 0">没填的格子不计错，只记未作答。</p>
    </div>`;
  }

  /* ---------------- 断卦走查器 ---------------- */
  const TREE = [
    { n: 1, t: '取用神', src: 'p03', zhang: '用神章第九', ask: '你问的是什么事？先定哪一爻代表它。',
      opts: [['问自身、运势、安危', '世爻'], ['问父母、长辈、文书、房子、车', '父母'], ['问钱财、工资、投资、女友', '妻财'], ['问工作、官职、疾病、丈夫', '官鬼'], ['问子女、晚辈、宠物、医药', '子孙'], ['问兄弟、朋友、同事、竞争者', '兄弟']],
      warn: '用神取错，后面全错。同一个卦问不同的事，用神完全不同。' },
    { n: 2, t: '看旺衰', src: 'p05', zhang: '月将章第十六 · 日辰章第十七', ask: '用神此刻有力还是无力？力量来自月建、日辰和动爻。',
      opts: [['临月建 / 临日辰', '旺相'], ['得日月生扶', '相'], ['休囚，无人生扶', '无力'], ['逢旬空', '空'], ['与月建相冲', '月破']],
      warn: '旺衰不看爻本身，看日月和动爻给了它多少力量。' },
    { n: 3, t: '看动爻', src: 'p05', zhang: '动静生克章第十四', ask: '卦里有哪几爻在动？它们对用神做了什么？',
      opts: [['有动爻生用神', '得生'], ['有动爻克用神', '受克'], ['动爻与用神相合', '被合'], ['无动爻（六爻安静）', '安静']],
      warn: '动爻优先级高于静爻，但静爻旺时一样能生克。' },
    { n: 4, t: '看动变', src: 'p05', zhang: '动变生克冲合章第十五', ask: '动爻变出了什么？变爻只作用本位那个动爻。',
      opts: [['化回头生', '加强'], ['化回头克', '削弱'], ['化进神', '加强'], ['化退神', '削弱'], ['化空 / 化破 / 化墓 / 化绝', '落空'], ['反吟 / 伏吟', '反复']],
      warn: '变爻不管别的爻，本位动爻也克不到变爻。' },
    { n: 5, t: '查特殊', src: 'p06', zhang: '章十九 ~ 章廿六 · P06–P08', ask: '这些结构里，有哪些在这一卦出现了？勾上它们。',
      checklist: ['旬空', '月破', '日破', '三合局', '六合', '六冲', '三刑', '伏神', '入墓'],
      warn: '特殊结构是"加分项/减分项"，不能单独定吉凶。' },
    { n: 6, t: '定吉凶', src: 'p05', zhang: '克处逢生章第十三', ask: '把前面五步合起来，最终落在用神身上的是生还是克？',
      opts: [['生多克少，用神旺', '吉'], ['克多生少，用神衰', '凶'], ['克处逢生，凶中有救', '先凶后吉'], ['生处逢克，吉中有变', '先吉后凶'], ['用神空破无救', '不成']],
      warn: '一克一生，看最后谁落在用神身上，不是数个数。' }
  ];

  let WALK = {};

  VIEWS.walk = function (root) {
    WALK = { ans: {}, spec: {}, step: 0 };
    root.innerHTML = `<div class="wrap">
      <div class="page-head">
        <div class="kicker">Decision Walk</div>
        <h1>断卦走查</h1>
        <p class="lede">按课程教过的顺序走一遍：取用神 → 看旺衰 → 看动爻 → 看动变 → 查特殊 → 定吉凶 → 出结论。每一步都标了它出自哪一章、哪一集，结论可以倒查。</p>
      </div>
      <div class="pan-grid" style="grid-template-columns:1fr 380px">
        <div id="steps"></div>
        <div>
          <div class="card" style="position:sticky;top:80px">
            <div class="card-hd"><h3>草稿纸</h3><button class="btn ghost sm" id="clearWalk">重来</button></div>
            <div class="card-pad" id="draft" style="max-height:calc(100vh - 180px);overflow:auto"><div class="empty" style="padding:32px 8px">选一项，这里会记下你的判断和它的出处。</div></div>
          </div>
        </div>
      </div>
    </div>`;
    renderWalk();
    $('#clearWalk').onclick = () => { WALK = { ans: {}, spec: {}, step: 0 }; renderWalk(); };
  };

  function renderWalk() {
    const box = $('#steps');
    box.innerHTML = TREE.map(s => {
      const open = WALK.step >= s.n - 1;
      const done = WALK.ans[s.n] || (s.n === 5 && Object.keys(WALK.spec).length);
      let body = '';
      if (s.checklist) {
        const cnt = Object.keys(WALK.spec).length;
        body = `<div style="border:1px solid var(--rule);border-radius:2px;overflow:hidden">
          <div style="height:44px;display:flex;align-items:center;justify-content:space-between;padding:0 14px;cursor:pointer;background:var(--paper-2)" id="specHead">
            <span style="font-size:14px;font-weight:500">特殊项</span>
            <span class="tiny muted">${cnt ? '已勾 ' + cnt + ' 项' : '未勾选'} · ${WALK.specOpen ? '收起' : '展开'}</span>
          </div>
          ${WALK.specOpen ? `<div>${s.checklist.map(c => `<label style="height:40px;display:flex;align-items:center;gap:10px;padding:0 14px;border-top:1px solid var(--rule);cursor:pointer;font-size:13px">
            <span style="width:16px;height:16px;border:1px solid var(--rule-2);border-radius:2px;display:grid;place-items:center;background:${WALK.spec[c] ? 'var(--accent)' : 'transparent'};color:var(--paper);font-size:11px">${WALK.spec[c] ? '✓' : ''}</span>
            ${c}</label>`).join('')}</div>` : ''}
        </div>`;
      } else if (s.opts) {
        body = `<div style="display:flex;flex-wrap:wrap;gap:8px">${s.opts.map((o, k) => {
          const on = WALK.ans[s.n] === o[1];
          return `<button class="opt ${on ? 'on' : ''}" data-step="${s.n}" data-val="${esc(o[1])}" data-key="${esc(o[0])}"
            style="text-align:left;padding:8px 12px;border:1px solid ${on ? 'var(--accent)' : 'var(--rule-2)'};background:${on ? 'var(--accent-wash)' : '#fff'};border-radius:2px;cursor:pointer;font-size:12px;line-height:1.5;max-width:100%">
            <div style="font-weight:500;color:var(--ink)">${esc(o[1])}</div>
            <div style="color:var(--ink-3)">${esc(o[0])}</div></button>`;
        }).join('')}</div>`;
      }
      if (!open) return '';
      return `<div class="card" style="margin-bottom:14px">
        <div style="padding:18px 20px">
          <div style="display:flex;align-items:baseline;gap:10px;margin-bottom:6px">
            <span class="mono" style="font-size:12px;color:var(--ink-4)">0${s.n}</span>
            <h3 style="font-size:16px">${esc(s.t)}</h3>
            <span style="flex:1"></span>
            ${done ? '<span class="seal good">已判</span>' : ''}
          </div>
          <div class="tiny muted" style="margin-bottom:14px">${esc(s.ask)}</div>
          ${body}
          ${s.warn ? `<div class="tree-warn">${esc(s.warn)}</div>` : ''}
          <div class="tiny mono" style="color:var(--ink-4);margin-top:10px">据 ${esc(s.zhang)} · ${videoRef(s.src)}</div>
        </div>
      </div>`;
    }).join('');

    if (WALK.ans[6]) {
      box.innerHTML += `<div class="card card-pad" style="border-left:3px solid var(--accent)">
        <div class="tiny mono" style="color:var(--accent);letter-spacing:.12em">结论草稿</div>
        <p style="font-family:var(--font-title);font-size:17px;margin:10px 0">${esc(buildDraft())}</p>
        <p class="tiny muted" style="margin:0 0 8px">这份草稿只用了课程讲过的判定步。课程没有应期专章，所以这里不给具体日期。</p>
        <p class="tiny" style="margin:0;color:var(--ink-2)">想看应期怎么推，去<a href="#/cases">案例库</a>看示例卦。</p>
      </div>`;
    }

    $$('#steps .opt').forEach(b => b.onclick = () => {
      WALK.ans[Number(b.dataset.step)] = b.dataset.val;
      WALK.ans['k' + b.dataset.step] = b.dataset.key;
      WALK.step = Math.max(WALK.step, Number(b.dataset.step));
      renderWalk();
    });
    const sh = $('#specHead');
    if (sh) sh.onclick = () => { WALK.specOpen = !WALK.specOpen; renderWalk(); };
    if (WALK.specOpen) $$('#steps label').forEach(l => l.onclick = e => {
      e.preventDefault();
      const t = l.textContent.trim();
      WALK.spec[t] = !WALK.spec[t];
      if (!WALK.spec[t]) delete WALK.spec[t];
      WALK.step = Math.max(WALK.step, 4);
      renderWalk();
    });
    renderDraft();
  }

  function buildDraft() {
    const a = WALK.ans;
    const parts = [];
    if (a[1]) parts.push(`以${a[1]}为用神`);
    if (a[2]) parts.push(`用神${a[2]}`);
    if (a[3]) parts.push(`卦中${a[3]}`);
    if (a[4]) parts.push(`变爻${a[4]}`);
    const sp = Object.keys(WALK.spec);
    if (sp.length) parts.push(`并见${sp.join('、')}`);
    if (a[6]) parts.push(`断为${a[6]}`);
    return parts.length ? parts.join('，') + '。' : '还没走完。';
  }

  function renderDraft() {
    const rows = [];
    TREE.forEach(s => {
      if (s.checklist) {
        const sp = Object.keys(WALK.spec);
        if (sp.length) rows.push(`<div style="padding:8px 0;border-bottom:1px dashed var(--rule)">
          <div style="font-size:13px"><span class="muted tiny">0${s.n} </span>特殊项：${sp.join('、')}</div>
          <div class="tiny mono" style="color:var(--ink-4);margin-top:2px">据 ${esc(s.zhang)} · P06–P08</div></div>`);
        return;
      }
      if (!WALK.ans[s.n]) return;
      rows.push(`<div style="padding:8px 0;border-bottom:1px dashed var(--rule)">
        <div style="font-size:13px"><span class="muted tiny">0${s.n} </span>${esc(s.t)}：<b>${esc(WALK.ans[s.n])}</b></div>
        <div class="tiny mono" style="color:var(--ink-4);margin-top:2px">据 ${esc(s.zhang)} · ${videoRef(s.src)}</div></div>`);
    });
    const box = $('#draft');
    if (!box) return;
    box.innerHTML = rows.length ? rows.join('') + (WALK.ans[6] ? `<div style="margin-top:14px;font-family:var(--font-title);font-size:15px">${esc(buildDraft())}</div>` : '')
      : '<div class="empty" style="padding:32px 8px">选一项，这里会记下你的判断和它的出处。</div>';
  }

  /* ---------------- 案例库 ---------------- */
  function parseGz(s) {
    const m = s.match(/([甲乙丙丁戊己庚辛壬癸])([子丑寅卯辰巳午未申酉戌亥])日/);
    const mm = s.match(/([子丑寅卯辰巳午未申酉戌亥])月/);
    return {
      dg: m ? P.GAN.indexOf(m[1]) : 0,
      dz: m ? P.ZHI.indexOf(m[2]) : 0,
      mz: mm ? mm[1] : '子'
    };
  }

  VIEWS.cases = function (root) {
    const curId = location.hash.split('/')[2] || D.CASES[0].id;
    const cur = D.CASES.find(c => c.id === curId) || D.CASES[0];
    const g = parseGz(cur.gz);
    const p = P.paipan(cur.yao, new Date(), {
      day: { gan: g.dg, zhi: g.dz },
      gzText: { month: g.mz + '月', day: P.GAN[g.dg] + P.ZHI[g.dz] + '日' }
    });

    root.innerHTML = `<div class="wrap">
      <div class="page-head">
        <div class="kicker">Cases</div>
        <h1>案例库</h1>
        <p class="lede">五张示例卦，每张只练一两个规则。卦盘由引擎按爻复算，解读是本站按课程规则作的推演，不是古籍原文。</p>
      </div>
      <div class="case-shell">
        <div class="case-list">
          ${D.CASES.map(c => `<a href="#/cases/${c.id}" class="case-item ${c.id === cur.id ? 'on' : ''}">
            <div class="mono tiny" style="color:var(--ink-4)">${videoRef(c.src)}</div>
            <div style="font-size:13px;font-weight:500;color:var(--ink)">${esc(c.title)}</div>
            <div class="tiny muted">${esc(c.focus)}</div>
          </a>`).join('')}
        </div>
        <div class="case-detail">
          <div>
            <div class="card">
              <div class="card-hd"><h3>卦象</h3><span class="tiny mono muted">${esc(p.ganzhi.monthText)} ${esc(p.ganzhi.dayText)}</span></div>
              <div class="card-pad">${panSummary(p)}${renderPan(p)}</div>
            </div>
          </div>
          <div>
            <h2 style="font-size:22px">${esc(cur.title)}</h2>
            <p class="muted" style="font-size:14px;margin-top:4px">${esc(cur.q)}</p>
            <div class="seal plain" style="margin:10px 0 18px">${esc(cur.focus)}</div>
            <div class="tiny muted" style="letter-spacing:.12em;margin-bottom:6px">示例解读</div>
            <p style="font-size:15px;line-height:1.95">${esc(cur.an)}</p>
            <div class="divider"></div>
            <p class="tiny muted" style="margin:0 0 10px">此卦为按课程规则构造的示例，用于演示判读路径；不是《增删卜易》原文，也不是课件板书摘录。真实占断请以原书与课程为准。</p>
            <div class="row" style="gap:10px">
              <button class="btn ghost sm" onclick="location.hash='#/walk'">用走查器走一遍 →</button>
              <button class="btn ghost sm" onclick="location.hash='#/manual'">去手册看这一章</button>
            </div>
            <div class="tiny mono" style="color:var(--ink-4);margin-top:14px">出自 ${videoRef(cur.src)} · ${esc(cur.zhang)}</div>
          </div>
        </div>
      </div>
    </div>`;
  };

  /* ---------------- 速查 ---------------- */
  VIEWS.ref = function (root) {
    const groups = [...new Set(D.CARDS.map(c => c.g))];
    root.innerHTML = `<div class="wrap">
      <div class="page-head">
        <div class="kicker">Reference</div>
        <h1>速查</h1>
        <p class="lede">44 张知识卡 + 8 张表。断卦卡住的时候，先来这里查，不要回去翻视频。</p>
      </div>
      <div class="row" style="margin-bottom:20px">
        <input type="text" id="q" placeholder="搜：旬空 / 三合 / 世应 / 六神…" style="width:100%">
      </div>
      <div id="cards">${groups.map(g => `<div class="tiny muted" style="letter-spacing:.14em;margin:22px 0 10px">${esc(g)}</div>
        <div class="cards-grid">${D.CARDS.filter(c => c.g === g).map(c => `
          <div class="kcard" data-txt="${esc(c.q + c.a)}">
            <div class="g">${esc(c.g)}</div>
            <div class="q">${esc(c.q)}</div>
            <div class="a">${esc(c.a)}</div>
            <div class="s">${videoRef(c.s)}</div>
          </div>`).join('')}</div>`).join('')}</div>

      <div class="tiny muted" style="letter-spacing:.14em;margin:36px 0 10px">对照表</div>
      <div class="cards-grid" style="grid-template-columns:repeat(auto-fill,minmax(320px,1fr))">
        <div class="card"><div class="card-hd"><h3>六合 / 六冲</h3></div><div class="card-pad">
          <div class="row" style="gap:16px"><div style="flex:1"><div class="tiny muted">六合</div>${D.TABLES.liuhe.map(x => `<div class="mono tiny">${x}</div>`).join('')}</div>
          <div style="flex:1"><div class="tiny muted">六冲</div>${D.TABLES.liuchong.map(x => `<div class="mono tiny">${x}</div>`).join('')}</div></div>
        </div></div>
        <div class="card"><div class="card-hd"><h3>三合局 / 三刑</h3></div><div class="card-pad">
          ${D.TABLES.sanhe.map(x => `<div class="mono tiny">${x}</div>`).join('')}
          <div class="divider" style="margin:10px 0"></div>
          ${D.TABLES.sanxing.map(x => `<div class="mono tiny">${x}</div>`).join('')}
        </div></div>
        <div class="card"><div class="card-hd"><h3>生旺墓绝</h3></div><div class="card-pad">
          <table class="tb"><thead><tr><th>五行</th><th>长生</th><th>帝旺</th><th>墓</th><th>绝</th></tr></thead><tbody>
          ${D.TABLES.mu.map(m => `<tr><td class="wx-${m.wx}">${m.wx}</td><td class="mono">${m.cs}</td><td class="mono">${m.wang}</td><td class="mono">${m.mu}</td><td class="mono">${m.jue}</td></tr>`).join('')}
          </tbody></table></div></div>
        <div class="card"><div class="card-hd"><h3>旬空</h3></div><div class="card-pad">
          <table class="tb"><thead><tr><th>旬</th><th>空亡</th></tr></thead><tbody>
          ${D.TABLES.xunkong.map(m => `<tr><td class="mono">${m.xun}</td><td class="mono">${m.kong}</td></tr>`).join('')}
          </tbody></table></div></div>
        <div class="card"><div class="card-hd"><h3>六神起法</h3></div><div class="card-pad">
          <table class="tb"><thead><tr><th>日干</th><th>初爻起</th></tr></thead><tbody>
          <tr><td>甲 乙</td><td>青龙</td></tr><tr><td>丙 丁</td><td>朱雀</td></tr>
          <tr><td>戊</td><td>勾陈</td></tr><tr><td>己</td><td>螣蛇</td></tr>
          <tr><td>庚 辛</td><td>白虎</td></tr><tr><td>壬 癸</td><td>玄武</td></tr>
          </tbody></table>
          <p class="tiny muted" style="margin:8px 0 0">顺序：青龙 → 朱雀 → 勾陈 → 螣蛇 → 白虎 → 玄武</p></div></div>
        <div class="card"><div class="card-hd"><h3>八宫世应</h3></div><div class="card-pad">
          <table class="tb"><thead><tr><th>卦型</th><th>世</th><th>应</th></tr></thead><tbody>
          <tr><td>本宫卦</td><td>六</td><td>三</td></tr><tr><td>一世</td><td>初</td><td>四</td></tr>
          <tr><td>二世</td><td>二</td><td>五</td></tr><tr><td>三世</td><td>三</td><td>六</td></tr>
          <tr><td>四世</td><td>四</td><td>初</td></tr><tr><td>五世</td><td>五</td><td>二</td></tr>
          <tr><td>游魂</td><td>四</td><td>初</td></tr><tr><td>归魂</td><td>三</td><td>六</td></tr>
          </tbody></table></div></div>
      </div>
    </div>`;

    $('#q').oninput = e => {
      const v = e.target.value.trim();
      $$('.kcard').forEach(c => {
        c.style.display = !v || c.dataset.txt.indexOf(v) >= 0 ? '' : 'none';
      });
    };
  };

  /* ---------------- 断卦手册 ---------------- */
  /* 章号：正文 18 章（章九~章廿六）+ 四时旺相 + 附录 3 章 = 22 章
     注：课件里「旬空章」与「归魂游魂章」同标第二十六，属课件重号，本站按附录处理 */
  const ZHANG = {
    c14: '章九', c15: '章十', c16: '章十一', c17: '章十二', c18: '章十三',
    c19: '章十四', c20: '章十五', c21: '章十六', c22: '章十七', c23: '章十八',
    c24: '章十九', c25: '章二十', c26: '章廿一', c27: '章廿二', c28: '章廿三',
    c29: '章廿四', c30: '章廿五', c31: '章廿六',
    m01: '附', c32: '附', c33: '附', c34: '附'
  };

  VIEWS.manual = function (root) {
    const chs = [];
    D.VOLS.slice(2).forEach(v => v.chapters.forEach(c => {
      const extra = (D.MANUAL_EXTRA || []).filter(m => m.before === c.id);
      extra.forEach(m => chs.push({ ...m, volTitle: v.title }));
      chs.push({ ...c, vol: v.id, volTitle: v.title });
    }));
    const curId = location.hash.split('/')[2] || chs[0].id;
    const cur = chs.find(c => c.id === curId) || chs[0];
    const idx = chs.indexOf(cur);
    const titleOf = c => c.mt || c.t;

    root.innerHTML = `<div class="wrap">
      <div class="page-head">
        <div class="kicker">Manual</div>
        <h1>断卦手册</h1>
        <p class="lede">《增删卜易》逐章精读的沉淀。21 章按原书章序排，每章都能回到视频里的那一段。</p>
      </div>
      <div class="case-grid" style="grid-template-columns:240px 1fr;gap:32px">
        <div style="position:sticky;top:80px;max-height:calc(100vh - 100px);overflow:auto">
          ${chs.map(c => `<a href="#/manual/${c.id}" style="display:flex;gap:10px;align-items:center;height:36px;padding:0 10px;border-radius:2px;text-decoration:none;
            background:${c.id === cur.id ? 'var(--paper-2)' : 'transparent'};border-left:2px solid ${c.id === cur.id ? 'var(--accent)' : 'transparent'}">
            <span class="mono tiny" style="color:var(--ink-4);width:44px;flex:none">${ZHANG[c.id] || ''}</span>
            <span style="font-size:13px;color:${c.id === cur.id ? 'var(--ink)' : 'var(--ink-2)'}">${esc(c.t)}</span></a>`).join('')}
        </div>
        <div style="max-width:68ch">
          <div class="tiny mono" style="color:var(--ink-4);letter-spacing:.1em">${ZHANG[cur.id] || ''} · ${esc(cur.volTitle)}</div>
          <h2 style="font-size:26px;margin:6px 0 4px">${esc(cur.t)}</h2>
          <div class="tiny mono muted" style="margin-bottom:20px">对应 ${videoRef(cur.vol)}</div>
          <p style="font-family:var(--font-title);font-size:16px;line-height:1.9">${esc(cur.p)}</p>
          <div class="divider"></div>
          <div class="tiny muted" style="letter-spacing:.12em;margin-bottom:8px">记住这两条</div>
          <ul style="font-size:14px;line-height:1.9;padding-left:18px;color:var(--ink-2)">
            ${cur.keys.map(k => `<li>${esc(k)}</li>`).join('')}
          </ul>
          <div style="margin-top:28px;height:56px;background:var(--paper-2);border-radius:2px;display:flex;align-items:center;justify-content:space-between;padding:0 16px">
            <span style="font-size:13px;color:var(--ink-2)">这一章可以这样练</span>
            <button class="btn ghost sm" onclick="location.hash='#/paipan'">装卦台试一次 →</button>
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:24px">
            ${idx > 0 ? `<a href="#/manual/${chs[idx - 1].id}" style="font-size:13px">← ${esc(chs[idx - 1].t)}</a>` : '<span></span>'}
            ${idx < chs.length - 1 ? `<a href="#/manual/${chs[idx + 1].id}" style="font-size:13px">${esc(chs[idx + 1].t)} →</a>` : '<span></span>'}
          </div>
        </div>
      </div>
    </div>`;
  };

  /* ---------------- 启动 ---------------- */
  router();
})();
