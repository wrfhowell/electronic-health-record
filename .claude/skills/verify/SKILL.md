---
name: verify
description: Build, launch, and drive the Practice Fusion clone (FastAPI backend + Vite frontend) to verify changes end-to-end.
---

# Verifying the Practice Fusion clone

## Launch

```bash
# Backend (port 8000) — venv already exists at backend/.venv (created with uv)
cd backend && .venv/bin/uvicorn main:app --port 8000

# Reset demo data any time (drop + recreate, 12 patients)
cd backend && .venv/bin/python seed.py

# Frontend (port 5173)
cd frontend && npm run dev
```

Smoke: `curl localhost:8000/api/health` → `{"status":"ok"}`; frontend serves 200 at `/`.

## Drive (browser)

Playwright works headless; chromium builds are already cached in
`~/Library/Caches/ms-playwright`. Install `playwright@1.43.0` in a scratch dir
(node here is 20.3.1 — newest playwright/create-vite need ≥20.9).

Flows worth driving (mirrors plan.md Verification):
login (any creds) → dashboard; Schedule → Add appointment (empty save shows
validation, patient typeahead "Steve") → chip on calendar → chip popover
Confirm; Charts → open Steve DemoCardio → summary populated → New encounter →
Sign without chief complaint rejected → fill CC/vitals/SOAP → Save → Sign
locks; Add patient; New task (empty details rejected) → Complete; New message
→ Sent + loops to Inbox → Archive.

## Gotchas

- Selectors: appointment chips and typeahead results can share text — scope
  modal clicks with `div.fixed`.
- The whole scripted run finishes in ~4s, so toasts (3.5s TTL) stack up in
  screenshots; that's not a bug.
- Reseed before a run: prior runs leave appointments/tasks/patients behind.
