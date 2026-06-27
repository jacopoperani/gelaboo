<script setup>
import { ref, onMounted } from 'vue'
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth'
import { auth, googleProvider } from './firebase.js'
import TheHeader from './components/TheHeader.vue'
import IntroLoader from './components/IntroLoader.vue'
import AuthModal from './components/AuthModal.vue'
import { useUserStore } from './stores/user.js'

const userStore = useUserStore()
const introCompleted = ref(false)
const authReady = ref(false)

onMounted(() => {
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
  </div>
  <AuthModal
    :open="userStore.authModalOpen"
    @close="userStore.closeAuthModal()"
    @login="handleLogin"
  />
</template>
