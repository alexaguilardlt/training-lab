from fastapi import FastAPI
from app.routers import strava, activities


app = FastAPI(title="Training Lab API")
app.include_router(strava.router)
app.include_router(activities.router)

@app.get("/")
async def root():
    return {"message": "Training Lab API is running!"}

@app.get("/health")
def health():
    return {"status": "ok"}