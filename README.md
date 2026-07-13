# Practice Fusion EHR Clone

An interactive web clone of the Practice Fusion EHR — pixel-faithful UI with
working user journeys (scheduling, charting, SOAP notes, tasks, messaging)
backed by a small FastAPI + SQLite service seeded with demo data.

Reference material lives in `practice_fusion_scrape/` (screenshots, layout
JSON, per-step notes from the real app).

## Run it

Backend (http://localhost:8000):

```bash
cd backend
uv venv .venv && uv pip install -p .venv/bin/python -r requirements.txt
.venv/bin/python seed.py            # drop + recreate ehr.db with demo data
.venv/bin/uvicorn main:app --reload
```

Frontend (http://localhost:5173):

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 — the login page accepts any credentials and signs
you in as **Will Demo / Will Demo Practice**.

## What works

- **Home** — practice dashboard with setup progress and card grid.
- **Schedule** — day/week calendar (30-min slots, today highlight, current-time
  line), display-option toggles (weekends / non-business hours), New
  appointment modal (With patient / Block time / Block range) with patient
  typeahead + validation; chips render by type color and have a status
  popover (Confirm, In Lobby, Seen, Cancel).
- **Charts** — patient lists (Recent/Scheduled, search with format-hint
  tooltip, Add patient), chart tabs (Summary / Timeline / Documents / Profile /
  Payment collection / Patient ledger), open-chart tabs in the dark top bar,
  and the full encounter view: CDS banners, editable vitals flowsheet with
  auto-computed BMI, SOAP note editor, Save (PUT) and Sign (validates chief
  complaint, locks the note).
- **Tasks** — tab strip + filters, New task modal (required details, quick
  reminder-date buttons), complete/reopen actions.
- **Messages** — Inbox/Sent/Archive split pane, unread bolding, archive; sent
  messages loop back into the inbox to keep the single-user demo alive.
- **Reports** — placeholder category cards.

## Stack

- `frontend/` — React 18 + TypeScript + Vite, react-router-dom (hash routes),
  Tailwind CSS (custom PF palette), TanStack Query, lucide-react.
- `backend/` — FastAPI + SQLAlchemy + SQLite (`backend/ehr.db`); see
  `backend/README.md` for the API surface. `seed.py` resets to the pristine
  demo state at any time.
