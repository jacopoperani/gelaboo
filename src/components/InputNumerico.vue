<script setup>
const props = defineProps({
  modelValue: { type: Number, required: true },
  min:        { type: Number, default: 0 },
  max:        { type: Number, default: Infinity },
  step:       { type: Number, default: 1 },
  unita:      { type: String, default: '' },
  label:      { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

function onChange(e) {
  const v = parseFloat(e.target.value)
  if (!isNaN(v)) emit('update:modelValue', Math.min(props.max, Math.max(props.min, v)))
}
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="text-ui-label text-notte/60">{{ label }}</label>
    <div class="flex items-center border border-notte/20 rounded-xl overflow-hidden focus-within:border-notte transition-colors bg-perla">
      <input
        type="number"
        :value="modelValue"
        :min="min"
        :max="max"
        :step="step"
        @change="onChange"
        class="flex-1 bg-transparent px-3 py-2.5 text-notte outline-none text-data"
        style="font-variant-numeric: tabular-nums;"
        :aria-label="label || unita"
      />
      <span v-if="unita" class="px-3 text-notte/50 text-ui-label border-l border-notte/10 select-none">{{ unita }}</span>
    </div>
  </div>
</template>
