

from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models import Activity

def calculate_acwr(daily_loads: list[float]) -> list[dict]:
  LAMBDA_ACUTE = 2 / (7 + 1)
  LAMBDA_CHRONIC = 2 / (28 + 1)

  results = []
  acute = None
  chronic = None

  for i, load in enumerate(daily_loads):
    if i == 0:
      acute = load
      chronic = load
    else:
      acute = load * LAMBDA_ACUTE + acute * (1 - LAMBDA_ACUTE)
      chronic = load * LAMBDA_CHRONIC + chronic * (1 - LAMBDA_CHRONIC)

    if i < 27 or chronic == 0:
      ratio = None
    else:
      ratio = acute / chronic

    results.append({"acute": acute, "chronic": chronic, "ratio": ratio})

  return results