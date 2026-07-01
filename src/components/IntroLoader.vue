<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { gsap } from 'gsap'
import LogoMorph from './LogoMorph.vue'

const props = defineProps({
  authReady: { type: Boolean, default: false },
})
const emit = defineEmits(['done'])
const rootRef = ref(null)

const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches

let dwellDone = false
let finished = false
let fadeTween = null
let dwellTimer = null

// Fade-out + done: parte solo quando ENTRAMBE le condizioni sono vere —
// dwell minimo trascorso E authReady. Chiamata da entrambi i trigger (fine
// dwell, watch authReady); la guardia `finished` garantisce una sola
// esecuzione qualunque sia l'ordine di arrivo.
function maybeFinish() {
  if (finished || !dwellDone || !props.authReady) return
  finished = true
  fadeTween = gsap.to(rootRef.value, {
    opacity: 0,
    duration: prefersReducedMotion ? 0.15 : 0.18,
    ease: 'power1.out',
    onComplete: () => emit('done'),
  })
}

onMounted(() => {
  // Dwell minimo: garantisce che il bounce-in interno a LogoMorph (0.9s +
  // ~0.3s stagger) si veda per intero. Con reduced motion il bounce non c'è
  // (lettere statiche): attesa minima solo per evitare un flash brusco.
  const dwell = prefersReducedMotion ? 300 : 1300
  dwellTimer = setTimeout(() => {
    dwellDone = true
    maybeFinish()
  }, dwell)
})

// Se authReady arriva dopo il dwell, il floating veloce di LogoMorph continua
// (loop infinito, nessun intervento) finché questo watch fa scattare il fade.
watch(() => props.authReady, () => maybeFinish())

onUnmounted(() => {
  clearTimeout(dwellTimer)
  fadeTween?.kill()
})
</script>

<template>
  <div
    ref="rootRef"
    class="fixed inset-0 z-[300] bg-notte flex items-center justify-center px-6"
  >
    <div class="max-w-2xl w-full">
      <LogoMorph :visible="true" :float-speed="2" color-class="text-perla" />
    </div>
  </div>
</template>
