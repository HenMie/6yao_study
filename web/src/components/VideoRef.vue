<script setup>
import { ref, computed } from 'vue'
import { NDrawer, NDrawerContent, NButton, NAlert } from 'naive-ui'

const props = defineProps({
  vid: { type: String, required: true },   // 'p01'
  t: { type: Number, default: 0 }
})

const VNAME = { p01: '基础知识', p02: '起卦', p03: '增删一', p04: '增删二', p05: '增删三', p06: '增删四', p07: '增删五', p08: '增删六' }
const show = ref(false)
const failed = ref(false)

const fileName = computed(() =>
  `六爻零基础 I 增删喂饭级教程，用力讲大白话——建议收藏 ${props.vid} ${VNAME[props.vid]} - 云野卦馆 (1080p, av01.0.00M.10.0.110.01.01.01.0, BiliBili) via VidBee.mp4`
)
// 视频是本地素材，用相对路径直接引用，不做转码与转存
// dev 时页面在 web/，构建后页面在 web/dist/，两者相对深度差一级
const VIDEO_BASE = import.meta.env.DEV ? '../视频/' : '../../视频/'
const src = computed(() => encodeURI(VIDEO_BASE + fileName.value))
const label = computed(() => {
  const mm = Math.floor(props.t / 60), ss = props.t % 60
  const stamp = props.t ? ` ${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}` : ''
  return `▸ P${props.vid.slice(1)} ${VNAME[props.vid]}${stamp}`
})

function open() { failed.value = false; show.value = true }
function onMeta(e) { if (props.t) e.target.currentTime = props.t }
</script>

<template>
  <a class="vref" href="#" @click.prevent="open" :title="t ? '跳到视频大概位置（粗定位 ±2 分钟）' : '打开该集视频'">{{ label }}</a>

  <n-drawer v-model:show="show" :width="720" placement="right">
    <n-drawer-content :title="`P${vid.slice(1)} · ${VNAME[vid]}`" closable>
      <video v-if="!failed" controls autoplay :src="src" style="width:100%;background:#000;border-radius:2px" @loadedmetadata="onMeta" @error="failed = true" />
      <n-alert v-else type="warning" title="浏览器无法解码这个文件（AV1）">
        <p class="tiny">请用本地播放器打开：</p>
        <p class="mono tiny" style="word-break:break-all">视频/{{ fileName }}</p>
      </n-alert>
      <p class="tiny muted" style="margin-top:12px">
        视频为本地素材，页面直接引用 <span class="mono">视频/</span> 目录下的原文件，不做转码、不转存。
        <span v-if="t">时间戳为按课件抽帧反推的粗定位，精度 ±2 分钟。</span>
      </p>
    </n-drawer-content>
  </n-drawer>
</template>
