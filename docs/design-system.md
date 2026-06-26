# Design system — gelaboo

Direzione: "gelateria anni '50, ma leggibile".

## Palette

| Ruolo | Nome | Hex |
|---|---|---|
| Base chiara | Crema | `#FBF3E7` |
| Base scura / testo | Inchiostro | `#3A2317` |
| Accento | Menta | `#7FB69E` |
| Accento | Ciliegia | `#C84B4B` |
| Accento | Mandarino | `#E8954A` |
| Accento | Pistacchio scuro | `#5F7A4E` |

**Regola fissa**: gli accenti sono solo per tag e decorazioni. Ogni dato numerico del calcolatore usa Inchiostro su Crema — mai un colore accento — per leggibilità e neutralità. Contrasto Inchiostro su Crema: circa 13:1, ben sopra la soglia minima di leggibilità (4.5:1).

**Testo su sfondo accento**: Menta e Mandarino sono chiari abbastanza da ospitare testo Inchiostro con contrasto sufficiente (~6:1). Ciliegia e Pistacchio scuro sono troppo scuri per Inchiostro (~3:1, sotto soglia) — su questi due va usato testo bianco `#FFFFFF` (~4.6–4.8:1).

## Tipografia

- **Fraunces** (serif) — wordmark e headings
- **Inter** (grotesque, tabular figures) — tutta la UI e i dati numerici
- Alternativa più "bold" per display: Abril Fatface

Entrambi i font principali sono su Google Fonts.

## Logo

Wordmark unica "gelaboo" in stile bubble letters — lettere arrotondate e organiche, disegnate su misura (non un font di sistema né Fraunces standard). Nessuna icona separata: il logo è solo la scritta. Colore: **Inchiostro** (`#3A2317`) su sfondo Crema. Non usare nero puro (`#000000`) in nessuna variante del logo.

## Animazioni

"Professionale" qui significa intenzionale: ogni animazione comunica uno stato o guida l'attenzione, non decorazione a caso.

- Durate: micro-interazioni (hover, focus) 150–250ms; transizioni di sezione/pagina 400–600ms; mai oltre 800ms.
- Easing: mai linear. `power2.out` / `power3.out` per elementi che entrano, `power1.inOut` per cambi di stato. Niente bounce/elastic — non si sposa con il tono vintage.
- Si anima solo `transform` e `opacity` (mai `width` / `height` / `top` / `left` direttamente) per restare fluidi.
- Rispettare sempre `prefers-reduced-motion`.
- Già definite (vedi `docs/site-structure.md`): intro loader (logo che si anima fino alla posizione dell'header, una tantum per sessione), transizioni di route via Vue Router (più leggere dell'intro).
- Da definire prima/durante Figma: hover su bottoni e card ricetta, reveal degli elementi al caricamento/scroll (ScrollTrigger), animazione del numero quando il calcolatore ricalcola (mai un salto secco).

## Componenti pianificati (da costruire in Figma con variabili, poi in Vue)

- Card sapore (preset)
- Builder ingrediente custom
- Input numerico con unità
- Card ricetta (vista lista) → vista dettaglio
- Badge categoria (unico punto dove compaiono i colori accento — **mapping categoria↔colore ancora da definire**, vedi nota sotto)

## Note

Software professionale di bilanciamento gelato esistente è visivamente datato — la combinazione di credibilità tecnica e estetica curata è il differenziatore di gelaboo. Non snaturare questo nel passaggio a Vue: i token sopra vanno rispettati 1:1 anche nel codice (variabili CSS / config Tailwind), non solo in Figma.

**Apertura da chiudere prima di Figma**: le 4 categorie di gusto in `docs/site-structure.md` (crema, frutta, sorbetto, vegano) non hanno ancora un colore accento assegnato esplicitamente — i 4 accenti sono nominati per sapore (Menta, Ciliegia, Mandarino, Pistacchio scuro), non per categoria. Va deciso se è un mapping 1:1 categoria→colore, oppure se i colori sono usati liberamente per singolo gusto indipendentemente dalla categoria.
