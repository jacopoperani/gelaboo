const CACHE_KEY = 'gelaboo_ai_cache'

function normalizza(nome) {
  return nome.toLowerCase().trim()
}

function leggiCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function salvaCache(nome, dati) {
  try {
    const cache = leggiCache()
    cache[normalizza(nome)] = { ...dati, _ts: Date.now() }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // localStorage pieno o non disponibile — non bloccare
  }
}

function daCacheLocale(nome) {
  return leggiCache()[normalizza(nome)] ?? null
}

// Range plausibili derivati da gelato-reference.md
const RANGE = {
  zuccheri: [0, 100],
  grassi:   [0, 100],
  slng:     [0, 96],
  altri:    [0, 100],
  pod:      [0, 250],
  pac:      [0, 250],
}

function validaIngredienteAI(dati) {
  const campi = ['zuccheri', 'grassi', 'slng', 'altri', 'pod', 'pac']
  let fuoriRange = false

  for (const campo of campi) {
    const v = dati[campo]
    if (typeof v !== 'number' || isNaN(v) || v < 0) return { valido: false, fuoriRange: true }
    const [min, max] = RANGE[campo]
    if (v < min || v > max) fuoriRange = true
  }

  const sommaSolidi = (dati.zuccheri ?? 0) + (dati.grassi ?? 0) + (dati.slng ?? 0) + (dati.altri ?? 0)
  if (sommaSolidi > 101) fuoriRange = true

  return { valido: true, fuoriRange }
}

function costruisciRisultato(raw, fuoriRange) {
  return {
    zuccheri: raw.zuccheri,
    grassi:   raw.grassi,
    slng:     raw.slng,
    altri:    raw.altri,
    pod:      raw.pod,
    pac:      raw.pac,
    verificato: false,
    nota: fuoriRange
      ? 'stima AI, valori fuori range tipico — verificare manualmente'
      : 'stima AI, non verificato manualmente',
  }
}

/**
 * Classifica un ingrediente non trovato nel DB locale.
 * Usa cache localStorage → proxy /api/classify → errore esplicito.
 * @returns {{ ok: true, dati: {...} } | { ok: false, messaggio: string }}
 */
export async function classificaIngrediente(nome) {
  // 1. Cache locale
  const cached = daCacheLocale(nome)
  if (cached) return { ok: true, dati: cached, daCahe: true }

  // 2. Chiamata proxy
  try {
    const res = await fetch('/api/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome }),
    })

    const json = await res.json()

    if (!res.ok || json.errore) {
      return { ok: false, messaggio: json.messaggio ?? 'Classificazione non riuscita' }
    }

    const { valido, fuoriRange } = validaIngredienteAI(json)
    if (!valido) {
      return { ok: false, messaggio: 'La risposta AI non è nel formato atteso. Inserisci i valori manualmente.' }
    }

    const dati = costruisciRisultato(json, fuoriRange)
    salvaCache(nome, dati)
    return { ok: true, dati }
  } catch (err) {
    console.error('classificaIngrediente:', err)
    return { ok: false, messaggio: 'Errore di rete. Controlla la connessione e riprova.' }
  }
}
