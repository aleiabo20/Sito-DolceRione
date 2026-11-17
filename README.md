# Dolcerione · Sito della pasticceria

Sito statico (HTML, CSS e JavaScript, senza dipendenze) della pasticceria artigianale **Dolcerione**.

## Struttura
- `index.html` – contenuti e sezioni (Chi siamo, Dolci, Su ordinazione, Recensioni, Dove siamo, Contatti)
- `style.css` – stile e layout responsive
- `script.js` – menu mobile, filtro prodotti, indicatore "aperto/chiuso", modulo contatti (via email)
- `assets/favicon.svg` – logo

## Anteprima locale
Apri `index.html` nel browser, oppure:
```bash
python3 -m http.server 8000
```

## Da personalizzare
Cerca `TODO` nei file per sostituire i dati segnaposto:
- indirizzo, telefono, WhatsApp, email, Instagram e P.IVA
- mappa (incollare l'iframe di Google Maps nel blocco `.map`)
- orari: tabella in `index.html` **e** costante `HOURS` in `script.js`
- prodotti, prezzi e recensioni

## Pubblicazione
Su GitHub Pages: *Settings → Pages → Deploy from a branch* e scegli il branch e la cartella `/ (root)`.
