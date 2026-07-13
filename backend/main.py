from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import models  # noqa: F401 — register models with Base before create_all
from database import Base, engine
from routers import appointments, encounters, messages, patients, providers, tasks

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Practice Fusion Clone API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(patients.router)
app.include_router(providers.router)
app.include_router(appointments.router)
app.include_router(encounters.router)
app.include_router(tasks.router)
app.include_router(messages.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
