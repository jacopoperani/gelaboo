// Trasforma una stringa SVG con <style> a classi (.stN) in SVG self-contained:
// le proprietà di presentazione (fill, opacity, …) vengono scritte inline come
// attributi sugli elementi, le classi e i <style> rimossi. Evita la collisione
// globale delle classi quando più SVG sono iniettati via innerHTML nello stesso
// documento. Il prefix namespacea anche gli id (es. id="Livello_1" duplicato).

// Proprietà CSS che esistono come attributi di presentazione SVG.
const PRESENTATION_PROPS = new Set([
  'fill', 'fill-opacity', 'fill-rule', 'stroke', 'stroke-width',
  'stroke-opacity', 'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray',
  'opacity', 'color', 'stop-color', 'stop-opacity',
])

function parseCssRules(css, out) {
  const re = /([^{}]+)\{([^{}]+)\}/g
  let m
  while ((m = re.exec(css))) {
    const selectors = m[1].trim()
    const props = {}
    for (const decl of m[2].split(';')) {
      const i = decl.indexOf(':')
      if (i === -1) continue
      const key = decl.slice(0, i).trim()
      const val = decl.slice(i + 1).trim()
      if (!PRESENTATION_PROPS.has(key)) continue // scarta isolation, ecc.
      props[key] = val
    }
    for (const sel of selectors.split(',')) {
      const s = sel.trim()
      out[s] = { ...(out[s] || {}), ...props }
    }
  }
}

export function inlineSvgColors(rawSvg, prefix = '') {
  if (typeof window === 'undefined' || !window.DOMParser) return rawSvg
  const doc = new DOMParser().parseFromString(rawSvg, 'image/svg+xml')
  const svg = doc.querySelector('svg')
  if (!svg || doc.querySelector('parsererror')) return rawSvg

  // 1-2. Estrai regole da ogni <style>, poi rimuovi <style> (e <defs> vuoti).
  const rules = {}
  for (const styleEl of svg.querySelectorAll('style')) {
    parseCssRules(styleEl.textContent || '', rules)
    styleEl.remove()
  }
  for (const defs of svg.querySelectorAll('defs')) {
    if (!defs.children.length) defs.remove()
  }

  // 3. Applica le props inline su ogni elemento con class, poi togli class.
  for (const el of svg.querySelectorAll('[class]')) {
    const classes = (el.getAttribute('class') || '').split(/\s+/).filter(Boolean)
    for (const c of classes) {
      const props = rules['.' + c]
      if (!props) continue
      for (const [k, v] of Object.entries(props)) {
        if (!el.hasAttribute(k)) el.setAttribute(k, v) // attributo esistente vince
      }
    }
    el.removeAttribute('class')
  }

  // Bonus: namespacea gli id per evitare duplicati tra più SVG iniettati.
  if (prefix) {
    for (const el of svg.querySelectorAll('[id]')) {
      el.setAttribute('id', `${prefix}-${el.getAttribute('id')}`)
    }
  }

  // 5. Stringa pulita, self-contained.
  return new XMLSerializer().serializeToString(svg)
}
