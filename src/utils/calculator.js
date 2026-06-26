export function risolviIngredienti(ricetta, ingredientiDB) {
  return ricetta.ingredienti.map(ref => ({
    ...ingredientiDB[ref.id],
    g_per_kg: ref.g_per_kg,
  }))
}

export function classificaValore(val, t) {
  if (t === null) return 'ok'
  if (val < t.lo_acc || val > t.hi_acc) return 'sballato'
  if (val < t.lo_ott || val > t.hi_ott) return 'attenzione'
  return 'ok'
}

/**
 * Calcolo deterministico bilancio gelato.
 * @param {Array} ingredienti - array plain di { nome, g_per_kg, zuccheri, grassi, slng, altri, pod, pac }
 * @param {number} quantitaKg
 * @param {string} categoria
 * @returns {{ zuccheri, grassi, slng, altriSolidi, solidiTotali, pod, pac, ingredientiScalati }}
 */
export function bilanciaRicetta(ingredienti, quantitaKg, categoria) {
  const ing = Array.isArray(ingredienti) ? ingredienti : []
  const kgTot = quantitaKg ?? 1

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
}
