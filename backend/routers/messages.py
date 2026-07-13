from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

import models
import schemas
from database import get_db

router = APIRouter(prefix="/api/messages", tags=["messages"])


def _get_message(db: Session, message_id: int) -> models.Message:
    msg = db.get(models.Message, message_id)
    if msg is None:
        raise HTTPException(status_code=404, detail="Message not found")
    return msg


@router.get("", response_model=list[schemas.MessageOut])
def list_messages(folder: str | None = None, db: Session = Depends(get_db)):
    q = db.query(models.Message).options(joinedload(models.Message.patient))
    if folder:
        q = q.filter(models.Message.folder == folder)
    return q.order_by(models.Message.created_at.desc()).all()


@router.post("", response_model=schemas.MessageOut, status_code=201)
def send_message(payload: schemas.MessageCreate, db: Session = Depends(get_db)):
    if not payload.subject.strip():
        raise HTTPException(status_code=422, detail="Subject is required")
    sent = models.Message(**payload.model_dump(), folder="sent", read=True)
    db.add(sent)
    # Single-user demo: addressed messages loop back into the inbox so it stays alive.
    inbox_copy = models.Message(**payload.model_dump(), folder="inbox", read=False)
    db.add(inbox_copy)
    db.commit()
    db.refresh(sent)
    return sent


@router.put("/{message_id}", response_model=schemas.MessageOut)
def update_message(
    message_id: int, payload: schemas.MessageUpdate, db: Session = Depends(get_db)
):
    msg = _get_message(db, message_id)
    data = payload.model_dump(exclude_unset=True)
    if "folder" in data and data["folder"] not in ("inbox", "sent", "archive"):
        raise HTTPException(status_code=422, detail="Invalid folder")
    for field, value in data.items():
        setattr(msg, field, value)
    db.commit()
    db.refresh(msg)
    return msg


@router.delete("/{message_id}", status_code=204)
def delete_message(message_id: int, db: Session = Depends(get_db)):
    db.delete(_get_message(db, message_id))
    db.commit()
