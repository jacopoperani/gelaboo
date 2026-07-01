import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

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
  {
    path: '/ricette-custom/:id',
    name: 'RicettaCustomDettaglio',
    component: () => import('../views/RicettaCustomDettaglio.vue'),
  },
]

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // Lo scroll a inizio pagina è gestito dentro la transition di route in
  // App.vue (onEnter, prima del fade-in) per sincronizzarlo col ciclo Lenis
  // ed evitare scatti a metà transizione. Qui disattivato.
  scrollBehavior: false,
})
