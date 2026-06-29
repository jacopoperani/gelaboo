<script setup>
import { computed } from 'vue'

const props = defineProps({
  label:  { type: String, required: true },
  valore: { type: [String, Number], required: true },
  unita:  { type: String, default: '' },
  stato:  { type: String, default: null },
})

const boxClass = computed(() => {
  if (props.stato === 'ok')         return 'box-ok'
  if (props.stato === 'attenzione') return 'box-attenzione'
  if (props.stato === 'sballato')   return 'box-sballato'
  return 'box-neutro'
})
</script>

<template>
  <div class="rounded-2xl border-[1.5px] p-5" :class="boxClass">
    <p class="text-ui-label text-notte/50 mb-2">{{ label }}</p>
    <p class="text-data-large text-notte">
      {{ valore }}<span v-if="unita" class="text-body-small text-notte/50 ml-1">{{ unita }}</span>
    </p>
  </div>
</template>
