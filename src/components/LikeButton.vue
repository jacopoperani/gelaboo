<script setup>
import { computed } from 'vue'
import { useUserStore } from '../stores/user.js'

const props = defineProps({
  ricettaId: { type: String, required: true },
})

const emit = defineEmits(['requireLogin'])
const userStore = useUserStore()
const liked = computed(() => userStore.hasLike(props.ricettaId))

function toggle() {
  if (!userStore.isLoggedIn) { emit('requireLogin'); return }
  userStore.toggleLike(props.ricettaId)
}
</script>

<template>
  <button
    @click="toggle"
    :aria-label="liked ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'"
    :aria-pressed="liked"
    class="flex items-center justify-center w-10 h-10 rounded-full border transition-colors"
    :class="liked
      ? 'bg-ciliegia border-ciliegia text-bianco'
      : 'bg-transparent border-inchiostro/20 text-inchiostro/50 hover:border-ciliegia hover:text-ciliegia'"
  >
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 13.5S1.5 9.5 1.5 5.5a3.5 3.5 0 0 1 6.5-1.8A3.5 3.5 0 0 1 14.5 5.5c0 4-6.5 8-6.5 8Z"
        :fill="liked ? 'currentColor' : 'none'"
        stroke="currentColor"
        stroke-width="1.4"
        stroke-linejoin="round"
      />
    </svg>
  </button>
</template>
