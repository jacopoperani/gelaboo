<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <section
    class="min-h-screen bg-crema flex flex-col items-center justify-center px-6 pt-16"
    style="font-family: Inter, sans-serif;"
  >
    <div class="max-w-2xl w-full text-center">
      <h1 class="text-display text-inchiostro mb-3">gelaboo</h1>
      <p
        class="text-inchiostro/60 mb-14"
        style="font-family: 'Fraunces', serif; font-variation-settings: 'WONK' 1; font-size: 22px; line-height: 1.35;"
      >Calcola ogni gusto al grammo.</p>

      <div class="flex flex-col sm:flex-row gap-3 justify-center items-center">
        <RouterLink
          to="/ricette"
          class="inline-flex items-center justify-center bg-inchiostro text-crema rounded-xl px-7 py-3.5 text-body font-medium no-underline hover:opacity-80 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inchiostro"
        >Sfoglia i gusti</RouterLink>
        <RouterLink
          to="/ricette"
          class="inline-flex items-center justify-center border border-inchiostro/20 text-inchiostro rounded-xl px-7 py-3.5 text-body font-medium no-underline hover:border-inchiostro/60 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inchiostro"
        >Calcola una ricetta</RouterLink>
        <RouterLink
          to="/crea"
          class="inline-flex items-center justify-center border border-inchiostro/20 text-inchiostro rounded-xl px-7 py-3.5 text-body font-medium no-underline hover:border-inchiostro/60 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inchiostro"
        >Crea il tuo gusto</RouterLink>
      </div>
    </div>
  </section>
</template>
