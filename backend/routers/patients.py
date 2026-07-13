import random
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db

router = APIRouter(prefix="/api/patients", tags=["patients"])


def _get_patient(db: Session, patient_id: int) -> models.Patient:
    patient = db.get(models.Patient, patient_id)
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


def _generate_prn(db: Session, first_name: str, last_name: str) -> str:
    initials = (first_name[:1] + last_name[:1]).upper() or "PT"
    while True:
        prn = f"{initials}{random.randint(100000, 999999)}"
        if not db.query(models.Patient).filter_by(prn=prn).first():
            return prn


@router.get("", response_model=list[schemas.PatientOut])
def list_patients(search: str | None = None, db: Session = Depends(get_db)):
    q = db.query(models.Patient)
    if search:
        like = f"%{search}%"
        q = q.filter(
            or_(
                models.Patient.first_name.ilike(like),
                models.Patient.last_name.ilike(like),
                models.Patient.prn.ilike(like),
            )
        )
    return q.order_by(models.Patient.last_accessed_at.desc()).all()


@router.post("", response_model=schemas.PatientOut, status_code=201)
def create_patient(payload: schemas.PatientCreate, db: Session = Depends(get_db)):
    data = payload.model_dump()
    prn = data.pop("prn", None) or _generate_prn(db, payload.first_name, payload.last_name)
    patient = models.Patient(**data, prn=prn, last_accessed_at=datetime.now())
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient


@router.get("/{patient_id}", response_model=schemas.PatientOut)
def get_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = _get_patient(db, patient_id)
    patient.last_accessed_at = datetime.now()
    db.commit()
    db.refresh(patient)
    return patient


@router.put("/{patient_id}", response_model=schemas.PatientOut)
def update_patient(
    patient_id: int, payload: schemas.PatientUpdate, db: Session = Depends(get_db)
):
    patient = _get_patient(db, patient_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(patient, field, value)
    db.commit()
    db.refresh(patient)
    return patient


@router.delete("/{patient_id}", status_code=204)
def delete_patient(patient_id: int, db: Session = Depends(get_db)):
    db.delete(_get_patient(db, patient_id))
    db.commit()


@router.get("/{patient_id}/summary", response_model=schemas.PatientSummary)
def patient_summary(patient_id: int, db: Session = Depends(get_db)):
    patient = _get_patient(db, patient_id)
    patient.last_accessed_at = datetime.now()
    db.commit()
    encounters = (
        db.query(models.Encounter)
        .filter_by(patient_id=patient_id)
        .order_by(models.Encounter.date.desc(), models.Encounter.id.desc())
        .all()
    )
    return schemas.PatientSummary(
        patient=schemas.PatientOut.model_validate(patient),
        diagnoses=[schemas.DiagnosisOut.model_validate(d) for d in patient.diagnoses],
        medications=[schemas.MedicationOut.model_validate(m) for m in patient.medications],
        allergies=[schemas.AllergyOut.model_validate(a) for a in patient.allergies],
        encounters=[schemas.EncounterOut.model_validate(e) for e in encounters],
        documents=[schemas.DocumentOut.model_validate(d) for d in patient.documents],
    )


@router.get("/{patient_id}/documents", response_model=list[schemas.DocumentOut])
def patient_documents(patient_id: int, db: Session = Depends(get_db)):
    return _get_patient(db, patient_id).documents
