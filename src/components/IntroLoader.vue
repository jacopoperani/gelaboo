<script setup>
import { onMounted } from 'vue'
const emit = defineEmits(['done'])
onMounted(() => emit('done'))
</script>
<template></template>
