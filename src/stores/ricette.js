import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import ricetteData from '../data/ricette.json'

export const useRicetteStore = defineStore('ricette', () => {
  const ricette = ref(ricetteData)
  const filtroCategoria = ref(null)

  const ricetteFiltrate = computed(() => {
    if (!filtroCategoria.value) return ricette.value
    return ricette.value.filter(r => r.categoria === filtroCategoria.value)
  })

  function getRicettaById(id) {
    return ricette.value.find(r => r.id === id) ?? null
  }

  function setFiltro(categoria) {
    filtroCategoria.value = categoria === filtroCategoria.value ? null : categoria
  }

  return { ricette, filtroCategoria, ricetteFiltrate, getRicettaById, setFiltro }
})
