<script setup>
import BoxMetrica from './BoxMetrica.vue'

defineProps({
  warnings:     { type: Array, default: () => [] },
  metricheGrid: { type: Array, required: true },
  metricheRiga: { type: Array, required: true },
})
</script>

<template>
  <div class="border border-notte/15 rounded-2xl p-6">
    <h2 class="text-h2 text-notte mb-5">Bilanciamento</h2>

    <!-- Warnings -->
    <div v-if="warnings.length" class="mb-5 space-y-2">
      <div
        v-for="w in warnings"
        :key="w.campo"
        class="flex items-start gap-2 text-body-small text-notte/80 rounded-xl px-3 py-2.5"
        style="background: rgba(232,148,74,0.15);"
        role="alert"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" class="mt-0.5 shrink-0" aria-hidden="true">
          <path d="M7 1.5L12.5 11H1.5L7 1.5Z" stroke="#E8954A" stroke-width="1.4" stroke-linejoin="round"/>
          <path d="M7 5.5v2.5" stroke="#E8954A" stroke-width="1.4" stroke-linecap="round"/>
          <circle cx="7" cy="9.5" r="0.65" fill="#E8954A"/>
        </svg>
        {{ w.msg }}
      </div>
    </div>

    <!-- Composizione -->
    <p class="text-ui-label text-notte/50 mb-3">Composizione</p>
    <div class="grid grid-cols-2 gap-3">
      <BoxMetrica
        v-for="m in metricheGrid"
        :key="m.label"
        :label="m.label"
        :valore="m.value"
        :unita="m.unita"
        :stato="m.stato"
      />
    </div>

    <!-- Indici -->
    <p class="text-ui-label text-notte/50 mb-3 mt-6">Indici</p>
    <div class="grid grid-cols-2 gap-3">
      <BoxMetrica
        v-for="m in metricheRiga"
        :key="m.label"
        :label="m.label"
        :valore="m.value"
        :unita="m.unita"
        :stato="m.stato"
      />
    </div>
  </div>
</template>
