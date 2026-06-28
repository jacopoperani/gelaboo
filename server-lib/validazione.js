// Range plausibili derivati da gelato-reference.md — stessa logica di src/utils/classifyIngredient.js
const RANGE = {
  zuccheri: [0, 100],
  grassi:   [0, 100],
  slng:     [0, 96],
  altri:    [0, 100],
  pod:      [0, 250],
  pac:      [0, 250],
}

/**
 * @returns {{ valido: boolean, fuoriRange: boolean }}
 * valido=false → dato inutilizzabile (NaN/negativo/tipo sbagliato)
 * valido=true, fuoriRange=true → dato accettato ma sospetto
 */
export function validaIngredienteAI(dati) {
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

export function notaValidazione(fuoriRange) {
  return fuoriRange
    ? 'stima AI, valori fuori range tipico — verificare manualmente'
    : 'stima AI, non verificato manualmente'
}
