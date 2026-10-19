import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { basename, join } from 'node:path'
import { pipeline } from 'node:stream/promises'

// 开发与本机预览均直接读取原片，不复制视频到 dist 或公开目录。
export function localVideos(directory) {
  const middleware = async (req, res, next) => {
    const url = new URL(req.url, 'http://localhost')
    if (!url.pathname.startsWith('/videos/')) return next()
    let name
    try { name = decodeURIComponent(url.pathname.slice('/videos/'.length)) }
    catch { res.writeHead(400).end('Invalid video URL'); return }
    if (basename(name) !== name || !name.endsWith('.mp4')) {
      res.writeHead(400).end('Expected a local MP4 filename'); return
    }
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.writeHead(405, { Allow: 'GET, HEAD' }).end(); return
    }
    try {
      const file = join(directory, name)
      const { size } = await stat(file)
      const range = req.headers.range
      const match = range?.match(/^bytes=(\d*)-(\d*)$/)
      if (range && (!match || (!match[1] && !match[2]))) {
        res.writeHead(416, { 'Content-Range': `bytes */${size}` }).end(); return
      }
      const start = match ? (match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]))) : 0
      const end = match?.[1] && match[2] ? Math.min(Number(match[2]), size - 1) : size - 1
      if (start > end || start >= size) {
        res.writeHead(416, { 'Content-Range': `bytes */${size}` }).end(); return
      }
      res.writeHead(range ? 206 : 200, {
        'Content-Type': 'video/mp4', 'Accept-Ranges': 'bytes',
        'Content-Length': end - start + 1,
        ...(range ? { 'Content-Range': `bytes ${start}-${end}/${size}` } : {})
      })
      if (req.method === 'HEAD') { res.end(); return }
      await pipeline(createReadStream(file, { start, end }), res)
    } catch (error) {
      // 播放器拖动或关闭抽屉时会主动断开原有视频流。
      if (error.code === 'ERR_STREAM_PREMATURE_CLOSE' && res.destroyed) return
      if (res.headersSent) { res.destroy(error); return }
      const status = error.code === 'ENOENT' ? 404 : 500
      res.writeHead(status).end(`Video read failed: ${error.message}`)
    }
  }
  return { name: 'local-course-videos', configureServer(server) { server.middlewares.use(middleware) }, configurePreviewServer(server) { server.middlewares.use(middleware) } }
}
