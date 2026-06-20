# Website Engine

A config-driven website generator. One codebase, unlimited client sites. The only thing that changes between clients is a JSON config file and a folder of images.

```
configs/clinic.json      ─┐
configs/restaurant.json  ─┼──►  same engine  ──►  3 different live sites
configs/gym.json         ─┘
```

## Quick Start (dev)

```bash
# Backend
cd website-engine/backend
cp .env.example .env          # set CLIENT_ID and optionally SMTP_*
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend (in Replit — starts automatically via workflow)
# Preview pane fetches /api from the proxy
```

## Stack

| Layer | Choice |
|---|---|
| Backend | Python 3.11, FastAPI, Pydantic v2, Uvicorn |
| Frontend | React 18 + Vite, TailwindCSS, react-helmet-async |
| Data store | JSON files on disk (Postgres seam left for Phase 2+) |
| Email | smtplib via env vars, console log fallback in dev |

## Repository Layout

```
website-engine/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app + CORS
│   │   ├── core/settings.py     # pydantic-settings
│   │   ├── models/config_schema.py  # source-of-truth schema
│   │   ├── routers/             # health, config, contact
│   │   └── services/            # config_loader, email_service
│   ├── configs/
│   │   ├── template.json        # blank skeleton for new clients
│   │   ├── clinic.json          # canonical reference (Indian clinic)
│   │   ├── restaurant.json
│   │   └── gym.json
│   ├── tests/
│   ├── requirements.txt
│   └── .env.example
├── docs/
│   ├── CONFIG_SCHEMA.md
│   └── NEW_CLIENT_WORKFLOW.md
├── docker-compose.yml           # VPS deployment
├── nginx/default.conf
├── render.yaml                  # PaaS deployment blueprint
└── README.md

artifacts/website-engine/       # React + Vite frontend (Replit workspace package)
├── public/runtime-config.js    # API_URL injection — overwrite at deploy time
├── src/
│   ├── api/client.js
│   ├── context/ConfigContext.jsx
│   ├── hooks/useTheme.js
│   ├── components/layout/      # Navbar, Footer, Layout
│   └── components/sections/    # Hero, About, Offerings, Gallery, Team,
│                               # Testimonials, Pricing, FAQ, ContactForm
└── index.html
```

## Adding a New Client

See `docs/NEW_CLIENT_WORKFLOW.md` for the 15-minute checklist.

## Deployment

See `docs/NEW_CLIENT_WORKFLOW.md` → Step 4 for both PaaS and VPS paths.

## Build Phases

| Phase | Status |
|---|---|
| 1. Scaffold | ✅ |
| 2. Backend core | 🔜 |
| 3. Sample configs | ✅ (done alongside scaffold) |
| 4. Frontend core | 🔜 |
| 5. Section components | 🔜 |
| 6. Contact form end-to-end | 🔜 |
| 7. Deployment artifacts | 🔜 |
| 8. Polish pass | 🔜 |
