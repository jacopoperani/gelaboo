<script setup>
import { inject, nextTick, ref, watch, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import GelatiFloating from '../components/GelatiFloating.vue'
import { useLogoAnchors } from '../composables/useLogoAnchors.js'

const { heroLogoAnchor } = useLogoAnchors()

// Segnale di visibilità dell'app (intro + auth pronti), fornito da App.vue.
// Fallback a true se il componente venisse testato isolato.
const appVisible = inject('appVisible', { value: true })

// Ref sulle 3 section, 3 titoli e 3 paragrafi, uno per blocco.
const sectionEls = []
const titleEls = []
const paraEls = []

// Istanze da ripulire allo smontaggio.
const splits = []
const timelines = []

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
let hasBuilt = false

// Ref sui due bottoni CTA, per lo shake periodico d'attenzione.
const ctaEls = [ref(null), ref(null)]
let shakeTl = null

// Ref sulla section dei bottoni CTA, trigger del reveal bounce scrub.
let ctaSectionEl = null

function buildReveals() {
  titleEls.forEach((titleEl, i) => {
    const paraEl = paraEls[i]
    const sectionEl = sectionEls[i]
    if (!titleEl || !paraEl || !sectionEl) return

    // type:'words' + mask:'words' → ogni parola avvolta in un contenitore
    // overflow:hidden, così yPercent:100 dà un reveal "a tendina" dal basso.
    const titleSplit = new SplitText(titleEl, { type: 'words', mask: 'words' })
    splits.push(titleSplit)

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionEl,
        start: 'top 85%',
        end: 'top 45%',
        scrub: 1.2,
      },
    })
    tl.from(titleSplit.words, {
      yPercent: 100,
      opacity: 0,
      stagger: 0.04,
      ease: 'none',
    })
    // '>' → il paragrafo attacca subito dopo la fine dell'anim del titolo.
    tl.from(paraEl, { opacity: 0, ease: 'none' }, '>')
    timelines.push(tl)
  })
}

watch(
  () => appVisible.value,
  async (visible) => {
    if (!visible || hasBuilt || prefersReduced) return
    hasBuilt = true
    await nextTick()
    buildReveals()
    ScrollTrigger.refresh()
  },
  { immediate: true },
)

// Shake periodico dei due bottoni CTA: solo transform rotation via GSAP, così
// il box fisico Matter.js (calcolato una volta da getBoundingClientRect al
// mount) non viene disturbato. repeat:-1 + repeatDelay:4 → si ripete ogni
// 4s. Rispetta prefers-reduced-motion come le altre anim del progetto.
onMounted(() => {
  if (prefersReduced) return
  const targets = ctaEls.map((r) => r.value).filter(Boolean)
  if (!targets.length) return

  gsap.set(targets, { transformOrigin: 'center center' })
  shakeTl = gsap.timeline({ repeat: -1, repeatDelay: 4 })
  shakeTl
    .to(targets, { rotation: -4, duration: 0.08, ease: 'power1.inOut' })
    .to(targets, { rotation: 4, duration: 0.08, ease: 'power1.inOut' })
    .to(targets, { rotation: -3, duration: 0.08, ease: 'power1.inOut' })
    .to(targets, { rotation: 3, duration: 0.08, ease: 'power1.inOut' })
    .to(targets, { rotation: 0, duration: 0.08, ease: 'power1.inOut' })
})

onUnmounted(() => {
  timelines.forEach((tl) => {
    tl.scrollTrigger?.kill()
    tl.kill()
  })
  splits.forEach((s) => s.revert())
  shakeTl?.kill()
})
</script>

<template>
  <div class="relative">
    <GelatiFloating />

    <section
      class="min-h-screen flex flex-col items-center justify-center px-6 lg:px-10 xl:px-16 pt-16"
    >
      <div class="relative z-10 max-w-2xl w-full text-center">
        <!-- Ancora invisibile: tiene lo spazio del logo grande nella Hero.
             Il logo vero è montato fixed in App.vue. Aspect ratio dal
             viewBox 667.85 × 280.28. -->
        <div
          ref="heroLogoAnchor"
          class="mb-3 w-[95%] sm:w-[92%] md:w-[88%] lg:w-[85%] max-w-7xl aspect-[667.85/280.28] mx-auto"
          aria-hidden="true"
        />
      </div>
    </section>

    <!-- Spacer: dà respiro durante il morph del logo, così il contenuto
         non arriva sotto l'header mentre il logo sta ancora animando. -->
    <div class="h-[8vh]" aria-hidden="true" />

    <section :ref="(el) => (sectionEls[0] = el)" class="py-16">
      <div class="relative z-10 max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto px-6 lg:px-10 xl:px-16">
        <h2 :ref="(el) => (titleEls[0] = el)" class="text-h1 text-center">Uno strumento per creare il gelato perfetto</h2>
        <p :ref="(el) => (paraEls[0] = el)" class="text-body text-notte/70 mt-4 text-center">
          Bilancia ogni ricetta in pochi secondi, senza calcoli a mano.
        </p>
      </div>
    </section>

    <section :ref="(el) => (sectionEls[1] = el)" class="py-16">
      <div class="relative z-10 max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto px-6 lg:px-10 xl:px-16">
        <h2 :ref="(el) => (titleEls[1] = el)" class="text-h1 text-center">Tante ricette di base, sempre in aggiornamento</h2>
        <p :ref="(el) => (paraEls[1] = el)" class="text-body text-notte/70 mt-4 text-center">
          Parti da una ricetta verificata o modificala come vuoi.
        </p>
      </div>
    </section>

    <section :ref="(el) => (sectionEls[2] = el)" class="pt-16 pb-12">
      <div class="relative z-10 max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto px-6 lg:px-10 xl:px-16">
        <h2 :ref="(el) => (titleEls[2] = el)" class="text-h1 text-center">Hai pensato a qualche gusto particolare? Crealo con Gelaboo</h2>
        <p :ref="(el) => (paraEls[2] = el)" class="text-body text-notte/70 mt-4 text-center">
          Descrivi il sapore che hai in mente: l'intelligenza artificiale
          suggerisce gli ingredienti, Gelaboo bilancia tutto il resto.
        </p>
      </div>
    </section>

    <section :ref="(el) => (ctaSectionEl = el)" class="pt-20 pb-64 text-center">
      <div class="relative z-10 flex flex-col sm:flex-row gap-16 justify-center items-center px-6 lg:px-10 xl:px-16">
        <RouterLink
          :ref="(el) => (ctaEls[0].value = el?.$el ?? el)"
          to="/ricette"
          data-gelato-obstacle
          class="inline-flex items-center justify-center bg-notte text-perla rounded-xl px-7 py-3.5 text-body font-medium no-underline hover:opacity-80 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-notte"
        >Sfoglia i gusti</RouterLink>
        <RouterLink
          :ref="(el) => (ctaEls[1].value = el?.$el ?? el)"
          to="/crea"
          data-gelato-obstacle
          class="inline-flex items-center justify-center border border-notte/20 text-notte rounded-xl px-7 py-3.5 text-body font-medium no-underline hover:border-notte/60 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-notte"
        >Crea il tuo gusto</RouterLink>
      </div>
    </section>
  </div>
</template>
