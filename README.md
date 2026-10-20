# 六爻研习社

《增删卜易》逐章精读与六爻练习的静态站点。Vue 3 + Vite + Naive UI，纯前端，无后端、无视频依赖。

## 本地运行

```bash
cd web
npm install
npm run dev
```

打开 `http://127.0.0.1:5173`。

## 构建

```bash
cd web
npm run build
```

产物在 `web/dist`，可直接部署到任意静态托管。

## 部署到 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/HenMie/6yao_study)

仓库根目录的 `vercel.json` 已配置好：

- 安装：`cd web && npm ci`
- 构建：`cd web && npm run build`
- 输出：`web/dist`

导入仓库后直接 Deploy 即可，不需要手动改 Root Directory，也不需要环境变量。hash 路由不需要 rewrite。

## 内容说明

- 课程正文按《增删卜易》逐章整理转述，演算与自测为本站编写。
- 图示为自绘 SVG / CSS 数据图，不依赖外部图片或视频。
