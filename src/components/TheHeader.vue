<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { gsap } from 'gsap'
import { useUserStore } from '../stores/user.js'

const userStore = useUserStore()
const router = useRouter()
const menuOpen = ref(false)

const panelRef = ref(null)
const scrimRef = ref(null)

const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches

function closeMenu() { menuOpen.value = false }

function nav(path) {
  router.push(path)
  closeMenu()
}

// Panel slides in from the right edge; the scrim fades in alongside it;
// menu items stagger in once the panel has nearly finished entering.
function onEnter(el, done) {
  const items = el.querySelectorAll('[data-menu-item]')

  if (prefersReducedMotion) {
    gsap.set([scrimRef.value, panelRef.value, ...items], {
      clearProps: 'all',
    })
    done()
    return
  }

  const tl = gsap.timeline({ onComplete: done })
  tl.set(scrimRef.value, { opacity: 0 })
    .set(panelRef.value, { xPercent: 100 })
    .set(items, { opacity: 0, x: 18 })
    .to(scrimRef.value, { opacity: 1, duration: 0.45, ease: 'sine.inOut' }, 0)
    .to(
      panelRef.value,
      { xPercent: 0, duration: 0.45, ease: 'power3.out' },
      0
    )
    .to(
      items,
      { opacity: 1, x: 0, duration: 0.38, ease: 'power2.out', stagger: 0.07 },
      '-=0.2'
    )
}

// Symmetric reverse: items leave first, then the panel slides back out
// to the right while the scrim fades away.
function onLeave(el, done) {
  const items = el.querySelectorAll('[data-menu-item]')

  if (prefersReducedMotion) {
    done()
    return
  }

  const tl = gsap.timeline({ onComplete: done })
  tl.to(items, {
    opacity: 0,
    x: 18,
    duration: 0.25,
    ease: 'power2.in',
    stagger: 0.05,
  })
    .to(
      panelRef.value,
      { xPercent: 100, duration: 0.4, ease: 'power3.in' },
      '-=0.1'
    )
    .to(
      scrimRef.value,
      { opacity: 0, duration: 0.4, ease: 'sine.inOut' },
      '<'
    )
}
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 bg-perla border-b border-notte/10 h-16 flex items-center px-6 gap-4"
  >
    <RouterLink
      to="/"
      @click="closeMenu"
      class="text-notte no-underline"
      aria-label="gelaboo — torna alla home"
    >
      <span style="font-family: 'Instrument Serif', serif; font-weight: 600; font-size: 20px; letter-spacing: -0.02em;">gelaboo</span>
    </RouterLink>

    <div class="flex-1" />

    <button
      v-if="!userStore.isLoggedIn"
      @click="userStore.openAuthModal()"
      class="text-body-small font-medium border border-notte/20 text-notte rounded-xl px-4 py-2 hover:border-notte transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-notte"
    >Accedi</button>
    <RouterLink
      v-else
      to="/profilo"
      @click="closeMenu"
      class="w-8 h-8 rounded-full bg-notte text-perla flex items-center justify-center text-h3 font-semibold no-underline select-none shrink-0"
      :aria-label="`Profilo di ${userStore.user.displayName}`"
    >{{ userStore.user.displayName?.charAt(0)?.toUpperCase() ?? 'U' }}</RouterLink>

    <button
      @click="menuOpen = !menuOpen"
      :aria-expanded="String(menuOpen)"
      class="px-4 py-2 rounded font-data text-body-small font-medium text-notte focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-notte shrink-0"
    >
      {{ menuOpen ? 'Chiudi' : 'Menu' }}
    </button>
  </header>

  <Transition :css="false" @enter="onEnter" @leave="onLeave">
    <div v-if="menuOpen" class="fixed inset-0 top-16 z-40">
      <div
        ref="scrimRef"
        class="absolute inset-0 bg-notte/20"
        @click="closeMenu"
        aria-hidden="true"
      />
      <nav
        ref="panelRef"
        class="absolute top-0 right-0 h-full w-[min(20rem,100%)] bg-perla border-l border-notte/10 px-6 py-2 overflow-y-auto"
        aria-label="Navigazione principale"
      >
        <button
          data-menu-item
          @click="nav('/ricette')"
          class="w-full text-right py-4 border-b border-notte/8 hover:opacity-60 transition-opacity focus-visible:outline-none"
          style="font-family: 'Instrument Serif', serif; font-size: 20px; font-weight: 600; line-height: 1.25; color: #161b33;"
        >Sfoglia i gusti</button>
        <button
          data-menu-item
          @click="nav('/crea')"
          class="w-full text-right py-4 hover:opacity-60 transition-opacity focus-visible:outline-none"
          style="font-family: 'Instrument Serif', serif; font-size: 20px; font-weight: 600; line-height: 1.25; color: #161b33;"
        >Crea il tuo gusto</button>
      </nav>
    </div>
  </Transition>
</template>
