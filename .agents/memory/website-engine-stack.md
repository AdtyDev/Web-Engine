---
name: Website Engine stack
description: Config-driven website generator — key architecture decisions and sharp edges found during build.
---

## Structure
- Backend: `website-engine/backend/` (Python 3.11 + FastAPI + Pydantic v2). Run via `artifacts/api-server` artifact.toml pointing at absolute path `/home/runner/workspace/website-engine/backend`.
- Frontend: `artifacts/website-engine/` (React 18 + Vite + Tailwind). All section components are `.jsx`, not `.tsx`.
- Configs: `website-engine/backend/configs/{client_id}.json`. `CLIENT_ID` env var selects which config to load.

## Sharp edges
- Section components are `.jsx` (not `.tsx`) — never use TypeScript syntax (`as Type`, interface, etc.) inside them.
- `useTheme` has two `useEffect` calls — both must always execute (no early `return` before either one). Guards go *inside* the effects.
- `useTheme` Google Fonts: uses `document.getElementById('gf-fonts')` to find/create a single `<link>` — never `appendChild` on every render.
- Backend runs from absolute path in artifact.toml (relative path fails uvicorn's `--reload` directory watch).
- `email-validator` pip package must be installed globally (not just in requirements.txt) for Pydantic `EmailStr`.

## Phase progress
- Phase 1 (Scaffold) ✅
- Phase 2 (Backend core — startup validation, tests 27/27, contact endpoint, schema generation) ✅
- Phase 3 (Frontend core — Navbar IntersectionObserver, Footer 3-col, all 9 sections, useTheme fix) ✅
- Phase 4: Frontend core polish (not yet — may be merged with Phase 3)
- Phase 5: Section components full polish
- Phase 6: Contact form E2E (SMTP)
- Phase 7: Deployment artifacts
- Phase 8: Polish pass

**Why:** Phase sequence from original spec.
