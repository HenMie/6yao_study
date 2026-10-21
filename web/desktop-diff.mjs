/**
 * 桌面端像素回归
 * 在 1440×950 下同时打开两个构建，整页截图后逐像素比较。
 * 手机端适配的硬约束是「桌面零变化」，改样式后用它证明这一点。
 *
 *   # 1. 取改动前的提交另开 worktree 构建，预览到 4174
 *   git worktree add ../_base <commit>
 *   cp -r web/node_modules ../_base/web/
 *   (cd ../_base/web && npm run build && npx vite preview --port 4174 --host 127.0.0.1 &)
 *
 *   # 2. 当前代码构建，预览到 4173
 *   npm run build && npx vite preview --port 4173 --host 127.0.0.1 &
 *
 *   # 3. 比较（可用 BASE_URL / NEW_URL 覆盖端口）
 *   node desktop-diff.mjs
 */
import { chromium } from 'playwright-core'
import zlib from 'node:zlib'

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:4174'
const NEW_URL = process.env.NEW_URL || 'http://127.0.0.1:4173'

// 极简 PNG 解码 + 逐像素比较（只处理 RGBA/RGB 8bit，浏览器截图即可）
function decodePng(buf) {
  let pos = 8, width, height, bitDepth, colorType, idat = []
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos); const type = buf.toString('ascii', pos+4, pos+8)
    const data = buf.subarray(pos+8, pos+8+len)
    if (type === 'IHDR') { width = data.readUInt32BE(0); height = data.readUInt32BE(4); bitDepth = data[8]; colorType = data[9] }
    else if (type === 'IDAT') idat.push(data)
    else if (type === 'IEND') break
    pos += 12 + len
  }
  if (bitDepth !== 8) throw new Error('bitDepth '+bitDepth)
  const ch = colorType === 6 ? 4 : colorType === 2 ? 3 : colorType === 0 ? 1 : 0
  if (!ch) throw new Error('colorType '+colorType)
  const raw = zlib.inflateSync(Buffer.concat(idat))
  const stride = width*ch, out = Buffer.alloc(height*stride)
  const paeth = (a,b,c) => { const p=a+b-c, pa=Math.abs(p-a), pb=Math.abs(p-b), pc=Math.abs(p-c); return pa<=pb&&pa<=pc?a:pb<=pc?b:c }
  for (let y=0, p=0; y<height; y++) {
    const f = raw[p++]; const row = y*stride, prev = (y-1)*stride
    for (let x=0; x<stride; x++) {
      const rv = raw[p++]
      const a = x>=ch ? out[row+x-ch] : 0, b = y>0 ? out[prev+x] : 0, c = (x>=ch&&y>0) ? out[prev+x-ch] : 0
      out[row+x] = (rv + (f===0?0:f===1?a:f===2?b:f===3?((a+b)>>1):paeth(a,b,c))) & 255
    }
  }
  return { width, height, ch, data: out }
}

const routes = [['path','/#/path'],['cast','/#/cast'],['walk','/#/walk'],['cases','/#/cases'],['ref','/#/ref'],['manual','/#/manual'],['unit','/#/unit/c04'],['manual-ch','/#/manual/c22']]
const b = await chromium.launch({ channel:'msedge', headless:true })
let anyDiff = false
for (const [n, r] of routes) {
  const shots = {}
  for (const [tag, base] of [['base', BASE_URL],['new', NEW_URL]]) {
    const ctx = await b.newContext({ viewport:{width:1440,height:950}, deviceScaleFactor:1 })
    const p = await ctx.newPage()
    await p.goto(base+r, { waitUntil:'networkidle' }); await p.waitForTimeout(300)
    shots[tag] = decodePng(await p.screenshot({ fullPage:true }))
    await ctx.close()
  }
  const A = shots.base, B = shots.new
  if (A.width !== B.width || A.height !== B.height) {
    console.log(n.padEnd(10), `尺寸不同 base=${A.width}x${A.height} new=${B.width}x${B.height}`); anyDiff = true; continue
  }
  let diff = 0
  for (let i=0; i<A.data.length; i += A.ch) {
    if (A.data[i]!==B.data[i] || A.data[i+1]!==B.data[i+1] || A.data[i+2]!==B.data[i+2]) diff++
  }
  const pct = (diff / (A.width*A.height) * 100).toFixed(4)
  console.log(n.padEnd(10), `${A.width}x${A.height}`, diff === 0 ? '✅ 像素完全一致' : `⚠️ ${diff} px 不同 (${pct}%)`)
  if (diff) anyDiff = true
}
await b.close()
console.log(anyDiff ? '\n❌ 桌面端存在差异' : '\n✅ 桌面端零变化')
process.exit(anyDiff ? 1 : 0)
