from sqlalchemy import Column, Integer, String, DateTime
from app.database import Base

class StravaAccount(Base):
    __tablename__ = "strava_accounts"

    id = Column(Integer, primary_key=True)
    athlete_id = Column(Integer, unique=True, nullable=False)
    access_token = Column(String, nullable=False)
    refresh_token = Column(String, nullable=False)
    expires_at = Column(DateTime, nullable=False)