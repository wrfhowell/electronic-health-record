from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

import models
import schemas
from database import get_db

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


def _get_task(db: Session, task_id: int) -> models.Task:
    task = db.get(models.Task, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.get("", response_model=list[schemas.TaskOut])
def list_tasks(
    status: str | None = None,
    task_type: str | None = None,
    assignee: str | None = None,
    patient_id: int | None = None,
    db: Session = Depends(get_db),
):
    q = db.query(models.Task).options(joinedload(models.Task.patient))
    if status:
        q = q.filter(models.Task.status == status)
    if task_type:
        q = q.filter(models.Task.task_type == task_type)
    if assignee:
        q = q.filter(models.Task.assignee == assignee)
    if patient_id:
        q = q.filter(models.Task.patient_id == patient_id)
    return q.order_by(models.Task.reminder_date, models.Task.id).all()


@router.post("", response_model=schemas.TaskOut, status_code=201)
def create_task(payload: schemas.TaskCreate, db: Session = Depends(get_db)):
    if not payload.details.strip():
        raise HTTPException(status_code=422, detail="Details are required")
    task = models.Task(**payload.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.put("/{task_id}", response_model=schemas.TaskOut)
def update_task(task_id: int, payload: schemas.TaskUpdate, db: Session = Depends(get_db)):
    task = _get_task(db, task_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    db.delete(_get_task(db, task_id))
    db.commit()
