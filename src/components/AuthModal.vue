<script setup>
defineProps({ open: { type: Boolean, default: false } })
const emit = defineEmits(['close', 'login'])
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 z-[200] flex items-center justify-center bg-notte/40 backdrop-blur-sm"
        @click.self="emit('close')"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
      >
        <div class="bg-perla rounded-2xl p-8 w-full max-w-sm mx-4 shadow-xl">
          <h2 id="auth-title" class="text-h2 text-notte mb-2">Accedi a gelaboo</h2>
          <p class="text-body text-notte/60 mb-6">Accedi per salvare ricette e aggiungere preferiti.</p>
          <button
            @click="emit('login')"
            class="w-full flex items-center justify-center gap-3 bg-notte text-perla rounded-xl py-3 font-medium transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-notte"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path fill="currentColor" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.17Z"/><path fill="currentColor" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04c-.71.48-1.63.77-2.7.77-2.08 0-3.85-1.4-4.48-3.29H1.83v2.07A8 8 0 0 0 8.98 17Z"/><path fill="currentColor" d="M4.5 10.5A4.8 4.8 0 0 1 4.25 9c0-.52.09-1.03.25-1.5V5.43H1.83A8 8 0 0 0 .98 9c0 1.29.31 2.51.85 3.57L4.5 10.5Z"/><path fill="currentColor" d="M8.98 3.72c1.17 0 2.23.4 3.06 1.2l2.3-2.3A7.97 7.97 0 0 0 8.98 1a8 8 0 0 0-7.15 4.43L4.5 7.5C5.13 5.62 6.9 3.72 8.98 3.72Z"/></svg>
            Continua con Google
          </button>
          <button
            @click="emit('close')"
            class="mt-3 w-full text-center text-notte/50 text-body-small hover:text-notte transition-colors"
          >Annulla</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
