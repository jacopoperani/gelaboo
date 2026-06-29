<script setup>
defineProps({
  procedimento: { type: Array,  required: true },
  notaTecnica:  { type: String, default: null },
})
</script>

<template>
  <div class="border border-notte/15 rounded-2xl p-6 lg:p-8">
    <p
      v-if="notaTecnica"
      class="text-body-small text-notte/55 italic mb-6 leading-relaxed"
    >
      {{ notaTecnica }}
    </p>

    <h2 class="text-h2 text-notte mb-5">Procedimento</h2>

    <ol class="space-y-4" v-if="procedimento?.length">
      <li
        v-for="(step, i) in procedimento"
        :key="i"
        class="flex gap-4"
      >
        <span
          class="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-perla text-ui-label"
          style="background: #161b33; font-size: 11px; font-weight: 600; margin-top: 1px;"
        >{{ i + 1 }}</span>
        <p class="text-body text-notte/80 leading-relaxed">{{ step }}</p>
      </li>
    </ol>
  </div>
</template>
