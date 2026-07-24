from datetime import datetime, timedelta, timezone
import httpx
from sqlalchemy.orm import Session
from app.models import StravaAccount
from app.config import settings

STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token"

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