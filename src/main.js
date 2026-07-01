import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import router from './router/index.js'
import './assets/style.css'
import App from './App.vue'

gsap.registerPlugin(ScrollTrigger, SplitText)

// Avvia lo smooth scroll Lenis + wiring col ticker GSAP/ScrollTrigger.
// L'import esegue il modulo (side-effect): crea l'istanza e la collega.
import './lib/lenis.js'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
