<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { gsap } from 'gsap'
import { ChevronDown } from 'lucide-vue-next'
import { useLogoAnchors } from '../composables/useLogoAnchors.js'

// Hint "scorri" una tantum: appare dopo 5s di inattività al primo ingresso
// in Home, sparisce appena l'utente scrolla e non si ripresenta più nella
// stessa permanenza. Riusa scrollProgress del morph logo per sapere se si
// è già scrollato (stessa soglia di Accedi/Menu in TheHeader).
const SCROLL_THRESHOLD = 0.05
const DELAY_MS = 5000

const route = useRoute()
const { scrollProgress } = useLogoAnchors()

const visible = ref(false) // controlla fade-in/out (opacity via classe)
const mounted = ref(false) // render solo in Home
const spent = ref(false)   // una tantum: una volta scrollato, mai più

let timer = null
const iconEl = ref(null)
let floatTween = null

const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

function clearTimer() {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

// Avvia il countdown solo se: in Home, non ancora scrollato, hint non già
// consumato e non già visibile/in attesa.
function maybeStartTimer() {
  if (spent.value || visible.value || timer) return
  if (route.path !== '/') return
  if (scrollProgress.value >= SCROLL_THRESHOLD) return
  timer = setTimeout(() => {
    timer = null
    // Ricontrolla le condizioni allo scadere: tutto ancora vero -> appare.
    if (route.path === '/' && scrollProgress.value < SCROLL_THRESHOLD && !spent.value) {
      visible.value = true
    }
  }, DELAY_MS)
}

// Cambio route: in Home riparte (se non consumato), fuori si annulla tutto.
watch(
  () => route.path,
  (path) => {
    if (path === '/') {
      mounted.value = true
      maybeStartTimer()
    } else {
      mounted.value = false
      visible.value = false
      clearTimer()
    }
  },
  { immediate: true }
)

// Scroll oltre soglia: annulla il countdown e/o nasconde l'hint, marcandolo
// come consumato così tornando in cima non ricompare.
watch(scrollProgress, (p) => {
  if (route.path !== '/') return
  if (p >= SCROLL_THRESHOLD) {
    clearTimer()
    if (visible.value) visible.value = false
    spent.value = true
  }
})

// Bounce continuo sull'icona, indipendente dal floating del logo. Saltato
// se prefers-reduced-motion (il fade resta, è solo opacity).
onMounted(() => {
  if (!prefersReduced && iconEl.value) {
    floatTween = gsap.to(iconEl.value, {
      y: 6,
      duration: 0.9,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    })
  }
})

onUnmounted(() => {
  clearTimer()
  floatTween?.kill()
})
</script>

<template>
  <div
    v-if="mounted"
    class="scroll-hint"
    :class="{ 'is-visible': visible }"
    aria-hidden="true"
  >
    <span class="scroll-hint__text">Scorri per scoprire</span>
    <span ref="iconEl" class="scroll-hint__icon">
      <ChevronDown :size="20" :stroke-width="2" />
    </span>
  </div>
</template>

<style scoped>
.scroll-hint {
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 30;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: var(--color-notte);
  font-family: 'Unbounded', sans-serif;
  opacity: 0;
  transition: opacity 0.45s ease;
}
.scroll-hint.is-visible {
  opacity: 0.6;
}
.scroll-hint__text {
  font-size: 0.75rem;
  letter-spacing: 0.02em;
}
.scroll-hint__icon {
  display: inline-flex;
}
</style>
