from datetime import datetime, date
from pydantic import BaseModel


class ActivityOut(BaseModel):
    id: int
    name: str
    start_date: datetime
    distance_meters: float
    moving_time_seconds: int
    pace_per_km: float

    model_config = {
        "from_attributes": True
    }

class DailyDistance(BaseModel):
    date: date
    distance_meters: float

class DailyTrainingLoad(BaseModel):
    date: date
    acute: float
    chronic: float
    ratio: float | None