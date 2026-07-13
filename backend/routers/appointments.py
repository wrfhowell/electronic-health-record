from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

import models
import schemas
from database import get_db

router = APIRouter(prefix="/api/appointments", tags=["appointments"])


def _get_appointment(db: Session, appointment_id: int) -> models.Appointment:
    appt = db.get(models.Appointment, appointment_id)
    if appt is None:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appt


@router.get("", response_model=list[schemas.AppointmentOut])
def list_appointments(
    start: date | None = None,
    end: date | None = None,
    patient_id: int | None = None,
    db: Session = Depends(get_db),
):
    q = db.query(models.Appointment).options(joinedload(models.Appointment.patient))
    if start:
        q = q.filter(models.Appointment.date >= start)
    if end:
        q = q.filter(models.Appointment.date <= end)
    if patient_id:
        q = q.filter(models.Appointment.patient_id == patient_id)
    return q.order_by(models.Appointment.date, models.Appointment.start_time).all()


@router.post("", response_model=schemas.AppointmentOut, status_code=201)
def create_appointment(payload: schemas.AppointmentCreate, db: Session = Depends(get_db)):
    if not payload.is_block and payload.patient_id is None:
        raise HTTPException(status_code=422, detail="patient_id is required")
    if payload.patient_id is not None and db.get(models.Patient, payload.patient_id) is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    if payload.end_time <= payload.start_time:
        raise HTTPException(status_code=422, detail="end_time must be after start_time")
    appt = models.Appointment(**payload.model_dump())
    db.add(appt)
    db.commit()
    db.refresh(appt)
    return appt


@router.put("/{appointment_id}", response_model=schemas.AppointmentOut)
def update_appointment(
    appointment_id: int, payload: schemas.AppointmentUpdate, db: Session = Depends(get_db)
):
    appt = _get_appointment(db, appointment_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(appt, field, value)
    if appt.end_time <= appt.start_time:
        raise HTTPException(status_code=422, detail="end_time must be after start_time")
    db.commit()
    db.refresh(appt)
    return appt


@router.delete("/{appointment_id}", status_code=204)
def delete_appointment(appointment_id: int, db: Session = Depends(get_db)):
    db.delete(_get_appointment(db, appointment_id))
    db.commit()
