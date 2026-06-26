# Architettura tecnica — gelaboo

## Principio cardine

Il calcolo del bilanciamento gelato è sempre deterministico (JS puro). L'AI non fa mai i conti: serve solo a classificare ingredienti sconosciuti e stimare dati nutrizionali quando l'utente inserisce qualcosa che non è già nel database locale.

## Flusso dati per un ingrediente sconosciuto

1. L'utente inserisce un ingrediente non presente in cache.
2. Il frontend chiama una funzione serverless (il "postino"), non l'API Gemini direttamente — per non esporre la API key nel codice client.
3. Il proxy chiama Gemini Flash-Lite (o Groq) per classificazione e stima nutrizionale.
4. Il risultato viene salvato in cache locale: l'AI non viene richiamata di nuovo per lo stesso ingrediente.
5. Il motore di calcolo deterministico usa il dato classificato per il bilanciamento finale.

## Stack e motivazioni

- **Vue 3 + Vite** — scelto sopra un sito statico per ricalcolo reattivo, navigazione lista→dettaglio e gestione dello stato; soddisfa anche il tier di complessità più alto richiesto dal corso.
- **Pinia** — stato globale: ricette salvate, utente, cache ingredienti classificati.
- **Firebase (piano Spark)** — autenticazione (Google login via `signInWithPopup`) e Firestore per le ricette salvate. Gratuito senza carta di credito, limiti generosi per lo scope dell'esame. Alternativa valida: Supabase, ma va in pausa dopo inattività.
- **Gemini API (Google AI Studio, tier free)** — fino a 1.500 richieste/giorno sui modelli Flash. Restrizione referrer HTTP sulla key come soluzione pragmatica per lo scope esame.
- **Proxy serverless (Vercel / Netlify / Cloudflare Workers, free tier)** — unico compito: fare da intermediario tra frontend e Gemini, tenendo la key fuori dal codice client.
- **Hosting (GitHub Pages, gh-pages)** — deploy statico del build Vue.

## Librerie frontend aggiuntive

Oltre alla base GSAP + ScrollTrigger + SplitText + Lenis (solo per le sezioni hero/marketing):

- **VueUse** — composables pronti, in particolare per il debounce sul ricalcolo automatico e per la cache locale degli ingredienti già classificati.
- **vue-chartjs o vue3-apexcharts** — per visualizzare il bilancio zuccheri/grassi/solidi della ricetta come grafico, non solo come numeri.
- **lucide-vue-next** — set di icone coerente con lo stile del progetto.
- **vue3-toastify** — notifiche di feedback (ricetta salvata, ingrediente classificato, errori).

Scartate deliberatamente: librerie UI complete (Vuetify, PrimeVue), perché appiattirebbero il lavoro di design personale richiesto dall'esame; librerie di validazione form, da valutare solo se il builder custom diventa più complesso; librerie di animazione extra (Three.js, Barba.js, Swiper, Anime.js) — utili per un sito generico multipagina/visivo, ma non necessarie per il taglio funzionale di gelaboo.

## Sequenza di implementazione consigliata

1. Struttura Vue: routing + componenti base, senza AI.
2. Calcolatore completo e funzionante con il motore deterministico.
3. Persistenza ricette (Firebase: auth + Firestore).
4. Integrazione Gemini come livello aggiuntivo — sessione dedicata futura, non mischiata con lo sviluppo del core.

## Workflow Figma → Vue (per i singoli componenti)

Per ogni componente Vue, si parte dal frame corrispondente in Figma (variabili + componenti già definiti in `design-system.md`) e si usa il Figma MCP server per ottenere `get_design_context` come riferimento di specifiche (colori, spaziature, tipografia) — non come codice da copiare integralmente. Il componente Vue va scritto/adattato a mano, mantenendo la disciplina dei token.
