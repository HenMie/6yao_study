<script setup>
/* ============================================================
 * ContentBlocks  分节讲解块渲染器
 * 渲染 data.js 章节的 d: 数组。块类型：ps / ul / verse / tbl / warn / dia
 * 版式遵循 DESIGN.md：宋体小节标题 + 汉字编号、口诀 serif 引文块
 * （朱砂左标线）、小对照表 1px 纸格、易错点朱砂标记块。
 * dia 为自绘图示块，由 DiagramBlock 按 type 分发。
 * ============================================================ */
import { computed } from 'vue'
import DiagramBlock from './DiagramBlock.vue'

const props = defineProps({
  blocks: { type: Array, default: () => [] }
})

/* 汉字编号：一 二 三 四 五 六 七 八 九 十 */
const CN = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二']
const noOf = (i) => CN[i] || String(i + 1)
</script>

<template>
  <div v-if="blocks && blocks.length" class="cblocks">
    <section v-for="(b, i) in blocks" :key="i" class="cb">
      <h3 v-if="b.h" class="cb-h">
        <span class="cb-no">{{ noOf(i) }}</span>
        <span>{{ b.h }}</span>
      </h3>

      <DiagramBlock v-if="b.dia" :spec="b.dia" />

      <p v-for="(p, j) in (b.ps || [])" :key="'p' + j" class="cb-p">{{ p }}</p>

      <ul v-if="b.ul" class="cb-ul">
        <li v-for="(it, j) in b.ul" :key="'u' + j">{{ it }}</li>
      </ul>

      <div v-if="b.verse" class="cb-verse">
        <p v-for="(v, j) in b.verse" :key="'v' + j">{{ v }}</p>
      </div>

      <table v-if="b.tbl" class="cb-tbl">
        <thead>
          <tr><th v-for="h in b.tbl.head" :key="h">{{ h }}</th></tr>
        </thead>
        <tbody>
          <tr v-for="(r, j) in b.tbl.rows" :key="'r' + j">
            <td v-for="(c, k) in r" :key="'c' + k" :class="{ first: k === 0 }">{{ c }}</td>
          </tr>
        </tbody>
      </table>

      <div v-if="b.warn" class="cb-warn">
        <div class="cb-warn-tag">易错</div>
        <ul>
          <li v-for="(w, j) in b.warn" :key="'w' + j">{{ w }}</li>
        </ul>
      </div>
    </section>
  </div>
</template>

<style scoped>
.cblocks { margin-top: 8px; }
.cb { padding: 26px 0 4px; }
.cb + .cb { border-top: 1px solid var(--rule); margin-top: 22px; }

.cb-h {
  font-family: var(--serif);
  font-size: 18px; font-weight: 600; line-height: 1.45;
  letter-spacing: .02em; color: var(--ink);
  display: flex; align-items: baseline; gap: 10px;
  margin-bottom: 10px;
}
.cb-no {
  font-family: var(--mono);
  font-size: 13px; font-weight: 400; color: var(--accent);
  flex: none; transform: translateY(-1px);
}

.cb-p { font-size: 16px; line-height: 1.92; color: var(--ink-2); margin: 0 0 11px; }

.cb-ul { margin: 0 0 10px; padding: 0; list-style: none; }
.cb-ul li {
  position: relative; padding: 0 0 6px 18px;
  font-size: 15px; line-height: 1.88; color: var(--ink-2);
}
.cb-ul li::before {
  content: ''; position: absolute; left: 0; top: .85em;
  width: 9px; height: 1px; background: var(--accent);
}

.cb-verse {
  background: var(--paper-2);
  border-left: 2px solid var(--accent);
  padding: 14px 20px; margin: 4px 0 12px;
}
.cb-verse p {
  margin: 0; font-family: var(--serif);
  font-size: 16.5px; line-height: 2.05; letter-spacing: .04em;
  color: var(--ink);
}

.cb-tbl { width: 100%; border-collapse: collapse; margin: 4px 0 12px; }
.cb-tbl th {
  text-align: left; font-weight: 500;
  font-size: 12px; letter-spacing: .08em; color: var(--ink-3);
  background: var(--paper-2);
  padding: 7px 12px; border-bottom: 1px solid var(--rule-2);
}
.cb-tbl td {
  font-size: 14.5px; line-height: 1.78; color: var(--ink-2);
  padding: 8px 12px; border-bottom: 1px solid var(--rule);
}
.cb-tbl tr:last-child td { border-bottom: 0; }
.cb-tbl td.first { font-family: var(--serif); font-weight: 600; color: var(--ink); white-space: nowrap; }

.cb-warn {
  border-left: 2px solid var(--accent);
  padding: 2px 0 2px 14px; margin: 8px 0 6px;
}
.cb-warn-tag {
  font-family: var(--mono); font-size: 12px;
  letter-spacing: .18em; color: var(--accent);
  margin-bottom: 6px;
}
.cb-warn ul { margin: 0; padding: 0; list-style: none; }
.cb-warn li {
  position: relative; padding: 0 0 6px 16px;
  font-size: 15px; line-height: 1.85; color: var(--ink-2);
}
.cb-warn li::before {
  content: '×'; position: absolute; left: 0; top: 0;
  font-family: var(--mono); font-size: 13px; color: var(--accent);
}
</style>
