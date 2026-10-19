/**
 * Naive UI 主题覆盖
 * 把「宣纸 / 墨 / 朱砂」的设计令牌注入组件库，
 * 这样按钮、卡片、输入、标签、进度条全部自动统一，不用逐个手写样式。
 */
export const tokens = {
  paper: '#FBF9F4',
  paper2: '#F4F0E6',
  paper3: '#EDE7D9',
  ink: '#16191C',
  ink2: '#3D4348',
  ink3: '#6B7076',
  ink4: '#9AA0A6',
  rule: '#DED6C4',
  rule2: '#C9BFA9',
  accent: '#A6331F',
  accentHover: '#8F2B1A',
  accentWash: '#F3E4DE',
  good: '#3F7D5A',
  bad: '#A6331F',
  warn: '#9A7B32'
}

export const themeOverrides = {
  common: {
    primaryColor: tokens.accent,
    primaryColorHover: '#B94A33',
    primaryColorPressed: tokens.accentHover,
    primaryColorSuppl: '#B94A33',
    infoColor: tokens.ink3,
    successColor: tokens.good,
    warningColor: tokens.warn,
    errorColor: tokens.bad,
    textColorBase: tokens.ink,
    textColor1: tokens.ink,
    textColor2: tokens.ink2,
    textColor3: tokens.ink3,
    borderColor: tokens.rule,
    dividerColor: tokens.rule,
    bodyColor: tokens.paper,
    cardColor: '#FFFFFF',
    modalColor: tokens.paper,
    popoverColor: '#FFFFFF',
    tableColor: '#FFFFFF',
    inputColor: 'transparent',
    borderRadius: '2px',
    borderRadiusSmall: '2px',
    fontSize: '14px',
    fontSizeSmall: '13px',
    fontFamily:
      '"Source Han Sans SC","Noto Sans SC","PingFang SC","Microsoft YaHei",-apple-system,sans-serif',
    fontFamilyMono: '"JetBrains Mono","Cascadia Mono",Consolas,ui-monospace,monospace',
    heightMedium: '34px',
    heightSmall: '28px'
  },
  Button: {
    borderRadiusMedium: '2px',
    borderRadiusSmall: '2px',
    fontWeight: '400',
    textColorPrimary: tokens.paper,
    colorPrimary: tokens.accent,
    colorHoverPrimary: '#B94A33',
    colorPressedPrimary: tokens.accentHover,
    borderPrimary: `1px solid ${tokens.accent}`,
    borderHoverPrimary: `1px solid #B94A33`,
    borderPressedPrimary: `1px solid ${tokens.accentHover}`,
    textColor: tokens.ink2,
    border: `1px solid ${tokens.rule2}`,
    borderHover: `1px solid ${tokens.ink}`,
    borderFocus: `1px solid ${tokens.ink}`,
    textColorHover: tokens.ink,
    textColorPressed: tokens.ink
  },
  Card: {
    borderRadius: '2px',
    borderColor: tokens.rule,
    color: '#FFFFFF',
    titleFontSizeMedium: '13px',
    titleFontWeight: '500'
  },
  Input: {
    border: `1px solid ${tokens.rule2}`,
    borderHover: `1px solid ${tokens.ink}`,
    borderFocus: `1px solid ${tokens.accent}`,
    boxShadowFocus: 'none',
    caretColor: tokens.accent,
    color: 'transparent',
    colorFocus: 'transparent',
    borderRadius: '2px'
  },
  Select: {
    peers: {
      InternalSelection: {
        border: `1px solid ${tokens.rule2}`,
        borderHover: `1px solid ${tokens.ink}`,
        borderActive: `1px solid ${tokens.accent}`,
        borderFocus: `1px solid ${tokens.accent}`,
        boxShadowActive: 'none',
        boxShadowFocus: 'none',
        color: 'transparent',
        colorActive: 'transparent',
        borderRadius: '2px'
      }
    }
  },
  Tag: {
    borderRadius: '2px',
    heightSmall: '20px',
    fontSizeSmall: '12px'
  },
  Progress: {
    railColor: tokens.paper3,
    fillColor: tokens.accent,
    height: '3px'
  },
  Tabs: {
    tabFontSizeMedium: '13px',
    tabTextColorActiveLine: tokens.ink,
    barColor: tokens.accent,
    tabTextColorLine: tokens.ink3
  },
  Collapse: {
    titleFontSize: '14px',
    titlePadding: '12px 16px',
    itemMargin: '0',
    borderRadius: '2px'
  },
  Drawer: { color: tokens.paper },
  Modal: { color: tokens.paper },
  Message: { borderRadius: '2px' },
  Divider: { color: tokens.rule }
}
