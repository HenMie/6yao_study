import { ref, onMounted, onUnmounted } from 'vue'

/**
 * 窄屏检测
 * 与 CSS 断点保持同一口径（max-width: 640px）。
 * SVG 图示无法用媒体查询改 viewBox，只能用 JS 判断后换一套布局参数。
 */
const QUERY = '(max-width: 640px)'

export function useNarrow() {
  const narrow = ref(false)
  if (typeof window === 'undefined' || !window.matchMedia) return narrow

  const mq = window.matchMedia(QUERY)
  narrow.value = mq.matches
  const onChange = (e) => { narrow.value = e.matches }
  onMounted(() => mq.addEventListener('change', onChange))
  onUnmounted(() => mq.removeEventListener('change', onChange))
  return narrow
}
