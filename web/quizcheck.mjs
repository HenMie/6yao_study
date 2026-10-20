import { chromium } from 'playwright-core'
const browser = await chromium.launch({ channel: 'msedge', headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 950 } })
const errs = []
page.on('pageerror', e => errs.push('[pageerror] ' + e.message))
page.on('console', m => { if (m.type() === 'error') errs.push('[console] ' + m.text()) })

await page.goto('http://127.0.0.1:4173/#/cast', { waitUntil: 'networkidle' })
await page.evaluate(() => localStorage.clear())
await page.reload({ waitUntil: 'networkidle' })
await page.getByText('判卷', { exact: true }).first().click()
await page.waitForTimeout(400)

// 1. 单爻精练 L1：汇总条 + 表头
let bar = await page.locator('.qp-bar').innerText()
console.log('汇总条:', bar.replace(/\s+/g, ' '))
const cols1 = await page.locator('.qp-head div').allInnerTexts()
console.log('L1 列:', cols1.join('|'))

// 2. 填卦名判卷（故意填错 → 错因行）
const nameSel = page.locator('.qp-gitem .n-base-selection').first()
await nameSel.click()
await page.locator('.n-base-select-option').first().click()
await page.getByRole('button', { name: '判卷' }).last().click()
await page.waitForTimeout(400)
const fb = await page.locator('.fb-line').allInnerTexts()
console.log('错因行数:', fb.length)
if (fb.length) console.log('错因样例:', fb[0].replace(/\s+/g, ' ').slice(0, 90))

// 3. 看答案
await page.getByRole('button', { name: '看答案' }).click()
await page.waitForTimeout(300)
console.log('看答案后显示正确值:', (await page.locator('.qp-ans').count()) > 0 ? '✅' : '❌')

// 4. 重做 → 换完整装卦（直接改 localStorage 提升档位模拟老用户）
await page.evaluate(() => {
  const recs = []
  for (let i = 0; i < 12; i++) recs.push({ right: 9, total: 9, filled: 9, lv: 1, kind: 'full', t: Date.now() })
  const st = { done: {}, last: null, quiz: recs, single: [] }
  localStorage.setItem('ly6.progress.v2', JSON.stringify(st))
})
await page.reload({ waitUntil: 'networkidle' })
await page.getByText('判卷', { exact: true }).first().click()
await page.waitForTimeout(400)
const cols2 = await page.locator('.qp-head div').allInnerTexts()
console.log('升档后(进阶) 列:', cols2.join('|'))
bar = await page.locator('.qp-bar').innerText()
console.log('汇总条:', bar.replace(/\s+/g, ' '))

// 5. 完整装卦 L3 格数（reload 后先切回判卷模式）
await page.getByText('判卷', { exact: true }).first().click(); await page.waitForTimeout(300); await page.getByText('完整装一卦').click()
await page.waitForTimeout(400)
bar = await page.locator('.qp-bar').innerText()
console.log('完整装卦:', bar.replace(/\s+/g, ' '))

// 截图
await page.screenshot({ path: 'shots/quiz-deep.png', fullPage: true })

// 6. 其余页面回归
for (const r of ['path', 'walk', 'cases', 'ref', 'manual']) {
  await page.goto('http://127.0.0.1:4173/#/' + r, { waitUntil: 'networkidle' })
  await page.waitForTimeout(300)
}
console.log(errs.length ? '❌ ' + errs.join(' | ') : '✅ 无运行时错误')
await browser.close()
