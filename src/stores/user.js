import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { signOut } from 'firebase/auth'
import { doc, setDoc, deleteDoc, getDocs, addDoc, collection, serverTimestamp, query, orderBy } from 'firebase/firestore'
import { auth, db } from '../firebase.js'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const likes = ref([])
  const ricetteSalvate = ref([])
  const authModalOpen = ref(false)

  const isLoggedIn = computed(() => user.value !== null)

  function setUser(u) { user.value = u }

  async function caricaLikes(uid) {
    const snap = await getDocs(collection(db, 'users', uid, 'likes'))
    likes.value = snap.docs.map(d => d.id)
  }

  async function toggleLike(recipeId) {
    if (!user.value) return
    const uid = user.value.uid
    const ref_ = doc(db, 'users', uid, 'likes', recipeId)
    const idx = likes.value.indexOf(recipeId)
    if (idx !== -1) {
      likes.value.splice(idx, 1)
      await deleteDoc(ref_)
    } else {
      likes.value.push(recipeId)
      await setDoc(ref_, { addedAt: serverTimestamp() })
    }
  }

  function hasLike(id) { return likes.value.includes(id) }

  async function salvaRicettaCustom(ricetta) {
    if (!user.value) return false
    const uid = user.value.uid
    try {
      const docRef = await addDoc(collection(db, 'users', uid, 'ricetteSalvate'), {
        ...ricetta,
        creataIl: serverTimestamp(),
      })
      ricetteSalvate.value.unshift({ ...ricetta, id: docRef.id })
      return docRef.id
    } catch (err) {
      console.error('[salvaRicettaCustom] Errore scrittura Firestore:', err)
      return false
    }
  }

  async function caricaRicetteSalvate() {
    if (!user.value) {
      ricetteSalvate.value = []
      return
    }
    const uid = user.value.uid
    try {
      const q = query(collection(db, 'users', uid, 'ricetteSalvate'), orderBy('creataIl', 'desc'))
      const snap = await getDocs(q)
      ricetteSalvate.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    } catch (err) {
      console.error('[caricaRicetteSalvate] Errore lettura Firestore:', err)
    }
  }

  async function logout() {
    await signOut(auth)
    user.value = null
    likes.value = []
    ricetteSalvate.value = []
  }

  function openAuthModal() { authModalOpen.value = true }
  function closeAuthModal() { authModalOpen.value = false }

  return { user, likes, ricetteSalvate, isLoggedIn, authModalOpen, setUser, caricaLikes, toggleLike, hasLike, salvaRicettaCustom, caricaRicetteSalvate, logout, openAuthModal, closeAuthModal }
})
