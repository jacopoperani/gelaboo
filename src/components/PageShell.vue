<script setup>
// Container di pagina riusabile: unifica max-width, padding laterale e
// top-offset sotto l'header fixed. <main> resta unico in App.vue, qui
// usiamo sempre <section>.
//
// L'outer è SEMPRE largo --container-page e centrato: definisce il bordo
// sinistro condiviso da tutte le pagine. La variante 'prose' non si
// ricentra da sola — restringe il contenuto via wrapper interno ancorato
// a sinistra (margin-inline-end: auto), così parte dallo stesso punto a
// sinistra di una pagina 'page' e finisce solo prima a destra.
//
// topOffset: solo il PRIMO PageShell di una pagina deve riservare lo
// spazio per l'header fisso. Se una pagina ne impila più d'uno, i
// successivi vanno con :top-offset="false" per non duplicare il vuoto.
const props = defineProps({
  width: {
    type: String,
    default: 'page',
    validator: (v) => ['page', 'prose'].includes(v),
  },
  topOffset: {
    type: Boolean,
    default: true,
  },
})

const innerMaxWidth = props.width === 'prose'
  ? 'var(--container-prose)'
  : 'none'
</script>

<template>
  <section class="page-shell" :class="{ 'page-shell--no-top': !topOffset }">
    <div class="page-shell__inner" :style="{ maxWidth: innerMaxWidth }">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.page-shell {
  max-width: var(--container-page);
  margin-inline: auto;
  padding-inline: clamp(1rem, 4vw, 2rem);
  padding-top: var(--header-offset);
}
.page-shell--no-top {
  padding-top: 0;
}
.page-shell__inner {
  /* Ancorato a sinistra: in 'prose' resta allineato al bordo sinistro
     del container page invece di centrarsi. */
  margin-inline-end: auto;
}
</style>
