# gelaboo

Calcolatore di ingredienti per gelato artigianale. Target: utenti prosumer con gelatiera e ingredienti professionali.

**Funzionalità**
- Gusti preset con calcoli bilanciati (POD/PAC/SLNG)
- Builder per gusto custom
- Ricette browsabili per categoria
- Account con ricette salvate e like (login Google)

## Stack

- Vue 3 + Vite
- Tailwind CSS + GSAP (animazioni)
- Pinia (state management)
- Firebase (Firestore + Authentication)
- Gemini API (classificazione ingredienti — opzionale)

## Comandi

```bash
npm install        # installa dipendenze
npm run dev        # avvia dev server (localhost:5173)
npm run build      # build produzione in dist/
```
