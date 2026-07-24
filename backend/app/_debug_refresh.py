from datetime import datetime, timedelta, timezone
from app.database import SessionLocal
from app.models import StravaAccount
from app.services.strava import get_valid_access_token

db = SessionLocal()
account = db.query(StravaAccount).first()
print("antes:", account.access_token[:10], account.expires_at)

account.expires_at = datetime.now(timezone.utc) - timedelta(hours=1)
db.commit()

token = get_valid_access_token(account, db)
print("después:", token[:10], account.expires_at)
