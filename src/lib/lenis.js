import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Istanza Lenis singleton: un solo scroller per la pagina. Condivisa tra
// main.js (avvio), App.vue (resize) e il router (scrollBehavior). Non usiamo
// provide/inject perché lo scroll è globale e il router vive fuori dal tree
// Vue: un modulo singleton è il punto di verità più semplice e senza cicli.
export const lenis = new Lenis()

// Wiring con GSAP: ogni scroll Lenis aggiorna ScrollTrigger, e il RAF di
// Lenis è pilotato dal ticker GSAP (un solo loop di animazione condiviso).
// gsap.ticker passa il tempo in secondi → *1000 per i ms attesi da lenis.raf.
// lagSmoothing(0) disattiva la compensazione lag di GSAP, che altrimenti
// falsa la sincronia con lo scroll interpolato di Lenis.
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => {
  lenis.raf(time * 1000)
})
gsap.ticker.lagSmoothing(0)
