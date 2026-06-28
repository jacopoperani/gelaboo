import ingredientiDB from '../src/data/ingredienti.json' with { type: 'json' }
import { callGemini, promptClassificazioneNutrizionale } from '../server-lib/gemini.js'
import { validaIngredienteAI, notaValidazione } from '../server-lib/validazione.js'
import { correggiRicetta } from '../server-lib/correggiRicetta.js'

const ALLOWED_ORIGINS = [
  'https://jacopoperani.github.io',
  'http://localhost:5173',
  'http://localhost:4173',
]

// Lookup per nome display normalizzato → record DB
const LOOKUP_PER_NOME = {}
for (const record of Object.values(ingredientiDB)) {
  LOOKUP_PER_NOME[record.nome.toLowerCase().trim()] = record
}

function trovaNelDB(nome) {
  return LOOKUP_PER_NOME[nome.toLowerCase().trim()] ?? null
}

const NOMI_DB = Object.values(ingredientiDB).map(r => r.nome)

function promptListaIngredienti(descrizione) {
  return `Sei un esperto di gelateria artigianale italiana. L'utente vuole creare un gelato artigianale con questa idea:

"${descrizione}"

Proponi una lista di 4-9 nomi di ingredienti adatti a realizzare questo gusto. Rispondi SOLO con un oggetto JSON valido, nessun preambolo, nessun markdown, nessuna spiegazione. Schema esatto:
{
  "ingredienti": ["<nome 1>", "<nome 2>", ...]
}

Ingredienti già disponibili nel nostro database (preferisci questi quando sono adatti, usando il nome ESATTO com'è scritto qui):
${NOMI_DB.join(', ')}

Regole:
- Usa sempre Saccarosio come zucchero base, salvo il gusto lo escluda esplicitamente.
- Includi sempre un agente strutturante adatto (Stabilizzante oppure Inulina per i vegani).
- Per i gelati a base latte: includi Latte intero e/o Panna 35%.
- Per i sorbetti: includi Acqua e nessun derivato del latte.
- Aggiungi nomi nuovi (non nel database) SOLO se servono a catturare davvero l'essenza del gusto — componenti caratterizzanti non sostituibili (es. "wafer al cacao", "cioccolato al latte") — e scrivili in italiano.
- Non aggiungere troppi ingredienti: 4-6 è il range ideale per un gelato artigianale ben definito.`
}

function promptProcedimento(descrizione, ingredientiConGrammature, categoria) {
  const lista = ingredientiConGrammature
    .map(i => `- ${i.nome}: ${i.g_per_kg} g/kg`)
    .join('\n')

  return `Sei un esperto di gelateria artigianale italiana. Scrivi il procedimento di preparazione per un gelato artigianale "${descrizione}" (categoria: ${categoria}) con questi ingredienti e grammature:

${lista}

Rispondi SOLO con un oggetto JSON valido, nessun preambolo, nessun markdown, nessuna spiegazione. Schema esatto:
{
  "procedimento": ["<step 1>", "<step 2>", ...],
  "notaTecnica": "<stringa breve opzionale>"
}

Regole:
- Da 4 a 8 passaggi, frasi brevi e dirette (es. "Pesare tutti gli ingredienti.", "Pastorizzare a 85 °C per 15 secondi.").
- Solo passaggi pratici fisici di preparazione: pesatura, miscelazione, pastorizzazione, maturazione, mantecazione, abbattimento. Nessun calcolo, nessun riferimento a percentuali, POD o PAC.
- notaTecnica: una frase breve su una caratteristica tecnica rilevante dell'ingrediente caratterizzante o del processo (es. "La pasta di pistacchio pura garantisce un colore naturale e un aroma intenso senza coloranti."). Ometti il campo (non includerlo nel JSON) se non hai nulla di utile da dire — non forzare una nota generica.
- Italiano professionale ma diretto, stile manuale di gelateria.`
}

function promptGrammature(ingredientiConNutrizione) {
  const lista = ingredientiConNutrizione
    .map(i => `- ${i.nome} (zuccheri ${i.zuccheri}%, grassi ${i.grassi}%, slng ${i.slng}%, altri ${i.altri}%)`)
    .join('\n')

  return `Sei un esperto di gelateria artigianale italiana. Proponi le grammature di partenza (g per kg di miscela totale) per una ricetta gelato con questi ingredienti:

${lista}

Rispondi SOLO con un oggetto JSON valido, nessun preambolo, nessun markdown, nessuna spiegazione. Schema esatto:
{
  "ingredienti": [
    { "nome": "<nome esatto come sopra>", "g_per_kg": <numero intero> },
    ...
  ],
  "categoria": "<una tra: crema | frutta | sorbetto | vegano>"
}

Regole importanti:
- Non fare calcoli di bilanciamento. Proponi SOLO proporzioni tipiche e plausibili per un gelato con questi componenti, basandoti sulla prassi della gelateria artigianale.
- Le grammature sono un punto di partenza — il gelatiere le modificherà. Non devono essere perfette, devono essere ragionevoli.
- La somma di tutti i g_per_kg deve essere il più vicino possibile a 1000.
- Mantieni tutti gli ingredienti ricevuti nell'input — non aggiungerne, non toglierne.
- categoria: scegli 'sorbetto' se prevale frutta senza latte, 'frutta' se c'è frutta con base lattica, 'vegano' se non ci sono derivati animali, 'crema' altrimenti.`
}

export default async function handler(req, res) {
  const origin = req.headers.origin || ''
  if (ALLOWED_ORIGINS.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ ok: false, messaggio: 'Metodo non consentito' })

  const { descrizione } = req.body ?? {}
  if (!descrizione || typeof descrizione !== 'string' || descrizione.trim().length === 0) {
    return res.status(400).json({ ok: false, messaggio: 'Descrizione del gusto mancante' })
  }

  try {
    // 1. Genera lista ingredienti dalla descrizione libera
    const proposta = await callGemini(promptListaIngredienti(descrizione.trim()))
    const nomiIngredienti = proposta.ingredienti ?? []
    if (!Array.isArray(nomiIngredienti) || nomiIngredienti.length === 0) {
      throw new Error('Gemini non ha proposto ingredienti validi')
    }

    // 2. Risolvi nutrizione: DB locale oppure AI
    const risolti = []
    for (const nome of nomiIngredienti) {
      const dbRecord = trovaNelDB(nome)
      if (dbRecord) {
        risolti.push({
          nome: dbRecord.nome,
          zuccheri: dbRecord.zuccheri,
          grassi:   dbRecord.grassi,
          slng:     dbRecord.slng,
          altri:    dbRecord.altri,
          pod:      dbRecord.pod,
          pac:      dbRecord.pac,
          verificato: dbRecord.verificato ?? false,
          nota:       dbRecord.nota ?? null,
        })
      } else {
        const ai = await callGemini(promptClassificazioneNutrizionale(nome))
        const { valido, fuoriRange } = validaIngredienteAI(ai)
        if (!valido) throw new Error(`Classificazione AI non valida per "${nome}"`)
        risolti.push({
          nome,
          zuccheri: ai.zuccheri,
          grassi:   ai.grassi,
          slng:     ai.slng,
          altri:    ai.altri,
          pod:      ai.pod,
          pac:      ai.pac,
          verificato: false,
          nota: notaValidazione(fuoriRange),
        })
      }
    }

    // 3. Proponi grammature
    const grammature = await callGemini(promptGrammature(risolti))

    // 4. Normalizza deterministicamente: somma → 1000
    const voci = grammature.ingredienti ?? []
    const somma = voci.reduce((s, i) => s + (i.g_per_kg ?? 0), 0)
    const scala = somma > 0 ? 1000 / somma : 1

    // 5. Componi risposta finale unendo nutrizione + grammature normalizzate
    const ricetta = voci.map((voce, idx) => {
      const nutriz = risolti[idx] ?? risolti.find(r => r.nome.toLowerCase() === voce.nome?.toLowerCase()) ?? risolti[idx] ?? {}
      return {
        nome:       voce.nome ?? nutriz.nome,
        g_per_kg:   Math.round((voce.g_per_kg ?? 0) * scala),
        zuccheri:   nutriz.zuccheri  ?? 0,
        grassi:     nutriz.grassi    ?? 0,
        slng:       nutriz.slng      ?? 0,
        altri:      nutriz.altri     ?? 0,
        pod:        nutriz.pod       ?? 0,
        pac:        nutriz.pac       ?? 0,
        verificato: nutriz.verificato ?? false,
        nota:       nutriz.nota      ?? null,
      }
    })

    const categoria = ['crema', 'frutta', 'sorbetto', 'vegano'].includes(grammature.categoria)
      ? grammature.categoria
      : 'crema'

    // 6. Correzione deterministica Gauss-Seidel
    const correzione = correggiRicetta(ricetta, categoria)
    const ricettaCorretta = correzione.ingredienti
    const bilanciamentoCorretto = correzione.bilanciamentoCorretto
    console.log(`correggiRicetta: ${correzione.cicliUsati} cicli, corretto=${bilanciamentoCorretto}`)

    // 7. Genera procedimento (fallback silenzioso se Gemini fallisce)
    let procedimento = []
    let notaTecnica
    try {
      const proc = await callGemini(promptProcedimento(descrizione.trim(), ricettaCorretta, categoria))
      if (Array.isArray(proc.procedimento) && proc.procedimento.length > 0) {
        procedimento = proc.procedimento
      }
      if (typeof proc.notaTecnica === 'string' && proc.notaTecnica.trim().length > 0) {
        notaTecnica = proc.notaTecnica.trim()
      }
    } catch (procErr) {
      console.error('generate-recipe procedimento error (non-fatal):', procErr)
    }

    return res.status(200).json({ ok: true, ricetta: ricettaCorretta, categoria, procedimento, bilanciamentoCorretto, ...(notaTecnica ? { notaTecnica } : {}) })
  } catch (err) {
    console.error('generate-recipe error:', err)
    return res.status(500).json({ ok: false, messaggio: 'Errore durante la generazione della ricetta' })
  }
}
