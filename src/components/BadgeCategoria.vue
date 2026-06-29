<script setup>
defineProps({
  categoria: { type: String, required: true },
})

const colori = {
  crema:    { bg: 'bg-turchese',  text: 'text-bianco' },
  frutta:   { bg: 'bg-fucsia',    text: 'text-bianco' },
  sorbetto: { bg: 'bg-indaco',    text: 'text-bianco' },
  vegano:   { bg: 'bg-bruciato',  text: 'text-notte'  },
}
</script>

<template>
  <span
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-ui-label"
    :class="[colori[categoria]?.bg ?? 'bg-indaco', colori[categoria]?.text ?? 'text-bianco']"
  >{{ categoria }}</span>
</template>
