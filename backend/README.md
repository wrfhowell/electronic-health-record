# EHR Clone — Backend

FastAPI + SQLAlchemy + SQLite service that powers the Practice Fusion clone frontend.

## Run

```bash
cd backend
uv venv .venv && uv pip install -p .venv/bin/python -r requirements.txt
.venv/bin/python seed.py            # drop + recreate ehr.db with demo data
.venv/bin/uvicorn main:app --reload # http://localhost:8000, docs at /docs
```

`seed.py` is idempotent — rerun it any time to reset to the pristine demo state
(12 Demo patients, Steve DemoCardio's full chart, this week's appointments,
tasks, and messages).

## API

- `GET/POST /api/patients`, `GET/PUT/DELETE /api/patients/{id}`
- `GET /api/patients/{id}/summary` — one payload for the chart Summary tab
  (diagnoses, meds, allergies, encounters + vitals history, documents)
- `GET/POST/PUT/DELETE /api/appointments` (`?start=&end=` date filters; block
  time via `is_block`)
- `GET/POST/PUT/DELETE /api/encounters`, `PUT /api/encounters/{id}/vitals`
  (BMI auto-computed), `POST /api/encounters/{id}/sign` (requires chief
  complaint; signed encounters become read-only)
- `GET/POST/PUT/DELETE /api/tasks` (`?status=&task_type=&assignee=`)
- `GET/POST/PUT/DELETE /api/messages` (`?folder=inbox|sent|archive`; sends
  loop back into the inbox for the single-user demo)
- `GET /api/providers`, `GET /api/health`

CORS is open to the Vite dev server (`http://localhost:5173`).
