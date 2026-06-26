<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRicetteStore } from '../stores/ricette.js'
import { useUserStore } from '../stores/user.js'
import { useCalcolatore, fasciaCorretta } from '../composables/useCalcolatore.js'
import { risolviIngredienti } from '../utils/calculator.js'
import ingredientiData from '../data/ingredienti.json'
import BadgeCategoria from '../components/BadgeCategoria.vue'
import LikeButton from '../components/LikeButton.vue'
import InputNumerico from '../components/InputNumerico.vue'
import SliderIngrediente from '../components/SliderIngrediente.vue'

const route = useRoute()
const router = useRouter()
const ricetteStore = useRicetteStore()
const userStore = useUserStore()

const ricetta = computed(() => ricetteStore.getRicettaById(route.params.id))
const quantitaKg = ref(1)

// Slider overrides: { [nomeIngrediente]: g_per_kg }
const overrides = ref({})
watch(() => ricetta.value?.id, () => { overrides.value = {} })

const baseIngredienti = computed(() =>
  ricetta.value ? risolviIngredienti(ricetta.value, ingredientiData) : []
)
const ingredientiModificabili = computed(() => ricetta.value?.ingredientiModificabili ?? [])

// Scale non-overridden ingredients proportionally to keep total stable
const ingredientiEffettivi = computed(() => {
  const base = baseIngredienti.value
  if (!base.length) return []
  const ovr = overrides.value
  const overridedNomi = new Set(Object.keys(ovr))
  if (!overridedNomi.size) return base

  const origTot = base.reduce((s, i) => s + i.g_per_kg, 0)
  const newOverridedSum = Object.values(ovr).reduce((s, v) => s + v, 0)
  const origRestSum = base.filter(i => !overridedNomi.has(i.nome)).reduce((s, i) => s + i.g_per_kg, 0)
  const remaining = Math.max(0, origTot - newOverridedSum)
  const scale = origRestSum > 0 ? remaining / origRestSum : 0

  return base.map(i => {
    if (overridedNomi.has(i.nome)) return { ...i, g_per_kg: ovr[i.nome] }
    return { ...i, g_per_kg: Math.round(i.g_per_kg * scale) }
  })
})

function sliderVal(nome) {
  const gPerKg = overrides.value[nome] ?? (baseIngredienti.value.find(i => i.nome === nome)?.g_per_kg ?? 0)
  return Math.round(gPerKg * factor.value)
}
function onSlider(nome, val) {
  overrides.value = { ...overrides.value, [nome]: val / factor.value }
}

const factor = computed(() => {
  const tot = ingredientiEffettivi.value.reduce((s, i) => s + i.g_per_kg, 0) || 1000
  return (quantitaKg.value * 1000) / tot
})

const categoriaRicetta = computed(() => ricetta.value?.categoria)
const { bilancio, warnings, stati } = useCalcolatore(ingredientiEffettivi, quantitaKg, categoriaRicetta)

// Per ogni ingrediente modificabile: fascia "ok" dentro il range assoluto
const fasceCorrette = computed(() => {
  const ing = ingredientiEffettivi.value
  const cat = categoriaRicetta.value
  const out = {}
  for (const mod of ingredientiModificabili.value) {
    const idx = ing.findIndex(i => i.nome === mod.nome)
    out[mod.nome] = idx === -1 ? null : fasciaCorretta(idx, ing, cat, mod.min, mod.max, ricetta.value?.eccezioniSoglie ?? [])
  }
  return out
})

// Status dot color class
function statoColor(stato) {
  if (stato === 'sballato')   return '#c84b4b'  // ciliegia
  if (stato === 'attenzione') return '#e8954a'  // mandarino
  return '#5f7a4e'                               // pistacchio
}

// Metrics for the 2×2 grid
const metricheGrid = computed(() => [
  { label: 'ZUCCHERI',     value: bilancio.value.zuccheri,    unita: '%', stato: stati.value.zuccheri },
  { label: 'GRASSI',       value: bilancio.value.grassi,      unita: '%', stato: stati.value.grassi },
  { label: 'SLNG',         value: bilancio.value.slng,        unita: '%', stato: stati.value.slng },
  { label: 'ALTRI SOLIDI', value: bilancio.value.altriSolidi, unita: '%', stato: null },
])

// Metrics for the summary row
const metricheRiga = computed(() => [
  { label: 'SOLIDI TOTALI', value: bilancio.value.solidiTotali, unita: '%', stato: stati.value.solidiTotali },
  { label: 'POD',           value: bilancio.value.pod,          unita: '',  stato: stati.value.pod },
  { label: 'PAC',           value: bilancio.value.pac,          unita: '',  stato: stati.value.pac },
])
</script>

<template>
  <section class="min-h-screen bg-crema px-6 pt-24 pb-16" style="font-family: Inter, sans-serif;">

    <div v-if="ricetta" class="max-w-4xl mx-auto">

      <!-- Back -->
      <button
        @click="router.back()"
        class="inline-flex items-center gap-2 text-inchiostro/50 hover:text-inchiostro transition-colors mb-8 text-body-small focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inchiostro rounded"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Tutti i gusti
      </button>

      <!-- Header -->
      <div class="flex items-start gap-4 mb-8">
        <div class="flex-1">
          <BadgeCategoria :categoria="ricetta.categoria" class="mb-3" />
          <h1 class="text-h1 text-inchiostro mb-2">{{ ricetta.nome }}</h1>
          <p class="text-body text-inchiostro/60">{{ ricetta.payoff }}</p>
        </div>
        <LikeButton :ricetta-id="ricetta.id" @require-login="userStore.openAuthModal()" />
      </div>

      <!-- Quantità -->
      <div class="border border-inchiostro/15 rounded-2xl p-6 mb-6">
        <div class="flex items-end gap-6 flex-wrap">
          <div class="w-44">
            <InputNumerico
              v-model="quantitaKg"
              label="Peso miscela"
              unita="kg"
              :min="0.1"
              :max="50"
              :step="0.1"
            />
          </div>
          <p class="text-body-small text-inchiostro/50 pb-2.5">
            Ricalcola le quantità per la tua produzione.
          </p>
        </div>
      </div>

      <!-- 2-col: ingredienti + bilanciamento -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        <!-- Ingredienti -->
        <div class="border border-inchiostro/15 rounded-2xl p-6">
          <h2 class="text-h2 text-inchiostro mb-5">Ingredienti</h2>

          <div class="divide-y divide-inchiostro/8 mb-6">
            <div
              v-for="ing in bilancio.ingredientiScalati"
              :key="ing.nome"
              class="flex items-baseline justify-between py-3"
            >
              <span class="text-body text-inchiostro">{{ ing.nome }}</span>
              <span class="text-data text-inchiostro tabular-nums shrink-0 ml-4" style="font-variant-numeric: tabular-nums;">
                {{ ing.g_assoluti }}<span class="text-body-small text-inchiostro/50 ml-0.5">g</span>
              </span>
            </div>
          </div>

          <!-- Sliders per ingredienti modificabili -->
          <template v-if="ingredientiModificabili.length">
            <div class="border-t border-inchiostro/10 pt-5 space-y-5">
              <p class="text-ui-label text-inchiostro/40">REGOLA PROPORZIONI</p>
              <SliderIngrediente
                v-for="mod in ingredientiModificabili"
                :key="mod.nome"
                :label="mod.nome"
                :min="Math.round(mod.min * factor)"
                :max="Math.round(mod.max * factor)"
                :model-value="sliderVal(mod.nome)"
                :fascia-lo="fasceCorrette[mod.nome] ? Math.round(fasceCorrette[mod.nome].lo * factor) : null"
                :fascia-hi="fasceCorrette[mod.nome] ? Math.round(fasceCorrette[mod.nome].hi * factor) : null"
                @update:model-value="onSlider(mod.nome, $event)"
              />
            </div>
          </template>
        </div>

        <!-- Bilanciamento -->
        <div class="border border-inchiostro/15 rounded-2xl p-6">
          <h2 class="text-h2 text-inchiostro mb-5">Bilanciamento</h2>

          <!-- Warnings -->
          <div v-if="warnings.length" class="mb-5 space-y-2">
            <div
              v-for="w in warnings"
              :key="w.campo"
              class="flex items-start gap-2 text-body-small text-inchiostro/80 bg-mandarino/15 rounded-xl px-3 py-2.5"
              role="alert"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" class="mt-0.5 shrink-0" aria-hidden="true">
                <path d="M7 1.5L12.5 11H1.5L7 1.5Z" stroke="#E8954A" stroke-width="1.4" stroke-linejoin="round"/>
                <path d="M7 5.5v2.5" stroke="#E8954A" stroke-width="1.4" stroke-linecap="round"/>
                <circle cx="7" cy="9.5" r="0.65" fill="#E8954A"/>
              </svg>
              {{ w.msg }}
            </div>
          </div>

          <!-- 2×2 grid metrics con stato -->
          <div class="grid grid-cols-2 gap-4 mb-5">
            <div v-for="m in metricheGrid" :key="m.label" class="relative">
              <div class="flex items-center gap-1.5 mb-1">
                <span
                  v-if="m.stato"
                  class="inline-block w-2 h-2 rounded-full shrink-0"
                  :style="{ background: statoColor(m.stato) }"
                  :aria-label="m.stato"
                ></span>
                <p class="text-ui-label text-inchiostro/50">{{ m.label }}</p>
              </div>
              <p class="text-data-large text-inchiostro" style="font-variant-numeric: tabular-nums;">
                {{ m.value }}<span class="text-h3 text-inchiostro/50">{{ m.unita }}</span>
              </p>
            </div>
          </div>

          <!-- Summary row -->
          <div class="border-t border-inchiostro/10 pt-4 space-y-3">
            <div
              v-for="m in metricheRiga"
              :key="m.label"
              class="flex justify-between items-center"
            >
              <div class="flex items-center gap-1.5">
                <span
                  v-if="m.stato"
                  class="inline-block w-2 h-2 rounded-full shrink-0"
                  :style="{ background: statoColor(m.stato) }"
                  :aria-label="m.stato"
                ></span>
                <span class="text-ui-label text-inchiostro/50">{{ m.label }}</span>
              </div>
              <span class="text-data text-inchiostro font-semibold" style="font-variant-numeric: tabular-nums;">
                {{ m.value }}{{ m.unita }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Procedimento + nota tecnica -->
      <div class="border border-inchiostro/15 rounded-2xl p-6 lg:p-8">

        <!-- Nota tecnica -->
        <p
          v-if="ricetta.notaTecnica"
          class="text-body-small text-inchiostro/55 italic mb-6 leading-relaxed"
          style="font-family: Inter, sans-serif;"
        >
          {{ ricetta.notaTecnica }}
        </p>

        <h2 class="text-h2 text-inchiostro mb-5">Procedimento</h2>

        <ol class="space-y-4" v-if="ricetta.procedimento?.length">
          <li
            v-for="(step, i) in ricetta.procedimento"
            :key="i"
            class="flex gap-4"
          >
            <span
              class="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-crema text-ui-label"
              style="background: #3a2317; font-size: 11px; font-weight: 600; margin-top: 1px;"
            >{{ i + 1 }}</span>
            <p class="text-body text-inchiostro/80 leading-relaxed">{{ step }}</p>
          </li>
        </ol>
      </div>

    </div>

    <div v-else class="flex items-center justify-center min-h-[60vh]">
      <p class="text-body text-inchiostro/50">Gusto non trovato.</p>
    </div>
  </section>
</template>
