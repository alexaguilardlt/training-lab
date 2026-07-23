from urllib.parse import urlencode
from fastapi import APIRouter
from fastapi.responses import RedirectResponse
from app.config import settings

router = APIRouter(prefix="/auth/strava", tags=["strava"])

STRAVA_AUTHORIZA_URL = "https://www.strava.com/oauth/authorize"
REDIRECT_URI = "http://personal-server.local:8000/auth/strava/callback"

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
