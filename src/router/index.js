import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import { lenis } from '../lib/lenis.js'

const routes = [
  { path: '/', name: 'Home', component: Home },
  {
    path: '/ricette',
    name: 'RicetteLista',
    component: () => import('../views/RicetteLista.vue'),
  },
  {
    path: '/ricette/:id',
    name: 'RicettaDettaglio',
    component: () => import('../views/RicettaDettaglio.vue'),
  },
  {
    path: '/crea',
    name: 'CustomBuilder',
    component: () => import('../views/CustomBuilder.vue'),
  },
  {
    path: '/guida',
    name: 'guida',
    component: () => import('../views/GuidaParametri.vue'),
  },
  {
    path: '/profilo',
    name: 'Profilo',
    component: () => import('../views/Profilo.vue'),
  },
]

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // Lenis controlla lo scroll: lo scrollBehavior nativo non avrebbe effetto.
  // scrollTo(0, immediate) porta in cima senza animazione a ogni cambio route.
  scrollBehavior: () => {
    lenis.scrollTo(0, { immediate: true })
  },
})
