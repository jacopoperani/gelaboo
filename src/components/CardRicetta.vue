<script setup>
import { RouterLink } from 'vue-router'
import BadgeCategoria from './BadgeCategoria.vue'

defineProps({
  ricetta: { type: Object, required: true },
})
</script>

<template>
  <RouterLink
    :to="`/ricette/${ricetta.id}`"
    class="block bg-perla border border-notte/15 rounded-2xl p-5 hover:border-notte/40 transition-colors no-underline group"
    style="text-decoration: none;"
  >
    <div class="flex items-start justify-between gap-3 mb-3">
      <BadgeCategoria :categoria="ricetta.categoria" />
    </div>
    <h3 class="text-notte text-h3 mb-1 group-hover:opacity-80 transition-opacity">{{ ricetta.nome }}</h3>
    <p class="text-notte/60 text-body-small line-clamp-2">{{ ricetta.payoff }}</p>
  </RouterLink>
</template>
