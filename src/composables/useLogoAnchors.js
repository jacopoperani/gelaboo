import { shallowRef } from 'vue'

// Ref DOM condivisi tra TheHeader (bersaglio "piccolo" nell'header) e
// Home (ancora del logo grande nella Hero). Il LogoMorph montato fixed in
// App.vue li legge per posizionarsi/interpolare. shallowRef: sono nodi DOM,
// non vogliamo reattività profonda su di essi.
const logoTarget = shallowRef(null)
const heroLogoAnchor = shallowRef(null)

// Progress dello ScrollTrigger del morph (0 = logo grande in Hero,
// 1 = logo docked in header). Aggiornato da App.vue, letto da TheHeader
// per mostrare/nascondere i controlli in Home.
const scrollProgress = shallowRef(0)

export function useLogoAnchors() {
  return { logoTarget, heroLogoAnchor, scrollProgress }
}
