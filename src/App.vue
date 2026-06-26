<script setup>
import { ref } from 'vue'
import TheHeader from './components/TheHeader.vue'
import IntroLoader from './components/IntroLoader.vue'
import AuthModal from './components/AuthModal.vue'
import { useUserStore } from './stores/user.js'

const userStore = useUserStore()
const introCompleted = ref(false)

function handleLogin() {
  userStore.setUser({ displayName: 'Utente', email: 'test@gelaboo.it' })
  userStore.closeAuthModal()
}
</script>

<template>
  <IntroLoader v-if="!introCompleted" @done="introCompleted = true" />
  <div v-show="introCompleted">
    <TheHeader />
    <main>
      <RouterView />
    </main>
  </div>
  <AuthModal
    :open="userStore.authModalOpen"
    @close="userStore.closeAuthModal()"
    @login="handleLogin"
  />
</template>
