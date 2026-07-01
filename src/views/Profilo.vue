<script setup>
import { ref, computed, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useUserStore } from '../stores/user.js'
import { useRicetteStore } from '../stores/ricette.js'
import CardRicetta from '../components/CardRicetta.vue'
import PageShell from '../components/PageShell.vue'

const userStore = useUserStore()
const ricetteStore = useRicetteStore()
const tabAttiva = ref('preferiti')

watch(tabAttiva, (tab) => {
  if (tab === 'salvate') userStore.caricaRicetteSalvate()
})

const ricetteLiked = computed(() =>
  userStore.likes.map(id => ricetteStore.getRicettaById(id)).filter(Boolean)
)
</script>

<template>
  <PageShell width="page" class="min-h-screen bg-perla pb-16">

      <!-- Non loggato -->
      <div
        v-if="!userStore.isLoggedIn"
        class="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center"
      >
        <h1 class="text-h1 text-notte">Il tuo profilo</h1>
        <p class="text-body text-notte/60 max-w-xs">
          Accedi per salvare ricette personalizzate e tenere traccia dei tuoi gusti preferiti.
        </p>
        <button
          @click="userStore.openAuthModal()"
          class="bg-notte text-perla rounded-xl px-6 py-3 text-body font-medium hover:opacity-80 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-notte"
        >Accedi con Google</button>
      </div>

      <!-- Loggato -->
      <template v-else>
        <div class="flex items-center gap-4 mb-10">
          <div
            class="w-12 h-12 rounded-full bg-notte text-perla flex items-center justify-center text-h3 font-semibold select-none shrink-0"
            aria-hidden="true"
          >{{ userStore.user.displayName?.charAt(0)?.toUpperCase() ?? 'U' }}</div>
          <div class="flex-1 min-w-0">
            <h1 class="text-h2 text-notte truncate">{{ userStore.user.displayName }}</h1>
            <p class="text-body-small text-notte/50 truncate">{{ userStore.user.email }}</p>
          </div>
          <button
            @click="userStore.logout()"
            class="text-body-small text-notte/50 hover:text-notte transition-colors shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-notte rounded"
          >Esci</button>
        </div>

        <!-- Tab bar -->
        <div class="flex border-b border-notte/10 mb-8" role="tablist">
          <button
            role="tab"
            :aria-selected="tabAttiva === 'preferiti'"
            @click="tabAttiva = 'preferiti'"
            class="px-4 py-2.5 text-ui-label transition-colors border-b-2 -mb-px"
            :class="tabAttiva === 'preferiti'
              ? 'border-notte text-notte'
              : 'border-transparent text-notte/40 hover:text-notte/70'"
          >Preferiti ({{ userStore.likes.length }})</button>
          <button
            role="tab"
            :aria-selected="tabAttiva === 'salvate'"
            @click="tabAttiva = 'salvate'"
            class="px-4 py-2.5 text-ui-label transition-colors border-b-2 -mb-px"
            :class="tabAttiva === 'salvate'
              ? 'border-notte text-notte'
              : 'border-transparent text-notte/40 hover:text-notte/70'"
          >Ricette salvate ({{ userStore.ricetteSalvate.length }})</button>
        </div>

        <!-- Tab: Preferiti -->
        <div v-if="tabAttiva === 'preferiti'" role="tabpanel">
          <p
            v-if="ricetteLiked.length === 0"
            class="text-body text-notte/50 py-8 text-center"
          >
            Nessun preferito ancora.<br>
            <RouterLink
              to="/ricette"
              class="text-notte underline hover:opacity-70 transition-opacity"
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
          <p
            v-if="userStore.ricetteSalvate.length === 0"
            class="text-body text-notte/50 py-8 text-center"
          >
            Nessuna ricetta salvata.<br>
            <RouterLink
              to="/crea"
              class="text-notte underline hover:opacity-70 transition-opacity"
            >Crea il tuo gusto</RouterLink> e salvalo qui.
          </p>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <RouterLink
              v-for="r in userStore.ricetteSalvate"
              :key="r.id"
              :to="`/ricette-custom/${r.id}`"
              class="block bg-perla border border-notte/15 rounded-2xl p-5 hover:border-notte/40 transition-colors no-underline"
              style="text-decoration: none;"
            >
              <p class="text-ui-label text-notte/40 mb-2">{{ r.categoria?.toUpperCase() }}</p>
              <h3 class="text-h3 text-notte mb-1">{{ r.nome }}</h3>
              <p class="text-body-small text-notte/50">{{ r.quantitaKg }} kg</p>
            </RouterLink>
          </div>
        </div>
      </template>

  </PageShell>
</template>
