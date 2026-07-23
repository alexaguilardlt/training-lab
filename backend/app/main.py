from fastapi import FastAPI
from app.routers import strava

app = FastAPI(title="Training Lab API")
app.include_router(strava.router)

@app.get("/")
async def root():
    return {"message": "Training Lab API is running!"}

@app.get("/health")
def health():
    return {"status": "ok"}