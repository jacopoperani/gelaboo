<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick, provide } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useRoute } from 'vue-router'
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth'
import { auth, googleProvider } from './firebase.js'
import TheHeader from './components/TheHeader.vue'
import IntroLoader from './components/IntroLoader.vue'
import AuthModal from './components/AuthModal.vue'
import LogoMorph from './components/LogoMorph.vue'
import ScrollHint from './components/ScrollHint.vue'
import { useUserStore } from './stores/user.js'
import { useLogoAnchors } from './composables/useLogoAnchors.js'
import { lenis } from './lib/lenis.js'

const userStore = useUserStore()
const introCompleted = ref(false)
const authReady = ref(false)

const route = useRoute()
const { logoTarget, heroLogoAnchor, scrollProgress } = useLogoAnchors()
const logoFixed = ref(null)
const logoMorphRef = ref(null)
// Reso disponibile ai discendenti (GelatiFloating in Home) per leggere le
// bbox delle lettere via getLetterBBoxes(). LogoMorph è montato qui fixed,
// non in Home, quindi provide/inject invece di un prop diretto.
provide('logoMorph', logoMorphRef)
const appVisible = computed(() => introCompleted.value && authReady.value)
provide('appVisible', appVisible)

let logoST = null

// Stato "piccolo": logo agganciato al placeholder dell'header, fermo.
// Usato su tutte le pagine diverse da Home. width = larghezza target,
// scala 1, origine top-left così x/y coincidono con left/top del rect.
function setSmall() {
  if (!logoTarget.value || !logoFixed.value) return
  const t = logoTarget.value.getBoundingClientRect()
  gsap.set(logoFixed.value, {
    x: t.left,
    y: t.top,
    width: t.width,
    scale: 1,
    transformOrigin: '0 0',
  })
  // Logo docked: floating completamente fermo.
  logoMorphRef.value?.setFloatAmplitude(0)
}

// Su Home: ScrollTrigger con scrub che interpola il logo fixed dallo stato
// Hero (grande, sull'ancora heroLogoAnchor) allo stato header (piccolo, su
// logoTarget). Baseline width = larghezza Hero, così scale 1 = Hero e
// scale = targetW/heroW = header. transformOrigin 0 0 mantiene allineati
// x/y a left/top durante lo scaling.
function buildHomeMorph() {
  if (!logoFixed.value || !heroLogoAnchor.value || !logoTarget.value) {
    setSmall()
    return
  }
  const heroSection = heroLogoAnchor.value.closest('section')
  if (!heroSection) {
    setSmall()
    return
  }

  const hero = heroLogoAnchor.value.getBoundingClientRect()
  const target = logoTarget.value.getBoundingClientRect()
  const scaleSmall = target.width / hero.width

  // Compensazione del decentramento da baseline scale 1.2 + transformOrigin
  // 0 0: il logo cresce di 0.2 verso destra/basso dall'angolo top-left.
  // Sottraggo metà dell'eccesso (0.1) dalle coordinate di partenza hero per
  // ricentrarlo sull'ancora mx-auto. Applicato SOLO al riposo hero: il
  // fromTo interpola x/y verso target.left/target.top, quindi l'offset
  // svanisce gradualmente a 0 con lo scroll (nessuno scatto, docked invariato).
  const heroX = hero.left - 0.1 * hero.width
  const heroY = hero.top - 0.1 * hero.height

  // Baseline allo stato Hero. scale 1.2 = logo hero +20% rispetto all'ancora
  // heroLogoAnchor. Lo stato docked resta invariato: scaleSmall è il valore
  // assoluto d'arrivo (target.width/hero.width), indipendente da questa
  // baseline. transformOrigin 0 0: il +20% cresce verso destra/basso da
  // hero.left/hero.top (vedi nota overflow).
  gsap.set(logoFixed.value, {
    x: heroX,
    y: heroY,
    width: hero.width,
    scale: 1.2,
    transformOrigin: '0 0',
  })

  // Floating pieno all'ingresso in Hero (progress 0).
  logoMorphRef.value?.setFloatAmplitude(1)
  scrollProgress.value = 0

  logoST = ScrollTrigger.create({
    trigger: heroSection,
    start: 'top top',
    end: 'bottom top',
    scrub: 0.3,
    animation: gsap.fromTo(
      logoFixed.value,
      { x: heroX, y: heroY, scale: 1.2 },
      { x: target.left, y: target.top, scale: scaleSmall, ease: 'none' }
    ),
    // Ampiezza floating = 1 - progress: piena in Hero, a zero in header.
    onUpdate: (self) => {
      logoMorphRef.value?.setFloatAmplitude(1 - self.progress)
      scrollProgress.value = self.progress
    },
  })
}

// Ricostruisce lo stato del logo in base alla route corrente. Killa
// sempre il trigger precedente per evitare doppioni al cambio pagina.
async function refreshLogo() {
  if (!appVisible.value) return
  if (logoST) {
    logoST.kill()
    logoST = null
  }
  await nextTick()
  if (route.path === '/') {
    // Home ma anchor non ancora montata (navigazione altra-route→Home con
    // Transition out-in: la vecchia pagina si smonta prima che Home monti).
    // Non fare docking: esci e aspetta. Il watch su heroLogoAnchor
    // ri-triggererà refreshLogo() appena l'anchor viene settata.
    if (!heroLogoAnchor.value) return
    buildHomeMorph()
  } else {
    setSmall()
  }
}

// Reagisce a: prima comparsa app (v-show), e ogni cambio di route.
watch([appVisible, () => route.path, heroLogoAnchor], () => {
  refreshLogo()
}, { immediate: true })

// Resize: le coordinate di partenza/arrivo cambiano in responsive, quindi
// ricostruisco il trigger daccapo (i valori px nel tween sono hardcoded).
let resizeTimer = null
function onResize() {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    refreshLogo()
    ScrollTrigger.refresh()
    // Ricalcola le dimensioni dello scroller Lenis dopo il refresh dei
    // trigger, così l'altezza scrollabile resta coerente in responsive.
    lenis.resize()
  }, 150)
}

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  logoST?.kill()
  clearTimeout(resizeTimer)
})

onMounted(() => {
  window.addEventListener('resize', onResize)
  onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      userStore.setUser({
        uid:         firebaseUser.uid,
        displayName: firebaseUser.displayName,
        email:       firebaseUser.email,
        photoURL:    firebaseUser.photoURL,
      })
      await userStore.caricaLikes(firebaseUser.uid)
    } else {
      userStore.setUser(null)
    }
    authReady.value = true
  })
})

// --- Transizione di route (GSAP, hook JS, no classi CSS) --------------------
// mode="out-in": il leave della vecchia pagina finisce prima dell'enter della
// nuova. LogoMorph e header sono fuori dal RouterView → non toccati.
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches

function onPageLeave(el, done) {
  if (prefersReducedMotion) return done()
  gsap.to(el, { opacity: 0, y: -8, duration: 0.25, ease: 'power1.in', onComplete: done })
}

function onPageEnter(el, done) {
  // Scroll in cima mentre la nuova pagina è ancora invisibile (opacity 0):
  // con out-in la vecchia è già smontata, quindi nessuno scatto visibile.
  lenis.scrollTo(0, { immediate: true })
  if (prefersReducedMotion) {
    gsap.set(el, { opacity: 1, y: 0 })
    return done()
  }
  gsap.fromTo(
    el,
    { opacity: 0, y: 8 },
    { opacity: 1, y: 0, duration: 0.3, ease: 'power1.out', onComplete: done }
  )
}

async function handleLogin() {
  try {
    await signInWithPopup(auth, googleProvider)
    userStore.closeAuthModal()
  } catch (err) {
    if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') return
    console.error('Login fallito:', err.message)
    alert('Accesso non riuscito. Controlla che i popup non siano bloccati dal browser e riprova.')
  }
}
</script>

<template>
  <IntroLoader v-if="!introCompleted" @done="introCompleted = true" />
  <div v-show="introCompleted && authReady">
    <TheHeader />
    <main>
      <RouterView v-slot="{ Component }">
        <Transition :css="false" mode="out-in" @enter="onPageEnter" @leave="onPageLeave">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
    <!-- Dissolvenza del contenuto che scorre sotto l'header (h-16 = 64px).
         z-40: sopra il contenuto, sotto header (z-50) e logo (z-60).
         Colore di partenza = --color-perla per fondersi col fondo pagina. -->
    <div
      class="fixed left-0 right-0 z-40 pointer-events-none transition-opacity duration-300"
      :style="{
        top: '64px',
        height: '32px',
        background: 'linear-gradient(to bottom, var(--color-perla) 0%, var(--color-perla) 35%, transparent 75%, transparent 100%)',
        opacity: (route.path !== '/' || scrollProgress >= 0.05) ? 1 : 0,
      }"
      aria-hidden="true"
    />
    <div ref="logoFixed" class="fixed top-0 left-0 z-[60] pointer-events-none">
      <LogoMorph ref="logoMorphRef" :visible="appVisible" />
    </div>
    <ScrollHint />
  </div>
  <AuthModal
    :open="userStore.authModalOpen"
    @close="userStore.closeAuthModal()"
    @login="handleLogin"
  />
</template>
