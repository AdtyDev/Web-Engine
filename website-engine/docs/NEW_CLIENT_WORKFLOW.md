# New Client — 15-Minute Workflow

## Step 1 — Copy the template

```bash
cp backend/configs/template.json backend/configs/{slug}.json
```

Fill in all fields. See `CONFIG_SCHEMA.md` for the full reference.

## Step 2 — Add images

Drop images into the frontend asset folder:

```
website-engine/frontend/public/assets/{slug}/
```

Reference them in the config as `/assets/{slug}/hero.jpg` etc.

## Step 3 — Verify locally

```bash
# Terminal 1 — backend
cd website-engine/backend
CLIENT_ID={slug} uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 — frontend (served by Vite dev server via Replit workflow)
# Check the preview pane — it fetches /api/config via the proxy
```

Hit `GET /api/config` and confirm the correct JSON is returned.

## Step 4 — Deploy

### PaaS (Render / Railway)

1. Backend → Web Service
   - Build: `pip install -r requirements.txt`
   - Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Env: `CLIENT_ID={slug}`, `ALLOWED_ORIGINS_RAW=https://{frontend-domain}`

2. Frontend → Static Site
   - Build command:
     ```
     corepack enable pnpm && pnpm install && echo "window.__APP_CONFIG__={API_URL:'https://{backend-url}'};" > public/runtime-config.js && pnpm run build
     ```
   - Publish directory: `dist`

### VPS + Docker

```bash
# Add a backend service in docker-compose.yml
# Add an nginx server block for the new domain
# Add a DNS A record
docker compose up -d
```

See `docker-compose.yml` and `nginx/default.conf` for templates.
