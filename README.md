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

## 手机端适配

站点已适配手机，体验基准为 iPhone 15 Pro Max（430×932 CSS px），向下覆盖到 375pt 窄机。断点为 `max-width: 640px`；桌面（≥1240px）版式保持不变，641–1239px 沿用既有堆叠回退。

手机端的处理要点：

- 顶栏两行吸顶，导航单行横向滑动（唯一允许横滑的元素）。
- 卦盘按「每爻一张卡」纵向排列，判卷按爻出卡，正文表格每条一张小卡 —— **手机上不需要横向滑动就能看全内容**。
- 横向多列图示（本卦变卦对照、判断分叉、作用链、变化方向）在窄屏重排为纵向版式；环状图收窄画布、保持字号。
- 案例列表与手册目录改为折叠选择器，选完自动收起。
- 所有可点元素不小于 44px，正文不小于 15px，图内字号不小于 9px。

改完界面后跑一次手机端校验（需要先 `npm run preview` 或 `npm run dev`）：

```bash
cd web
npm run check:mobile
```

脚本会用 Edge 无头浏览器依次打开 375 / 390 / 430 / 768 四档视口，逐页检查横向溢出、触摸目标尺寸、正文字号和图内字号，并完成摇卦、判卷、走查、手册切章四项交互冒烟，截图写到 `web/shots/mobile/`。

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
