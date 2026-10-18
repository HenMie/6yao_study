/* 学习单元页冒烟测试：验证扩写后的分节讲解渲染 */
import { chromium } from 'playwright-core'

const base = 'http://127.0.0.1:4173'
const errs = []
const browser = await chromium.launch({ channel: 'msedge', headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 950 }, deviceScaleFactor: 1 })
page.on('console', m => { if (m.type() === 'error') errs.push('[console] ' + m.text()) })
page.on('pageerror', e => errs.push('[pageerror] ' + e.message))
page.on('response', r => { if (r.status() >= 400) errs.push('[HTTP ' + r.status() + '] ' + r.url()) })

const units = ['c01', 'c05', 'c10', 'c14', 'c21', 'c24', 'c31', 'c34']
for (const id of units) {
  await page.goto(base + '/#/unit/' + id, { waitUntil: 'networkidle' })
  await page.waitForTimeout(300)
  const n = await page.locator('.cb').count()
  const txt = await page.locator('#app').innerText()
  const ok = n >= 2 && txt.includes('本节速览') && txt.includes('易错')
  console.log(id.padEnd(5), '分节', String(n).padStart(2), '·', ok ? '✅' : '❌')
  if (!ok) errs.push(id + ' 分节渲染异常')
  if (txt.includes('{{')) errs.push(id + ' 出现未编译模板')
  await page.screenshot({ path: `shots/unit-${id}.png`, fullPage: true })
}

// 首个单元完整截图 + 抓手/口诀/表格样式抽查
await page.goto(base + '/#/unit/c10', { waitUntil: 'networkidle' })
await page.waitForTimeout(300)
console.log('口诀块:', await page.locator('.cb-verse').count())
console.log('表格数:', await page.locator('.cb-tbl').count())

await browser.close()
if (errs.length) { console.log('❌ FAIL\n' + errs.join('\n')); process.exit(1) }
console.log('✅ 全部通过')
