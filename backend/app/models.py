from sqlalchemy import BigInteger, Column, Integer, String, DateTime, Float, ForeignKey
from app.database import Base

class StravaAccount(Base):
    __tablename__ = "strava_accounts"

    id = Column(Integer, primary_key=True)
    athlete_id = Column(Integer, unique=True, nullable=False)
    access_token = Column(String, nullable=False)
    refresh_token = Column(String, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)

class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True)
    account_id = Column(Integer, ForeignKey("strava_accounts.id"), nullable=False)
    strava_activity_id = Column(BigInteger, unique=True, nullable=False)
    name = Column(String, nullable=False)
    activity_type = Column(String, nullable=False)
    distance_meters = Column(Float, nullable=False)
    moving_time_seconds = Column(Integer, nullable=False)
    average_speed = Column(Float, nullable=True)
    start_date = Column(DateTime(timezone=True), nullable=False)