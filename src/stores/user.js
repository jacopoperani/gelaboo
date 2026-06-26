import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const likes = ref([])
  const authModalOpen = ref(false)

  const isLoggedIn = computed(() => user.value !== null)

  function setUser(u) { user.value = u }
  function logout() { user.value = null; likes.value = [] }

  function toggleLike(id) {
    const idx = likes.value.indexOf(id)
    if (idx === -1) likes.value.push(id)
    else likes.value.splice(idx, 1)
  }

  function hasLike(id) { return likes.value.includes(id) }

  function openAuthModal() { authModalOpen.value = true }
  function closeAuthModal() { authModalOpen.value = false }

  return { user, likes, isLoggedIn, authModalOpen, setUser, logout, toggleLike, hasLike, openAuthModal, closeAuthModal }
})
