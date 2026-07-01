<script setup>
import { onMounted, onUnmounted, ref, inject, watch } from 'vue'
import Matter from 'matter-js'
import { useLogoAnchors } from '../composables/useLogoAnchors.js'

// Illustrazioni gelati: SVG sorgente importati raw (stringa). Nessun override
// di colore/fill/stroke — iniettati esattamente come da file.
import cono1 from '../assets/icon/gelati-falling/cono-1.svg?raw'
import cono2 from '../assets/icon/gelati-falling/cono-2.svg?raw'
import cono3 from '../assets/icon/gelati-falling/cono-3.svg?raw'
import cono4 from '../assets/icon/gelati-falling/cono-4.svg?raw'
import coppetta1 from '../assets/icon/gelati-falling/coppetta-1.svg?raw'
import coppetta2 from '../assets/icon/gelati-falling/coppetta-2.svg?raw'
import coppetta3 from '../assets/icon/gelati-falling/coppetta-3.svg?raw'
import coppetta4 from '../assets/icon/gelati-falling/coppetta-4.svg?raw'
import { inlineSvgColors } from '../utils/inlineSvgColors.js'

// LogoMorph (montato fixed in App.vue) per leggere le bbox delle lettere, e
// l'ancora di layout del logo Hero (in-flow, sistema di coordinate stabile).
const logoMorph = inject('logoMorph', null)
const { heroLogoAnchor, scrollProgress } = useLogoAnchors()

// Dimensioni del viewBox del logo (LogoMorph.vue), per mappare le bbox
// lettera in coordinate pixel dell'ancora.
const VB_W = 667.85
const VB_H = 280.28

const { Engine, World, Bodies, Body, Common, Events } = Matter

// ---------- CONFIG ----------
const NUM_OBJECTS = 45
const MOUSE_RADIUS = 140
const MOUSE_FORCE = 0.06
const GRAVITY = 0.3

// ---------- ILLUSTRAZIONI GELATI ----------
// Array di funzioni che ritornano la stringa SVG (stesso contratto di prima).
const SHAPES = [
  { svg: inlineSvgColors(cono1, 's0'), ratio: 124 / 248, extraScale: 1.7 },
  { svg: inlineSvgColors(cono2, 's1'), ratio: 116 / 274, extraScale: 1.7 },
  { svg: inlineSvgColors(cono3, 's2'), ratio: 104 / 298, extraScale: 1.7 },
  { svg: inlineSvgColors(cono4, 's3'), ratio: 112 / 274, extraScale: 1.7 },
  { svg: inlineSvgColors(coppetta1, 's4'), ratio: 124 / 164, extraScale: 1 },
  { svg: inlineSvgColors(coppetta2, 's5'), ratio: 146.3 / 160, extraScale: 1 },
  { svg: inlineSvgColors(coppetta3, 's6'), ratio: 161 / 186.4, extraScale: 1 },
  { svg: inlineSvgColors(coppetta4, 's7'), ratio: 166.4 / 179.3, extraScale: 1 },
]

const layerEl = ref(null)

// Stato non reattivo del motore: niente reattività Vue sui body fisici.
let engine = null
let world = null
let rafId = null
let boundsEl = null
const items = []
let ground = null
let leftWall = null
let rightWall = null
// Ostacoli statici = bottoni CTA della Home. Gli oggetti ci rimbalzano
// sopra invece di attraversarli. Ricalcolati on resize come i muri.
let buttonBodies = []
// Box di collisione per-lettera del logo: { body, baseX, baseY } per ognuno,
// più sH (scala verticale viewBox→pixel) salvato per il sync floating in
// render(). Separati dai CTA perché si muovono ogni frame col floating.
let letterBodies = []
let letterScaleH = 0
// --- Fade gelati appoggiati al logo ---
// Lookup body→item (popolato in spawnAll) per risalire dall'evento di
// collisione Matter al div DOM da sfadeare. Set dei body lettera per test O(1).
const bodyToItem = new Map()
let letterBodySet = new Set()
// Soglia velocità per considerare un gelato "a riposo" sul logo: 0.5 px/step.
// Sopra → sta rimbalzando/cadendo, lo ignoriamo (evita falsi positivi quando
// un gelato attraversa l'area in volo). Valore regolabile a vista.
const RESTING_SPEED = 0.5
// Quanti px sopra il top reale dei letterBodies estendere la zona di
// rilevamento "a riposo sul logo" (solo check virtuale, NON tocca il body
// fisico). Serve a catturare gelati impilati più in alto del bordo lettere.
const RESTING_DETECTION_EXTRA_HEIGHT = 40
// Grafo di adiacenza gelato↔gelato per frame: coppie di item entrambi a
// riposo e in contatto. Serve a propagare lo stato "a riposo sul logo" su
// pile di altezza arbitraria (un gelato su un gelato su un gelato sul logo).
// Map<item, item[]>. Azzerato ogni frame in render() prima di Engine.update.
let restingAdjacency = new Map()
// Item snapshot al primo scroll (fade out); rimessi a opacity 1 al ritorno.
let frozenOnLogoItems = []
// Edge-detection scroll: true finché siamo a inizio pagina (progress 0).
let wasAtTop = true
let stopScrollWatch = null

// collisionActive: ogni frame con contatti attivi marca gli item che toccano
// un body lettera E sono sotto soglia di velocità. item._restingOnLogo è il
// flag live letto al momento del primo scroll.
function onCollisionActive(evt) {
  for (const pair of evt.pairs) {
    const itemA = bodyToItem.get(pair.bodyA)
    const itemB = bodyToItem.get(pair.bodyB)
    const aIsLetter = letterBodySet.has(pair.bodyA)
    const bIsLetter = letterBodySet.has(pair.bodyB)

    // Base case: contatto diretto gelato↔letterBody.
    if (aIsLetter && itemB) {
      if (itemB.body.speed < RESTING_SPEED) itemB._restingOnLogo = true
      continue
    }
    if (bIsLetter && itemA) {
      if (itemA.body.speed < RESTING_SPEED) itemA._restingOnLogo = true
      continue
    }

    // Adiacenza gelato↔gelato: registra la coppia solo se entrambi a riposo.
    // Sarà usata dal flood-fill per propagare lo stato lungo le pile.
    if (itemA && itemB && itemA.body.speed < RESTING_SPEED && itemB.body.speed < RESTING_SPEED) {
      addAdjacency(itemA, itemB)
      addAdjacency(itemB, itemA)
    }
  }
}

function addAdjacency(a, b) {
  let list = restingAdjacency.get(a)
  if (!list) {
    list = []
    restingAdjacency.set(a, list)
  }
  list.push(b)
}

// Flood-fill/BFS: parte dagli item già marcati _restingOnLogo (base case +
// box virtuale) e propaga il flag a tutti gli item adiacenti a riposo,
// transitivamente. Copre pile di altezza arbitraria sopra il logo.
function propagateRestingOnLogo() {
  const queue = items.filter((it) => it._restingOnLogo)
  while (queue.length) {
    const it = queue.pop()
    const neighbors = restingAdjacency.get(it)
    if (!neighbors) continue
    for (const n of neighbors) {
      if (!n._restingOnLogo) {
        n._restingOnLogo = true
        queue.push(n)
      }
    }
  }
}

// Sweep geometrico per-frame: marca come "a riposo sul logo" anche i gelati
// che NON toccano fisicamente un letterBody ma stanno dentro la sua bbox
// estesa verso l'alto di RESTING_DETECTION_EXTRA_HEIGHT (gelati impilati).
// Box virtuale: usa body.bounds reali dei letterBodies (già sincronizzati col
// floating), allargati solo verso l'alto. Non modifica nulla di fisico.
function markRestingByVirtualBox() {
  if (!letterBodies.length) return
  for (const it of items) {
    if (it.body.speed >= RESTING_SPEED) continue
    const p = it.body.position
    for (const e of letterBodies) {
      const b = e.body.bounds
      if (
        p.x >= b.min.x &&
        p.x <= b.max.x &&
        p.y >= b.min.y - RESTING_DETECTION_EXTRA_HEIGHT &&
        p.y <= b.max.y
      ) {
        it._restingOnLogo = true
        break
      }
    }
  }
}
// Init differita: il container può montare nascosto (v-show in App.vue
// false durante l'intro) → clientWidth 0 → spawn collassa a sinistra.
// Aspettiamo width reale prima di inizializzare.
let started = false
let resizeObserver = null
let W = 0
let H = 0

let mouseX = -9999
let mouseY = -9999
let prevMouseX = mouseX
let prevMouseY = mouseY

const wallOpts = { isStatic: true, restitution: 0.3, friction: 0.4 }

// Il pavimento coincide col fondo del CONTENITORE della home (scrollHeight),
// non della viewport: boundsEl è il parent del layer (wrapper Home).
function getBounds() {
  return {
    W: boundsEl.clientWidth,
    H: boundsEl.scrollHeight,
  }
}

function addWalls() {
  ground = Bodies.rectangle(W / 2, H + 20, W * 2, 40, wallOpts)
  leftWall = Bodies.rectangle(-20, H / 2, 40, H * 2, wallOpts)
  rightWall = Bodies.rectangle(W + 20, H / 2, 40, H * 2, wallOpts)
  World.add(world, [ground, leftWall, rightWall])
}

// Ostacoli statici [data-gelato-obstacle]: bottoni CTA + ancora logo Hero.
// Le coordinate vanno rese relative a boundsEl (container scrollabile),
// stesso sistema di riferimento di ground/leftWall/rightWall. L'ancora
// logo resta nel flusso (non è il LogoMorph fixed), quindi il suo rect è
// costante rispetto a boundsEl anche durante il morph/scroll.
function addButtons() {
  const boundsRect = boundsEl.getBoundingClientRect()
  const els = boundsEl.querySelectorAll('[data-gelato-obstacle]')
  for (const el of els) {
    const r = el.getBoundingClientRect()
    if (r.width === 0 || r.height === 0) continue
    // Fattore di scala del box fisico (default 1). L'ancora logo Hero usa
    // 1.2 per allinearsi al LogoMorph reale ingrandito via GSAP, restando
    // di dimensione "base" come elemento di layout. Centro invariato → il
    // box cresce simmetrico attorno allo stesso punto.
    const factor = parseFloat(el.dataset.gelatoObstacle) || 1
    const w = r.width * factor
    const h = r.height * factor
    const cx = r.left - boundsRect.left + r.width / 2
    // Box gonfiato (factor > 1): la metà inferiore d'eccesso (0.1×h per 1.2)
    // farebbe sforare il bordo basso del logo. Alzo il centro di metà
    // dell'eccesso verticale, così il box resta allineato al bordo visivo.
    const cy = r.top - boundsRect.top + r.height / 2
                 - (r.height * (factor - 1)) / 2
    const body = Bodies.rectangle(cx, cy, w, h, wallOpts)
    // Salvo anche el: serve a syncButtonBodies() per leggere l'angolo CSS
    // (shake GSAP in Home.vue) e riportarlo sul Body static ogni frame.
    buttonBodies.push({ body, el })
  }

  addLetterBodies(boundsRect)

  if (buttonBodies.length) World.add(world, buttonBodies.map((b) => b.body))
}

// Sincronizza l'angolo dei box bottone col rotation CSS applicato via GSAP
// (shake). Estrae l'angolo dalla matrice 2D di getComputedStyle().transform
// con atan2(b, a) e lo applica al Body static. Solo angolo: lo shake anima
// rotation, non posizione (estendibile con Body.setPosition se servisse).
function syncButtonBodies() {
  if (!buttonBodies.length) return
  for (const { body, el } of buttonBodies) {
    const t = getComputedStyle(el).transform
    if (!t || t === 'none') {
      Body.setAngle(body, 0)
      continue
    }
    const m = new DOMMatrixReadOnly(t)
    Body.setAngle(body, Math.atan2(m.b, m.a))
  }
}

// 7 box di collisione, uno per lettera di "gelaboo", così i gelati si
// infilano negli spazi tra le lettere invece di fermarsi al rettangolo pieno.
// Le bbox arrivano in unità viewBox da LogoMorph.getLetterBBoxes() (statiche,
// immuni a scale/scroll). L'ancora heroLogoAnchor è in-flow → rect stabile
// nel sistema di boundsEl. Riapplico lo stesso scaling 1.2 centrato del logo
// (coerente con heroX/heroY in App.vue) all'ancora prima di mappare, così il
// fattore è già incorporato: nessun ×1.2 per-lettera.
function addLetterBodies(boundsRect) {
  const anchor = heroLogoAnchor.value
  const bboxes = logoMorph?.value?.getLetterBBoxes?.()
  if (!anchor || !bboxes?.length) return

  const a = anchor.getBoundingClientRect()
  if (a.width === 0 || a.height === 0) return

  // Ancora scalata 1.2 attorno al proprio centro.
  const sLeft = a.left - 0.1 * a.width
  const sTop = a.top - 0.1 * a.height
  const sW = a.width * 1.2
  const sH = a.height * 1.2
  letterScaleH = sH

  const bodies = []
  for (const bb of bboxes) {
    const w = (bb.width / VB_W) * sW
    const h = (bb.height / VB_H) * sH
    const cx = (sLeft - boundsRect.left) + (bb.x / VB_W) * sW + w / 2
    const cy = (sTop - boundsRect.top) + (bb.y / VB_H) * sH + h / 2
    const body = Bodies.rectangle(cx, cy, w, h, wallOpts)
    // baseX/baseY: posizione di riposo. render() ci somma l'offset floating.
    letterBodies.push({ body, baseX: cx, baseY: cy })
    bodies.push(body)
  }
  if (bodies.length) World.add(world, bodies)
}

// ---------- SPAWN UNA TANTUM AL CARICAMENTO ----------
function spawnAll() {
  for (let i = 0; i < NUM_OBJECTS; i++) {
    const size = Common.random(63, 108)
    const radius = size / 2
    const x = Common.random(radius, W - radius)
    const y = -size - Common.random(0, 900) // partono sopra lo schermo, a cascata

    const shape = SHAPES[Math.floor(Common.random(0, SHAPES.length))]
    // I coni (extraScale > 1) vengono ingranditi rispetto alla base comune,
    // le coppette restano a 1. Tutto il pezzo deriva da effectiveSize.
    const effectiveSize = size * shape.extraScale
    const width = effectiveSize * shape.ratio
    // Corpo rettangolare = dimensioni reali del div, ridotte del margine 0.85
    // (stesso respiro di prima) così le silhouette non si compenetrano.
    const body = Bodies.rectangle(x, y, width * 0.85, effectiveSize * 0.85, {
      restitution: 0.4,
      friction: 0.2,
      frictionAir: 0.014,
      density: 0.0018,
      angle: Common.random(0, Math.PI * 2),
    })
    Body.setAngularVelocity(body, Common.random(-0.04, 0.04))
    World.add(world, body)

    const el = document.createElement('div')
    el.className = 'piece'
    el.style.width = width + 'px'
    el.style.height = effectiveSize + 'px'
    el.innerHTML = shape.svg
    layerEl.value.appendChild(el)

    const item = { body, el, radius: effectiveSize / 2, halfWidth: width / 2, _restingOnLogo: false }
    items.push(item)
    bodyToItem.set(body, item)
  }
}

// ---------- INTERAZIONE MOUSE ----------
function onMouseMove(e) {
  const rect = boundsEl.getBoundingClientRect()
  prevMouseX = mouseX
  prevMouseY = mouseY
  mouseX = e.clientX - rect.left
  mouseY = e.clientY - rect.top // rect.top tiene già conto dello scroll di window
}

function applyMouseForce() {
  const vx = mouseX - prevMouseX
  const vy = mouseY - prevMouseY
  const speed = Math.min(Math.hypot(vx, vy), 40)

  for (const { body } of items) {
    const dx = body.position.x - mouseX
    const dy = body.position.y - mouseY
    const dist = Math.hypot(dx, dy)
    if (dist < MOUSE_RADIUS && dist > 0.01) {
      const falloff = 1 - dist / MOUSE_RADIUS
      const power = MOUSE_FORCE * falloff * (0.4 + speed / 40)
      Body.applyForce(body, body.position, {
        x: (dx / dist) * power,
        y: (dy / dist) * power - power * 0.3,
      })
      Body.setAngularVelocity(body, body.angularVelocity + (Common.random(-1, 1) * 0.04))
    }
  }
}

// Sincronizza i box lettera col floating del logo: ogni frame somma alla base
// l'offset y corrente (unità viewBox → pixel via letterScaleH/VB_H). Body
// statici: setPosition basta per la collisione posizionale. Accoppiamento per
// indice (stesso ordine DOM di getLetterBBoxes/getLetterOffsets).
function syncLetterBodies() {
  if (!letterBodies.length) return
  const offsets = logoMorph?.value?.getLetterOffsets?.()
  if (!offsets?.length) return
  for (let i = 0; i < letterBodies.length; i++) {
    const off = offsets[i]
    if (!off) continue
    const e = letterBodies[i]
    Body.setPosition(e.body, {
      x: e.baseX,
      y: e.baseY + (off.y / VB_H) * letterScaleH,
    })
  }
}

// Fade veloce (centinaia di ms) tocca SOLO lo stile di item.el: il Matter.Body
// resta in vita e continua fisica + forza mouse anche con opacity 0.
const FADE = 'opacity 150ms ease-out'

function fadeOutRestingItems() {
  // Snapshot degli item appoggiati sul logo al momento del primo scroll.
  frozenOnLogoItems = items.filter((it) => it._restingOnLogo)
  for (const it of frozenOnLogoItems) {
    it.el.style.transition = FADE
    it.el.style.opacity = '0'
  }
}

function fadeInRestingItems() {
  for (const it of frozenOnLogoItems) {
    it.el.style.transition = FADE
    it.el.style.opacity = '1'
  }
  frozenOnLogoItems = []
}

// ---------- LOOP ----------
function render() {
  applyMouseForce()
  syncLetterBodies()
  syncButtonBodies()
  // Reset flag + grafo adiacenza prima dello step: onCollisionActive
  // (dispatchato dentro Engine.update) li ricostruisce dai contatti correnti →
  // stato "appoggiato sul logo" sempre fresco, mai stale dopo un rimbalzo.
  for (const it of items) it._restingOnLogo = false
  restingAdjacency.clear()
  Engine.update(engine, 1000 / 60)
  // Dopo lo step: bounds dei letterBodies aggiornati → sweep box virtuale alto.
  markRestingByVirtualBox()
  // Propaga lo stato lungo le pile (gelato su gelato su logo).
  propagateRestingOnLogo()

  for (const { body, el, radius, halfWidth } of items) {
    const x = body.position.x - halfWidth
    const y = body.position.y - radius
    el.style.transform = `translate(${x}px, ${y}px) rotate(${body.angle}rad)`
  }

  rafId = requestAnimationFrame(render)
}

// ---------- RESIZE ----------
function onResize() {
  const b = getBounds()
  W = b.W
  H = b.H
  World.remove(world, [ground, leftWall, rightWall])
  addWalls()
  // Ricalcola gli ostacoli bottone: posizione/dimensione cambiano in responsive.
  if (buttonBodies.length) {
    World.remove(world, buttonBodies.map((b) => b.body))
    buttonBodies = []
  }
  // Stesso rebuild per i box lettera (posizione/scala cambiano in responsive).
  if (letterBodies.length) {
    World.remove(world, letterBodies.map((e) => e.body))
    letterBodies = []
  }
  addButtons()
  letterBodySet = new Set(letterBodies.map((e) => e.body))
}

// Init valido solo quando il container ha dimensioni reali (> 0).
// Ritorna true se ha inizializzato, false se ancora a dimensione 0.
function init() {
  if (started) return true
  const b = getBounds()
  if (b.W === 0 || b.H === 0) return false
  W = b.W
  H = b.H

  addWalls()
  addButtons()
  letterBodySet = new Set(letterBodies.map((e) => e.body))
  spawnAll() // una sola volta, niente interval

  window.addEventListener('resize', onResize)
  rafId = requestAnimationFrame(render)
  started = true
  return true
}

onMounted(() => {
  boundsEl = layerEl.value.parentElement

  engine = Engine.create()
  engine.gravity.y = GRAVITY
  world = engine.world

  window.addEventListener('mousemove', onMouseMove)

  // Tracking real-time dei gelati a riposo sul muro per-lettera del logo.
  Events.on(engine, 'collisionActive', onCollisionActive)

  // Edge-detection scroll: 0→>0 = primo scroll (fade out), ritorno a 0 = fade in.
  // wasAtTop evita di ritriggerare ad ogni micro-variazione durante lo scroll.
  stopScrollWatch = watch(scrollProgress, (p) => {
    if (wasAtTop && p > 0) {
      wasAtTop = false
      fadeOutRestingItems()
    } else if (!wasAtTop && p === 0) {
      wasAtTop = true
      fadeInRestingItems()
    }
  })

  // Se il container è già visibile, init subito; altrimenti aspetta che
  // ResizeObserver veda dimensioni > 0 (fine intro), poi disconnette.
  if (!init()) {
    resizeObserver = new ResizeObserver(() => {
      if (init()) {
        resizeObserver.disconnect()
        resizeObserver = null
      }
    })
    resizeObserver.observe(boundsEl)
  }
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  if (rafId) cancelAnimationFrame(rafId)
  if (stopScrollWatch) {
    stopScrollWatch()
    stopScrollWatch = null
  }
  if (engine) Events.off(engine, 'collisionActive', onCollisionActive)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('resize', onResize)
  for (const { el } of items) el.remove()
  items.length = 0
  bodyToItem.clear()
  letterBodySet = new Set()
  restingAdjacency.clear()
  frozenOnLogoItems = []
  // World.clear rimuove tutti i body; azzero anche i riferimenti locali.
  buttonBodies = []
  letterBodies = []
  if (world) World.clear(world, false)
  if (engine) Engine.clear(engine)
  engine = null
  world = null
})
</script>

<template>
  <div ref="layerEl" class="gelati-layer" aria-hidden="true" />
</template>

<style scoped>
.gelati-layer {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}
.gelati-layer :deep(.piece) {
  position: absolute;
  top: 0;
  left: 0;
  will-change: transform;
  transform-origin: center center;
}
.gelati-layer :deep(.piece svg) {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
