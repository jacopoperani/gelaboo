const SEMPRE_FISSO = [
  'stabilizzante', 'inulina', 'acqua', 'latte polvere scremato',
  'destrosio', 'destrosio (monoidrato)',
]

export function isModificabile(nome, categoria, nomeCaratterizzante) {
  const n = nome.toLowerCase().trim()
  const nomeCarLower = (nomeCaratterizzante || '').toLowerCase().trim()

  if (SEMPRE_FISSO.includes(n)) return false
  if (n.startsWith('estratto di')) return false
  if (nomeCarLower && n === nomeCarLower) return true
  if (n === 'saccarosio') return true
  if (n.includes('panna')) return true
  if (n === 'latte intero') return categoria === 'frutta'
  if (n.includes('sciroppo') && n.includes('glucosio')) return categoria === 'sorbetto'

  return false
}

export function isCorreggibile(nome) {
  const n = nome.toLowerCase().trim()
  return n !== 'stabilizzante' && n !== 'inulina'
}
