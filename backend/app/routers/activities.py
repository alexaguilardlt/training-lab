from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import StravaAccount, Activity
from app.schemas import ActivityOut
from app.services.strava import sync_activities

router = APIRouter(prefix="/strava", tags=["strava"])

@router.post("/sync")
def sync_all_counts(db: Session = Depends(get_db)):
    accounts = db.query(StravaAccount).all()
    total_news = 0

    for account in accounts:
        total_news += sync_activities(account, db)
    return {"cuentas_sinc": len(accounts), "actividades_nuevas": total_news}

activities_router = APIRouter(prefix="/activities", tags=["activities"])

@activities_router.get("/", response_model=list[ActivityOut])
def get_activities(db: Session = Depends(get_db)):
    activities = db.query(Activity).filter(Activity.activity_type == 'Run').order_by(Activity.start_date).all()

    result = []

    for activity in activities:
        pace_per_km = (activity.moving_time_seconds/60) / (activity.distance_meters/1000)
        result.append(ActivityOut(
            id=activity.id,
            name=activity.name,
            start_date=activity.start_date,
            distance_meters=activity.distance_meters,
            moving_time_seconds=activity.moving_time_seconds,
            pace_per_km=pace_per_km,
        ))

    return result