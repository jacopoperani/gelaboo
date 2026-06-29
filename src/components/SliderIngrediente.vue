<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Number, required: true },
  min:        { type: Number, required: true },
  max:        { type: Number, required: true },
  step:       { type: Number, default: 5 },
  label:      { type: String, default: '' },
  fasciaLo:   { default: null },
  fasciaHi:   { default: null },
})
const emit = defineEmits(['update:modelValue'])

function onInput(e) {
  emit('update:modelValue', parseInt(e.target.value, 10))
}

// Gradient CSS per la traccia: fascia "ok" = banda più scura di Notte dentro la track base
const trackStyle = computed(() => {
  const span = props.max - props.min
  if (span <= 0 || props.fasciaLo == null || props.fasciaHi == null) {
    return { background: 'rgba(22,27,51,0.13)' }
  }
  const pLo = Math.max(0, Math.min(100, ((props.fasciaLo - props.min) / span) * 100))
  const pHi = Math.max(0, Math.min(100, ((props.fasciaHi - props.min) / span) * 100))
  return {
    background: `linear-gradient(to right,
      rgba(22,27,51,0.13) 0%,
      rgba(22,27,51,0.13) ${pLo}%,
      rgba(22,27,51,0.32) ${pLo}%,
      rgba(22,27,51,0.32) ${pHi}%,
      rgba(22,27,51,0.13) ${pHi}%,
      rgba(22,27,51,0.13) 100%)`,
  }
})
</script>

<template>
  <div class="space-y-1.5">
    <div class="flex justify-between items-baseline">
      <label class="text-ui-label text-notte/60">{{ label }}</label>
      <span class="text-data text-notte">
        {{ modelValue }}<span class="text-body-small text-notte/50 ml-0.5">g</span>
      </span>
    </div>
    <input
      type="range"
      :value="modelValue"
      :min="min"
      :max="max"
      :step="step"
      @input="onInput"
      class="slider-ingrediente w-full cursor-pointer"
      :style="trackStyle"
      :aria-label="label"
      :aria-valuemin="min"
      :aria-valuemax="max"
      :aria-valuenow="modelValue"
    />
    <div class="flex justify-between items-center" style="font-size: 11px; font-weight: 500; letter-spacing: 0.04em; color: rgba(22,27,51,0.28);">
      <span>{{ min }}</span>
      <span
        v-if="fasciaLo != null && fasciaHi != null"
        style="font-size: 10px; color: rgba(22,27,51,0.45); font-weight: 600; letter-spacing: 0.03em;"
      >fascia ok {{ Math.round(fasciaLo) }}–{{ Math.round(fasciaHi) }}</span>
      <span v-else-if="fasciaLo === null && fasciaHi === null" style="font-size: 10px; color: rgba(22,27,51,0.3); font-weight: 500;">nessuna fascia ok</span>
      <span>{{ max }}</span>
    </div>
  </div>
</template>

<style scoped>
.slider-ingrediente {
  -webkit-appearance: none;
  appearance: none;
  height: 3px;
  border-radius: 2px;
  background: rgba(22, 27, 51, 0.15);
  outline: none;
  display: block;
}
.slider-ingrediente::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #161b33;
  cursor: pointer;
  border: 2px solid #f5f1fa;
  box-shadow: 0 0 0 1.5px #161b33;
  transition: transform 0.1s;
}
.slider-ingrediente::-webkit-slider-thumb:hover {
  transform: scale(1.15);
}
.slider-ingrediente::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #161b33;
  cursor: pointer;
  border: 2px solid #f5f1fa;
  box-shadow: 0 0 0 1.5px #161b33;
}
</style>
