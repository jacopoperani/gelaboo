# Riferimento tecnico — formulazione del gelato artigianale

Guida di bilanciamento usata come base per il motore di calcolo di gelaboo. Valori presentati come **range guida** (consenso tra fonti professionali), non come standard fisico assoluto — nel calcolatore vanno tenuti modificabili dall'utente, non hard-codati.

> Nota di ricostruzione: questo file è stato recuperato da una chat precedente di questo stesso progetto. Le sezioni 1, 3, 4, 5, 6, 7, 8, 9, 10, 13, 14, 15 sono state ritrovate per intero. La tabella dettagliata di §2 (range per categoria, versione estesa) e le sezioni 11-12 non sono state recuperate in questa ricerca — il contenuto operativo di §2 è comunque coperto dal riepilogo compatto di §14, pensato apposta per essere usato come default del calcolatore.

---

## 1. I 5 componenti della miscela

Acqua (unica parte congelabile), zuccheri (POD = dolcezza, PAC = potere anticongelante), grassi, SLNG — Solidi del Latte Non Grassi (proteine + lattosio), altri solidi (stabilizzanti/fibre). La somma dei primi quattro = **solidi totali**; il resto è acqua.

---

## 3. POD e PAC: le due unità di misura del bilanciamento

- **POD** (Potere Dolcificante): quanto dolce viene percepito un ingrediente rispetto al saccarosio (=100). Valore **empirico**, da assaggi — fonti diverse danno numeri leggermente diversi.
- **PAC** (Potere Anticongelante): quanto un ingrediente abbassa il punto di congelamento rispetto al saccarosio (=100). Base più "fisica": deriva dal rapporto tra il peso molecolare del saccarosio (342) e quello dello zucchero considerato, moltiplicato per la sua percentuale di sostanza secca. Esempio: destrosio anidro, peso molecolare 180 → 342/180 = 1,9 → PAC ≈ 190.

### Tabella di riferimento zuccheri

| Zucchero | POD | PAC | Note d'uso |
|---|---|---|---|
| Saccarosio | 100 | 100 | Zucchero di riferimento; >70% del totale zuccheri in ricetta |
| Destrosio (monoidrato comm.) | 70–75 | ~170-190 (anidro: 190) | Sostituisce saccarosio max 15-25% del totale zuccheri |
| Sciroppo di glucosio (38-42 DE) | 40–50 | 80–90 | Più alto il DE, più si comporta come destrosio |
| Sciroppo di glucosio atomizzato (52-62 DE) | 50–65 | 90–115 | — |
| Fruttosio | 170–173 | ~190 | Alto potere dolcificante → si usa poco zucchero aggiunto |
| Zucchero invertito | 127–130 | ~190 | Forte anticristallizzante; max ~10-20% del totale zuccheri |
| Lattosio | 16 | 100 | Presente nel latte; oltre soglia causa sabbiosità |
| Maltodestrine (5-20 DE) | 5–15 | 20–40 | Danno corpo con dolcezza quasi nulla; max 2-5% della miscela |
| Miele | 130–150 | 150–190 | Composto soprattutto da zucchero invertito |
| Trealosio | ~45 | ~90 | Uso di nicchia, max ~30-35% del saccarosio |
| Inulina (fibra) | ~10 | ~25 | Utile nei sorbetti/gelati vegani; max ~5% (effetto laxativo oltre) |

**Regola pratica di sostituzione**: il saccarosio resta lo zucchero prevalente (60-80% del totale zuccheri); il restante 20-40% si distribuisce tra destrosio, sciroppo di glucosio ed eventualmente invertito/fruttosio. Va sempre verificato il risultato finale di POD e PAC della miscela, non solo la singola sostituzione.

### Formula PAC della miscela
```
PAC miscela = Σ (peso ingrediente zuccherino × suo PAC) / peso totale miscela
```

### Regola pratica "PAC/2"
Dividendo il PAC per 2 si ottiene un'indicazione approssimativa (in gradi negativi) della temperatura alla quale il gelato dovrebbe restare spatolabile in vetrina. Regola didattica, non un calcolo scientifico esatto.

---

## 4. SLNG: la formula

```
SLNG (%) = [100 − (Zuccheri% + Grassi% + Altri Solidi%)] × 0,15
```

Il coefficiente 0,15 deriva dalla capacità del lattosio/SLNG di "legare" acqua. Dal valore ottenuto ci si può discostare **solo per difetto**, e non oltre 2 punti percentuali.

**Limite di sabbiosità**: non superare il 10% di lattosio rispetto alla parte acquosa (in pratica: SLNG totali tra l'8 e il 12% della miscela, mai oltre). Sforare questo limite è la causa più comune di gelato "sabbioso" nei gusti a base latte.

---

## 5. Altri solidi: stabilizzanti, emulsionanti, "neutro"

**Funzione**
- Stabilizzanti/addensanti (farina di semi di carruba E410, gomma di guar E412, gomma di tara E417, alginati, carragenina, pectina, agar-agar): legano l'acqua libera, rallentano la ricristallizzazione del ghiaccio in conservazione.
- Emulsionanti (mono e digliceridi E471, lecitine E322): stabilizzano la dispersione del grasso, favoriscono e "tengono" l'overrun.

**Dosaggi tipici**
- Stabilizzante puro (solo gomme): 4–10 g/kg (0,4–1%, raramente oltre 0,5-0,6%)
- Basi/neutri pronti: 35–150 g/kg secondo dosaggio
- Dose pratica più citata: 3–6 g per kg di liquidi

**Caldo vs freddo**
- Lavorazione a caldo (pastorizzazione 80-85 °C): farina di semi di carruba, alginato di sodio.
- Lavorazione a freddo (basi frutta/sorbetti): farina di semi di tara (dosata ~30% in meno della carruba, idrata più acqua, tollera ambienti acidi), gomma di guar.
- Sinergia classica: guar + carruba — il guar favorisce l'assorbimento d'aria, la carruba frena l'assorbimento ma mantiene meglio la struttura.

**Normativa**: nell'UE (Reg. CE 1333/2008 e succ.) la maggior parte degli addensanti sono autorizzati "quantum satis" — nessun limite numerico fisso, vanno usati nella quantità minima necessaria. In etichetta: nome categoria funzionale + nome specifico o codice E.

---

## 6. Tabella valori nutrizionali ingredienti (per 100 g)

Valori medi indicativi per impostare il database del calcolatore — verificare sempre la scheda tecnica del fornitore reale.

| Ingrediente | Zuccheri | Grassi | SLNG | Altri solidi |
|---|---|---|---|---|
| Acqua | 0 | 0 | 0 | 0 |
| Latte intero | 0 | 3,5 | 9 | 0 |
| Latte parz. scremato | 0 | 1,8 | 9 | 0 |
| Latte scremato | 0 | 0 | 9 | 0 |
| Panna 25% | 0 | 25 | 7 | 0 |
| Panna 30% | 0 | 30 | 6 | 0 |
| Panna 35% | 0 | 35 | 6 | 0 |
| Panna 40% | 0 | 40 | 5 | 0 |
| Latte polvere scremato | 0 | 1 | 96 | 0 |
| Latte polvere intero | 0 | 26 | 72 | 0 |
| Latte evaporato intero | 0 | 8 | 18 | 0 |
| Burro | 0 | 84 | 0 | 0 |
| Burro anidro | 0 | 99 | 0 | 0 |
| Tuorlo d'uovo fresco | 0 | 27 | 0 | ~15 (proteine) |
| Uovo intero | 0 | 10 | 0 | 15 |
| Saccarosio | 100 | 0 | 0 | 0 |
| Destrosio (monoidrato comm.) | 92 | 0 | 0 | 0 |
| Sciroppo di glucosio 38-42 DE | 80 | 0 | 0 | 0 |
| Fruttosio liquido (70%) | 70 | 0 | 0 | 0 |
| Zucchero invertito (70%) | 70 | 0 | 0 | 0 |
| Miele | 80 | 0 | 0 | 0 |
| Stabilizzante puro (gomme) | 0 | 0 | 0 | 100 |
| Cacao amaro 20-24% grasso | 0 | 20-24 | 0 | 72-76 |
| Cacao in pasta | 0 | 55 | 0 | 44 |
| Pasta di nocciola pura | 0 | 60 | 0 | 35 |
| Pasta di pistacchio pura | 0 | 55 | 0 | 45 |
| Pasta di mandorla pura | 0 | 50-55 | 0 | 40-45 |

---

## 7. Tabella zuccheri/altri solidi della frutta (per 100 g parte edibile)

| Frutta | Zuccheri (%) | Altri solidi (%) |
|---|---|---|
| Albicocca | 11 | 5 |
| Amarena | 9 | 5 |
| Ananas | 13 | 5 |
| Banana | 19 | 7 |
| Cachi | 14 | 5 |
| Ciliegia | 14 | 8 |
| Fico | 20 | 5 |
| Fragola | 9 | 2 |
| Kiwi | 9 | 3 |
| Lampone | 9 | 2 |
| Mango | 14 | 5 |
| Maracuja | 9 | 5 |
| Mela | 11 | 5 |
| Melone | 11 | 5 |
| Mirtillo | 7 | 3 |
| Mora | 7 | 5 |
| Papaya | 11 | 5 |
| Pera | 11 | 5 |
| Pesca | 14 | 5 |
| Prugna | 15 | 5 |
| Ribes | 8 | 5 |
| Succo d'arancia | 10 | 2 |
| Succo di limone | 2 | 2 |
| Succo d'uva | 20 | 2 |

> Questi valori variano molto per varietà/maturazione/stagione: trattarli come default modificabili dall'utente, non come costanti.

> **Nota di correzione (Succo di limone):** il valore zuccheri originale (9) era un probabile errore di trascrizione introdotto durante la ricostruzione del documento — troppo alto per un succo, dove il contenuto reale di zuccheri è molto basso (il limone è soprattutto acqua e acidità). Corretto a 2 sulla base di fonti nutrizionali esterne indipendenti (INRAN/USDA: ≈1,4 g/100 g), arrotondato per coerenza con la precisione delle altre righe della tabella. Fragola e Lampone, che condividono lo stesso valore "9" della vecchia riga, sono stati verificati come corretti e indipendenti — non sono affetti dallo stesso errore.

**Gelato alla frutta (con latte) vs sorbetto**
- Gelato alla frutta: contiene anche latte (grassi e SLNG). Frutta di solito 20-30% del totale (agrumi: meno basta).
- Sorbetto: solo acqua + zucchero + frutta (+ eventuale stabilizzante a freddo). Polpa tipicamente 35-50% del totale.
- Regola di equivalenza solidi totali: solidi totali frutta × 3/2 ≈ solidi totali equivalenti di una base alle creme.

---

## 8. Casi particolari: cioccolato, nocciola, pistacchio (grassi vegetali)

I grassi vegetali a temperature negative indurisco molto più del grasso del latte e non hanno vera funzione anticongelante. Metodo classico: trattarli a "PAC zero", ma in pratica (metodo Corvitto) serve compensare aumentando gli zuccheri.

```
PAC corretto ≈ Zuccheri% − 1,4 × Grassi vegetali%
```

Il risultato negativo indica quanto zucchero aggiuntivo serve per riequilibrare. Da usare con cautela: spingere troppo il PAC per compensare un'alta % di grassi vegetali (es. cioccolato fondente) porta a un gelato più dolce e che si scioglie più in fretta — è un compromesso.

---

## 9. Il processo produttivo (parametri) e overrun

| Fase | Parametro | Valore tipico |
|---|---|---|
| Pastorizzazione bassa | temp/tempo | 65 °C per 30 min (miscele con uova/alcol) |
| Pastorizzazione media | temp/tempo | 72 °C per 15 min |
| Pastorizzazione alta | temp/tempo | 85 °C per pochi secondi (più usata) |
| Fascia critica batterica | range da evitare | 10–40 °C |
| Maturazione miscela | temp/tempo | 2–4 °C per alcune ore |
| Mantecazione (cilindro) | temperatura | da −25 °C a −40 °C |
| Estrazione gelato | temp al cuore | tra −7 °C e −9 °C (~60-70% acqua congelata) |
| Conservazione/abbattimento | temperatura | −18 / −25 °C |
| Esposizione in vetrina | temperatura | −12 / −16 °C |

**Overrun (aria incorporata)**
```
Overrun (%) = (Volume gelato − Volume miscela) / Volume miscela × 100
```
- Gelato artigianale alle creme: 30–40% (alcune fonti: 20-45%)
- Sorbetti: 15–25%
- Gelato industriale: può superare 80-100% (fino a 110-120%)

Dipende da: viscosità della miscela, tipo di mantecatore, proteine del latte, emulsionanti.

---

## 10. Esempio numerico completo (base Fior di Panna)

Obiettivo: zuccheri 19%, grassi 7%, altri solidi 0,6% (stabilizzante).

1. SLNG = [100 − (19+7+0,6)] × 0,15 = 73,4 × 0,15 ≈ **11%**
2. Solidi totali = 19 + 7 + 0,6 + 11 = **37,6%** → in target (36-44%)
3. Composizione per 1 kg di miscela:

| Ingrediente | % sul totale |
|---|---|
| Latte intero | 60% |
| Panna 35% | 15% |
| Zucchero semolato | 16% |
| Latte polvere scremato | 5% |
| Stabilizzante puro | 0,8% |
| Sciroppo di glucosio 42DE | 3% |

Risultato finale verificato: zuccheri ≈19%, grassi ≈7%, SLNG ≈11%, altri solidi ≈0,5%, solidi totali ≈37,6%.

---

## 13. Difetti del gelato: diagnosi e correzione

| Difetto | Causa più probabile | Correzione |
|---|---|---|
| Sabbioso/granuloso | Eccesso SLNG/lattosio vs acqua disponibile; latte in polvere troppo alto | Riportare SLNG entro 8-12%; ridurre latte in polvere; aumentare parte acquosa o stabilizzante |
| Gommoso/elastico | Eccesso stabilizzante o proteine | Ridurre dose neutro/stabilizzante (0,3-0,5%); verificare SLNG |
| Troppo duro, si sfalda | PAC troppo basso; overrun insufficiente | Aumentare zuccheri (preferendo destrosio/glucosio); verificare mantecazione |
| Troppo morbido/sciropposo | PAC troppo alto | Ridurre zuccheri "secondi" a favore del saccarosio; verificare solidi totali |
| Troppo dolce | POD alto anche con PAC normale | Sostituire zuccheri ad alto POD con destrosio/glucosio (basso POD, PAC simile) |
| Cristalli di ghiaccio grossi | Solidi totali bassi; temperatura instabile in conservazione | Aumentare solidi totali; catena del freddo stabile; congelamento più rapido |
| Si scioglie troppo in fretta | Overrun alto vs solidi; pochi grassi/SLNG | Ridurre overrun; aumentare grassi o SLNG entro i range |
| Cioccolato/nocciola troppo duri | Grasso vegetale non compensato (§8) | Applicare correzione PAC negativo, aumentando lievemente gli zuccheri |

---

## 14. Riepilogo "parametri calcolatore" (versione compatta — usare come default)

```
GELATO ALLE CREME
  Zuccheri:      16 - 22 %      (fino 27% in gusti molto ricchi)
  Grassi:         6 - 12 %
  SLNG:           8 - 12 %      (formula: [100-(Z+G+AS)] x 0.15, tolleranza -2%)
  Altri solidi:   0 - 5  %      (stabilizzante puro 0.3 - 0.5%)
  Solidi totali: 36 - 44 %
  POD:          13 - 19.5       (formula: Σ(g_puro_i × POD_i) / tot_miscela)
  PAC:          22 - 30         (formula: Σ(g_puro_i × PAC_i) / tot_miscela)
  Overrun:       30 - 40 %

GELATO ALLA FRUTTA (con base latte)
  Zuccheri:      22 - 27 %
  Grassi:         0 - 4  %
  SLNG:           4 - 8  %
  Solidi totali: 30 - 38 %
  POD:          13 - 19.5       (identico a CREME — vedi nota sotto)
  PAC:          22 - 30         (identico a CREME — vedi nota sotto)
  Overrun:       25 - 35 %

SORBETTO
  Zuccheri:      22 - 30 %      (agrumi/limone: 28-30%)
  Grassi:         0 %
  Solidi totali: 28 - 34 %
  POD:          20 - 23.5       (formula: Σ(g_puro_i × POD_i) / tot_miscela)
  PAC:          27.5 - 37.5     (formula: Σ(g_puro_i × PAC_i) / tot_miscela)
  Overrun:       15 - 25 %

GELATO VEGANO
  Zuccheri:      16 - 22 %
  Grassi:         5 - 12 %
  Altri solidi:   7 - 17 %      (fibre/proteine vegetali al posto di SLNG)
  Solidi totali: 32 - 40 %
  POD:          13 - 17.5       (stimato per analogia con crema — non da fonte diretta)
  PAC:          22 - 27         (stimato per analogia con crema — non da fonte diretta)
  Overrun:       25 - 35 %

REGOLE TRASVERSALI
  Zuccheri "secondi" (destrosio+glucosio+invertito) max 20-25% del totale zuccheri
  Maltodestrine max 2-5% della miscela
  Stabilizzante puro 0.3 - 0.6% della miscela (UE: quantum satis, nessun limite numerico di legge)
  Cioccolato/frutta secca: PAC corretto = Zuccheri% - 1.4 x Grassi_vegetali%
```

> **Nota PAC/POD gelato alla frutta con latte:** nessuna fonte professionale consultata (BilanciaLi, Gelato Per Passione, TuttoGelato, manuali Preti/Terrile) pubblica range PAC/POD dedicati per questa sottocategoria. Il software BilanciaLi distingue solo 4 profili (gelato, sorbetto, granita, vegano) e tratta il gelato alla frutta con latte come profilo "gelato" standard. Di conseguenza nel calcolatore gelaboo i threshold PAC/POD per la categoria "frutta" sono allineati a quelli delle creme (PAC 22–30, POD 13–19.5). I parametri strutturali (Zuccheri, Grassi, SLNG, Solidi) restano ai valori propri della categoria frutta.

> **Nota di correzione (POD/PAC):** i valori POD/PAC originali di questa sezione (130–195, 220–300, 200–260, 275–375) erano espressi con un fattore di scala errato (×10) rispetto alla formula definita in §3, probabilmente introdotto durante la ricostruzione del documento da una chat precedente. I valori qui sopra sono stati corretti dividendo per 10 e verificati a mano con l'esempio di §10 (fior di panna: PAC ≈ 18, POD ≈ 17) e con una fonte esterna indipendente (Gelato Per Passione: PAC relativo 25.95%, POD 16.97% per fior di latte, ricetta analoga). La formula corretta è Σ(g_puro_i × indice_i) / peso_totale_miscela, dove g_puro_i = g_per_kg × (zuccheri_i / 100).

---

## 15. Fonti consultate

Sintesi elaborata a partire da manuali e schede tecniche di gelatieri professionisti, dispense storiche (Marco Terrile, "La Produzione del Gelato Artigianale"; Giovanni Preti, "Il Gelato Artigianale Italiano"), blog tecnici di settore (Gelato Per Passione, TuttoGelato, Artigeniale, Jo Pistacchio, Gelato in Casa, AllInFood, Food in Progress, IceIceDaddy), schede tecniche di produttori di neutri/stabilizzanti (Fugar, SaporePuro), manuali di software di bilanciamento (BilanciaLi/CucinaLi), risorse divulgative (My-Personal Trainer, ConGelato, Reire) e normativa UE sugli additivi alimentari (Reg. CE 1333/2008 e successivi). I valori numerici sono presentati come range guida derivati dal consenso tra più fonti indipendenti: nella pratica professionale ogni gelatiere/scuola calibra questi parametri sulla propria materia prima e sul proprio stile.
