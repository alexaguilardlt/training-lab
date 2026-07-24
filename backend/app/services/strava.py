from datetime import datetime, timedelta, timezone
import httpx
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import StravaAccount
from app.config import settings
from app.models import Activity

STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token"
STRAVA_ACTIVITIES_URL = "https://www.strava.com/api/v3/athlete/activities"

def get_valid_access_token(account: StravaAccount, db: Session) -> str:
    now = datetime.now(timezone.utc)
    margen_seguridad = timedelta(minutes=5)

    if account.expires_at > now + margen_seguridad:
        return account.access_token

    response = httpx.post(STRAVA_TOKEN_URL, data={
        "client_id": settings.strava_client_id,
        "client_secret": settings.strava_client_secret,
        "grant_type": "refresh_token",
        "refresh_token": account.refresh_token  
    })
    response.raise_for_status()
    token_data = response.json()

    account.access_token = token_data["access_token"]
    account.refresh_token = token_data["refresh_token"]
    account.expires_at = datetime.fromtimestamp(token_data["expires_at"], tz=timezone.utc)
    db.commit()

    return account.access_token

def get_last_activity_timestamp(account: StravaAccount, db: Session) -> int | None:
    last_activity = (
        db.query(func.max(Activity.start_date))
        .filter(Activity.account_id == account.id)
        .scalar()
    )

    if last is None:
        return None

    return int((last_activity - timedelta(days=1)).timestamp())

def sync_activities(account: StravaAccount, db: Session) -> int:
    access_token = get_valid_access_token(account, db)
    headers = {"Authorization": f"Bearer {access_token}"}
    after = get_last_activity_timestamp(account, db)

    news = 0
    page = 1
    while True:
        params = {"page": page, "per_page": 100}
        if after is not None:
            params["after"] = after

        response = httpx.get(
            STRAVA_ACTIVITIES_URL,
            headers=headers,
            params=params
        )
        response.raise_for_status()
        activities = response.json()

        if not activities:
            break

        for a in activities:
            exist_activity = db.query(Activity).filter_by(strava_activity_id=a["id"]).first()

            if exist_activity:
                continue

            db.add(Activity(
                account_id=account.id,
                strava_activity_id=a["id"],
                name=a["name"],
                activity_type=a["type"],
                distance_meters=a["distance"],
                moving_time_seconds=a["moving_time"],
                average_speed=a.get("average_speed"),
                start_date=datetime.fromisoformat(a["start_date"])
            ))
            news += 1

        db.commit()
        page += 1

    return news