import { bilanciaRicetta, classificaValore } from '../src/utils/calculator.js'
import { THRESHOLDS } from '../src/data/thresholds.js'
import { isCorreggibile } from './regoleModificabilita.js'

function getCat(categoria) {
  return (typeof categoria === 'string' ? categoria : 'crema')
}

// Copia 1:1 da src/composables/useCalcolatore.js:117-175
function fasciaCorretta(ingIdx, ingredienti, categoria, absMin, absMax, eccezioniSoglie = []) {
  const t    = THRESHOLDS[getCat(categoria)] ?? THRESHOLDS.crema
  const ingK = ingredienti[ingIdx]
  const others = ingredienti.filter((_, i) => i !== ingIdx)

  const C    = others.reduce((s, i) => s + i.g_per_kg, 0)
  const Az   = others.reduce((s, i) => s + i.g_per_kg * i.zuccheri / 100, 0)
  const Ag   = others.reduce((s, i) => s + i.g_per_kg * i.grassi   / 100, 0)
  const As   = others.reduce((s, i) => s + i.g_per_kg * i.slng     / 100, 0)
  const Aa   = others.reduce((s, i) => s + i.g_per_kg * i.altri    / 100, 0)
  const Apod = others.reduce((s, i) => s + i.g_per_kg * (i.zuccheri / 100) * i.pod, 0)
  const Apac = others.reduce((s, i) => s + i.g_per_kg * (i.zuccheri / 100) * i.pac, 0)

  const Bz   = ingK.zuccheri / 100
  const Bg   = ingK.grassi   / 100
  const Bs   = ingK.slng     / 100
  const Ba   = ingK.altri    / 100
  const Bpod = (ingK.zuccheri / 100) * ingK.pod
  const Bpac = (ingK.zuccheri / 100) * ingK.pac

  const metrics = [
    [Az,           Bz,           t.zuccheri,      100, 'zuccheri'],
    [Ag,           Bg,           t.grassi,        100, 'grassi'],
    [As,           Bs,           t.slng,          100, 'slng'],
    [Aa,           Ba,           t.altri ?? null, 100, 'altri'],
    [Az+Ag+As+Aa,  Bz+Bg+Bs+Ba, t.solidi,        100, 'solidi'],
    [Apod,         Bpod,         t.pod,             1, 'pod'],
    [Apac,         Bpac,         t.pac,             1, 'pac'],
  ]

  let lo = absMin, hi = absMax
  const eps = 1e-9

  for (const [A, B, thresh, scale, nome] of metrics) {
    if (thresh === null) continue
    if (eccezioniSoglie.includes(nome)) continue
    const lv = thresh.lo_acc / scale
    const hv = thresh.hi_acc / scale

    const cl = B - lv, rl = lv * C - A
    if (Math.abs(cl) < eps) { if (rl >  eps) return null }
    else if (cl > 0) lo = Math.max(lo, rl / cl)
    else             hi = Math.min(hi, rl / cl)

    const ch = B - hv, rh = hv * C - A
    if (Math.abs(ch) < eps) { if (rh < -eps) return null }
    else if (ch < 0) lo = Math.max(lo, rh / ch)
    else             hi = Math.min(hi, rh / ch)

    if (lo > hi + eps) return null
  }

  lo = Math.max(absMin, lo)
  hi = Math.min(absMax, hi)
  return lo > hi + eps ? null : { lo, hi }
}

function tuttiDentroRange(ingredienti, categoria) {
  const b = bilanciaRicetta(ingredienti, 1, categoria)
  const t = THRESHOLDS[getCat(categoria)] ?? THRESHOLDS.crema
  const checks = [
    [b.zuccheri,    t.zuccheri],
    [b.grassi,      t.grassi],
    [b.slng,        t.slng],
    [b.solidiTotali, t.solidi],
    [b.pod,         t.pod],
    [b.pac,         t.pac],
  ]
  return checks.every(([val, thresh]) => thresh === null || classificaValore(val, thresh) !== 'sballato')
}

/**
 * Gauss-Seidel su fasciaCorretta: porta gli ingredienti modificabili
 * dentro i range accettabili della categoria, max 25 cicli.
 * absMin/absMax = 0/1000 (vincolo matematico, non di UI).
 * Restituisce { ingredienti, cicliUsati, bilanciamentoCorretto }.
 */
export function correggiRicetta(ingredienti, categoria) {
  // Deep copy per non mutare l'array originale
  const ing = ingredienti.map(i => ({ ...i }))
  const modificabili = ing
    .map((i, idx) => ({ idx, correggibile: isCorreggibile(i.nome) }))
    .filter(x => x.correggibile)
    .map(x => x.idx)

  const MAX_CICLI   = 25
  const CONVERGENZA = 0.5
  let cicliUsati    = 0

  for (let ciclo = 0; ciclo < MAX_CICLI; ciclo++) {
    cicliUsati++
    const prevValori = modificabili.map(idx => ing[idx].g_per_kg)
    let maxDelta = 0

    for (const idx of modificabili) {
      const fascia = fasciaCorretta(idx, ing, categoria, 0, 1000)
      if (fascia === null) continue

      const corrente = ing[idx].g_per_kg
      let nuovo = corrente
      const margine = (fascia.hi - fascia.lo) * 0.05
      if (corrente < fascia.lo) nuovo = fascia.lo + margine
      else if (corrente > fascia.hi) nuovo = fascia.hi - margine

      // Valori decimali durante i cicli — Math.round solo alla fine
      ing[idx] = { ...ing[idx], g_per_kg: nuovo }
      maxDelta = Math.max(maxDelta, Math.abs(nuovo - corrente))
    }

    if (maxDelta < CONVERGENZA) break
  }

  // Riscala proporzionalmente a 1000, poi arrotonda una sola volta
  const somma = ing.reduce((s, i) => s + i.g_per_kg, 0)
  if (somma > 0) {
    const scala = 1000 / somma
    for (const i of ing) i.g_per_kg = Math.round(i.g_per_kg * scala)
  }

  return {
    ingredienti: ing,
    cicliUsati,
    bilanciamentoCorretto: tuttiDentroRange(ing, categoria),
  }
}
