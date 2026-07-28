from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import strava, activities


app = FastAPI(title="Training Lab API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://personal-server.local:3000"
    ],
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(strava.router)
app.include_router(activities.router)
app.include_router(activities.activities_router)

@app.get("/")
async def root():
    return {"message": "Training Lab API is running!"}

@app.get("/health")
def health():
    return {"status": "ok"}