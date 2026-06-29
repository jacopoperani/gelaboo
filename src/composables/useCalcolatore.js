import { computed } from 'vue'
import { bilanciaRicetta, classificaValore } from '../utils/calculator.js'
import { THRESHOLDS } from '../data/thresholds.js'


function getCat(categoria) {
  return (typeof categoria === 'string' ? categoria : categoria?.value) ?? 'crema'
}

/**
 * Motore deterministico di bilanciamento gelato.
 * @param {Ref<Array>} ingredienti - array reattivo di { nome, g_per_kg, zuccheri, grassi, slng, altri, pod, pac }
 * @param {Ref<number>} quantitaKg  - kg totali della miscela (default 1)
 * @param {Ref<string>|string} [categoria] - 'crema'|'frutta'|'sorbetto'|'vegano'; fallback 'crema'
 */
export function useCalcolatore(ingredienti, quantitaKg, categoria, eccezioniSoglie = []) {
  const bilancio = computed(() =>
    bilanciaRicetta(
      Array.isArray(ingredienti) ? ingredienti : ingredienti.value ?? [],
      quantitaKg?.value ?? 1,
      getCat(categoria),
    )
  )

  // Warnings sballato: appare solo fuori lo_acc/hi_acc — gelato-reference.md §14
  const warnings = computed(() => {
    const b = bilancio.value
    const t = THRESHOLDS[getCat(categoria)] ?? THRESHOLDS.crema
    const w = []
    const checks = [
      ['zuccheri', b.zuccheri,      t.zuccheri, 'Zuccheri'],
      ['grassi',   b.grassi,        t.grassi,   'Grassi'],
      ['slng',     b.slng,          t.slng,     'SLNG'],
      ['solidi',   b.solidiTotali,  t.solidi,   'Solidi totali'],
      ['pod',      b.pod,           t.pod,      'POD'],
      ['pac',      b.pac,           t.pac,      'PAC'],
    ]
    const exc = Array.isArray(eccezioniSoglie) ? eccezioniSoglie : eccezioniSoglie?.value ?? []
    for (const [campo, val, thresh, label] of checks) {
      if (thresh === null) continue
      if (exc.includes(campo)) continue
      if (val < thresh.lo_acc) w.push({ campo, msg: `${label} sotto il minimo (${thresh.lo_acc}%)` })
      else if (val > thresh.hi_acc) w.push({ campo, msg: `${label} sopra il massimo (${thresh.hi_acc}%)` })
    }
    return w
  })

  // Classificazione a 3 livelli: 'ok' | 'attenzione' | 'sballato'
  const stati = computed(() => {
    const b = bilancio.value
    const t = THRESHOLDS[getCat(categoria)] ?? THRESHOLDS.crema
    return {
      zuccheri:     classificaValore(b.zuccheri, t.zuccheri),
      grassi:       classificaValore(b.grassi, t.grassi),
      slng:         classificaValore(b.slng, t.slng),
      altriSolidi:  t.altri ? classificaValore(b.altriSolidi, t.altri) : null,
      solidiTotali: classificaValore(b.solidiTotali, t.solidi),
      pod:          classificaValore(b.pod, t.pod),
      pac:          classificaValore(b.pac, t.pac),
    }
  })

  return { bilancio, warnings, stati }
}

/**
 * Per un ingrediente a indice ingIdx, inverte algebricamente la formula di bilancio
 * rispetto al suo g/kg (tenendo fissi gli altri ai valori correnti) per ogni parametro.
 * Il risultato è l'INTERSEZIONE di tutti i sottointervalli compatibili con la zona 'accettabile'
 * (lo_acc..hi_acc), clampata in [absMin, absMax]. Restituisce null se l'intersezione
 * è vuota — significa che nessun valore di quell'ingrediente evita lo stato 'sballato'
 * su tutti i parametri contemporaneamente, dato lo stato attuale degli altri ingredienti.
 *
 * Formula invertita: f(x) = (A + B·x)/(C + x)·scale → x = (v·C − A)/(B − v)
 * con A = contributo degli altri ingredienti, B = coeff dell'ingrediente in esame,
 * C = somma g/kg degli altri.
 */
export function fasciaCorretta(ingIdx, ingredienti, categoria, absMin, absMax, eccezioniSoglie = []) {
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

  // [A, B, soglia THRESHOLDS, scale, nome] — scale=100 per %, 1 per pod/pac
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

    // f(x) >= lv  →  (B - lv)·x >= lv·C - A
    const cl = B - lv, rl = lv * C - A
    if (Math.abs(cl) < eps) { if (rl >  eps) return null }
    else if (cl > 0) lo = Math.max(lo, rl / cl)
    else             hi = Math.min(hi, rl / cl)

    // f(x) <= hv  →  (B - hv)·x <= hv·C - A
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
