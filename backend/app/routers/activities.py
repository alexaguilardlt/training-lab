from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import StravaAccount
from app.services.strava import sync_activities

router = APIRouter(prefix="/strava", tags=["strava"])

@router.post("/sync")
def sync_all_counts(db: Session = Depends(get_db)):
    accounts = db.query(StravaAccount).all()
    total_news = 0

    for account in accounts:
        total_news += sync_activities(account, db)
    return {"cuentas_sinc": len(accounts), "actividades_nuevas": total_news}