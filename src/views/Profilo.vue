<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useUserStore } from '../stores/user.js'
import { useRicetteStore } from '../stores/ricette.js'
import CardRicetta from '../components/CardRicetta.vue'

const userStore = useUserStore()
const ricetteStore = useRicetteStore()
const tabAttiva = ref('preferiti')

const ricetteLiked = computed(() =>
  userStore.likes.map(id => ricetteStore.getRicettaById(id)).filter(Boolean)
)
</script>

<template>
  <section class="min-h-screen bg-crema px-6 pt-24 pb-16" style="font-family: Inter, sans-serif;">
    <div class="max-w-4xl mx-auto">

      <!-- Non loggato -->
      <div
        v-if="!userStore.isLoggedIn"
        class="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center"
      >
        <h1 class="text-h1 text-inchiostro">Il tuo profilo</h1>
        <p class="text-body text-inchiostro/60 max-w-xs">
          Accedi per salvare ricette personalizzate e tenere traccia dei tuoi gusti preferiti.
        </p>
        <button
          @click="userStore.openAuthModal()"
          class="bg-inchiostro text-crema rounded-xl px-6 py-3 text-body font-medium hover:opacity-80 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inchiostro"
        >Accedi con Google</button>
      </div>

      <!-- Loggato -->
      <template v-else>
        <div class="flex items-center gap-4 mb-10">
          <div
            class="w-12 h-12 rounded-full bg-inchiostro text-crema flex items-center justify-center text-h3 font-semibold select-none shrink-0"
            aria-hidden="true"
          >{{ userStore.user.displayName?.charAt(0)?.toUpperCase() ?? 'U' }}</div>
          <div class="flex-1 min-w-0">
            <h1 class="text-h2 text-inchiostro truncate">{{ userStore.user.displayName }}</h1>
            <p class="text-body-small text-inchiostro/50 truncate">{{ userStore.user.email }}</p>
          </div>
          <button
            @click="userStore.logout()"
            class="text-body-small text-inchiostro/50 hover:text-inchiostro transition-colors shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inchiostro rounded"
          >Esci</button>
        </div>

        <!-- Tab bar -->
        <div class="flex border-b border-inchiostro/10 mb-8" role="tablist">
          <button
            role="tab"
            :aria-selected="tabAttiva === 'preferiti'"
            @click="tabAttiva = 'preferiti'"
            class="px-4 py-2.5 text-ui-label transition-colors border-b-2 -mb-px"
            :class="tabAttiva === 'preferiti'
              ? 'border-inchiostro text-inchiostro'
              : 'border-transparent text-inchiostro/40 hover:text-inchiostro/70'"
          >Preferiti ({{ userStore.likes.length }})</button>
          <button
            role="tab"
            :aria-selected="tabAttiva === 'salvate'"
            @click="tabAttiva = 'salvate'"
            class="px-4 py-2.5 text-ui-label transition-colors border-b-2 -mb-px"
            :class="tabAttiva === 'salvate'
              ? 'border-inchiostro text-inchiostro'
              : 'border-transparent text-inchiostro/40 hover:text-inchiostro/70'"
          >Ricette salvate</button>
        </div>

        <!-- Tab: Preferiti -->
        <div v-if="tabAttiva === 'preferiti'" role="tabpanel">
          <p
            v-if="ricetteLiked.length === 0"
            class="text-body text-inchiostro/50 py-8 text-center"
          >
            Nessun preferito ancora.<br>
            <RouterLink
              to="/ricette"
              class="text-inchiostro underline hover:opacity-70 transition-opacity"
            >Esplora i gusti</RouterLink> e aggiungi i tuoi.
          </p>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <CardRicetta
              v-for="r in ricetteLiked"
              :key="r.id"
              :ricetta="r"
            />
          </div>
        </div>

        <!-- Tab: Salvate -->
        <div v-else role="tabpanel">
          <p class="text-body text-inchiostro/50 py-8 text-center">
            Nessuna ricetta salvata.<br>
            <RouterLink
              to="/crea"
              class="text-inchiostro underline hover:opacity-70 transition-opacity"
            >Crea il tuo gusto</RouterLink> e salvalo qui.
          </p>
        </div>
      </template>

    </div>
  </section>
</template>
