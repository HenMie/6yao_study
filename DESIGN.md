---
name: 六爻研习社
description: 面向电脑端的《增删卜易》精读与六爻练习界面
colors:
  paper: "#FBF9F4"
  paper-2: "#F4F0E6"
  paper-3: "#EDE7D9"
  surface: "#FFFFFF"
  ink: "#16191C"
  ink-2: "#3D4348"
  ink-3: "#6B7076"
  ink-4: "#9AA0A6"
  rule: "#DED6C4"
  rule-2: "#C9BFA9"
  accent: "#A6331F"
  accent-wash: "#F3E4DE"
  good: "#3F7D5A"
  warn: "#9A7B32"
typography:
  heading:
    fontFamily: "Source Han Serif SC, Noto Serif SC, Songti SC, STSong, SimSun, Georgia, serif"
    fontSize: "28px"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "0.02em"
  body:
    fontFamily: "Source Han Sans SC, Noto Sans SC, PingFang SC, Microsoft YaHei, -apple-system, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.8
  label:
    fontFamily: "JetBrains Mono, Cascadia Mono, Consolas, ui-monospace, monospace"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.12em"
rounded:
  sm: "2px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.paper}"
    rounded: "{rounded.sm}"
    height: "34px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "14px 16px"
---

# Design System: 六爻研习社

## Overview

**Creative North Star:「带排盘附录的学术校勘本」**

界面把《增删卜易》的逐章精读与六爻练习呈现在一张安静、易读的纸面上。温暖纸色承载内容，宋体用于章节和古籍文本，黑体承担操作说明，等宽字用于集号、时间与数据。朱砂既是品牌强调色，也是当前交互和学习标记的主要色彩。

当前产品包含学习路径、装卦台、断卦走查、案例、速查和断卦手册。页面采用常规纵向滚动；装卦、走查、案例和手册在桌面端使用不同的双栏或分栏结构。它不是全屏工作台，也不依赖水墨插画、拟古纹样或投影来表达传统文化。

**Key Characteristics:**

- 温暖纸色、暖黑文字和低饱和分隔线。
- 宋体标题、黑体界面文字、等宽元信息。
- 朱砂作为主要交互与强调色；内容状态另用竹青、绛色和土金色。
- 2px 小圆角、细边框和留白构成层次。

## Colors

当前颜色以 `web/src/styles/global.css` 和 `web/src/theme.js` 为实现依据。Naive UI 的 primary 色为朱砂，文档不再沿用旧稿中的群青主题或未落地的五行配色变量。

### Primary

- **朱砂** (`#A6331F`)：品牌强调、激活导航、主要按钮、进度条、标记和重点提示。它是当前组件库的 primary 色。
- **朱砂浅色** (`#F3E4DE`)：选中选项和强调提示的浅底。

### Neutral

- **宣纸** (`#FBF9F4`)：页面背景。
- **次纸** (`#F4F0E6`) 与 **纸阶** (`#EDE7D9`)：次级区域、进度轨道和组件区分。
- **白色表面** (`#FFFFFF`)：卡片、弹层、选项和部分内容容器。
- **暖墨** (`#16191C`)：标题与正文主色；**次墨** (`#3D4348`)：正文次级信息。
- **注记灰** (`#6B7076`) 与 **弱灰** (`#9AA0A6`)：说明、时间、占位与弱化信息。小字号使用前应检查具体背景上的可读性。
- **纸线** (`#DED6C4`) 与 **深纸线** (`#C9BFA9`)：行分隔、卡片边框和输入边框。

### Semantic

- **竹青** (`#3F7D5A`) 表示正确或完成。
- **绛朱** (`#A6331F`) 表示错误；与品牌朱砂共用当前实现色值。
- **土金** (`#9A7B32`) 表示警告。
- 状态信息必须同时由文字、符号或结构表达，不只依赖颜色。

## Typography

**Display / Heading Font:** Source Han Serif SC, Noto Serif SC, Songti SC, STSong, SimSun, Georgia, serif

**Body Font:** Source Han Sans SC, Noto Sans SC, PingFang SC, Microsoft YaHei, -apple-system, sans-serif

**Label / Mono Font:** JetBrains Mono, Cascadia Mono, Consolas, ui-monospace, monospace

**Character:** 标题和古籍引文有书刊感，操作文字保持直接、现代。等宽字只用于集号、时间、干支和紧凑数据，不承担长段正文。

### Hierarchy

- **页面标题**（600，28px，行高 1.5）：页面 h1。
- **章节标题**（600，20px，行高 1.5）：默认 h2；页面可按内容使用 22–26px 局部标题。
- **正文**（400，15px，行高 1.8）：全局基础文字。
- **正文强调 / 古籍内容**：常用 15–17px serif，行高约 1.8–2.05。
- **操作文字**：组件库默认 14px；局部按钮和卡片操作随实际密度使用 12–13px。
- **标签与元信息**：常用 11–13px mono 或 sans；kicker 为 11px mono，字距 `.18em`。

## Layout

### 支持范围

- 产品面向电脑端高分辨率视口，**设计验收基准为至少 1240 CSS px 宽**；建议以 1440×900 检查完整页面。这里的宽度指浏览器 CSS 视口，不是显示器物理像素。
- 首版不承诺手机或平板体验。视口低于 1240px 时只启用明确的可用性回退：顶栏导航换行并横向滚动、主要双栏区域堆叠、学习集卡缩为两列、手册目录移到正文上方横向滚动；这些回退不等同于完整移动端适配。
- 页面使用自然文档滚动；不要把全站改成固定高度、不可滚动的单屏应用。

### 全局框架

- 顶栏粘顶，高 60px，底部 1px 分隔线；内部最大宽度 1160px，左右内边距 24px。
- 顶栏顺序：六爻研习社品牌、六项导航（学习路径、装卦台、断卦走查、案例、速查、断卦手册）、右侧课程说明。
- 页面内容 `.wrap` 最大宽度 1160px，顶部/左右/底部内距为 `32px 24px 80px`；页头以底部分隔线和 32px 下间距结束。
- 页脚与主内容同宽，位于页面内容之后，不固定在视口底部。

### 页面骨架

- **学习路径：**当前学习单元卡、学习进度统计、视频集卡及所选集的单元列表。集卡桌面默认四列，卡片按内容自然定高。
- **装卦台：**输入区与卦盘区并列，列宽为约 300px 与 `minmax(520px, 1fr)`，间距 24px。窄屏回退为单列。卦盘、日期信息和判卷面板沿用卡片容器。
- **断卦走查：**步骤卡片与约 360px 草稿栏并列，间距 24px；草稿栏在桌面滚动时粘顶。窄屏回退为单列。
- **案例：**约 200px 案例列表与详情并列；详情区以 40/60 比例展示卦盘和解读，间距约 32px。窄屏回退为单列。
- **断卦手册：**240px 章节目录与正文并列，间距约 32px；正文最大宽度约 68ch。低于 1240px 时目录移到正文上方并横向滚动，正文单列。
- **速查：**卡片依可用宽度自动填列，知识卡最小宽约 280px，对照表最小宽约 320px。
- **间距节奏：**常用 8、12、16、24、32px；局部密集表格可使用更小的 4–6px 内距。

## Elevation & Depth

默认采用平面排版：纸色层次、边框、分隔线和留白负责分组。卡片不使用持续投影；当前学习集卡 hover 有轻微阴影，Naive UI 弹层可按组件默认行为浮起。不要为普通页面卡片叠加多层阴影。

## Shapes

- 卡片、输入、按钮、标签和弹层采用统一的 2px 小圆角。
- 常规卡片为白色表面与 1px 纸线边框；输入框使用透明或白色底和深纸线边框。
- 主要强调可以用朱砂色文字、边线、标签或浅色提示底；不以大面积圆角胶囊作为通用控件形态。
- 卦象爻线由 CSS 绘制，避免依赖字体字形。当前条宽约 104px、高 4px，断爻中缝 7px；动爻用朱砂 ○ / × 标记。

## Components

### Navigation

顶栏采用纸色半透明背景、轻微背景模糊和下边框。品牌文字使用 17px serif/600；导航文字 13px，默认次墨，悬停出现次纸底，当前路由以暖墨加朱砂底线标示。右侧显示课程说明，不放头像或账号控件。

### Buttons and Inputs

使用 Naive UI 并通过 `web/src/theme.js` 统一主题。组件圆角为 2px；主操作使用朱砂，次操作使用描边或幽灵样式。按钮高度随组件尺寸变体（小按钮约 28px，默认中尺寸约 34px）；输入框常用 40px。焦点、禁用和错误状态遵循 Naive UI 状态，并保留可辨识的文本/边框反馈。

### Cards

卡片以白底、纸线边框、小圆角为基础。学习集卡在 hover 时增加轻微阴影，当前集用朱砂边框；走查选项用边框与朱砂浅底呈现选中态。内容卡片优先通过内部留白和标题层级分组。

### Gua Pan

卦盘是自绘数据表，不是传统符号插画。当前列包含六神、六亲/五行、纳甲、爻象、世应和动爻；爻象以约 104×4px 的横线绘制。世爻行使用浅朱砂底，动爻以朱砂 ○ / × 表示；变卦和伏神作为附加行展示。不得套用未实现的旧稿列宽、汉字行号或双线标记规格。

### Learning and Reference Cards

学习路径集卡显示集号、时长、单元数、目标说明与完成进度；展开后列出单元和视频回链。速查卡片以分组标题、问题、简明解释和来源回链组织。案例详情并排呈现卦盘与解读，窄屏时纵向排列。

### Quiz Feedback

判卷面板以纸色汇总条、表格行和逐格反馈组织信息。错误使用绛朱文字/3px 左边线及错因说明；正确状态使用竹青内缘反馈并短暂淡出；未作答状态使用弱灰，不呈现错误信号。错因文案必须保留完整可读，避免截断规则或回链。

### Video Reference

视频回链使用 `▸ Pxx` 或 `▸ Pxx mm:ss` 的等宽小字。常态为次墨文字加朱砂下划线，悬停转朱砂；它是可跳转链接，不使用按钮底色。

## Do's and Don'ts

### Do:

- **Do** 以 `web/src/styles/global.css` 与 `web/src/theme.js` 作为颜色、字体和组件主题的实现来源；修改后同步更新本文件。
- **Do** 用纸色、白色表面、暖墨和细边框保持页面安静、易读。
- **Do** 用宋体表达章节与古籍内容，用黑体表达 UI，用等宽字标示编号、日期和短数据。
- **Do** 让朱砂承担当前实现中的主要交互强调，并确保状态不只靠颜色传递。
- **Do** 按宽屏电脑视口组织多栏内容；主要页面在 1240 CSS px 及以上验收，低于该宽度只验证已记录的回退行为。
- **Do** 保留视频来源与章节回链，让练习反馈可追溯。

### Don't:

- **Don't** 把旧版群青主色、五行色板、移动端专用尺寸或旧版 1240px 容器上限当作当前已实现 token。
- **Don't** 声称本站已支持手机/平板；1240px 以下仅有有限回退，不是完整移动端支持。
- **Don't** 给普通卡片添加厚重阴影、玻璃效果、复杂渐变或装饰性背景图案。
- **Don't** 使用水墨、卷轴、云纹、罗盘、八卦水印或仿古印章贴图来制造传统感；现有 CSS 文字标签除外。
- **Don't** 用颜色作为唯一的成功、错误、选中或可交互提示。
- **Don't** 把未实现的旧稿规格写成当前组件事实；新提案需明确标为待实现，落地后再纳入现状规范。
