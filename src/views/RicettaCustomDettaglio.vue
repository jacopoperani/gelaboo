<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user.js'
import { useCalcolatore, fasciaCorretta } from '../composables/useCalcolatore.js'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase.js'
import BadgeCategoria from '../components/BadgeCategoria.vue'
import SliderIngrediente from '../components/SliderIngrediente.vue'
import PannelloBilanciamento from '../components/PannelloBilanciamento.vue'
import Procedimento from '../components/Procedimento.vue'
import PageShell from '../components/PageShell.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const ricetta = ref(null)
const caricamento = ref(true)

// Stato mutabile locale — inizializzato dopo il caricamento
const ingredienti = ref([])
const quantitaKg  = ref(1)
const categoria   = ref('crema')

function isModificabile(ing) {
  return ing.modificabile === true
}

function inizializzaDaRicetta(r) {
  ricetta.value    = r
  ingredienti.value = r.ingredienti.map(i => ({ ...i }))
  quantitaKg.value  = r.quantitaKg
  categoria.value   = r.categoria
}

onMounted(async () => {
  const id = route.params.id

  const inStore = userStore.ricetteSalvate.find(r => r.id === id)
  if (inStore) {
    inizializzaDaRicetta(inStore)
    caricamento.value = false
    return
  }

  if (!userStore.user) {
    caricamento.value = false
    return
  }
  try {
    const snap = await getDoc(doc(db, 'users', userStore.user.uid, 'ricetteSalvate', id))
    if (snap.exists()) {
      inizializzaDaRicetta({ id: snap.id, ...snap.data() })
    }
  } catch (err) {
    console.error('[RicettaCustomDettaglio] Errore lettura Firestore:', err)
  } finally {
    caricamento.value = false
  }
})

// ── Calcolatore live ──────────────────────────────────────────────────────────

const { bilancio, warnings, stati } = useCalcolatore(ingredienti, quantitaKg, categoria)

const factor = computed(() => {
  const tot = ingredienti.value.reduce((s, i) => s + i.g_per_kg, 0) || 1000
  return (quantitaKg.value * 1000) / tot
})

// Slider overrides: { [nomeIngrediente]: g_per_kg }
const overrides = ref({})

function sliderVal(nome) {
  const ing = ingredienti.value.find(i => i.nome === nome)
  const gPerKg = overrides.value[nome] ?? ing?.g_per_kg ?? 0
  return Math.round(gPerKg * factor.value)
}

function onSlider(nome, val) {
  const gPerKg = val / factor.value
  overrides.value = { ...overrides.value, [nome]: gPerKg }
  const idx = ingredienti.value.findIndex(i => i.nome === nome)
  if (idx !== -1) {
    const updated = [...ingredienti.value]
    updated[idx] = { ...updated[idx], g_per_kg: gPerKg }
    ingredienti.value = updated
  }
}

const fasceCorrette = computed(() => {
  const ing = ingredienti.value
  const cat = categoria.value
  const out = {}
  for (const i of ing) {
    if (!isModificabile(i)) continue
    const idx = ing.findIndex(x => x.nome === i.nome)
    const absMin = Math.max(0, Math.round(i.g_per_kg * 0.5))
    const absMax = Math.round(i.g_per_kg * 1.5)
    out[i.nome] = fasciaCorretta(idx, ing, cat, absMin, absMax)
  }
  return out
})

const metricheGrid = computed(() => [
  { label: 'ZUCCHERI',     value: bilancio.value.zuccheri,    unita: '%', stato: stati.value.zuccheri },
  { label: 'GRASSI',       value: bilancio.value.grassi,      unita: '%', stato: stati.value.grassi },
  { label: 'SLNG',         value: bilancio.value.slng,        unita: '%', stato: stati.value.slng },
  { label: 'ALTRI SOLIDI', value: bilancio.value.altriSolidi, unita: '%', stato: stati.value.altriSolidi },
])

const metricheRiga = computed(() => [
  { label: 'SOLIDI TOTALI', value: bilancio.value.solidiTotali, unita: '%', stato: stati.value.solidiTotali },
  { label: 'POD',           value: bilancio.value.pod,          unita: '',  stato: stati.value.pod },
  { label: 'PAC',           value: bilancio.value.pac,          unita: '',  stato: stati.value.pac },
])
</script>

<template>
  <PageShell width="page" class="min-h-screen bg-perla pb-16">

    <div v-if="caricamento" class="flex items-center justify-center min-h-[60vh]">
      <p class="text-body text-notte/50">Caricamento…</p>
    </div>

    <div v-else-if="ricetta">

      <!-- Back -->
      <button
        @click="router.back()"
        class="inline-flex items-center gap-2 text-notte/50 hover:text-notte transition-colors mb-8 text-body-small focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-notte rounded"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Profilo
      </button>

      <!-- Header -->
      <div class="mb-8">
        <BadgeCategoria :categoria="ricetta.categoria" class="mb-3" />
        <h1 class="text-h1 text-notte mb-1">{{ ricetta.nome }}</h1>
        <p class="text-body-small text-notte/50">{{ ricetta.quantitaKg }} kg</p>
      </div>

      <!-- 2-col: ingredienti + bilanciamento -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        <!-- Ingredienti -->
        <div class="border border-notte/15 rounded-2xl p-6">
          <h2 class="text-h2 text-notte mb-5">Ingredienti</h2>

          <div class="divide-y divide-notte/8 mb-6">
            <div
              v-for="ing in bilancio.ingredientiScalati"
              :key="ing.nome"
              class="flex items-baseline justify-between py-3"
            >
              <span class="text-body text-notte">{{ ing.nome }}</span>
              <span class="text-data text-notte tabular-nums shrink-0 ml-4" style="font-variant-numeric: tabular-nums;">
                {{ ing.g_assoluti }}<span class="text-body-small text-notte/50 ml-0.5">g</span>
              </span>
            </div>
          </div>

          <!-- Slider per ingredienti modificabili -->
          <div class="border-t border-notte/10 pt-5 space-y-5">
            <p class="text-ui-label text-notte/40">REGOLA PROPORZIONI</p>
            <template v-for="ing in ingredienti" :key="ing.nome">
              <SliderIngrediente
                v-if="isModificabile(ing)"
                :label="ing.nome"
                :min="Math.round(Math.max(0, ing.g_per_kg * 0.5) * factor)"
                :max="Math.round(ing.g_per_kg * 1.5 * factor)"
                :model-value="sliderVal(ing.nome)"
                :fascia-lo="fasceCorrette[ing.nome] ? Math.round(fasceCorrette[ing.nome].lo * factor) : null"
                :fascia-hi="fasceCorrette[ing.nome] ? Math.round(fasceCorrette[ing.nome].hi * factor) : null"
                @update:model-value="onSlider(ing.nome, $event)"
              />
            </template>
          </div>
        </div>

        <!-- Bilanciamento -->
        <PannelloBilanciamento
          :warnings="warnings"
          :metriche-grid="metricheGrid"
          :metriche-riga="metricheRiga"
        />
      </div>

      <!-- Procedimento -->
      <Procedimento
        :procedimento="ricetta.procedimento"
        :nota-tecnica="ricetta.notaTecnica"
      />

    </div>

    <div v-else class="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <p class="text-body text-notte/50">Ricetta non trovata.</p>
      <RouterLink
        to="/profilo"
        class="text-body-small text-notte underline hover:opacity-70 transition-opacity"
      >Torna al profilo</RouterLink>
    </div>

  </PageShell>
</template>
