# Struttura del sito — gelaboo

## Sitemap

Header fisso su tutte le pagine: logo gelaboo (sinistra, link a Home) — bottone "Accedi" a destra (sostituito da avatar circolare quando loggato) + icona burger a destra che apre dropdown (Calcola una ricetta / Sfoglia i gusti / Crea il tuo gusto). Nessuna nav centrale.

```
/                    Home (hero breve + 3 CTA)
/ricette             Lista gusti, filtri pill orizzontali: Tutti (attivo default, sfondo Inchiostro pieno) / Crema / Frutta / Sorbetto / Vegano
/ricette/:id         Dettaglio gusto + calcolatore con quantità editabile
                     (stesso template per gusti preset e custom salvati — cambia solo la
                      fonte dati: file statico vs Firestore)
/crea                Builder gusto personalizzato (ingredienti liberi + classificazione AI)
/crea/risultato      Risultato del gusto custom (stesso template di /ricette/:id)
/profilo             Le mie ricette salvate + preferiti (richiede login)
```

**Nota**: calcolatore e ricette sono volutamente unificati, non sono due sezioni separate. Scegliendo un gusto (preset o custom) si arriva direttamente alla pagina che *è* il calcolatore, con quantità modificabile (litri/kg) e ricalcolo in tempo reale.

## Navigazione e Home

- Header fisso: logo a sinistra (→ Home), bottone "Accedi" a destra (sostituito da avatar circolare quando loggato) + icona burger a destra che apre dropdown di navigazione (Calcola una ricetta / Sfoglia i gusti / Crea il tuo gusto). Nessuna nav centrale.
- Intro/loading screen: animazione GSAP — il logo appare al centro e si anima fino alla posizione dell'header in alto a sinistra. Solo al primo ingresso di sessione (flag in sessionStorage); i cambi di route successivi usano le transizioni di Vue Router, più leggere.
- Home: hero breve (wordmark + payoff, tono prosumer) + 3 CTA dirette — *Calcola una ricetta*, *Sfoglia i gusti*, *Crea il tuo gusto*. Niente landing "marketing" lunga con scroll infinito.

## Flusso "crea gusto personalizzato"

**Fase 1 — Descrizione AI**: campo testuale "Descrivi il gusto che vuoi" (badge AI) + selettore quantità + bottone "Genera con AI". L'utente descrive il gusto in linguaggio naturale.

**Fase 2 — Editing e bilanciamento**: l'AI genera una lista ingredienti con quantità, mostrata in sezione "Ingredienti" editabile (rimuovi con ×, aggiungi con "+ Aggiungi ingrediente"). Affiancata dal pannello "Risultato bilanciamento" che si aggiorna in tempo reale tramite il motore JS deterministico.

Per ogni ingrediente non riconosciuto: chiamata a Gemini via proxy serverless → classificazione e stima nutrizionale → risultato cachato localmente.

Risultato finale mostrato con lo stesso template di `/ricette/:id`, con bottoni Like e Salva.

## Accesso, like e salvataggio

- Visualizzazione e calcolo: liberi per tutti, senza login.
- Like e salvataggio permanente: richiedono login Google (Firebase Authentication). Se un utente non loggato clicca Like/Salva, si apre un **modal di login** — non si naviga a una pagina separata, per non rompere il flusso.

Schema Firestore (indicativo):
- `users/{uid}/likes` — riferimenti alle ricette (preset o custom) con like
- `users/{uid}/customRecipes` — ricette create dall'utente, con ingredienti e parametri calcolati

## Componenti Vue previsti

- `Header.vue` — logo + burger + Accedi/avatar, sempre visibile
- `IntroLoader.vue` — animazione iniziale, una tantum per sessione
- `RicettaCard.vue` — card per le liste
- `RicettaDettaglio.vue` — calcolatore + risultato, condiviso tra preset e custom
- `AiPromptInput.vue` — campo testuale "Descrivi il gusto" + badge AI + bottone "Genera con AI" (fase 1 di `/crea`)
- `IngredientPicker.vue` — lista ingredienti editabile post-generazione AI (fase 2 di `/crea`)
- `LikeButton.vue`
- `AuthModal.vue` — login Google
- `ProfiloRicette.vue` — tab "salvate" / "preferiti"
- composable `useCalcolatore.js` — motore di bilanciamento deterministico, separato dai componenti UI
