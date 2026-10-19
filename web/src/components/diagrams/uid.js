/* SVG 内部 id（箭头 marker 等）在同一页面必须唯一，按组件实例递增 */
let n = 0
export function uid (prefix = 'd') {
  n += 1
  return prefix + n
}
