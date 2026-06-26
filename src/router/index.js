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
    path: '/profilo',
    name: 'Profilo',
    component: () => import('../views/Profilo.vue'),
  },
]

export default createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})
