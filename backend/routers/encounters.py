from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db

router = APIRouter(prefix="/api/encounters", tags=["encounters"])


def compute_bmi(height_in: float | None, weight_lb: float | None) -> float | None:
    if not height_in or not weight_lb:
        return None
    return round(703 * weight_lb / (height_in**2), 2)


def _get_encounter(db: Session, encounter_id: int) -> models.Encounter:
    enc = db.get(models.Encounter, encounter_id)
    if enc is None:
        raise HTTPException(status_code=404, detail="Encounter not found")
    return enc


@router.get("", response_model=list[schemas.EncounterOut])
def list_encounters(patient_id: int | None = None, db: Session = Depends(get_db)):
    q = db.query(models.Encounter)
    if patient_id:
        q = q.filter_by(patient_id=patient_id)
    return q.order_by(models.Encounter.date.desc(), models.Encounter.id.desc()).all()


@router.post("", response_model=schemas.EncounterOut, status_code=201)
def create_encounter(payload: schemas.EncounterCreate, db: Session = Depends(get_db)):
    if db.get(models.Patient, payload.patient_id) is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    enc = models.Encounter(**payload.model_dump(), provider_id=1)
    db.add(enc)
    db.commit()
    db.refresh(enc)
    return enc


@router.get("/{encounter_id}", response_model=schemas.EncounterOut)
def get_encounter(encounter_id: int, db: Session = Depends(get_db)):
    return _get_encounter(db, encounter_id)


@router.put("/{encounter_id}", response_model=schemas.EncounterOut)
def update_encounter(
    encounter_id: int, payload: schemas.EncounterUpdate, db: Session = Depends(get_db)
):
    enc = _get_encounter(db, encounter_id)
    if enc.status == "Signed":
        raise HTTPException(status_code=409, detail="Signed encounters are read-only")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(enc, field, value)
    db.commit()
    db.refresh(enc)
    return enc


@router.delete("/{encounter_id}", status_code=204)
def delete_encounter(encounter_id: int, db: Session = Depends(get_db)):
    db.delete(_get_encounter(db, encounter_id))
    db.commit()


@router.put("/{encounter_id}/vitals", response_model=schemas.VitalsOut)
def upsert_vitals(
    encounter_id: int, payload: schemas.VitalsIn, db: Session = Depends(get_db)
):
    enc = _get_encounter(db, encounter_id)
    if enc.status == "Signed":
        raise HTTPException(status_code=409, detail="Signed encounters are read-only")
    vitals = enc.vitals or models.Vitals(encounter_id=enc.id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(vitals, field, value)
    vitals.bmi = compute_bmi(vitals.height_in, vitals.weight_lb)
    db.add(vitals)
    db.commit()
    db.refresh(vitals)
    return vitals


@router.post("/{encounter_id}/sign", response_model=schemas.EncounterOut)
def sign_encounter(encounter_id: int, db: Session = Depends(get_db)):
    enc = _get_encounter(db, encounter_id)
    if enc.status == "Signed":
        raise HTTPException(status_code=409, detail="Encounter is already signed")
    if not (enc.chief_complaint or "").strip():
        raise HTTPException(
            status_code=422, detail="Chief complaint is required before signing"
        )
    enc.status = "Signed"
    enc.signed_at = datetime.now()
    db.commit()
    db.refresh(enc)
    return enc
