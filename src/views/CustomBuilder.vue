<script setup>
import { ref, computed, watch } from 'vue'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import { useCalcolatore, fasciaCorretta } from '../composables/useCalcolatore.js'
import { useUserStore } from '../stores/user.js'
import InputNumerico from '../components/InputNumerico.vue'
import SliderIngrediente from '../components/SliderIngrediente.vue'
import PannelloBilanciamento from '../components/PannelloBilanciamento.vue'
import Procedimento from '../components/Procedimento.vue'
import PageShell from '../components/PageShell.vue'

const userStore = useUserStore()

const descrizione   = ref('')
const quantitaKg    = ref(1)
const ingredienti   = ref([])
const categoria     = ref('crema')
const procedimento  = ref([])
const notaTecnica   = ref(null)
const nomeGenerato  = ref('')   // descrizione snapshot al momento della generazione
const generando     = ref(false)

function isModificabile(ing) {
  return ing.modificabile === true  // default false se campo assente (retrocompatibilità)
}

// Slider overrides: { [nomeIngrediente]: g_per_kg }
const overrides = ref({})

// Quando cambia la descrizione, nascondi l'editor
watch(descrizione, () => {
  if (nomeGenerato.value) {
    nomeGenerato.value = ''
    ingredienti.value  = []
    overrides.value    = {}
    procedimento.value = []
    notaTecnica.value  = null
  }
})

const mostraEditor = computed(() => nomeGenerato.value.length > 0 && ingredienti.value.length > 0)

const titolo = computed(() => {
  if (!nomeGenerato.value) return ''
  return nomeGenerato.value.charAt(0).toUpperCase() + nomeGenerato.value.slice(1)
})

// ── Calcolatore ──────────────────────────────────────────────────────────────

const { bilancio, warnings, stati } = useCalcolatore(ingredienti, quantitaKg, categoria)

const factor = computed(() => {
  const tot = ingredienti.value.reduce((s, i) => s + i.g_per_kg, 0) || 1000
  return (quantitaKg.value * 1000) / tot
})

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

// fasciaCorretta per ogni ingrediente modificabile
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

// Metriche per PannelloBilanciamento
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

// ── Generazione AI ───────────────────────────────────────────────────────────

async function generaConAI() {
  const testo = descrizione.value.trim()
  if (!testo) {
    toast.warn('Descrivi il gusto che vuoi creare', { autoClose: 3000 })
    return
  }

  generando.value = true

  try {
    const res  = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/generate-recipe`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ descrizione: testo }),
    })
    const json = await res.json()
    if (!res.ok || !json.ok) {
      toast.error(json.messaggio ?? 'Errore nella generazione della ricetta', { autoClose: 6000 })
      return
    }
    ingredienti.value  = json.ricetta
    categoria.value    = json.categoria ?? 'crema'
    procedimento.value = json.procedimento ?? []
    notaTecnica.value  = json.notaTecnica ?? null
    overrides.value    = {}
    nomeGenerato.value = testo
  } catch {
    toast.error('Errore di rete. Controlla la connessione e riprova.', { autoClose: 5000 })
  } finally {
    generando.value = false
  }
}
</script>

<template>
  <PageShell width="page" class="min-h-screen bg-perla pb-16">

      <!-- Header + form -->
      <h1 class="text-h1 text-notte mb-2">Crea il tuo gusto</h1>
      <p class="text-body text-notte/60 mb-10">
        Descrivi il gusto che vuoi creare — genera una base di partenza da modificare.
      </p>

      <div class="max-w-xl mb-10">
        <label for="ai-prompt" class="text-ui-label text-notte/50 mb-2 block">DESCRIVI IL GUSTO</label>
        <div class="relative mb-4">
          <textarea
            id="ai-prompt"
            v-model="descrizione"
            rows="3"
            placeholder="es. gelato al Kinder Bueno, oppure: pistacchio e cioccolato bianco"
            class="w-full border border-notte/20 rounded-xl px-4 py-3 text-body text-notte bg-perla resize-none focus:outline-none focus:border-notte transition-colors placeholder:text-notte/30"
          />
          <span
            class="absolute top-3 right-3 text-ui-label px-2 py-0.5 rounded-full select-none"
            style="background: rgba(127,182,158,0.12); color: #7FB69E;"
          >AI</span>
        </div>

        <div class="mb-6 w-44">
          <InputNumerico
            v-model="quantitaKg"
            label="Peso miscela"
            unita="kg"
            :min="0.1"
            :max="50"
            :step="0.1"
          />
        </div>

        <button
          @click="generaConAI"
          :disabled="generando"
          class="bg-notte text-perla rounded-xl px-6 py-3 text-body font-medium hover:opacity-80 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-notte disabled:opacity-50"
        >{{ generando ? 'Generazione…' : 'Genera con AI' }}</button>
      </div>

      <!-- Editor: appare solo dopo generazione riuscita -->
      <div v-if="mostraEditor">

        <h2 class="text-h1 text-notte mb-8">{{ titolo }}</h2>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          <!-- Ingredienti -->
          <div class="border border-notte/15 rounded-2xl p-6">
            <h2 class="text-h2 text-notte mb-5">Ingredienti</h2>

            <!-- Lista con grammi scalati per quantitaKg -->
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
          :procedimento="procedimento"
          :nota-tecnica="notaTecnica"
        />

        <!-- Salva -->
        <div class="flex items-center gap-4 mt-6">
          <button
            @click="userStore.isLoggedIn ? undefined : userStore.openAuthModal()"
            class="bg-notte text-perla rounded-xl px-6 py-3 text-body font-medium hover:opacity-80 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-notte"
            :aria-label="userStore.isLoggedIn ? 'Salva ricetta' : 'Accedi per salvare la ricetta'"
          >Salva ricetta</button>
          <span v-if="!userStore.isLoggedIn" class="text-body-small text-notte/40">
            Richiede accesso
          </span>
        </div>

      </div>
  </PageShell>
</template>
