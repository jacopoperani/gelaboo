<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user.js'

const userStore = useUserStore()
const router = useRouter()
const menuOpen = ref(false)

function closeMenu() { menuOpen.value = false }

function nav(path) {
  router.push(path)
  closeMenu()
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

  <Transition name="menu">
    <nav
      v-if="menuOpen"
      class="fixed top-16 inset-x-0 z-40 bg-perla border-b border-notte/10 px-6 py-2"
      aria-label="Navigazione principale"
    >
      <button
        @click="nav('/ricette')"
        class="w-full text-left py-4 border-b border-notte/8 hover:opacity-60 transition-opacity focus-visible:outline-none"
        style="font-family: 'Instrument Serif', serif; font-size: 20px; font-weight: 600; line-height: 1.25; color: #161b33;"
      >Sfoglia i gusti</button>
      <button
        @click="nav('/ricette')"
        class="w-full text-left py-4 border-b border-notte/8 hover:opacity-60 transition-opacity focus-visible:outline-none"
        style="font-family: 'Instrument Serif', serif; font-size: 20px; font-weight: 600; line-height: 1.25; color: #161b33;"
      >Calcola una ricetta</button>
      <button
        @click="nav('/crea')"
        class="w-full text-left py-4 hover:opacity-60 transition-opacity focus-visible:outline-none"
        style="font-family: 'Instrument Serif', serif; font-size: 20px; font-weight: 600; line-height: 1.25; color: #161b33;"
      >Crea il tuo gusto</button>
    </nav>
  </Transition>

  <div
    v-if="menuOpen"
    class="fixed inset-0 z-30"
    @click="closeMenu"
    aria-hidden="true"
  />
</template>

<style scoped>
.menu-enter-active,
.menu-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
