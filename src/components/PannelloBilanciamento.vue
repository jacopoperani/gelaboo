<script setup>
defineProps({
  warnings:     { type: Array,  default: () => [] },
  metricheGrid: { type: Array,  required: true },
  metricheRiga: { type: Array,  required: true },
})

function statoColor(stato) {
  if (stato === 'sballato')   return '#c84b4b'
  if (stato === 'attenzione') return '#e8954a'
  return '#5f7a4e'
}
</script>

<template>
  <div class="border border-inchiostro/15 rounded-2xl p-6">
    <h2 class="text-h2 text-inchiostro mb-5">Bilanciamento</h2>

    <!-- Warnings -->
    <div v-if="warnings.length" class="mb-5 space-y-2">
      <div
        v-for="w in warnings"
        :key="w.campo"
        class="flex items-start gap-2 text-body-small text-inchiostro/80 bg-mandarino/15 rounded-xl px-3 py-2.5"
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

    <!-- 2×2 grid metrics -->
    <div class="grid grid-cols-2 gap-4 mb-5">
      <div v-for="m in metricheGrid" :key="m.label" class="relative">
        <div class="flex items-center gap-1.5 mb-1">
          <span
            v-if="m.stato"
            class="inline-block w-2 h-2 rounded-full shrink-0"
            :style="{ background: statoColor(m.stato) }"
            :aria-label="m.stato"
          ></span>
          <p class="text-ui-label text-inchiostro/50">{{ m.label }}</p>
        </div>
        <p class="text-data-large text-inchiostro" style="font-variant-numeric: tabular-nums;">
          {{ m.value }}<span class="text-h3 text-inchiostro/50">{{ m.unita }}</span>
        </p>
      </div>
    </div>

    <!-- Summary row -->
    <div class="border-t border-inchiostro/10 pt-4 space-y-3">
      <div
        v-for="m in metricheRiga"
        :key="m.label"
        class="flex justify-between items-center"
      >
        <div class="flex items-center gap-1.5">
          <span
            v-if="m.stato"
            class="inline-block w-2 h-2 rounded-full shrink-0"
            :style="{ background: statoColor(m.stato) }"
            :aria-label="m.stato"
          ></span>
          <span class="text-ui-label text-inchiostro/50">{{ m.label }}</span>
        </div>
        <span class="text-data text-inchiostro font-semibold" style="font-variant-numeric: tabular-nums;">
          {{ m.value }}{{ m.unita }}
        </span>
      </div>
    </div>
  </div>
</template>
