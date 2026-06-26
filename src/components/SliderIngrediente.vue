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

// Gradient CSS per la traccia: fascia "ok" = banda più scura di Inchiostro dentro la track base
const trackStyle = computed(() => {
  const span = props.max - props.min
  if (span <= 0 || props.fasciaLo == null || props.fasciaHi == null) {
    return { background: 'rgba(58,35,23,0.13)' }
  }
  const pLo = Math.max(0, Math.min(100, ((props.fasciaLo - props.min) / span) * 100))
  const pHi = Math.max(0, Math.min(100, ((props.fasciaHi - props.min) / span) * 100))
  // base track: rgba(58,35,23,0.13) — Inchiostro tenue
  // fascia ok:  rgba(58,35,23,0.32) — Inchiostro più marcato (no colori accent)
  return {
    background: `linear-gradient(to right,
      rgba(58,35,23,0.13) 0%,
      rgba(58,35,23,0.13) ${pLo}%,
      rgba(58,35,23,0.32) ${pLo}%,
      rgba(58,35,23,0.32) ${pHi}%,
      rgba(58,35,23,0.13) ${pHi}%,
      rgba(58,35,23,0.13) 100%)`,
  }
})
</script>

<template>
  <div class="space-y-1.5">
    <div class="flex justify-between items-baseline">
      <label class="text-ui-label text-inchiostro/60" style="font-family: Inter, sans-serif;">{{ label }}</label>
      <span style="font-family: Inter, sans-serif; font-size: 15px; font-weight: 500; font-variant-numeric: tabular-nums; color: #3a2317;">
        {{ modelValue }}<span style="font-size: 13px; color: rgba(58,35,23,0.5); margin-left: 2px;">g</span>
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
    <div class="flex justify-between items-center" style="font-family: Inter, sans-serif; font-size: 11px; font-weight: 500; letter-spacing: 0.04em; color: rgba(58,35,23,0.28);">
      <span>{{ min }}</span>
      <span
        v-if="fasciaLo != null && fasciaHi != null"
        style="font-size: 10px; color: rgba(58,35,23,0.45); font-weight: 600; letter-spacing: 0.03em;"
      >fascia ok {{ Math.round(fasciaLo) }}–{{ Math.round(fasciaHi) }}</span>
      <span v-else-if="fasciaLo === null && fasciaHi === null" style="font-size: 10px; color: rgba(58,35,23,0.3); font-weight: 500;">nessuna fascia ok</span>
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
  background: rgba(58, 35, 23, 0.15);
  outline: none;
  display: block;
}
.slider-ingrediente::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #3a2317;
  cursor: pointer;
  border: 2px solid #fbf3e7;
  box-shadow: 0 0 0 1.5px #3a2317;
  transition: transform 0.1s;
}
.slider-ingrediente::-webkit-slider-thumb:hover {
  transform: scale(1.15);
}
.slider-ingrediente::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #3a2317;
  cursor: pointer;
  border: 2px solid #fbf3e7;
  box-shadow: 0 0 0 1.5px #3a2317;
}
</style>
