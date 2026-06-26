<script setup>
defineProps({
  categoria: { type: String, required: true },
})

const colori = {
  crema:    { bg: 'bg-mandarino',   text: 'text-inchiostro' },
  frutta:   { bg: 'bg-ciliegia',    text: 'text-bianco'     },
  sorbetto: { bg: 'bg-menta',       text: 'text-inchiostro' },
  vegano:   { bg: 'bg-pistacchio',  text: 'text-bianco'     },
}
</script>

<template>
  <span
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-ui-label"
    :class="[colori[categoria]?.bg ?? 'bg-menta', colori[categoria]?.text ?? 'text-inchiostro']"
  >{{ categoria }}</span>
</template>
