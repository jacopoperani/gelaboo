<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
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

const userStore = useUserStore()
const introCompleted = ref(false)
const authReady = ref(false)

const route = useRoute()
const { logoTarget, heroLogoAnchor, scrollProgress } = useLogoAnchors()
const logoFixed = ref(null)
const logoMorphRef = ref(null)
const appVisible = computed(() => introCompleted.value && authReady.value)

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

  // Baseline allo stato Hero.
  gsap.set(logoFixed.value, {
    x: hero.left,
    y: hero.top,
    width: hero.width,
    scale: 1,
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
      { x: hero.left, y: hero.top, scale: 1 },
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
    buildHomeMorph()
  } else {
    setSmall()
  }
}

// Reagisce a: prima comparsa app (v-show), e ogni cambio di route.
watch([appVisible, () => route.path], () => {
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
      <RouterView />
    </main>
    <!-- Dissolvenza del contenuto che scorre sotto l'header (h-16 = 64px).
         z-40: sopra il contenuto, sotto header (z-50) e logo (z-60).
         Colore di partenza = --color-perla per fondersi col fondo pagina. -->
    <div
      class="fixed left-0 right-0 z-40 pointer-events-none"
      style="top: 64px; height: 32px; background: linear-gradient(to bottom, var(--color-perla) 0%, var(--color-perla) 35%, transparent 75%, transparent 100%);"
      aria-hidden="true"
    />
    <div ref="logoFixed" class="fixed top-0 left-0 z-[60] pointer-events-none">
      <LogoMorph ref="logoMorphRef" />
    </div>
    <ScrollHint />
  </div>
  <AuthModal
    :open="userStore.authModalOpen"
    @close="userStore.closeAuthModal()"
    @login="handleLogin"
  />
</template>
