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

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/import?s=https%3A%2F%2Fgithub.com%2FHenMie%2F6yao_study)

Vercel 导入仓库后会自动识别 `web` 为 Root Directory、Vite 为框架预设，直接 Deploy 即可。

如果 Root Directory 没有自动填好，手动设置为：

- **Root Directory**：`web`
- **Framework Preset**：Vite
- **Build Command**：`npm run build`
- **Output Directory**：`dist`

不需要环境变量；hash 路由不需要 rewrite。

> 请用 **Import Git Repository** 直接导入本仓库，不要走 Clone 模板流程——Clone 会在你的账号下新建一个副本仓库，之后 push 原仓库不会触发部署。

## 内容说明

- 课程正文按《增删卜易》逐章整理转述，演算与自测为本站编写。
- 图示为自绘 SVG / CSS 数据图，不依赖外部图片或视频。
