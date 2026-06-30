<script setup>
import { RouterLink } from 'vue-router'
import GelatiFloating from '../components/GelatiFloating.vue'
import { useLogoAnchors } from '../composables/useLogoAnchors.js'

const { heroLogoAnchor } = useLogoAnchors()
</script>

<template>
  <div class="relative">
    <GelatiFloating />

    <section
      class="min-h-screen flex flex-col items-center justify-center px-6 pt-16"
    >
      <div class="relative z-10 max-w-2xl w-full text-center">
        <!-- Ancora invisibile: tiene lo spazio del logo grande nella Hero.
             Il logo vero è montato fixed in App.vue. Aspect ratio dal
             viewBox 667.85 × 280.28. -->
        <div
          ref="heroLogoAnchor"
          data-gelato-obstacle
          class="mb-3 w-[95%] sm:w-[92%] md:w-[88%] lg:w-[85%] max-w-7xl aspect-[667.85/280.28] mx-auto"
          aria-hidden="true"
        />
      </div>
    </section>

    <!-- Spacer: dà respiro durante il morph del logo, così il contenuto
         non arriva sotto l'header mentre il logo sta ancora animando. -->
    <div class="h-[35vh]" aria-hidden="true" />

    <section class="py-24">
      <div class="relative z-10 max-w-3xl mx-auto px-6 text-left">
        <h2 class="text-h1">Uno strumento per creare il gelato perfetto</h2>
        <p class="text-body text-notte/70 mt-4">
          Bilancia ogni ricetta in pochi secondi, senza calcoli a mano.
        </p>
      </div>
    </section>

    <section class="py-24">
      <div class="relative z-10 max-w-3xl mx-auto px-6 text-left">
        <h2 class="text-h1">Tante ricette di base, sempre in aggiornamento</h2>
        <p class="text-body text-notte/70 mt-4">
          Parti da una ricetta verificata o modificala come vuoi.
        </p>
      </div>
    </section>

    <section class="pt-24 pb-12">
      <div class="relative z-10 max-w-3xl mx-auto px-6 text-left">
        <h2 class="text-h1">Hai pensato a qualche gusto particolare? Crealo con<br>Gelaboo</h2>
        <p class="text-body text-notte/70 mt-4">
          Descrivi il sapore che hai in mente: l'intelligenza artificiale
          suggerisce gli ingredienti, Gelaboo bilancia tutto il resto.
        </p>
      </div>
    </section>

    <section class="pt-20 pb-24 text-center">
      <div class="relative z-10 flex flex-col sm:flex-row gap-3 justify-center items-center px-6">
        <RouterLink
          to="/ricette"
          data-gelato-obstacle
          class="inline-flex items-center justify-center bg-notte text-perla rounded-xl px-7 py-3.5 text-body font-medium no-underline hover:opacity-80 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-notte"
        >Sfoglia i gusti</RouterLink>
        <RouterLink
          to="/crea"
          data-gelato-obstacle
          class="inline-flex items-center justify-center border border-notte/20 text-notte rounded-xl px-7 py-3.5 text-body font-medium no-underline hover:border-notte/60 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-notte"
        >Crea il tuo gusto</RouterLink>
      </div>
    </section>
  </div>
</template>
