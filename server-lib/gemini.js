const GEMINI_MODEL = 'gemini-3.1-flash-lite'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

export async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY non configurata')

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1, responseMimeType: 'application/json' },
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Gemini ${res.status}: ${body.slice(0, 200)}`)
  }

  const data = await res.json()
  const testo = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  return JSON.parse(testo)
}

export function promptClassificazioneNutrizionale(nome) {
  return `Sei un esperto di gelateria artigianale italiana. Stima i valori nutrizionali dell'ingrediente "${nome}" per uso in gelateria.

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
}
