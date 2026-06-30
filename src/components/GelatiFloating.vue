<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import Matter from 'matter-js'

const { Engine, World, Bodies, Body, Common } = Matter

// ---------- CONFIG ----------
const NUM_OBJECTS = 45
const MOUSE_RADIUS = 140
const MOUSE_FORCE = 0.06
const GRAVITY = 0.3

// ---------- ILLUSTRAZIONI GELATI (flat, disegnate a mano in SVG) ----------
// Ogni funzione restituisce un markup SVG completo, viewBox 64x64.
// Palette ufficiale "gelateria anni '50" — UNICI colori ammessi:
// Perla #F5F1FA, Notte #161B33, Indaco #4B3F8A, Fucsia #D6418C, Turchese #2BC4C9, Bruciato #E0703A
const SHAPES = [

  // 1. cono singola pallina — Fucsia
  () => `<svg viewBox="0 0 64 64" width="100%" height="100%">
    <path d="M22 30 L42 30 L33 58 Z" fill="#E0703A"/>
    <line x1="25" y1="35" x2="40" y2="41" stroke="#161B33" stroke-width="1" opacity="0.25"/>
    <line x1="24" y1="41" x2="39" y2="47" stroke="#161B33" stroke-width="1" opacity="0.25"/>
    <line x1="26" y1="47" x2="36" y2="52" stroke="#161B33" stroke-width="1" opacity="0.25"/>
    <circle cx="32" cy="20" r="16" fill="#D6418C"/>
    <circle cx="26" cy="15" r="3" fill="#F5F1FA" opacity="0.55"/>
  </svg>`,

  // 2. cono doppia pallina — Indaco + Turchese
  () => `<svg viewBox="0 0 64 64" width="100%" height="100%">
    <path d="M23 34 L41 34 L32 58 Z" fill="#E0703A"/>
    <line x1="26" y1="38" x2="38" y2="44" stroke="#161B33" stroke-width="1" opacity="0.25"/>
    <line x1="25" y1="44" x2="37" y2="50" stroke="#161B33" stroke-width="1" opacity="0.25"/>
    <circle cx="32" cy="30" r="13" fill="#4B3F8A"/>
    <circle cx="32" cy="14" r="13" fill="#2BC4C9"/>
    <circle cx="27" cy="9" r="3" fill="#F5F1FA" opacity="0.55"/>
  </svg>`,

  // 3. cono soft-swirl — Perla con punta Fucsia
  () => `<svg viewBox="0 0 64 64" width="100%" height="100%">
    <path d="M24 32 L40 32 L32 58 Z" fill="#E0703A"/>
    <line x1="27" y1="36" x2="37" y2="41" stroke="#161B33" stroke-width="1" opacity="0.25"/>
    <line x1="26" y1="42" x2="36" y2="47" stroke="#161B33" stroke-width="1" opacity="0.25"/>
    <path d="M20 30 C20 18 28 8 32 14 C36 8 44 18 44 30 C44 24 38 22 32 26 C26 22 20 24 20 30 Z" fill="#F5F1FA"/>
    <path d="M20 30 C20 18 28 8 32 14 C36 8 44 18 44 30 C44 24 38 22 32 26 C26 22 20 24 20 30 Z" fill="none" stroke="#161B33" stroke-width="1" opacity="0.15"/>
    <circle cx="32" cy="10" r="2.5" fill="#D6418C"/>
  </svg>`,

  // 4. coppetta con due palline — Bruciato + Turchese
  () => `<svg viewBox="0 0 64 64" width="100%" height="100%">
    <path d="M16 34 L48 34 L43 54 a8 8 0 0 1 -8 7 L29 61 a8 8 0 0 1 -8 -7 Z" fill="#F5F1FA"/>
    <ellipse cx="32" cy="34" rx="16" ry="4" fill="#161B33" opacity="0.08"/>
    <circle cx="24" cy="24" r="11" fill="#E0703A"/>
    <circle cx="38" cy="22" r="12" fill="#2BC4C9"/>
    <circle cx="34" cy="16" r="2.5" fill="#F5F1FA" opacity="0.55"/>
  </svg>`,

  // 5. coppetta singola pallina grande — Indaco
  () => `<svg viewBox="0 0 64 64" width="100%" height="100%">
    <path d="M16 32 L48 32 L42 53 a10 10 0 0 1 -20 0 Z" fill="#F5F1FA"/>
    <ellipse cx="32" cy="32" rx="16" ry="4" fill="#161B33" opacity="0.08"/>
    <circle cx="32" cy="20" r="15" fill="#4B3F8A"/>
    <circle cx="25" cy="13" r="3" fill="#F5F1FA" opacity="0.45"/>
  </svg>`,

  // 6. coppetta tre palline — Fucsia, Bruciato, Turchese
  () => `<svg viewBox="0 0 64 64" width="100%" height="100%">
    <path d="M14 36 L50 36 L43 56 a10 10 0 0 1 -22 0 Z" fill="#F5F1FA"/>
    <ellipse cx="32" cy="36" rx="18" ry="4" fill="#161B33" opacity="0.08"/>
    <circle cx="22" cy="28" r="9" fill="#D6418C"/>
    <circle cx="32" cy="22" r="10" fill="#E0703A"/>
    <circle cx="42" cy="28" r="9" fill="#2BC4C9"/>
  </svg>`,
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
    buttonBodies.push(body)
  }
  if (buttonBodies.length) World.add(world, buttonBodies)
}

// ---------- SPAWN UNA TANTUM AL CARICAMENTO ----------
function spawnAll() {
  for (let i = 0; i < NUM_OBJECTS; i++) {
    const size = Common.random(42, 72)
    const radius = size / 2
    const x = Common.random(radius, W - radius)
    const y = -size - Common.random(0, 900) // partono sopra lo schermo, a cascata

    const body = Bodies.circle(x, y, radius * 0.85, {
      restitution: 0.4,
      friction: 0.2,
      frictionAir: 0.014,
      density: 0.0018,
      angle: Common.random(0, Math.PI * 2),
    })
    Body.setAngularVelocity(body, Common.random(-0.04, 0.04))
    World.add(world, body)

    const shapeFn = SHAPES[Math.floor(Common.random(0, SHAPES.length))]

    const el = document.createElement('div')
    el.className = 'piece'
    el.style.width = size + 'px'
    el.style.height = size + 'px'
    el.innerHTML = shapeFn()
    layerEl.value.appendChild(el)

    items.push({ body, el, radius })
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

// ---------- LOOP ----------
function render() {
  applyMouseForce()
  Engine.update(engine, 1000 / 60)

  for (const { body, el, radius } of items) {
    const x = body.position.x - radius
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
    World.remove(world, buttonBodies)
    buttonBodies = []
  }
  addButtons()
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
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('resize', onResize)
  for (const { el } of items) el.remove()
  items.length = 0
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
</style>
