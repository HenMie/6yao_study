import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'
import { VOLS, MANUAL_CHAPTERS, STAMPS } from './src/content/data.js'

const base = process.env.COURSE_BASE || 'http://127.0.0.1:4173'
const browser = await chromium.launch({ channel: 'msedge', headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 950 } })
const errors = []
page.on('pageerror', error => errors.push(`pageerror: ${error.message}`))
page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`) })
page.on('response', response => { if (response.status() >= 400) errors.push(`http ${response.status()}: ${response.url()}`) })

try {
  let checkedVideos = 0
  for (const volume of VOLS) for (const unit of volume.chapters) {
    await page.goto(`${base}/#/unit/${unit.id}`, { waitUntil: 'networkidle' })
    assert.equal(await page.locator('.cb').count(), unit.d.length, `${unit.id} content blocks`)
    assert.equal(await page.locator('.lesson-exercise').count(), 1, `${unit.id} exercise`)
    const answer = unit.exercise.answer
    const wrong = (answer + 1) % unit.exercise.options.length
    await page.locator('input[type=radio]').nth(wrong).check()
    await page.getByRole('button', { name: '核对答案与解析' }).click()
    assert.ok((await page.locator('.lesson-feedback').innerText()).includes('应为'), `${unit.id} wrong feedback`)
    await page.locator('input[type=radio]').nth(answer).check()
    await page.getByRole('button', { name: '核对答案与解析' }).click()
    assert.ok((await page.locator('.lesson-feedback.correct').innerText()).includes(unit.exercise.explanation), `${unit.id} correct feedback`)

    if (checkedVideos < 8) {
      await page.locator('.vref').first().click()
      await page.waitForFunction(() => document.querySelector('video')?.readyState >= 1)
      const video = await page.locator('video').evaluate(element => ({ duration: element.duration, time: element.currentTime }))
      assert.ok(video.duration > STAMPS[unit.id], `${unit.id} video duration`)
      assert.ok(Math.abs(video.time - STAMPS[unit.id]) < 10, `${unit.id} video seek ${video.time}`)
      checkedVideos += 1
      await page.keyboard.press('Escape')
      await page.locator('video').waitFor({ state: 'detached' })
    }
  }

  await page.goto(`${base}/#/manual/c22`, { waitUntil: 'networkidle' })
  assert.equal(await page.locator('.manual-grid > div:first-child a[href^="#/manual/"]').count(), MANUAL_CHAPTERS.length, 'manual index')
  assert.equal(await page.locator('.cb').count(), MANUAL_CHAPTERS.find(chapter => chapter.id === 'c22').d.length, 'manual blocks')
  assert.equal(await page.locator('.lesson-exercise').count(), 1, 'manual exercise')

  await page.goto(`${base}/#/unit/c01`, { waitUntil: 'networkidle' })
  await page.locator('input[type=radio]').first().check()
  await page.getByRole('button', { name: '核对答案与解析' }).click()
  await page.goto(`${base}/#/unit/c02`, { waitUntil: 'networkidle' })
  assert.equal(await page.locator('input:checked').count(), 0, 'exercise state reset')
  assert.equal(await page.locator('.lesson-feedback').count(), 0, 'feedback state reset')

  assert.deepEqual(errors, [])
  console.log(`PASS: 34 units, 23 manual entries, ${checkedVideos} video streams, exercise feedback/reset, no runtime or HTTP errors`)
} finally {
  await browser.close()
}
