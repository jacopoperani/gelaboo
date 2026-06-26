<script setup>
import { useRicetteStore } from '../stores/ricette.js'
import CardRicetta from '../components/CardRicetta.vue'

const ricetteStore = useRicetteStore()
const categorie = ['crema', 'frutta', 'sorbetto', 'vegano']
</script>

<template>
  <section class="min-h-screen bg-crema px-6 pt-24 pb-16" style="font-family: Inter, sans-serif;">
    <div class="max-w-5xl mx-auto">
      <h1 class="text-h1 text-inchiostro mb-8">Gusti</h1>

      <div
        class="flex gap-2 flex-wrap mb-10"
        role="group"
        aria-label="Filtra per categoria"
      >
        <button
          @click="ricetteStore.setFiltro(null)"
          class="px-4 py-1.5 rounded-full text-ui-label transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inchiostro"
          :class="!ricetteStore.filtroCategoria
            ? 'bg-inchiostro text-crema'
            : 'border border-inchiostro/20 text-inchiostro hover:border-inchiostro/50'"
          :aria-pressed="String(!ricetteStore.filtroCategoria)"
        >Tutti</button>

        <button
          v-for="cat in categorie"
          :key="cat"
          @click="ricetteStore.setFiltro(cat)"
          class="px-4 py-1.5 rounded-full text-ui-label capitalize transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inchiostro"
          :class="ricetteStore.filtroCategoria === cat
            ? 'bg-inchiostro text-crema'
            : 'border border-inchiostro/20 text-inchiostro hover:border-inchiostro/50'"
          :aria-pressed="String(ricetteStore.filtroCategoria === cat)"
        >{{ cat }}</button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <CardRicetta
          v-for="ricetta in ricetteStore.ricetteFiltrate"
          :key="ricetta.id"
          :ricetta="ricetta"
        />
      </div>

      <p
        v-if="ricetteStore.ricetteFiltrate.length === 0"
        class="text-body text-inchiostro/50 py-16 text-center"
      >Nessun gusto in questa categoria.</p>
    </div>
  </section>
</template>
