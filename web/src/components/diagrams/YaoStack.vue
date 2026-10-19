<script setup>
/* ============================================================
 * YaoStack  六爻纵向图
 * 行序自上而下（上 → 初），爻线复用全局 .yao 的 CSS 画法。
 * 可加：摇卦次序、内外卦分组、飞神伏神、术语标签。
 * ============================================================ */
defineProps({
  rows: { type: Array, required: true },
  order: { type: Boolean, default: false },
  arrow: { type: String, default: '' },
  groups: { type: Array, default: () => [] },
  head: { type: Array, default: () => [] }
})
</script>

<template>
  <div class="ys">
    <div v-if="head.length" class="ys-head">
      <span v-for="(h, i) in head" :key="i">{{ h }}</span>
    </div>

    <div class="ys-body">
      <div v-if="arrow" class="ys-rail" aria-hidden="true">
        <span class="ys-rail-t">{{ arrow }}</span>
        <span class="ys-rail-l" />
      </div>

      <div class="ys-rows">
        <div v-for="(r, i) in rows" :key="i" class="ys-item">
          <div class="ys-row" :class="{ shi: r.tone === 'shi' }">
            <span class="ys-pos m">{{ r.pos }}</span>
            <span v-if="order" class="ys-ord m">{{ r.left }}</span>
            <span class="yao" :class="[r.yin ? 'yin' : 'yang', r.tone === 'move' ? 'move' : '']">
              <i /><i v-if="r.yin" />
            </span>
            <span class="ys-mark m">{{ r.mark || '' }}</span>
            <span class="ys-zhi m">{{ r.zhi || '' }}</span>
            <span class="ys-lbl s">{{ r.label || '' }}</span>
            <span class="ys-tags">
              <b v-for="t in (r.tags || [])" :key="t">{{ t }}</b>
            </span>
          </div>
          <div v-if="r.fushen" class="ys-fu">
            <span class="ys-fu-tag m">伏</span>
            <span class="ys-fu-zhi m">{{ r.fushen.zhi }}</span>
            <span class="ys-fu-lbl s">{{ r.fushen.label }}</span>
            <span v-if="r.fushen.note" class="ys-fu-note">{{ r.fushen.note }}</span>
          </div>
        </div>
      </div>

      <div v-if="groups.length" class="ys-groups">
        <div v-for="(g, i) in groups" :key="i" class="ys-grp" :style="{ flex: g.n }">
          <b>{{ g.label }}</b>
          <span v-if="g.sub">{{ g.sub }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ys { font-size: 14px; }
.ys-head {
  display: grid; grid-template-columns: 26px 54px 104px 24px 52px 1fr auto;
  gap: 10px; padding: 0 0 6px; border-bottom: 1px solid var(--rule-2);
  font-family: var(--mono); font-size: 10px; letter-spacing: .12em; color: var(--ink-3);
}
.ys-head span:first-child { grid-column: 1 / 3; }

.ys-body { display: flex; align-items: stretch; gap: 12px; }

.ys-rail {
  flex: none; width: 20px; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 8px;
}
.ys-rail-t {
  writing-mode: vertical-rl; text-orientation: upright;
  font-family: var(--mono); font-size: 10px; letter-spacing: .18em; color: var(--ink-3);
}
.ys-rail-l {
  width: 1px; flex: 1; max-height: 120px;
  background: linear-gradient(to top, var(--rule-2), var(--accent));
  position: relative;
}
.ys-rail-l::before {
  content: ''; position: absolute; top: -1px; left: -3px;
  border-left: 3.5px solid transparent; border-right: 3.5px solid transparent;
  border-bottom: 6px solid var(--accent);
}

.ys-rows { flex: 1; min-width: 0; max-width: 640px; }
.ys-item { border-bottom: 1px solid #F1ECE1; }
.ys-item:last-child { border-bottom: 0; }

.ys-row {
  display: grid;
  grid-template-columns: 26px 54px 104px 24px 52px 1fr auto;
  gap: 10px; align-items: center; min-height: 40px;
}
.ys-row:not(:has(.ys-ord)) { grid-template-columns: 26px 104px 24px 52px 1fr auto; }
.ys-row.shi { background: rgba(166, 51, 31, .035); }

.ys-pos { font-size: 12px; color: var(--ink-3); }
.ys-ord { font-size: 10px; color: var(--ink-4); letter-spacing: .02em; }
.yao.move i { background: var(--accent); }
.ys-mark { font-size: 13px; color: var(--accent); text-align: center; }
.ys-zhi { font-size: 12.5px; color: var(--ink-2); }
.ys-lbl { font-size: 14px; color: var(--ink); }

.ys-tags { display: flex; gap: 4px; justify-content: flex-end; }
.ys-tags b {
  font-weight: 400; font-family: var(--mono); font-size: 9.5px;
  letter-spacing: .04em; color: var(--accent);
  border: 1px solid rgba(166, 51, 31, .35); border-radius: 2px;
  padding: 0 4px; line-height: 1.6;
}

.ys-fu {
  display: flex; align-items: center; gap: 8px;
  margin: 0 0 6px 184px; padding: 4px 0 2px 0;
  border-top: 1px dashed var(--rule-2);
  font-size: 12px;
}
.ys-fu-tag {
  font-size: 9.5px; color: var(--ink-3);
  border: 1px solid var(--rule-2); border-radius: 2px; padding: 0 4px;
}
.ys-fu-zhi { font-size: 12px; color: var(--ink-2); }
.ys-fu-lbl { font-size: 13px; color: var(--ink); }
.ys-fu-note { font-size: 11.5px; color: var(--ink-3); }

.ys-groups { flex: none; width: 72px; display: flex; flex-direction: column; }
.ys-grp {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 3px; border-left: 1px solid var(--rule-2); padding-left: 6px;
}
.ys-grp b {
  font-weight: 400; font-family: var(--serif); font-size: 12px;
  letter-spacing: .1em; color: var(--ink-2);
}
.ys-grp span {
  font-family: var(--mono); font-size: 9.5px; letter-spacing: .1em; color: var(--ink-4);
}
</style>
