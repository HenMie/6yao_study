import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'
import { VOLS } from '../src/content/data.js'

const base = process.env.COURSE_BASE || 'http://127.0.0.1:4173'
const browser = await chromium.launch({ channel: 'msedge', headless: true })

/* 对每张"本卦与变卦对照"图做包围盒相交检查：
 * 文字（卦名/爻位/○×/阴阳标注/底注）不得与矩形（爻线/高亮底纹）相交。 */
const probe = async (viewport, label) => {
  const page = await browser.newPage({ viewport })
  const found = []
  try {
    for (const volume of VOLS) for (const unit of volume.chapters) {
      await page.goto(`${base}/#/unit/${unit.id}`, { waitUntil: 'networkidle' })
      const svgs = page.locator('svg[aria-label="本卦与变卦对照"]')
      const n = await svgs.count()
      for (let s = 0; s < n; s++) {
        const issues = await svgs.nth(s).evaluate(svg => {
          const boxes = []
          for (const el of svg.querySelectorAll('text, rect, line, path')) {
            const b = el.getBoundingClientRect()
            if (b.width === 0 && b.height === 0) continue
            boxes.push({ tag: el.tagName, cls: el.getAttribute('class') || '', txt: el.textContent.trim(), b })
          }
          const hits = []
          for (const a of boxes) if (a.tag === 'text') for (const c of boxes) {
            if (c.tag !== 'rect') continue
            const ox = Math.min(a.b.right, c.b.right) - Math.max(a.b.left, c.b.left)
            const oy = Math.min(a.b.bottom, c.b.bottom) - Math.max(a.b.top, c.b.top)
            if (ox > 0.5 && oy > 0.5) hits.push(`"${a.txt}"(${a.cls}) ∩ rect [${ox.toFixed(1)}×${oy.toFixed(1)}px]`)
          }
          return hits
        })
        if (issues.length) found.push(`${unit.id} svg#${s}: ${issues.join(' | ')}`)
      }
    }
  } finally { await page.close() }
  assert.deepEqual(found, [], `${label} text/rect overlaps`)
  console.log(`PASS: ${label} — 全部 guapair 图无文字/矩形重叠`)
}

await probe({ width: 1440, height: 950 }, '桌面 1440')
await probe({ width: 390, height: 844 }, '手机 390')
await browser.close()
