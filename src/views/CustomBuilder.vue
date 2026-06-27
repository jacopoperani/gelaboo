<script setup>
import { ref, watch } from 'vue'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import { useCalcolatore } from '../composables/useCalcolatore.js'
import { useUserStore } from '../stores/user.js'
import { classificaIngrediente } from '../utils/classifyIngredient.js'
import InputNumerico from '../components/InputNumerico.vue'

const userStore = useUserStore()

const fase = ref(1)
const descrizione = ref('')
const quantitaKg = ref(1)
const ingredienti = ref([])
const categoria = ref('crema')

const { bilancio, warnings } = useCalcolatore(ingredienti, quantitaKg, categoria)

// Valori nutrizionali per 100g — da gelato-reference.md §6
const DB = {
  'latte intero': { zuccheri: 0, grassi: 3.5, slng: 9, altri: 0, pod: 0, pac: 0 },
  'latte parzialmente scremato': { zuccheri: 0, grassi: 1.8, slng: 9, altri: 0, pod: 0, pac: 0 },
  'latte scremato': { zuccheri: 0, grassi: 0, slng: 9, altri: 0, pod: 0, pac: 0 },
  'panna 35%': { zuccheri: 0, grassi: 35, slng: 6, altri: 0, pod: 0, pac: 0 },
  'panna 30%': { zuccheri: 0, grassi: 30, slng: 6, altri: 0, pod: 0, pac: 0 },
  'panna 25%': { zuccheri: 0, grassi: 25, slng: 7, altri: 0, pod: 0, pac: 0 },
  'panna 40%': { zuccheri: 0, grassi: 40, slng: 5, altri: 0, pod: 0, pac: 0 },
  'latte polvere scremato': { zuccheri: 0, grassi: 1, slng: 96, altri: 0, pod: 0, pac: 0 },
  'latte polvere intero': { zuccheri: 0, grassi: 26, slng: 72, altri: 0, pod: 0, pac: 0 },
  'burro': { zuccheri: 0, grassi: 84, slng: 0, altri: 0, pod: 0, pac: 0 },
  "tuorlo d'uovo": { zuccheri: 0, grassi: 27, slng: 0, altri: 15, pod: 0, pac: 0 },
  'uovo intero': { zuccheri: 0, grassi: 10, slng: 0, altri: 15, pod: 0, pac: 0 },
  'saccarosio': { zuccheri: 100, grassi: 0, slng: 0, altri: 0, pod: 100, pac: 100 },
  'zucchero': { zuccheri: 100, grassi: 0, slng: 0, altri: 0, pod: 100, pac: 100 },
  'destrosio': { zuccheri: 92, grassi: 0, slng: 0, altri: 0, pod: 72, pac: 180 },
  'sciroppo di glucosio 42de': { zuccheri: 80, grassi: 0, slng: 0, altri: 0, pod: 45, pac: 85 },
  'sciroppo di glucosio': { zuccheri: 80, grassi: 0, slng: 0, altri: 0, pod: 45, pac: 85 },
  'zucchero invertito': { zuccheri: 70, grassi: 0, slng: 0, altri: 0, pod: 130, pac: 190 },
  'miele': { zuccheri: 80, grassi: 0, slng: 0, altri: 0, pod: 140, pac: 170 },
  'fruttosio': { zuccheri: 100, grassi: 0, slng: 0, altri: 0, pod: 170, pac: 190 },
  'acqua': { zuccheri: 0, grassi: 0, slng: 0, altri: 0, pod: 0, pac: 0 },
  'stabilizzante': { zuccheri: 0, grassi: 0, slng: 0, altri: 100, pod: 0, pac: 0 },
  'stabilizzante (freddo)': { zuccheri: 0, grassi: 0, slng: 0, altri: 100, pod: 0, pac: 0 },
  'cacao amaro': { zuccheri: 0, grassi: 22, slng: 0, altri: 73, pod: 0, pac: 0 },
  'cacao in pasta': { zuccheri: 0, grassi: 55, slng: 0, altri: 44, pod: 0, pac: 0 },
  'pasta di nocciola': { zuccheri: 0, grassi: 60, slng: 0, altri: 35, pod: 0, pac: 0 },
  'pasta di nocciola pura': { zuccheri: 0, grassi: 60, slng: 0, altri: 35, pod: 0, pac: 0 },
  'pasta di pistacchio': { zuccheri: 0, grassi: 55, slng: 0, altri: 45, pod: 0, pac: 0 },
  'pasta di pistacchio pura': { zuccheri: 0, grassi: 55, slng: 0, altri: 45, pod: 0, pac: 0 },
  'pasta di mandorla': { zuccheri: 0, grassi: 52, slng: 0, altri: 42, pod: 0, pac: 0 },
  'fragole': { zuccheri: 9, grassi: 0, slng: 0, altri: 2, pod: 90, pac: 130 },
  'fragole fresche': { zuccheri: 9, grassi: 0, slng: 0, altri: 2, pod: 90, pac: 130 },
  'succo di limone': { zuccheri: 9, grassi: 0, slng: 0, altri: 2, pod: 90, pac: 130 },
  'latte di cocco': { zuccheri: 3, grassi: 21, slng: 0, altri: 3, pod: 30, pac: 30 },
  'latte di cocco intero': { zuccheri: 3, grassi: 21, slng: 0, altri: 3, pod: 30, pac: 30 },
  'inulina': { zuccheri: 10, grassi: 0, slng: 0, altri: 85, pod: 10, pac: 25 },
  'maltodestrine': { zuccheri: 0, grassi: 0, slng: 0, altri: 95, pod: 10, pac: 30 },
}

const dbNomi = Object.keys(DB).map(k => k.charAt(0).toUpperCase() + k.slice(1))

function lookup(nome) {
  return DB[nome.toLowerCase().trim()] ?? { zuccheri: 0, grassi: 0, slng: 0, altri: 0, pod: 0, pac: 0 }
}

const BASI = {
  crema: [
    { nome: 'Latte intero', g_per_kg: 600 },
    { nome: 'Panna 35%', g_per_kg: 150 },
    { nome: 'Saccarosio', g_per_kg: 160 },
    { nome: 'Latte polvere scremato', g_per_kg: 50 },
    { nome: 'Sciroppo di glucosio 42DE', g_per_kg: 30 },
    { nome: 'Stabilizzante', g_per_kg: 8 },
  ],
  frutta: [
    { nome: 'Fragole fresche', g_per_kg: 450 },
    { nome: 'Acqua', g_per_kg: 200 },
    { nome: 'Saccarosio', g_per_kg: 200 },
    { nome: 'Destrosio', g_per_kg: 80 },
    { nome: 'Sciroppo di glucosio 42DE', g_per_kg: 60 },
    { nome: 'Stabilizzante (freddo)', g_per_kg: 5 },
  ],
  sorbetto: [
    { nome: 'Succo di limone', g_per_kg: 300 },
    { nome: 'Acqua', g_per_kg: 350 },
    { nome: 'Saccarosio', g_per_kg: 220 },
    { nome: 'Destrosio', g_per_kg: 80 },
    { nome: 'Zucchero invertito', g_per_kg: 40 },
    { nome: 'Stabilizzante (freddo)', g_per_kg: 5 },
  ],
  vegano: [
    { nome: 'Latte di cocco intero', g_per_kg: 550 },
    { nome: 'Acqua', g_per_kg: 100 },
    { nome: 'Saccarosio', g_per_kg: 180 },
    { nome: 'Destrosio', g_per_kg: 60 },
    { nome: 'Sciroppo di glucosio 42DE', g_per_kg: 80 },
    { nome: 'Inulina', g_per_kg: 25 },
    { nome: 'Stabilizzante (freddo)', g_per_kg: 5 },
  ],
}

function buildFromBase(key) {
  ingredienti.value = BASI[key].map(b => ({ nome: b.nome, g_per_kg: b.g_per_kg, ...lookup(b.nome) }))
  categoria.value = key
  fase.value = 2
}

const generando = ref(false)
const rispostaAI = ref(null)

watch(descrizione, () => { rispostaAI.value = null })

async function generaConAI() {
  const testo = descrizione.value.trim()
  if (!testo) {
    toast.warn('Descrivi il gusto che vuoi creare', { autoClose: 3000 })
    return
  }

  generando.value = true
  rispostaAI.value = null

  try {
    const res = await fetch('/api/generate-recipe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ descrizione: testo }),
    })
    const json = await res.json()
    if (!res.ok || !json.ok) {
      toast.error(json.messaggio ?? 'Errore nella generazione della ricetta', { autoClose: 6000 })
    } else {
      rispostaAI.value = json
    }
  } catch {
    toast.error('Errore di rete. Controlla la connessione e riprova.', { autoClose: 5000 })
  } finally {
    generando.value = false
  }
}

function usaRispostaAI() {
  if (!rispostaAI.value) return
  ingredienti.value = rispostaAI.value.ricetta
  categoria.value = rispostaAI.value.categoria ?? 'crema'
  fase.value = 2
}

function iniziaDaZero() { ingredienti.value = []; categoria.value = 'crema'; fase.value = 2 }

function addIngrediente() {
  ingredienti.value.push({ nome: '', g_per_kg: 0, zuccheri: 0, grassi: 0, slng: 0, altri: 0, pod: 0, pac: 0 })
}

function rimuovi(i) { ingredienti.value.splice(i, 1) }

const classificando = ref(new Set())

async function onNomeChange(i, nome) {
  const trovatoLocale = DB[nome.toLowerCase().trim()]
  if (trovatoLocale) {
    ingredienti.value[i] = { ...ingredienti.value[i], nome, ...trovatoLocale }
    return
  }

  // Non trovato in DB locale → classifica via AI
  classificando.value = new Set([...classificando.value, i])
  ingredienti.value[i] = { ...ingredienti.value[i], nome }

  const risultato = await classificaIngrediente(nome)

  classificando.value = new Set([...classificando.value].filter(x => x !== i))

  if (risultato.ok) {
    const { dati } = risultato
    ingredienti.value[i] = { ...ingredienti.value[i], ...dati }
    if (dati.nota?.includes('fuori range')) {
      toast.warn(`"${nome}": stima AI con valori atipici — verifica manualmente`, { autoClose: 5000 })
    } else {
      toast.info(`"${nome}": valori stimati dall'AI`, { autoClose: 3000 })
    }
  } else {
    toast.error(`"${nome}": ${risultato.messaggio} — inserisci i valori manualmente`, { autoClose: 6000 })
    // Lascia l'ingrediente con zeri espliciti — mai silenzioso
    ingredienti.value[i] = {
      ...ingredienti.value[i],
      zuccheri: 0, grassi: 0, slng: 0, altri: 0, pod: 0, pac: 0,
      _aiError: true,
    }
  }
}

function onGrammiChange(i, val) {
  const g = Math.max(0, parseFloat(val) || 0)
  ingredienti.value[i] = { ...ingredienti.value[i], g_per_kg: g }
}
</script>

<template>
  <section class="min-h-screen bg-crema px-6 pt-24 pb-16" style="font-family: Inter, sans-serif;">
    <div class="max-w-5xl mx-auto">

      <!-- FASE 1 -->
      <div v-if="fase === 1">
        <h1 class="text-h1 text-inchiostro mb-2">Crea il tuo gusto</h1>
        <p class="text-body text-inchiostro/60 mb-10">
          Descrivi il gusto che vuoi creare — genera una base di partenza da modificare.
        </p>

        <div class="max-w-xl">
          <label for="ai-prompt" class="text-ui-label text-inchiostro/50 mb-2 block">DESCRIVI IL GUSTO</label>
          <div class="relative mb-4">
            <textarea
              id="ai-prompt"
              v-model="descrizione"
              rows="3"
              placeholder="Es. gelato al Kinder Bueno, oppure: pistacchio e cioccolato bianco"
              class="w-full border border-inchiostro/20 rounded-xl px-4 py-3 text-body text-inchiostro bg-crema resize-none focus:outline-none focus:border-inchiostro transition-colors placeholder:text-inchiostro/30"
            />
            <span
              class="absolute top-3 right-3 text-ui-label px-2 py-0.5 rounded-full select-none"
              style="background: rgba(127,182,158,0.12); color: #7FB69E;"
            >AI</span>
          </div>
          <p class="text-body-small text-inchiostro/40 mb-6">L'AI sceglie gli ingredienti e propone le grammature di partenza.</p>

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

          <div class="flex items-center gap-4 flex-wrap">
            <button
              @click="generaConAI"
              :disabled="generando"
              class="bg-inchiostro text-crema rounded-xl px-6 py-3 text-body font-medium hover:opacity-80 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inchiostro disabled:opacity-50"
            >{{ generando ? 'Generazione…' : 'Genera con AI' }}</button>
            <button
              @click="iniziaDaZero"
              class="text-body text-inchiostro/50 hover:text-inchiostro transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inchiostro rounded"
            >oppure inizia da zero →</button>
          </div>

          <div class="mt-10">
            <p class="text-ui-label text-inchiostro/40 mb-3">PARTI DA UNA BASE</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="[key, label] in [['crema','Base crema'],['frutta','Base frutta'],['sorbetto','Sorbetto'],['vegano','Base vegana']]"
                :key="key"
                @click="buildFromBase(key)"
                class="px-4 py-2 border border-inchiostro/20 rounded-xl text-body-small text-inchiostro hover:border-inchiostro/50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inchiostro"
              >{{ label }}</button>

              <!-- Quinta card: risultato AI -->
              <button
                v-if="rispostaAI"
                @click="usaRispostaAI"
                class="px-4 py-2 border rounded-xl text-body-small transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style="border-color: #7FB69E; color: #7FB69E; background: rgba(127,182,158,0.06);"
              >
                <span class="mr-1.5 text-ui-label" style="color: #7FB69E;">AI</span>
                {{ rispostaAI.ricetta.slice(0, 2).map(i => i.nome).join(', ') }}{{ rispostaAI.ricetta.length > 2 ? ` +${rispostaAI.ricetta.length - 2}` : '' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- FASE 2 -->
      <div v-else>
        <div class="flex items-center gap-4 mb-8 flex-wrap">
          <button
            @click="fase = 1"
            class="inline-flex items-center gap-2 text-inchiostro/50 hover:text-inchiostro transition-colors text-body-small focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inchiostro rounded"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Ricomincia
          </button>
          <h1 class="text-h1 text-inchiostro flex-1">Gusto personalizzato</h1>
          <div class="w-36 shrink-0">
            <InputNumerico
              v-model="quantitaKg"
              unita="kg"
              label="Peso"
              :min="0.1"
              :max="50"
              :step="0.1"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Ingredienti editabili -->
          <div class="border border-inchiostro/15 rounded-2xl p-6">
            <h2 class="text-h2 text-inchiostro mb-5">Ingredienti</h2>

            <datalist id="ing-db">
              <option v-for="n in dbNomi" :key="n" :value="n" />
            </datalist>

            <div class="space-y-2 mb-4" role="list" aria-label="Lista ingredienti">
              <div
                v-for="(ing, i) in ingredienti"
                :key="i"
                class="flex items-center gap-2"
                role="listitem"
              >
                <div class="flex-1 min-w-0 relative">
                  <input
                    type="text"
                    :value="ing.nome"
                    @change="onNomeChange(i, $event.target.value)"
                    list="ing-db"
                    placeholder="Nome ingrediente"
                    :disabled="classificando.has(i)"
                    class="w-full border border-inchiostro/20 rounded-xl px-3 py-2.5 text-body-small text-inchiostro bg-crema focus:outline-none focus:border-inchiostro transition-colors placeholder:text-inchiostro/30 disabled:opacity-50"
                    :class="ing._aiError ? 'border-mandarino/60' : ''"
                    :aria-label="`Nome ingrediente ${i + 1}`"
                  />
                  <span
                    v-if="classificando.has(i)"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-inchiostro/40"
                    style="font-size: 10px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase;"
                    aria-live="polite"
                  >AI…</span>
                </div>
                <div class="w-28 shrink-0 flex items-center border border-inchiostro/20 rounded-xl overflow-hidden focus-within:border-inchiostro transition-colors bg-crema">
                  <input
                    type="number"
                    :value="ing.g_per_kg"
                    @change="onGrammiChange(i, $event.target.value)"
                    min="0"
                    step="1"
                    class="flex-1 min-w-0 bg-transparent px-2 py-2.5 text-inchiostro outline-none text-body-small"
                    style="font-variant-numeric: tabular-nums;"
                    :aria-label="`Grammi per kg di ${ing.nome || 'ingrediente'}`"
                  />
                  <span class="px-2 text-inchiostro/50 border-l border-inchiostro/10 select-none shrink-0" style="font-size: 11px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase;">g/kg</span>
                </div>
                <button
                  @click="rimuovi(i)"
                  class="w-8 h-8 shrink-0 flex items-center justify-center text-inchiostro/30 hover:text-ciliegia transition-colors rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ciliegia"
                  :aria-label="`Rimuovi ${ing.nome || 'ingrediente'}`"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>
            </div>

            <button
              @click="addIngrediente"
              class="inline-flex items-center gap-2 text-body-small text-inchiostro/50 hover:text-inchiostro transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inchiostro rounded"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M7 2v10M2 7h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              Aggiungi ingrediente
            </button>
          </div>

          <!-- Bilanciamento -->
          <div class="border border-inchiostro/15 rounded-2xl p-6">
            <h2 class="text-h2 text-inchiostro mb-5">Bilanciamento</h2>

            <div v-if="ingredienti.length === 0" class="text-body text-inchiostro/40 py-4">
              Aggiungi ingredienti per vedere il bilanciamento.
            </div>

            <template v-else>
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

              <div class="grid grid-cols-2 gap-4 mb-5">
                <div v-for="item in [
                  { label: 'ZUCCHERI', value: bilancio.zuccheri },
                  { label: 'GRASSI',   value: bilancio.grassi },
                  { label: 'SLNG',     value: bilancio.slng },
                  { label: 'ALTRI SOLIDI', value: bilancio.altriSolidi },
                ]" :key="item.label">
                  <p class="text-ui-label text-inchiostro/50 mb-1">{{ item.label }}</p>
                  <p class="text-data-large text-inchiostro" style="font-variant-numeric: tabular-nums;">
                    {{ item.value }}<span class="text-h3 text-inchiostro/50">%</span>
                  </p>
                </div>
              </div>

              <div class="border-t border-inchiostro/10 pt-4 space-y-3 mb-5">
                <div class="flex justify-between items-center">
                  <span class="text-ui-label text-inchiostro/50">SOLIDI TOTALI</span>
                  <span class="text-data text-inchiostro font-semibold" style="font-variant-numeric: tabular-nums;">{{ bilancio.solidiTotali }}%</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-ui-label text-inchiostro/50">POD</span>
                  <span class="text-data text-inchiostro" style="font-variant-numeric: tabular-nums;">{{ bilancio.pod }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-ui-label text-inchiostro/50">PAC</span>
                  <span class="text-data text-inchiostro" style="font-variant-numeric: tabular-nums;">{{ bilancio.pac }}</span>
                </div>
              </div>

              <div class="border-t border-inchiostro/10 pt-4">
                <p class="text-ui-label text-inchiostro/40 mb-3">PER {{ quantitaKg }} kg</p>
                <div class="divide-y divide-inchiostro/8">
                  <div
                    v-for="ing in bilancio.ingredientiScalati"
                    :key="ing.nome"
                    class="flex items-baseline justify-between py-2"
                  >
                    <span class="text-body-small text-inchiostro truncate mr-3">{{ ing.nome || '—' }}</span>
                    <span class="text-data text-inchiostro shrink-0" style="font-variant-numeric: tabular-nums;">
                      {{ ing.g_assoluti }}<span class="text-body-small text-inchiostro/50 ml-0.5">g</span>
                    </span>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>

        <div class="flex items-center gap-4 mt-6">
          <button
            @click="userStore.isLoggedIn ? undefined : userStore.openAuthModal()"
            class="bg-inchiostro text-crema rounded-xl px-6 py-3 text-body font-medium hover:opacity-80 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inchiostro"
            :aria-label="userStore.isLoggedIn ? 'Salva ricetta' : 'Accedi per salvare la ricetta'"
          >Salva ricetta</button>
          <span v-if="!userStore.isLoggedIn" class="text-body-small text-inchiostro/40">
            Richiede accesso
          </span>
        </div>
      </div>

    </div>
  </section>
</template>
