╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌↑╌
 Practice Fusion EHR Clone — Implementation Plan

 Context

 Build a realistic, interactive web clone of the Practice Fusion EHR. The emphasis is the frontend: pixel-faithful UI and working user journeys (navigation, modals, forms with validation, state that persists across screens). The backend exists only to make interactions feel real — a simple FastAPI + SQLite service seeded with demo data.

 Reference material: practice_fusion_scrape/ (screenshots, layout JSON, per-step notes). Key screenshots reviewed:
 - Shell/dashboard: step_000_post_login.png
 - Schedule week view + New Appointment modal: step_008…, step_009…
 - Patient lists: step_040…
 - Chart summary: step_016…
 - Encounter view + SOAP note + vitals: step_023…, step_025…, step_026…
 - Profile: step_036…; Tasks: step_044…; Messages: step_049…

 Stack & Repo Layout

 /frontend   React 18 + TypeScript + Vite, react-router-dom (routes mirroring PF hash paths),
             Tailwind CSS (custom PF palette), TanStack Query for server state, lucide-react icons
 /backend    FastAPI + SQLAlchemy + SQLite (file: backend/ehr.db) — NOT Postgres ("psql only if
             needed"; SQLite keeps it dependency-free), uvicorn, CORS open to the Vite dev server,
             seed.py that creates + populates the DB with the 12 "Demo" patients from the screenshots

 No auth for real — a fake login page that accepts anything and sets a client-side "session" (user = Will Demo, practice = Will Demo Practice), matching the scrape's post-login state.

 Visual system (from screenshots)

 - Left rail: near-black #1a1a1a, ~80px wide, icon+label items (Home, Schedule, Tasks, Charts, Messages, Reports); active item = bright blue #0091ea-ish background.
 - Top bar: dark gray strip with Help, "Will Demo | Will Demo Practice", Lock, Settings, Log out.
Page header: bright blue band (#00a8e1/#29abe2 family) with white page title and tab buttons.
 - Buttons: orange primary (#f5821f) for main CTAs (Add appointment, New task, Sign), blue/white secondary.
 - Right side: static "Advertisement" rail with 1–2 fake promo cards (adds a lot of realism, zero logic).
 - Font: open-sans-ish; light-gray content background #e9e9e9 with white cards.

 Backend

 Data model (SQLAlchemy, one file models.py)

 - patients — first/last name, prn, dob, sex, phone(s), email, address, status, insurance fields, last_accessed_at
 - providers — the one demo user is enough (Will Demo)
 - appointments — patient_id, provider_id, date, start/end time, type, status (Pending/Confirmed/In Lobby/Seen…), chief_complaint, facility, note; also block-time rows (is_block, block_reason)
 - encounters — patient_id, date, type ("Office Visit"), note_type ("SOAP Note"), status (unsigned/signed), chief_complaint, subjective, objective, assessment, plan_note, signed_at
 - vitals — encounter_id, height, weight, bmi (computed), bp_systolic/diastolic, temp, pulse, resp_rate, o2_sat, pain
 - diagnoses — patient_id, icd10 code, description, is_chronic
medications — patient_id, name, sig, start_date, status (active/historical)
 - allergies — patient_id, category (drug/food/environmental), substance, reaction  (empty = "no known")
 - tasks — details, assignee, patient_id, reminder_date, task_type, status (incomplete/complete), author
 - messages — from/to, patient_id, subject, body, urgent, folder (inbox/sent/archive), read, created_at
 - documents — patient_id, title, type, provider, date, size, status

 API (FastAPI, routers per resource, plain CRUD)                                                                                                                                                                                                 ↓

 GET/POST/PUT/DELETE on /api/patients, /api/appointments, /api/encounters, /api/tasks, /api/messages, plus nested reads like /api/patients/{id}/summary (one payload with diagnoses, meds, allergies, encounters, vitals history for the chart   ↓Summary tab). Pydantic schemas give free request validation. seed.py (idempotent: drop+recreate) inserts the demo patients seen in the scrape (Jennifer DemoRheum, Eric DemoGastro, Steve DemoCardio with CHF/HTN/DM diagnoses, Lasix+Lisinopril meds, 5 encounters incl. the signed 04/20 one, 3 vitals columns…), a handful of appointments this week, tasks, and inbox messages so every screen renders populated.                                                                            ↓

 Frontend — Screens & Journeys                                                                                                                                                                                                                   ↓

 Phase 1: Shell + routing                                                                                                                                                                                                                        ↓

 - Fake login page → dashboard.                                                                                                                                                                                                                  ↓
 - App shell: left nav, top bar, blue header band, ad rail. Routes: /home, /schedule/:view, /tasks, /charts, /charts/patients/:id/:tab, /charts/patients/:id/encounter/:encId, /messages/:folder, /reports.
 - Home dashboard: PRACTICE SETUP progress bar (16%), 3×3 card grid with "INCOMPLETE" corner ribbons, orange/blue CTAs (buttons show a small "demo" toast or navigate where sensible, e.g. Settings).                                            ↓

 Phase 2: Schedule (high-interaction)                                                                                                                                                                                                            ↓

 - Day + Week calendar grid (30-min slots, time gutter, today column highlight, red current-time line), header with date-range paging / Today / slot-size select.                                                                                ↓
 - Left filter panel: USERS checkboxes, collapsible DISPLAY OPTIONS (Weekends, Non-business hours toggle actually hides/shows columns/rows), APPOINTMENT TYPES/STATUS.
 - New appointment modal (3 tabs: With patient / Block time / Block range): patient typeahead searching the API, type/duration/status selects, date + time steppers, validation (patient + date/time required); Save → POST → appointment chip   ↓renders on the calendar at the right slot, colored by type. Click a chip → edit/status popover (Confirm, In Lobby, Cancel).
                                                                                                                                                                                                                                                 ↓
 Phase 3: Charts (the core EHR — deepest investment)
                                                                                                                                                                                                                                                 ↓
 - Patient lists: Recent/Scheduled toggle, search box with the format-hint tooltip, provider filter, sortable table (avatar, First, Last w/ PRN, DOB/sex, contact info, accessed). Row click opens the chart and adds a tab in the top dark bar ("Patient lists | Steve DemoCardio ×") like the real app. Add patient modal → POST → appears in list.                                                                                                                                           ↓
 - Patient chart header: avatar, name, PRN, age/sex, "…" overflow, Actions dropdown; blue tab row: Summary • Timeline • Documents • Profile • Payment collection • Patient ledger (+ open-encounter date tabs with ×).
 - Summary tab: two/three-column card layout — Flowsheets, Diagnoses (chronic, ICD-10 links), Allergies (drug/food/environmental with "no known" checkboxes), Medications (list + Record/Prescribe links), Health concerns, Goals, Screenings,   ↓Implantable devices, Social history, Patient risk score, Encounters card listing visits (click → encounter view).
 - Timeline tab: event list filtered by a dropdown (Encounters, Appointments, Lab results, …); encounter rows navigate to the encounter view.                                                                                                    ↓
 - Encounter view (richest screen):
   - Yellow CDS notification banners (dismissable, "Mark as complete").                                                                                                                                                                          ↓
   - Left mini-column (Diagnoses, Risk score, Social history), main column: Encounter details (type/note type/date/facility/status/self-pay), Chief complaint, Health concerns.
   - Vitals flowsheet table — columns per visit date, current encounter's column editable; BMI auto-computed.                                                                                                                                    ↓
   - Medications section.
   - SOAP note editor: Subjective/Objective/Assessment/Plan sections, each a contenteditable/textarea with a cosmetic formatting toolbar; "Save" persists (PUT), "Sign" (orange) validates chief complaint present → confirms → status flips to  ↓Signed, note becomes read-only, lock icon appears in Summary's encounter list.
   - "New encounter" button on chart header → POST creates an unsigned encounter pre-dated today → opens it.                                                                                                                                     ↓
 - Profile tab: Patient / Contact / Address / Insurance & eligibility / Guarantor sections with Edit-section inline forms (Save/Cancel), reminder toggles.
 - Documents / Patient ledger tabs: filterable tables from seed data (read-mostly).                                                                                                                                                              ↓

 Phase 4: Tasks & Messages                                                                                                                                                                                                                       ↓

 - Tasks: tab strip (All / My / Unassigned / Rx change / Lab results / Refill requests / …), filter row (type, patient search, Incomplete/Complete, Current, provider), empty-state text, table with row Actions (Complete ✓ strikes through /   ↓removes per filter). New task modal: Details (required), Assign to + "Assign to me", Regarding-patient typeahead, Reminder date with Today/+1d/+1w/+1m/+1y quick buttons, Task type select.
 - Messages: Inbox/Sent/Archive/Referrals tabs, split pane (list left, reading pane right with "Click a message to show it here."), unread bolding, archive action. New message modal: To (In practice directory), patient attach + "Add to chart↓checkbox, Subject, body, Urgent checkbox → Send → lands in Sent (and Inbox, since it's a single-user demo, addressed messages loop back — keeps the inbox alive).
                                                                                                                                                                                                                                                 ↓
 Phase 5 (stretch): Reports
                                                                                                                                                                                                                                                 ↓
 Static cards/table page matching PF's report categories — placeholder-level only.
                                                                                                                                                                                                                                                 ↓
 Build order / Milestones
                                                                                                                                                                                                                                                 ↓
 1. Scaffold backend (models, seed, routers) — verify with curl.
 2. Scaffold frontend (Vite, Tailwind theme, shell, login, dashboard).                                                                                                                                                                           ↓
 3. Charts: patient list → chart summary → encounter view (SOAP save/sign).
 4. Schedule with appointment creation.                                                                                                                                                                                                          ↓
 5. Tasks + Messages.
 6. Polish pass against screenshots (spacing, colors, ad rail, tooltips, toasts), README with run instructions.                                                                                                                                  ↓

 Verification                                                                                                                                                                                                                                    ↓

 - cd backend && uvicorn main:app --reload + python seed.py; curl smoke checks on /api/patients, /api/patients/{id}/summary.                                                                                                                     ↓
 - cd frontend && npm run dev; walk each journey end-to-end in the browser:
   a. Login → dashboard renders.                                                                                                                                                                                                                 ↓
   b. Schedule → Add appointment (validation errors, then success) → chip on calendar.
   c. Charts → search "Steve" → open chart → Summary populated → New encounter → enter vitals + SOAP → Save → Sign → appears locked in Timeline/Summary.                                                                                         ↓
   d. Add patient → appears in list → open its (empty-state) chart.
   e. New task (required-field validation) → complete it.                                                                                                                                                                                        ↓
   f. New message → appears in Sent; archive an inbox message.
 - Side-by-side compare each screen with its scrape screenshot.