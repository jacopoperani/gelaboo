<script setup>
// Vista statica di documentazione: spiega i parametri del bilanciamento.
// Contenuto guidato dai dati per tenere il template pulito; nessun calcolo,
// nessuna fonte esterna — solo testo di riferimento.

const parametri = [
  {
    nome: 'Grassi totali',
    range: '7–12% creme · sotto al 2% sorbetti',
    descrizione:
      "I grassi arrivano da latte, panna, tuorli e paste di frutta secca. Non solo danno gusto: si cristallizzano durante il raffreddamento creando una rete che intrappola le bolle d'aria. Più grassi = più cremosità e sensazione vellutata in bocca.",
    scenari: [
      { tipo: 'ok', label: 'OK', testo: 'Texture cremosa, si scioglie in bocca, buon overrun.' },
      { tipo: 'attenzione', label: 'Attenzione (bassi)', testo: 'Gelato acquoso, poca cremosità, si percepiscono cristalli di ghiaccio al palato.' },
      { tipo: 'sballato', label: 'Sballato (alti)', testo: 'Sensazione di grasso che non si scioglie, retrogusto pesante.' },
    ],
    correggere:
      'Usa lo slider della panna come leva principale. Per gusti con pasta (nocciola, pistacchio), ricorda che la pasta porta già il 60–65% di grassi.',
  },
  {
    nome: 'Zuccheri totali',
    range: '17–26% creme · 20–28% sorbetti',
    descrizione:
      'Include saccarosio e destrosio aggiunti, più il lattosio del latte (circa 4,8%) e gli zuccheri della frutta. Doppio ruolo: dolcificano e abbassano il punto di congelamento dell’acqua. Senza zuccheri il gelato sarebbe un blocco di ghiaccio.',
    scenari: [
      { tipo: 'ok', label: 'OK', testo: 'Dolcezza equilibrata, struttura morbida, non si indurisce troppo.' },
      { tipo: 'attenzione', label: 'Attenzione (bassi)', testo: 'Gelato duro, cristalli di ghiaccio grandi, difficile da spatolare.' },
      { tipo: 'sballato', label: 'Sballato (alti)', testo: 'Troppo dolce, collassa velocemente, aspetto lucido e molle.' },
    ],
    correggere:
      'Se alti, riduci il saccarosio. Se bassi, aggiungi destrosio (più anticongelante ma meno dolce del saccarosio).',
  },
  {
    nome: 'SLNG (Solidi Latte Non Grassi)',
    range: '7–12% (solo creme)',
    descrizione:
      'Tutto ciò che rimane del latte togliendo grassi e acqua — principalmente proteine (caseina) e lattosio. Le proteine stabilizzano l’emulsione e trattengono l’aria in mantecazione. Arrivano da latte, latte in polvere, panna.',
    scenari: [
      { tipo: 'ok', label: 'OK', testo: 'Corpo pieno, buon overrun, struttura vellutata e stabile nel tempo.' },
      { tipo: 'attenzione', label: 'Attenzione (bassi)', testo: 'Gelato "vuoto", poca struttura, tende a collassare, overrun scarso.' },
      { tipo: 'sballato', label: 'Sballato (alti)', testo: 'Eccesso di lattosio, cristallizzazione sabbiosa al palato dopo qualche giorno.' },
    ],
    correggere:
      'Aggiungi latte in polvere scremato (alza gli SLNG senza aggiungere grassi), oppure sostituisci parte della panna con latte intero.',
  },
  {
    nome: 'PAC — Potere AntiCongelante',
    range: '22–30% creme · 26–37% sorbetti',
    descrizione:
      'Il parametro più critico — determina la spatolabilità. È la somma del potere anticongelante di ogni zucchero presente: il destrosio ha un PAC molto più alto del saccarosio (molecola più piccola, abbassa di più il punto di congelamento). La temperatura di vetrina si stima approssimativamente come −(PAC% ÷ 2) per le creme.',
    scenari: [
      { tipo: 'ok', label: 'OK', testo: 'Gelato spatolabile, esce bene dal pozzetto alla temperatura calcolata.' },
      { tipo: 'attenzione', label: 'Attenzione (basso)', testo: 'Gelato duro, difficile o impossibile da spatolare.' },
      { tipo: 'sballato', label: 'Sballato (alto)', testo: 'Gelato troppo molle, si appiattisce nella vaschetta, nessuna struttura.' },
    ],
    correggere:
      'PAC basso → aumenta il destrosio. PAC alto → sostituisci parte del destrosio con saccarosio.',
  },
  {
    nome: 'POD — Potere Dolcificante',
    range: '15–21% creme · 17–24% sorbetti',
    descrizione:
      'Misura la dolcezza percepita complessiva della miscela. Non tutti gli zuccheri dolcificano allo stesso modo. È il parametro più soggettivo e tollerante: zabaione, malaga e frutta matura hanno naturalmente POD alto, ed è normale, non un errore.',
    scenari: [
      { tipo: 'ok', label: 'OK', testo: 'Dolcezza equilibrata, il gusto principale emerge bene.' },
      { tipo: 'attenzione', label: 'Attenzione (basso)', testo: 'Gelato poco dolce, gusto piatto — spesso cercato apposta per gusti intensi.' },
      { tipo: 'attenzione', label: 'Attenzione (alto)', testo: 'Stucchevole, la dolcezza copre l’aroma principale.' },
    ],
    correggere:
      'Per abbassare il POD, sostituisci saccarosio con destrosio (PAC simile, meno dolce). Per alzarlo, fai il contrario.',
  },
  {
    nome: 'Solidi totali',
    range: '36–44% creme · 30–34% sorbetti (varia secondo le fonti)',
    descrizione:
      'Tutto ciò che non è acqua nella miscela — grassi, zuccheri, proteine, cacao, paste. L’acqua libera è quella che congela formando cristalli: più solidi significa meno acqua libera e meno cristalli. Ma troppi solidi senza abbastanza acqua per scioglierli danno un gelato pastoso.',
    scenari: [
      { tipo: 'ok', label: 'OK', testo: 'Equilibrio acqua/solidi, struttura fine, nessuna granulosità.' },
      { tipo: 'attenzione', label: 'Attenzione (bassi)', testo: 'Troppa acqua libera, cristalli grandi, gelato acquoso e duro.' },
      { tipo: 'sballato', label: 'Sballato (alti)', testo: 'Pasta densa, sabbiosità da cristallizzazione del lattosio.' },
    ],
    correggere:
      'I solidi salgono automaticamente quando aumenti grassi, zuccheri o SLNG — raramente serve agire direttamente su questo parametro.',
  },
]

const leve = [
  { causa: 'Più destrosio', effetto: 'PAC sale (più morbido), POD scende (meno dolce)' },
  { causa: 'Più saccarosio', effetto: 'POD sale (più dolce), PAC sale meno del destrosio' },
  { causa: 'Più panna', effetto: 'Grassi salgono, cremosità aumenta, SLNG leggermente su' },
  { causa: 'Più latte in polvere', effetto: 'SLNG sale molto, grassi stabili, PAC leggermente su' },
  { causa: 'Più pasta (nocciola/pistacchio)', effetto: 'Grassi salgono molto (60–65%), serve ridurre la panna di pari passo' },
  { causa: 'Più tuorli', effetto: 'Grassi e SLNG salgono, emulsione migliora, struttura più ricca' },
  { causa: 'Più polpa frutta', effetto: 'Zuccheri e PAC salgono, intensità del gusto aumenta' },
  { causa: 'Più acqua nei sorbetti', effetto: 'PAC scende, gelato più duro — usare solo per correzioni fini' },
]

// I token semantici --color-stato-* valgono per gli stati ok/attenzione/sballato,
// mai i colori brand.
const statoColore = {
  ok: 'var(--color-stato-ok)',
  attenzione: 'var(--color-stato-attenzione)',
  sballato: 'var(--color-stato-sballato)',
}
</script>

<template>
  <main class="bg-perla text-notte min-h-screen pt-16">
    <div class="max-w-[800px] mx-auto px-6 py-16">
      <!-- 1. Header -->
      <header class="mb-12">
        <h1 class="text-display text-notte">Guida ai parametri</h1>
        <p class="text-lead text-notte/70 mt-3">
          Cosa significano i valori del bilanciamento, cosa succede se escono dal
          range e come correggerli
        </p>
      </header>

      <!-- 2. Callout introduttivo -->
      <div
        class="rounded-2xl border-[1.5px] p-6 mb-16"
        style="border-color: var(--color-indaco); background: rgba(75,63,138,0.08);"
      >
        <p class="text-body text-notte/85">
          Non è obbligatorio avere tutti i quadrati verdi. I parametri sono strumenti
          di orientamento, non voti scolastici — e i range possono variare leggermente
          a seconda della fonte e dello stile del gelatiere. Un gelatiere professionista
          esce deliberatamente dai range per ottenere caratteristiche specifiche:
          zabaione, malaga e gusti con frutta matura hanno naturalmente POD alto. Quello
          che conta davvero è che il PAC sia in range (determina la spatolabilità) e che
          il gelato sia buono all’assaggio.
        </p>
      </div>

      <!-- 3. Schede parametro -->
      <section class="grid md:grid-cols-2 gap-5 mb-16">
        <article
          v-for="p in parametri"
          :key="p.nome"
          class="rounded-2xl border-[1.5px] border-notte/15 p-6 flex flex-col"
        >
          <h2 class="text-h3 text-notte">{{ p.nome }}</h2>
          <span
            class="inline-flex self-start items-center px-2.5 py-0.5 mt-2 rounded-full text-ui-label border border-notte/20 text-notte/70"
          >{{ p.range }}</span>

          <p class="text-body-small text-notte/80 mt-4">{{ p.descrizione }}</p>

          <ul class="mt-4 space-y-2.5">
            <li
              v-for="(s, i) in p.scenari"
              :key="i"
              class="flex items-start gap-2.5"
            >
              <span
                class="w-2 h-2 rounded-full mt-1.5 shrink-0"
                :style="{ backgroundColor: statoColore[s.tipo] }"
                aria-hidden="true"
              />
              <p class="text-body-small text-notte/80">
                <span class="font-medium text-notte">{{ s.label }}:</span>
                {{ s.testo }}
              </p>
            </li>
          </ul>

          <p class="text-body-small text-notte/70 mt-4 pt-4 border-t border-notte/10">
            <span class="font-medium text-notte">Come correggere:</span>
            {{ p.correggere }}
          </p>
        </article>
      </section>

      <!-- 4. Come usare gli slider -->
      <section class="mb-16">
        <h2 class="text-h2 text-notte mb-5">
          Come usare gli slider per correggere i parametri
        </h2>
        <ul class="rounded-2xl border-[1.5px] border-notte/15 divide-y divide-notte/10">
          <li
            v-for="(l, i) in leve"
            :key="i"
            class="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 px-5 py-3.5"
          >
            <span class="text-body-small font-medium text-notte sm:w-56 shrink-0">{{ l.causa }}</span>
            <span class="text-body-small text-notte/75">{{ l.effetto }}</span>
          </li>
        </ul>
      </section>

      <!-- 5. Temperatura di servizio -->
      <section>
        <h2 class="text-h2 text-notte mb-5">
          Come interpretare la temperatura di servizio
        </h2>
        <div class="space-y-4 text-body-small text-notte/80">
          <p>
            La temperatura mostrata è quella a cui impostare vetrina o freezer, stimata
            a partire dal PAC della ricetta. Il gelato servito nel cono o nella coppetta
            sarà qualche grado più caldo, perché si scalda in superficie in pochi minuti
            fuori dal pozzetto.
          </p>
          <p>
            <span class="font-medium text-notte">Gelato troppo duro quando lo servi?</span>
            Alza la temperatura della vetrina di 1–2°C, oppure aumenta il destrosio nella
            ricetta.
          </p>
          <p>
            <span class="font-medium text-notte">Gelato troppo molle?</span>
            Abbassa la temperatura di 1–2°C, oppure sostituisci parte del destrosio con
            saccarosio.
          </p>
        </div>
      </section>
    </div>
  </main>
</template>
