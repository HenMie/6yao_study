/**
 * 手机端适配校验
 * 基准机型：iPhone 15 Pro Max（430×932 CSS px，DPR 3，触摸）
 * 覆盖档位：375×812（窄机）、390×844、430×932（基准）、768×1024（平板）
 *
 * 校验项：
 *  1. 页面无横向溢出（有意横向滚动的容器除外）
 *  2. 可点目标不小于 44px 高
 *  3. 正文与图示内字号可读
 *  4. 关键交互在手机视口下可完成
 */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { chromium } from 'playwright-core'

const base = process.env.MOBILE_BASE || 'http://127.0.0.1:4173'
const SHOTS = 'shots/mobile'
const DEVICES = [
  { name: 'iphone15promax', width: 430, height: 932, dpr: 3 },
  { name: 'iphone13mini', width: 375, height: 812, dpr: 3 },
  { name: 'iphone14', width: 390, height: 844, dpr: 3 },
  // 平板沿用桌面回退（不承诺完整适配），只做溢出兜底，其余指标仅作参考
  { name: 'ipad', width: 768, height: 1024, dpr: 2, relaxed: true }
]
const ROUTES = [
  ['path', '/#/path'],
  ['cast', '/#/cast'],
  ['walk', '/#/walk'],
  ['cases', '/#/cases'],
  ['ref', '/#/ref'],
  ['manual', '/#/manual'],
  ['unit', '/#/unit/c04'],
  ['manual-ch', '/#/manual/c22']
]

const MIN_TOUCH = 44
const MIN_BODY_FONT = 15
const MIN_SVG_FONT = 8

fs.mkdirSync(SHOTS, { recursive: true })

const browser = await chromium.launch({ channel: 'msedge', headless: true })
const errors = []
const findings = []
const notes = []

for (const dev of DEVICES) {
  const ctx = await browser.newContext({
    viewport: { width: dev.width, height: dev.height },
    deviceScaleFactor: dev.dpr,
    isMobile: dev.width < 700,
    hasTouch: true
  })
  const page = await ctx.newPage()
  page.on('pageerror', e => errors.push(`[${dev.name}] pageerror: ${e.message}`))
  page.on('console', m => { if (m.type() === 'error') errors.push(`[${dev.name}] console: ${m.text()}`) })
  page.on('response', r => { if (r.status() >= 400) errors.push(`[${dev.name}] HTTP ${r.status()}: ${r.url()}`) })

  for (const [name, route] of ROUTES) {
    await page.goto(base + route, { waitUntil: 'networkidle' })
    await page.waitForTimeout(250)

    const report = await page.evaluate(({ MIN_TOUCH, MIN_BODY_FONT, MIN_SVG_FONT }) => {
      const vw = document.documentElement.clientWidth
      const docW = document.documentElement.scrollWidth

      // 手机端不允许任何"需要横滑才能看全"的容器（导航条除外，那是单行标签栏）
      const scrollers = [...document.querySelectorAll('body *')].filter(el => {
        if (el.closest('.nav')) return false
        const cs = getComputedStyle(el)
        return /auto|scroll/.test(cs.overflowX) && el.scrollWidth > el.clientWidth + 1
      }).map(el => (el.className && typeof el.className === 'string' ? el.className : el.tagName) + `(${el.scrollWidth}/${el.clientWidth})`)

      // 找出真正把页面撑宽的元素：右边界超出视口、且没有可滚动祖先
      const culprits = []
      for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect()
        if (r.width === 0) continue
        if (r.right <= vw + 1) continue
        let p = el.parentElement, inScroller = false
        while (p) {
          const cs = getComputedStyle(p)
          if (/auto|scroll/.test(cs.overflowX)) { inScroller = true; break }
          p = p.parentElement
        }
        if (inScroller) continue
        const tag = el.tagName.toLowerCase()
        const cls = typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/).join('.') : ''
        culprits.push(`${tag}${cls} right=${Math.round(r.right)}`)
      }

      // 触摸目标
      const touchSel = '.nav a, .opt, .case-item, .unit, button, a[href^="#/manual/"], .drill a'
      const small = []
      for (const el of document.querySelectorAll(touchSel)) {
        const r = el.getBoundingClientRect()
        if (r.width === 0 || r.height === 0) continue
        // 跳过内联文字链接（正文内跳转不强求 44px）
        if (getComputedStyle(el).display === 'inline') continue
        if (r.height > 0 && r.height < MIN_TOUCH) {
          const cls = typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/).join('.') : ''
          small.push(`${el.tagName.toLowerCase()}${cls} h=${Math.round(r.height)}`)
        }
      }

      // 正文字号
      const smallText = []
      for (const sel of ['.cb-p', '.brief-p', '.lede', '.cb-ul li', '.cb-warn li', '.cur-sum p']) {
        const el = document.querySelector(sel)
        if (!el) continue
        const fs = parseFloat(getComputedStyle(el).fontSize)
        if (fs < MIN_BODY_FONT) smallText.push(`${sel} ${fs}px`)
      }

      // 图示内文字：按 SVG 缩放比折算实际渲染字号
      const svgSmall = []
      const svg = document.querySelector('.dia-body > svg')
      if (svg) {
        const vb = svg.viewBox.baseVal
        const scale = vb && vb.width ? svg.getBoundingClientRect().width / vb.width : 1
        for (const t of svg.querySelectorAll('text')) {
          const declared = parseFloat(t.getAttribute('font-size') || getComputedStyle(t).fontSize)
          const actual = declared * scale
          if (actual && actual < MIN_SVG_FONT) {
            svgSmall.push(`${t.textContent.trim().slice(0, 6)} ${actual.toFixed(1)}px`)
            if (svgSmall.length >= 3) break
          }
        }
      }
      return { vw, docW, overflow: docW - vw, scrollers, culprits: culprits.slice(0, 6), small: small.slice(0, 8), smallText, svgSmall }
    }, { MIN_TOUCH, MIN_BODY_FONT, MIN_SVG_FONT })

    const tag = `${dev.name}/${name}`
    if (report.overflow > 1) {
      // 横向溢出在所有档位都是硬失败
      findings.push(`${tag}: 横向溢出 ${report.overflow}px ← ${report.culprits.join(' | ')}`)
    }
    if (!dev.relaxed && report.scrollers.length) {
      findings.push(`${tag}: 仍有需要横滑的容器 ${report.scrollers.join(', ')}`)
    }
    if (!dev.relaxed) {
      if (report.small.length) findings.push(`${tag}: 触摸目标偏小 ${report.small.join(', ')}`)
      if (report.smallText.length) findings.push(`${tag}: 正文偏小 ${report.smallText.join(', ')}`)
      if (report.svgSmall.length) findings.push(`${tag}: 图示字号偏小 ${report.svgSmall.join(', ')}`)
    } else if (report.small.length || report.smallText.length || report.svgSmall.length) {
      notes.push(`${tag}: 平板档沿用桌面回退（触摸 ${report.small.length} 项、小字 ${report.smallText.length} 项）`)
    }

    if (dev.name === 'iphone15promax' || dev.name === 'iphone13mini') {
      await page.screenshot({ path: `${SHOTS}/${dev.name}-${name}.png`, fullPage: name === 'unit' || name === 'manual-ch' })
    }
    console.log(
      tag.padEnd(30),
      `vw=${report.vw} doc=${report.docW}`,
      report.overflow > 1 ? `❌溢出${report.overflow}` : '✅无溢出',
      report.small.length ? `⚠️${report.small.length}个小目标` : '',
      report.svgSmall.length ? `⚠️图字${report.svgSmall.length}` : ''
    )
  }

  // 交互冒烟：只在基准机型上跑一次
  if (dev.name === 'iphone15promax') {
    await page.goto(base + '/#/cast', { waitUntil: 'networkidle' })
    await page.getByRole('button', { name: '连摇六次' }).click()
    await page.waitForTimeout(600)
    const panRows = await page.locator('.pan-row').count()
    assert.ok(panRows >= 6, `手机端排盘失败，行数 ${panRows}`)
    await page.screenshot({ path: `${SHOTS}/cast-result.png` })

    await page.getByText('判卷', { exact: true }).first().click()
    await page.waitForTimeout(500)
    assert.ok((await page.locator('#app').innerText()).includes('单爻精练'), '手机端判卷未出题')
    await page.screenshot({ path: `${SHOTS}/quiz.png` })

    await page.goto(base + '/#/walk', { waitUntil: 'networkidle' })
    await page.locator('.opt').first().click()
    await page.waitForTimeout(300)
    assert.ok(await page.locator('.seal').first().isVisible(), '手机端走查选中态未出现')
    await page.getByRole('button', { name: '展开' }).first().click().catch(() => {})
    await page.screenshot({ path: `${SHOTS}/walk-picked.png` })

    await page.goto(base + '/#/manual', { waitUntil: 'networkidle' })
    // 手机端目录默认折叠，先展开再点章节
    await page.locator('.manual-picker').click()
    await page.waitForTimeout(200)
    await page.locator('.manual-toc a').nth(2).click()
    await page.waitForTimeout(400)
    await page.screenshot({ path: `${SHOTS}/manual-ch2.png` })

    // 案例页折叠选择器
    await page.goto(base + '/#/cases', { waitUntil: 'networkidle' })
    await page.locator('.case-picker').click()
    await page.waitForTimeout(200)
    assert.ok(await page.locator('.case-list.open .case-item').first().isVisible(), '案例列表未展开')
    await page.locator('.case-list.open .case-item').nth(2).click()
    await page.waitForTimeout(300)
  }

  await ctx.close()
}

await browser.close()

if (findings.length) {
  console.log('\n===== 待修项 =====')
  for (const f of findings) console.log('• ' + f)
}
if (notes.length) {
  console.log('\n===== 参考（不计入失败） =====')
  for (const n of notes) console.log('· ' + n)
}
if (errors.length) {
  console.log('\n===== 运行时错误 =====')
  for (const e of errors) console.log('• ' + e)
}
const ok = findings.length === 0 && errors.length === 0
console.log(ok ? '\n✅ 手机端校验全部通过' : `\n❌ ${findings.length} 项待修，${errors.length} 个运行时错误`)
process.exit(ok ? 0 : 1)
