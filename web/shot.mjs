import { chromium } from 'playwright-core'
import fs from 'node:fs'

const base = 'http://127.0.0.1:4173'
const routes = [
  ['path', '/#/path'], ['cast', '/#/cast'], ['walk', '/#/walk'],
  ['cases', '/#/cases'], ['ref', '/#/ref'], ['manual', '/#/manual']
]
const errs = []
const browser = await chromium.launch({ channel: 'msedge', headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 950 }, deviceScaleFactor: 1 })
page.on('console', m => { if (m.type() === 'error') errs.push('[console] ' + m.text()) })
page.on('requestfailed', r => errs.push('[404] ' + r.url()))
page.on('response', r => { if (r.status() >= 400) errs.push('[HTTP ' + r.status() + '] ' + r.url()) })
page.on('pageerror', e => errs.push('[pageerror] ' + e.message))

fs.mkdirSync('shots', { recursive: true })
for (const [name, p] of routes) {
  await page.goto(base + p, { waitUntil: 'networkidle' })
  await page.waitForTimeout(400)
  const len = (await page.locator('#app').innerText()).replace(/\s+/g, ' ').trim().length
  console.log(name.padEnd(8), len, '字')
  if (len < 150) errs.push(name + ' 渲染过少(' + len + ')')
  await page.screenshot({ path: `shots/${name}.png`, fullPage: false })
}

// 交互：装卦台摇六次
await page.goto(base + '/#/cast', { waitUntil: 'networkidle' })
await page.getByRole('button', { name: '连摇六次' }).click()
await page.waitForTimeout(500)
const panRows = await page.locator('.pan-row').count()
console.log('排盘行数:', panRows)
if (panRows < 6) errs.push('排盘失败，行数 ' + panRows)
await page.screenshot({ path: 'shots/cast-result.png' })

// 交互：切判卷
await page.getByText('判卷', { exact: true }).first().click()
await page.waitForTimeout(400)
const quizText = await page.locator('#app').innerText()
console.log('判卷模式:', quizText.includes('单爻精练') ? '✅' : '❌')
await page.screenshot({ path: 'shots/quiz.png' })

await browser.close()
console.log(errs.length ? '❌\n' + errs.join('\n') : '✅ 无运行时错误')
process.exit(errs.length ? 1 : 0)
