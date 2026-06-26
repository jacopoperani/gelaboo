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
    <label v-if="label" class="text-ui-label text-inchiostro/60" style="font-family: Inter, sans-serif;">{{ label }}</label>
    <div class="flex items-center border border-inchiostro/20 rounded-xl overflow-hidden focus-within:border-inchiostro transition-colors bg-crema">
      <input
        type="number"
        :value="modelValue"
        :min="min"
        :max="max"
        :step="step"
        @change="onChange"
        class="flex-1 bg-transparent px-3 py-2.5 text-inchiostro outline-none text-data"
        style="font-family: Inter, sans-serif; font-variant-numeric: tabular-nums;"
        :aria-label="label || unita"
      />
      <span v-if="unita" class="px-3 text-inchiostro/50 text-ui-label border-l border-inchiostro/10 select-none" style="font-family: Inter, sans-serif;">{{ unita }}</span>
    </div>
  </div>
</template>
