import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import '@fontsource/noto-serif-sc/400.css'
import '@fontsource/noto-serif-sc/600.css'
import '@fontsource/noto-serif-sc/900.css'
import 'lxgw-wenkai-webfont/lxgwwenkai-regular.css'
import './styles/global.css'

createApp(App).use(router).mount('#app')
