# gelaboo — contesto di progetto

Calcolatore di ingredienti per gelato artigianale. Progetto d'esame per Web Design 2 (Vue con routing, componenti, integrazione dati esterni). Target: utenti prosumer che hanno già una gelatiera e ingredienti professionali — non un sito per principianti.

**Funzionalità chiave**: gusti preset con calcoli integrati, builder per gusto personalizzato, ricette browsabili per categoria, account con ricette salvate e like.

## Vincoli d'esame (non negoziabili)

- Tier di complessità più alto richiesto dal corso: Vue con routing, componenti con props, dinamica lista/dettaglio, caricamento dati da fonte esterna via API.
- Va prodotto anche un elaborato Figma con variabili e componenti, collegato a questo stesso progetto.
- Il programma valuta lavoro personale e qualità, non quantità: evitare di affidarsi a codice generato in blocco senza comprenderlo o poterlo spiegare.

## Stack tecnico

- Frontend: Vue 3 + Vite, Tailwind CSS, Pinia
- Animazioni: GSAP, ScrollTrigger, SplitText, Lenis — nessuna libreria di animazione aggiuntiva, questa base basta
- Composables/utility: VueUse (debounce ricalcolo, cache local storage)
- Grafici: vue-chartjs o vue3-apexcharts (bilancio zuccheri/grassi/solidi)
- Icone: lucide-vue-next
- Notifiche: vue3-toastify
- Backend/auth: Firebase (piano Spark) — Firestore + Authentication
- AI: Gemini API (Google AI Studio, tier free) per classificazione ingredienti, mai per i calcoli
- Proxy serverless: Vercel/Netlify/Cloudflare Workers (free tier) per non esporre la API key
- Hosting: GitHub Pages (gh-pages)
- Editor: Visual Studio Code

**Da evitare**: librerie UI complete (Vuetify, PrimeVue) — appiattirebbero il lavoro di design personale. Form validation: solo se il calcolatore custom diventa più complesso.

## Principi guida (regole fisse)

1. **Calcolo sempre deterministico.** Il motore di bilanciamento gelato è JS puro. L'AI non fa mai i conti — entra in gioco solo per classificare ingredienti sconosciuti, poi il codice deterministico fa la matematica.
2. **Colori accento = decorazione, non dati.** Menta / Ciliegia / Mandarino / Pistacchio scuro solo per tag e dettagli visivi. Ogni numero o dato di calcolo usa Inchiostro su Crema.
3. **Core prima, AI dopo.** Il calcolatore deve funzionare completamente senza AI prima di aggiungere l'integrazione Gemini come livello opzionale.
4. **Niente librerie a caso.** Solo le librerie elencate nello stack sopra, ognuna scelta per uno scopo preciso — non accumulare strumenti senza motivo.
5. **Accesso libero, login solo per salvare.** Ricette e calcolatore sono visibili e usabili da chiunque senza account. Il login (Google) serve solo per salvare ricette custom e mettere like — dettagli in `docs/site-structure.md`.

## Skill Claude Code: ui-ux-pro-max

Disponibile in Claude Code per la fase di coding Vue — **non** per la fase Figma, dove design e palette sono già decisi.

- Usarla sempre con riferimento esplicito a `docs/design-system.md` — mai lasciarle proporre uno stile o una palette alternativa, quella scelta è chiusa.
- Utile per: checklist di accessibilità (contrasto, ARIA, keyboard nav), stati che Figma non mostra (hover, focus, responsive), pattern Vue idiomatici per modal/form, scelta del tipo di grafico per il bilancio ingredienti.

## Documenti collegati

- `docs/design-system.md` — palette, tipografia, logo, regole d'uso
- `docs/architecture.md` — architettura tecnica (Vue, Firebase, Gemini, proxy, caching)
- `docs/site-structure.md` — sitemap, navigazione, flussi (crea gusto, like/salva), componenti Vue, schema Firestore
- `docs/gelato-reference.md` — riferimento tecnico gelato: POD/PAC, range per categoria, formula SLNG, stabilizzanti, database ingredienti

## Stato attuale / prossimo passo

Da aggiornare man mano — questa sezione cambia spesso, a differenza del resto del file.

Definiti: sitemap, navigazione, componenti Vue previsti, schema Firestore (vedi `docs/site-structure.md`); palette v2 "anni '50" e principi di animazione (vedi `docs/design-system.md`).

Aperti: organizzazione precisa delle categorie di gusti base; gestione delle unità di misura nel calcolatore (litri/kg/porzioni); mapping colore accento ↔ categoria gusto.

Ultimo aggiornamento: palette e font aggiornati alla direzione "anni '50". Prossimo passo: sessione Figma.
