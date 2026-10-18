import { chromium } from 'playwright-core'
const browser = await chromium.launch({ channel: 'msedge', headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 950 } })
const errs = []
page.on('pageerror', e => errs.push(e.message))
await page.goto('http://127.0.0.1:4173/#/cast', { waitUntil: 'networkidle' })
await page.evaluate(() => localStorage.clear())
await page.reload({ waitUntil: 'networkidle' })
await page.getByText('判卷', { exact: true }).first().click()
await page.waitForTimeout(300)
await page.getByText('完整装一卦').click()
await page.waitForTimeout(300)
console.log('入门完整:', (await page.locator('.qp-bar').innerText()).replace(/\s+/g, ' '))
console.log('列:', (await page.locator('.qp-head div').allInnerTexts()).join('|'))
// 预填灰字
console.log('预填灰字(地支/五行):', await page.locator('.qp-row .pre').count() === 12 ? '✅ 12 格' : '❌ ' + await page.locator('.qp-row .pre').count())
// 世爻/应爻全局格存在
const labels = await page.locator('.qp-glabel').allInnerTexts()
console.log('全局格:', labels.join('|'))
// 答全对 → 绿框 + 计分
const q = await page.evaluate(() => window.__quiz || null)
console.log('错因字号抽测:')
await page.locator('.qp-global').screenshot({ path: 'shots/quiz-full-l1.png' }).catch(() => {})
console.log(errs.length ? '❌ ' + errs.join('|') : '✅ 无错误')
await browser.close()
