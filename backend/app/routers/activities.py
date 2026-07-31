from datetime import date, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import StravaAccount, Activity
from app.schemas import ActivityOut, DailyDistance, DailyTrainingLoad
from app.services.strava import sync_activities
from app.services.training_load import calculate_acwr

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
    activities = db.query(Activity).filter(Activity.activity_type == 'Run', Activity.distance_meters > 0).order_by(Activity.start_date).all()

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

@activities_router.get("/heatmap", response_model=list[DailyDistance])
def get_daily_distance(db: Session = Depends(get_db)):
    daily_distances = db.query(
        func.date(Activity.start_date),
        func.sum(Activity.distance_meters)
    ).filter(Activity.activity_type == "Run") \
     .group_by(func.date(Activity.start_date)) \
     .all()

    result = []
    
    for fecha, distacia_total in daily_distances:
        result.append(DailyDistance(date=fecha, distance_meters=distacia_total))

    return result

@activities_router.get("/training-load", response_model=list[DailyTrainingLoad])
def calculate_acwr_from_activities(db: Session = Depends(get_db)) -> list[dict]:
  results = db.query(
    func.date(Activity.start_date),
    func.sum(Activity.moving_time_seconds)
  ).filter(Activity.activity_type == "Run") \
   .group_by(func.date(Activity.start_date)) \
   .all()

  first_date = min(date_ for date_, _ in results)
  today = date.today()

  dates = []
  daily_loads = []
  current = first_date
  while current <= today:
    load = next((total for date_, total in results if date_ == current), 0.0)
    dates.append(current)
    daily_loads.append(load)
    current += timedelta(days=1)

  acwr_results = calculate_acwr(daily_loads)

  return [
      DailyTrainingLoad(date=d, acute=r["acute"], chronic=r["chronic"], ratio=r["ratio"])
      for d, r in zip(dates, acwr_results)
  ]

