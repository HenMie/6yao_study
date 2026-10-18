import { JSDOM } from 'file:///C:/Users/nr666/.workbuddy-ai/binaries/node/workspace/node_modules/jsdom/lib/api.js'
import fs from 'node:fs'
import path from 'node:path'

const dist = 'dist'
const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')
const jsFile = fs.readdirSync(path.join(dist, 'assets')).find(f => f.endsWith('.js'))

const errs = []
const dom = new JSDOM(html.replace(/<script[^>]*><\/script>/, ''), {
  url: 'http://localhost/',
  runScripts: 'outside-only',
  pretendToBeVisual: true
})
const w = dom.window
w.matchMedia = w.matchMedia || (() => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }))
w.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} }
w.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} takeRecords() { return [] } }
w.addEventListener('error', e => errs.push('error: ' + (e.message || e.error)))
w.addEventListener('unhandledrejection', e => errs.push('rejection: ' + e.reason))

try {
  w.eval(fs.readFileSync(path.join(dist, 'assets', jsFile), 'utf8'))
} catch (e) {
  errs.push('bundle eval: ' + e.message)
}

await new Promise(r => setTimeout(r, 600))
const app = w.document.getElementById('app')
const text = (app?.textContent || '').replace(/\s+/g, ' ').trim()
console.log('挂载文本长度:', text.length)
console.log('首屏片段:', text.slice(0, 120))
const routes = ['#/path', '#/cast', '#/walk', '#/cases', '#/ref', '#/manual']
for (const r of routes) {
  w.location.hash = r
  await new Promise(res => setTimeout(res, 300))
  const t = (w.document.getElementById('app')?.textContent || '').replace(/\s+/g, ' ').trim()
  console.log(r.padEnd(9), t.length, '字')
  if (t.length < 150) errs.push(r + ' 渲染过少')
}
console.log(errs.length ? '❌ ' + errs.join(' | ') : '✅ 无运行时错误')
process.exit(errs.length ? 1 : 0)
