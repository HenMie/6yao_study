import { chromium } from 'playwright-core'
const browser = await chromium.launch({ channel: 'msedge', headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 950 } })
const errs = []
page.on('pageerror', e => errs.push(e.message))
await page.goto('http://127.0.0.1:4173/#/cast', { waitUntil: 'networkidle' })
await page.getByRole('button', { name: '连摇六次' }).click()
await page.waitForTimeout(600)
const gw = page.locator('.guawen')
console.log('经文区块:', await gw.count() ? '✅ 出现' : '❌ 缺失')
if (await gw.count()) {
  const t = await gw.innerText()
  console.log('--- 内容片段 ---')
  console.log(t.split('\n').slice(0, 10).join('\n'))
  // 简繁切换
  await page.locator('.gw-toggle').click()
  await page.waitForTimeout(200)
  const t2 = await gw.innerText()
  console.log('切繁体后含「無/貞」等:', /無|貞|龍/.test(t2) ? '✅' : '❌')
  // 传文折叠
  await page.locator('.gw-more').click()
  await page.waitForTimeout(200)
  console.log('传文展开含彖曰:', (await gw.innerText()).includes('彖曰') ? '✅' : '❌')
}
console.log(errs.length ? '❌ ' + errs.join('|') : '✅ 无页面错误')
await browser.close()
