# NEXUS — Il Futuro Delle Notizie

Magazine digitale premium che aggrega notizie mondiali da RSS feed e le arricchisce con sintesi editoriali generate da Claude AI, con layout tipografico ispirato alle riviste d'élite.

## Funzionalità

- **8 categorie** — Mondo, Tecnologia, Scienza, Economia, Salute, Cultura, Sport, Italia
- **Sintesi AI** — Titoli e riassunti in italiano generati da Claude tramite server proxy sicuro
- **Meteo live** — Posizione automatica via IP + Open-Meteo
- **Crypto markets** — BTC, ETH, SOL, XRP aggiornati ogni minuto (CoinGecko)
- **Breaking news ticker** — Scorre in tempo reale con i titoli attivi
- **Responsive** — Ottimizzato per desktop e mobile

## Stack

| Layer | Tecnologia |
|-------|-----------|
| Frontend | HTML + CSS + JavaScript vanilla |
| Backend | Node.js + Express |
| AI | Claude API (via proxy `/api/ai`) |
| RSS | rss2json.com |
| Meteo | Open-Meteo + ipapi.co |
| Crypto | CoinGecko API |

## Setup locale

### 1. Prerequisiti

- Node.js ≥ 18
- Un [API key Anthropic](https://console.anthropic.com)

### 2. Installazione

```bash
git clone <repo-url>
cd nexus-news-aggregator
npm install
```

### 3. Configurazione

```bash
cp .env.example .env
# Modifica .env e inserisci la tua ANTHROPIC_API_KEY
```

### 4. Avvio

```bash
# Produzione
npm start

# Sviluppo (con auto-reload)
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000)

---

## Deployment

### Render / Railway / Fly.io

1. Collega il repository
2. Imposta la variabile d'ambiente `ANTHROPIC_API_KEY`
3. Comando di avvio: `npm start`

### Vercel

```bash
npm i -g vercel
vercel --prod
# Aggiungi ANTHROPIC_API_KEY nelle impostazioni del progetto Vercel
```

### Netlify (con Edge Functions)

Usa il file `netlify.toml` incluso nel progetto.
Imposta `ANTHROPIC_API_KEY` nelle variabili d'ambiente del sito Netlify.

---

## Struttura del progetto

```
nexus-news-aggregator/
├── index.html        # Frontend — layout, CSS, JavaScript
├── server.js         # Backend — server Express + proxy /api/ai
├── package.json
├── .env.example      # Template variabili d'ambiente
├── .gitignore
├── netlify.toml      # Config deploy Netlify
├── vercel.json       # Config deploy Vercel
└── README.md
```

## Note di sicurezza

Il server Express fa da proxy per le chiamate all'API Anthropic: la chiave API non è mai esposta al browser. Tutte le richieste AI passano per `/api/ai` lato server.

---

© 2026 Nexus Magazine · Made with Claude AI
