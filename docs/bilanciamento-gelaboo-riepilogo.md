# gelaboo — Riepilogo sessione bilanciamento ricette

Documento di riferimento per riprendere il lavoro su ingredienti/ricette in una chat nuova, o per Claude Code. Non sostituisce `docs/gelato-reference.md` (le formule restano lì) — qui c'è il *metodo* di lavoro e lo stato attuale.

## Stato finale del catalogo

**30 ricette, 39 ingredienti**, tutte verificate numericamente contro i range target e centrate nella fascia *ottimale* (non solo "accettabile") dove possibile.

| Categoria | Ricette | Note |
|---|---|---|
| Crema | 7 | Fior di Panna, Cioccolato, Pistacchio, Nocciola, Caffè, Stracciatella, Zabaione, Crema |
| Frutta | 6 | Fragola, Banana, Pesca, Mango, Ananas, Frutti di Bosco |
| Sorbetto | 9 | Limone, Lampone, Arancia, Melone, Pera, Kiwi, Mandarino, Anguria, Pompelmo |
| Vegano | 7 | Cocco, Noci, Mandorla, Cioccolato, Pistacchio, Nocciola, Matcha |

(7+6+9+7 = 29, +1 Crema aggiunta per ultima = 30 — la tabella sopra è già aggiornata)

## Architettura dati

- `src/data/ingredienti.json` — database ingredienti condiviso. Ogni voce: `nome, zuccheri, grassi, slng, altri, pod, pac, verificato (bool), nota (opzionale)`.
- `src/data/ricette.json` — array di ricette. Ogni ricetta referenzia ingredienti per `id` + `g_per_kg` (non li duplica). Campi: `id, nome, categoria, payoff, ingredienti[], ingredientiModificabili[], procedimento[], notaTecnica, eccezioniSoglie[] (opzionale)`.
- Una funzione di join (`risolviIngredienti()` in `useCalcolatore.js`) unisce i riferimenti della ricetta con i dati canonici prima di chiamare `bilanciaRicetta()`. Il motore di calcolo non sa nulla di come sono storati i dati.
- `eccezioniSoglie`: array di stringhe (`"solidi"`, `"altri"` — nomi corti, coerenti con le chiavi di `THRESHOLDS`, non con i nomi lunghi del bilancio) per i parametri che una ricetta specifica è autorizzata a non rispettare, per un motivo strutturale documentato in `notaTecnica`. Rispettato sia da `fasciaCorretta()` (slider) sia dai banner di warning.

## Target di bilanciamento per categoria (fascia ottimale, usata per nuove ricette)

```
crema:    zuccheri 16-22  grassi 6-10  slng 8-11   solidi 36-42  pod 13-17.5  pac 22-27
frutta:   zuccheri 22-27* grassi 0-4               solidi 30-38  pod 13-19.5  pac 22-30
sorbetto: zuccheri 22-28* (no grassi/slng)          solidi 28-34  pod 20-23.5  pac 27.5-37.5
vegano:   zuccheri 16-22  grassi 5-12  altri 7-17   solidi 32-40  pod 13-17.5  pac 22-27
```
\* range *accettabile* più ampio fino a 27/30 — vedi nota sotto su perché spesso non c'è margine per centrare oltre un certo punto.

## Metodologia per aggiungere un nuovo ingrediente

1. Cercare il valore nutrizionale (zuccheri%, altri%) su fonti esterne (CREA/USDA via Dietabit, Humanitas, Torrinomedica, ecc.) — **mai fidarsi ciecamente di `gelato-reference.md` §7**: contiene almeno un errore reale già trovato e corretto (limone, melone).
2. POD/PAC: se non esiste un indice gelato specifico per quell'ingrediente, riusare gli indici di ingredienti simili già in catalogo (es. tutta la frutta usa POD90/PAC130 come convenzione semplificata) o impostare 0/0 se l'ingrediente non contiene zuccheri (proteine/fibre pure, come paste di frutta secca o tuorlo d'uovo).
3. Marcare `verificato: true/false` + `nota` con la fonte o il motivo dell'incertezza.
4. Ingredienti usati in dosi minime (caffè, matcha, vaniglia, coloranti) hanno un impatto marginale sul bilancio finale — non serve precisione estrema, basta una stima ragionevole con nota.

## Metodologia per aggiungere/modificare una ricetta

1. Scrivere una bozza di ingredienti e quantità (`g_per_kg`, base 1kg).
2. **Calcolare il bilancio con uno script Python** (replica la formula di `bilanciaRicetta()`) prima di scrivere qualsiasi file — non aspettare che lo scopra il sito.
3. Se un parametro non rientra: o aggiustare le proporzioni (spesso serve una *ricerca a griglia* su saccarosio/destrosio/glucosio, non un singolo tentativo a mano), oppure — se il parametro è strutturalmente irraggiungibile con gli ingredienti disponibili (es. "altri solidi" nel vegano, limitato dalla dose di sicurezza dell'inulina; "solidi totali" nelle creme a frutta secca, per i grassi vegetali) — documentarlo in `notaTecnica` e aggiungere il parametro a `eccezioniSoglie`.
4. Aggiornare `ingredientiModificabili` (min/max degli slider) perché contengano il nuovo valore corrente — **errore commesso più volte oggi**: cambiare le quantità senza aggiornare i range degli slider, lasciando il valore attuale fuori da min/max.
5. Controllare che `procedimento` e `notaTecnica` non citino per nome un ingrediente che è stato rimosso o sostituito.

## Errori commessi oggi, da non ripetere

- **Eseguire una ricerca a griglia *prima* di salvare su disco una correzione precedente** → la ricerca usa ancora il vecchio dato. Sempre: salva la correzione, *poi* ricarica da disco per la ricerca successiva.
- **Fidarsi del risultato di uno script senza rileggerlo da disco nello stesso passaggio.** Pattern ormai stabilito e da riusare sempre: definisci esplicitamente → verifica → scrivi *solo se* tutto ok → ricarica da disco e confronta che corrisponda esattamente a quanto appena calcolato.
- **Verificare solo le ricette appena toccate, non l'intero catalogo.** Più volte un cambiamento ha rotto `ingredientiModificabili` (valore attuale fuori da min/max) o un riferimento testuale (`procedimento`/`notaTecnica` che cita un ingrediente rimosso) in ricette non toccate nello stesso turno. Sempre: dopo ogni scrittura, un controllo di integrità su *tutte* le ricette, non solo quelle modificate.
- **Margine reale vs margine apparente**: non assumere che "non c'è spazio per centrare meglio un parametro" senza una ricerca a griglia ampia (che varii *tutti* gli ingredienti, non solo i due zuccheri secondari). Due volte oggi la prima valutazione ("non c'è margine") si è rivelata sbagliata dopo una ricerca più ampia.
- **Cache del browser / file non ancora ricaricato**: se un numero sul sito non corrisponde a quanto appena scritto nei file, il primo sospetto deve essere "hard refresh + riavvio dev server", non un bug nei dati.

## Cosa resta aperto

- Bug `quantitaKg` su altri punti del sito oltre alla pagina ricetta-dettaglio (mai controllato a fondo).
- Eventuale estensione futura: Pasta di pistacchio/nocciola/mandorla potrebbero avere fonti di verifica esterne più precise (oggi marcate `verificato: false`, valori da `gelato-reference.md` §6 con range, non punto singolo).
- Nessun secondo round di test Vitest aggiunto per le nuove 26 ricette (i 4 test originali coprono solo le prime 4 ricette storiche) — da valutare se vale la pena espandere la suite.

## Prossimo passo del progetto

Bilanciamento ricette → **Firebase Auth** (Google login via `signInWithPopup`, piano Spark gratuito) → Firestore (ricette salvate, like) → integrazione AI (Gemini Flash-Lite, solo classificazione ingredienti, mai calcolo) → polish visivo (GSAP/Lenis, ultimo).
