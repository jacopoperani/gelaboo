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
    class="fixed top-0 left-0 right-0 z-50 bg-crema border-b border-inchiostro/10 h-16 flex items-center px-6 gap-4"
    style="font-family: Inter, sans-serif;"
  >
    <RouterLink
      to="/"
      @click="closeMenu"
      class="text-inchiostro no-underline"
      aria-label="gelaboo — torna alla home"
    >
      <span style="font-family: 'Fraunces', serif; font-weight: 600; font-size: 20px; font-variation-settings: 'WONK' 1; letter-spacing: -0.02em;">gelaboo</span>
    </RouterLink>

    <div class="flex-1" />

    <button
      v-if="!userStore.isLoggedIn"
      @click="userStore.openAuthModal()"
      class="text-body-small font-medium border border-inchiostro/20 text-inchiostro rounded-xl px-4 py-2 hover:border-inchiostro transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inchiostro"
    >Accedi</button>
    <RouterLink
      v-else
      to="/profilo"
      @click="closeMenu"
      class="w-8 h-8 rounded-full bg-inchiostro text-crema flex items-center justify-center text-ui-label font-semibold no-underline select-none shrink-0"
      :aria-label="`Profilo di ${userStore.user.displayName}`"
    >{{ userStore.user.displayName?.charAt(0)?.toUpperCase() ?? 'U' }}</RouterLink>

    <button
      @click="menuOpen = !menuOpen"
      :aria-label="menuOpen ? 'Chiudi menu' : 'Apri menu'"
      :aria-expanded="String(menuOpen)"
      class="w-8 h-8 flex flex-col items-center justify-center gap-[5px] rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inchiostro shrink-0"
    >
      <span
        class="block w-5 bg-inchiostro rounded-full origin-center transition-all duration-200"
        style="height: 1.5px;"
        :style="menuOpen ? { transform: 'rotate(45deg) translate(0, 5px)' } : {}"
      />
      <span
        class="block w-5 bg-inchiostro rounded-full transition-all duration-200"
        style="height: 1.5px;"
        :style="menuOpen ? { opacity: '0' } : {}"
      />
      <span
        class="block w-5 bg-inchiostro rounded-full origin-center transition-all duration-200"
        style="height: 1.5px;"
        :style="menuOpen ? { transform: 'rotate(-45deg) translate(0, -5px)' } : {}"
      />
    </button>
  </header>

  <Transition name="menu">
    <nav
      v-if="menuOpen"
      class="fixed top-16 inset-x-0 z-40 bg-crema border-b border-inchiostro/10 px-6 py-2"
      aria-label="Navigazione principale"
    >
      <button
        @click="nav('/ricette')"
        class="w-full text-left py-4 border-b border-inchiostro/8 hover:opacity-60 transition-opacity focus-visible:outline-none"
        style="font-family: 'Fraunces', serif; font-variation-settings: 'WONK' 1; font-size: 20px; font-weight: 600; line-height: 1.25; color: #3A2317;"
      >Sfoglia i gusti</button>
      <button
        @click="nav('/ricette')"
        class="w-full text-left py-4 border-b border-inchiostro/8 hover:opacity-60 transition-opacity focus-visible:outline-none"
        style="font-family: 'Fraunces', serif; font-variation-settings: 'WONK' 1; font-size: 20px; font-weight: 600; line-height: 1.25; color: #3A2317;"
      >Calcola una ricetta</button>
      <button
        @click="nav('/crea')"
        class="w-full text-left py-4 hover:opacity-60 transition-opacity focus-visible:outline-none"
        style="font-family: 'Fraunces', serif; font-variation-settings: 'WONK' 1; font-size: 20px; font-weight: 600; line-height: 1.25; color: #3A2317;"
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
