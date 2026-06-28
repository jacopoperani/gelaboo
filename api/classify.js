import { validaIngredienteAI, notaValidazione } from '../server-lib/validazione.js'

const ALLOWED_ORIGINS = [
  'https://jacopoperani.github.io',
  'http://localhost:5173',
  'http://localhost:4173',
]

const GEMINI_MODEL = 'gemini-3.1-flash-lite'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

const PROMPT = (nome) => `Sei un esperto di gelateria artigianale italiana. Stima i valori nutrizionali dell'ingrediente "${nome}" per uso in gelateria.

Rispondi SOLO con un oggetto JSON valido, nessun preambolo, nessun markdown, nessuna spiegazione. Schema esatto:
{
  "zuccheri": <percentuale 0-100, grammi di zuccheri per 100g di ingrediente>,
  "grassi": <percentuale 0-100, grammi di grassi per 100g>,
  "slng": <percentuale 0-100, solidi del latte non grassi per 100g — 0 se non è un derivato del latte>,
  "altri": <percentuale 0-100, altri solidi (fibre, proteine non lattee, stabilizzanti) per 100g>,
  "pod": <potere dolcificante relativo al saccarosio=100, tipicamente 0-250>,
  "pac": <potere anticongelante relativo al saccarosio=100, tipicamente 0-250>
}

Regole:
- Se l'ingrediente non contiene zuccheri liberi (es. grassi puri, proteine), pod e pac sono 0.
- Se è un derivato del latte, usa slng per le proteine/lattosio, non altri.
- La somma zuccheri+grassi+slng+altri non deve superare 100.
- Per la frutta fresca: zuccheri tipicamente 5-20%, pod 80-130, pac 110-160.
- Per la frutta secca/paste (nocciola, pistacchio, mandorla): grassi 50-65%, altri 30-45%, pod e pac vicini a 0.`

export default async function handler(req, res) {
  const origin = req.headers.origin || ''
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ errore: true, messaggio: 'Metodo non consentito' })

  const { nome } = req.body ?? {}
  if (!nome || typeof nome !== 'string' || nome.trim().length === 0) {
    return res.status(400).json({ errore: true, messaggio: 'Nome ingrediente mancante' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ errore: true, messaggio: 'Configurazione server mancante' })
  }

  try {
    const geminiRes = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: PROMPT(nome.trim()) }] }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json',
        },
      }),
    })

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text()
      console.error('Gemini error:', errBody)
      return res.status(500).json({ errore: true, messaggio: 'Gemini non disponibile' })
    }

    const data = await geminiRes.json()
    const testo = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    const parsed = JSON.parse(testo)

    const { valido, fuoriRange } = validaIngredienteAI(parsed)
    if (!valido) {
      return res.status(500).json({ errore: true, messaggio: 'La risposta AI non è nel formato atteso' })
    }

    return res.status(200).json({ ...parsed, nota: notaValidazione(fuoriRange) })
  } catch (err) {
    console.error('classify error:', err)
    return res.status(500).json({ errore: true, messaggio: 'Errore durante la classificazione' })
  }
}
