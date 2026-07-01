import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import router from './router/index.js'
import './assets/style.css'
import App from './App.vue'

gsap.registerPlugin(ScrollTrigger, SplitText)

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
