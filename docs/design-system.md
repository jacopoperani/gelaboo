# Design system — gelaboo

## Palette (versione attuale)

Direzione: contrasto alto, accenti cromatici saturi, tono contemporaneo.

| Ruolo | Nome | Hex |
|---|---|---|
| Base chiara / sfondo | Perla | `#f5f1fa` |
| Base scura / testo | Notte | `#161b33` |
| Bianco | Bianco | `#ffffff` |
| Accento primario | Indaco | `#4b3f8a` |
| Accento | Fucsia | `#d6418c` |
| Accento | Turchese | `#2bc4c9` |
| Accento | Bruciato | `#e0703a` |

**Regola fissa**: gli accenti sono solo per tag, badge categoria e decorazioni. Ogni dato numerico del calcolatore usa Notte su Perla — mai un colore accento. Contrasto Notte su Perla: verificare ≥ 4.5:1.

**Testo su sfondo accento**: tutti e quattro gli accenti usano testo Bianco (`#ffffff`). È la regola fissa per i badge categoria — non testare testo Notte su accenti, è già stato verificato e risolto.

### Badge categoria — mapping definitivo

| Categoria | Sfondo | Testo |
|---|---|---|
| crema | Turchese `#2bc4c9` | Bianco |
| frutta | Fucsia `#d6418c` | Bianco |
| sorbetto | Indaco `#4b3f8a` | Bianco |
| vegano | Bruciato `#e0703a` | Bianco |

### Colori di stato semantico (sistema separato)

I colori ok/attenzione/sballato del calcolatore sono un sistema semantico **separato dalla palette di brand**, definito con variabili CSS dedicate:

```css
--color-stato-ok:         #5f7a4e
--color-stato-attenzione: #e8954a
--color-stato-sballato:   #c84b4b
```

Non vanno mai confusi con gli accenti di categoria, né riutilizzati per altri scopi. Il verde/ambra/rosso ha un significato univoco nell'UI (bilancio ingredienti), usarlo altrove crea ambiguità semantica.

## Tipografia

Sistema a **2 font**:

- **Instrument Serif** — titoli, headings, wordmark nel menu mobile, nomi ricetta (H1–H4, `.text-display`)
- **Unbounded** — tutto il resto: corpo testo, label, bottoni, badge, numeri, dati tabulari

Entrambi su Google Fonts. Caricare con `display=swap` e pesi `300;400;500;700` per Unbounded.

**Regola implementativa**: il font-family si imposta sempre tramite le classi `.text-*` o il default del body in `style.css`, mai con `style` inline su singoli elementi.

### Scala tipografica

| Classe | Font | Size | Weight | Line-height | Note |
|---|---|---|---|---|---|
| `.text-display` | Instrument Serif | 56px | 600 | 1.1 | |
| `.text-h1` | Instrument Serif | 36px | 600 | 1.15 | |
| `.text-h2` | Instrument Serif | 28px | 600 | 1.2 | |
| `.text-h3` | Instrument Serif | 20px | 600 | 1.25 | |
| `.text-body` | Unbounded | 16px | 400 | 1.5 | |
| `.text-body-small` | Unbounded | 14px | 300 | 1.45 | Testo descrittivo/secondario |
| `.text-ui-label` | Unbounded | 13px | 500 | 1.3 | Uppercase, ls 0.05em |
| `.text-data-large` | Unbounded | 32px | 600 | 1.1 | tabular-nums |
| `.text-data` | Unbounded | 18px | 500 | 1.2 | tabular-nums |

## Logo

Wordmark unica "gelaboo" in stile bubble letters — lettere arrotondate e organiche, disegnate su misura (SVG inline). Nessuna icona separata: il logo è solo la scritta. Colore: **Notte** (`#161b33`) su sfondo Perla. Non usare nero puro (`#000000`) in nessuna variante del logo.

Il nome "gelaboo" nell'header (testo, non SVG) usa Instrument Serif 20px 600.

## Animazioni

"Professionale" qui significa intenzionale: ogni animazione comunica uno stato o guida l'attenzione, non decorazione a caso.

- Durate: micro-interazioni (hover, focus) 150–250ms; transizioni di sezione/pagina 400–600ms; mai oltre 800ms.
- Easing: mai linear. `power2.out` / `power3.out` per elementi che entrano, `power1.inOut` per cambi di stato. Niente bounce/elastic.
- Si anima solo `transform` e `opacity` (mai `width` / `height` / `top` / `left` direttamente) per restare fluidi.
- Rispettare sempre `prefers-reduced-motion`.
- Già definite (vedi `docs/site-structure.md`): intro loader (logo che si anima fino alla posizione dell'header, una tantum per sessione), transizioni di route via Vue Router.
- Da definire prima/durante Figma: hover su bottoni e card ricetta, reveal degli elementi al caricamento/scroll (ScrollTrigger), animazione del numero quando il calcolatore ricalcola.

## Componenti pianificati (da costruire in Figma con variabili, poi in Vue)

- Card sapore (preset)
- Builder ingrediente custom
- Input numerico con unità
- Card ricetta (vista lista) → vista dettaglio
- Badge categoria (mapping categoria↔colore definitivo — vedi tabella sopra)

## Note

Software professionale di bilanciamento gelato esistente è visivamente datato — la combinazione di credibilità tecnica e estetica curata è il differenziatore di gelaboo. I token sopra vanno rispettati 1:1 anche nel codice (variabili CSS / config Tailwind), non solo in Figma.

---

## ⚠️ SUPERSEDED — Palette precedente ("gelateria anni '50")

> Sostituita dalla palette attuale sopra. Mantenuta come riferimento storico.

Direzione originale: "gelateria anni '50, ma leggibile".

| Ruolo | Nome | Hex |
|---|---|---|
| Base chiara | Crema | `#FBF3E7` |
| Base scura / testo | Inchiostro | `#3A2317` |
| Accento | Menta | `#7FB69E` |
| Accento | Ciliegia | `#C84B4B` |
| Accento | Mandarino | `#E8954A` |
| Accento | Pistacchio scuro | `#5F7A4E` |

Font precedenti: **Fraunces** (serif, headings, con asse variabile WONK) + **Inter** (UI e dati numerici) + **Unbounded** (dati tabulari, CTA).
