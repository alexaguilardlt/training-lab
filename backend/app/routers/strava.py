from datetime import datetime, timezone
import httpx
from urllib.parse import urlencode
from fastapi import APIRouter, Depends
from fastapi.responses import RedirectResponse
from app.config import settings
from app.database import get_db
from app.models import StravaAccount
from sqlalchemy.orm import Session


router = APIRouter(prefix="/auth/strava", tags=["strava"])

STRAVA_AUTHORIZA_URL = "https://www.strava.com/oauth/authorize"
REDIRECT_URI = "http://personal-server.local:8000/auth/strava/callback"
STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token"

@router.get("/login")
def strava_login():
    params = {
        "client_id": settings.strava_client_id,
        "redirect_uri": REDIRECT_URI,
        "response_type": "code",
        "approval_prompt": "auto",
        "scope": "read,activity:read_all"
    }

    return RedirectResponse(f"{STRAVA_AUTHORIZA_URL}?{urlencode(params)}")

@router.get("/callback")
def strava_callback(code: str, db: Session = Depends(get_db)):
    response = httpx.post(STRAVA_TOKEN_URL, data={
        "client_id": settings.strava_client_id,
        "client_secret": settings.strava_client_secret,
        "code": code,
        "grant_type": "authorization_code"
    })
    response.raise_for_status()
    token_data = response.json()

    athlete_id = token_data["athlete"]["id"]
    expires_at = datetime.fromtimestamp(token_data["expires_at"], tz=timezone.utc)

    account = db.query(StravaAccount).filter_by(athlete_id=athlete_id).first()
    if account is None:
        account = StravaAccount(athlete_id=athlete_id)
        db.add(account)

    account.access_token = token_data["access_token"]
    account.refresh_token = token_data["refresh_token"]
    account.expires_at = expires_at
    db.commit()

    return {"message": "Cuenta de Strava conectada correctamente", "athlete_id": athlete_id}