import { computed } from 'vue'

// Range binari per warnings (backward-compat) — gelato-reference.md §14
const RANGES = {
  crema: {
    zuccheriMin: 16, zuccheriMax: 27,
    grassiMin: 6,    grassiMax: 12,
    slngMax: 12,
    solidiMin: 36,   solidiMax: 44,
  },
  frutta: {
    zuccheriMin: 22, zuccheriMax: 27,
    grassiMin: null, grassiMax: 4,
    slngMax: 8,
    solidiMin: 30,   solidiMax: 38,
  },
  sorbetto: {
    zuccheriMin: 22, zuccheriMax: 30,
    grassiMin: null, grassiMax: 2,
    slngMax: null,
    solidiMin: 28,   solidiMax: 34,
  },
  vegano: {
    zuccheriMin: 16, zuccheriMax: 22,
    grassiMin: 5,    grassiMax: 12,
    slngMax: null,
    solidiMin: 32,   solidiMax: 40,
  },
}

// Soglie a 3 livelli — gelato-reference.md §14 (valori ÷10, verificati vs §10 e fonte esterna)
const THRESHOLDS = {
  crema: {
    zuccheri: { lo_acc: 13,   lo_ott: 16,   hi_ott: 22,   hi_acc: 27 },
    grassi:   { lo_acc: 4,    lo_ott: 6,    hi_ott: 10,   hi_acc: 12 },
    slng:     { lo_acc: 6,    lo_ott: 8,    hi_ott: 11,   hi_acc: 12 },
    solidi:   { lo_acc: 33,   lo_ott: 36,   hi_ott: 42,   hi_acc: 44 },
    pod:      { lo_acc: 11,   lo_ott: 13,   hi_ott: 17.5, hi_acc: 19.5 },
    pac:      { lo_acc: 18,   lo_ott: 22,   hi_ott: 27,   hi_acc: 30 },
  },
  frutta: {
    zuccheri: { lo_acc: 19,   lo_ott: 22,   hi_ott: 26,   hi_acc: 27 },
    grassi:   { lo_acc: 0,    lo_ott: 0,    hi_ott: 3,    hi_acc: 5 },
    slng:     { lo_acc: 2,    lo_ott: 4,    hi_ott: 7,    hi_acc: 8 },
    solidi:   { lo_acc: 27,   lo_ott: 30,   hi_ott: 36,   hi_acc: 38 },
    pod:      { lo_acc: 11,   lo_ott: 13,   hi_ott: 17.5, hi_acc: 19.5 },
    pac:      { lo_acc: 18,   lo_ott: 22,   hi_ott: 27,   hi_acc: 30 },
  },
  sorbetto: {
    zuccheri: { lo_acc: 19,   lo_ott: 22,   hi_ott: 28,   hi_acc: 30 },
    grassi:   { lo_acc: 0,    lo_ott: 0,    hi_ott: 0.5,  hi_acc: 2 },
    slng:     null,
    solidi:   { lo_acc: 25,   lo_ott: 28,   hi_ott: 32,   hi_acc: 34 },
    pod:      { lo_acc: 18,   lo_ott: 20,   hi_ott: 23.5, hi_acc: 26 },
    pac:      { lo_acc: 25,   lo_ott: 27.5, hi_ott: 34,   hi_acc: 37.5 },
  },
  vegano: {
    zuccheri: { lo_acc: 13,   lo_ott: 16,   hi_ott: 20,   hi_acc: 22 },
    grassi:   { lo_acc: 3,    lo_ott: 5,    hi_ott: 10,   hi_acc: 12 },
    slng:     null,
    solidi:   { lo_acc: 28,   lo_ott: 32,   hi_ott: 38,   hi_acc: 40 },
    pod:      { lo_acc: 11,   lo_ott: 13,   hi_ott: 17.5, hi_acc: 19.5 },
    pac:      { lo_acc: 18,   lo_ott: 22,   hi_ott: 27,   hi_acc: 30 },
  },
}

function classificaValore(val, t) {
  if (t === null) return 'ok'
  if (val < t.lo_acc || val > t.hi_acc) return 'sballato'
  if (val < t.lo_ott || val > t.hi_ott) return 'attenzione'
  return 'ok'
}

function getCat(categoria) {
  return (typeof categoria === 'string' ? categoria : categoria?.value) ?? 'crema'
}

/**
 * Motore deterministico di bilanciamento gelato.
 * @param {Ref<Array>} ingredienti - array reattivo di { nome, g_per_kg, zuccheri, grassi, slng, altri, pod, pac }
 * @param {Ref<number>} quantitaKg  - kg totali della miscela (default 1)
 * @param {Ref<string>|string} [categoria] - 'crema'|'frutta'|'sorbetto'|'vegano'; fallback 'crema'
 */
export function useCalcolatore(ingredienti, quantitaKg, categoria) {
  const bilancio = computed(() => {
    const ing = Array.isArray(ingredienti) ? ingredienti : ingredienti.value ?? []
    const kgTot = quantitaKg?.value ?? 1

    let zG = 0, gG = 0, sG = 0, aG = 0
    let podNum = 0, pacNum = 0, zPuri = 0
    let pesoBase = 0

    for (const i of ing) {
      const g = i.g_per_kg
      const zucch = g * (i.zuccheri / 100)
      pesoBase += g
      zG += zucch
      gG += g * (i.grassi  / 100)
      sG += g * (i.slng    / 100)
      aG += g * (i.altri   / 100)
      podNum += zucch * i.pod
      pacNum += zucch * i.pac
      zPuri  += zucch
    }

    const tot = pesoBase || 1000
    const factor = kgTot * 1000 / tot

    const z = (zG / tot) * 100
    const g = (gG / tot) * 100
    const s = (sG / tot) * 100
    const a = (aG / tot) * 100
    const st = z + g + s + a

    const pod = podNum / tot
    const pac = pacNum / tot

    const ingredientiScalati = ing.map(i => {
      const zucch = i.g_per_kg * (i.zuccheri / 100)
      return {
        ...i,
        g_assoluti:  Math.round(i.g_per_kg * factor),
        pacContrib: +(zucch * i.pac / tot).toFixed(2),
      }
    })

    return {
      zuccheri:     +z.toFixed(1),
      grassi:       +g.toFixed(1),
      slng:         +s.toFixed(1),
      altriSolidi:  +a.toFixed(1),
      solidiTotali: +st.toFixed(1),
      pod:          +pod.toFixed(1),
      pac:          +pac.toFixed(1),
      ingredientiScalati,
    }
  })

  // Checks fuori range per categoria — gelato-reference.md §14
  const warnings = computed(() => {
    const b = bilancio.value
    const cat = getCat(categoria)
    const r = RANGES[cat] ?? RANGES.crema
    const w = []
    if (b.zuccheri < r.zuccheriMin) w.push({ campo: 'zuccheri', msg: `Zuccheri sotto il minimo (${r.zuccheriMin}%)` })
    if (b.zuccheri > r.zuccheriMax) w.push({ campo: 'zuccheri', msg: `Zuccheri sopra il massimo (${r.zuccheriMax}%)` })
    if (r.grassiMin != null && b.grassi < r.grassiMin) w.push({ campo: 'grassi', msg: `Grassi sotto il minimo (${r.grassiMin}%)` })
    if (r.grassiMax != null && b.grassi > r.grassiMax) w.push({ campo: 'grassi', msg: `Grassi sopra il massimo (${r.grassiMax}%)` })
    if (r.slngMax != null && b.slng > r.slngMax) w.push({ campo: 'slng', msg: `SLNG sopra soglia sabbiosità (${r.slngMax}%)` })
    if (b.solidiTotali < r.solidiMin) w.push({ campo: 'solidi', msg: `Solidi totali sotto il minimo (${r.solidiMin}%)` })
    if (b.solidiTotali > r.solidiMax) w.push({ campo: 'solidi', msg: `Solidi totali sopra il massimo (${r.solidiMax}%)` })
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
export function fasciaCorretta(ingIdx, ingredienti, categoria, absMin, absMax) {
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

  // [A, B, soglia THRESHOLDS, scale] — scale=100 per %, 1 per pod/pac
  const metrics = [
    [Az,           Bz,           t.zuccheri, 100],
    [Ag,           Bg,           t.grassi,   100],
    [As,           Bs,           t.slng,     100],
    [Az+Ag+As+Aa,  Bz+Bg+Bs+Ba, t.solidi,   100],
    [Apod,         Bpod,         t.pod,        1],
    [Apac,         Bpac,         t.pac,        1],
  ]

  let lo = absMin, hi = absMax
  const eps = 1e-9

  for (const [A, B, thresh, scale] of metrics) {
    if (thresh === null) continue
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
