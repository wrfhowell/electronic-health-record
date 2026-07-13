from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db

router = APIRouter(prefix="/api/providers", tags=["providers"])


@router.get("", response_model=list[schemas.ProviderOut])
def list_providers(db: Session = Depends(get_db)):
    return db.query(models.Provider).all()
