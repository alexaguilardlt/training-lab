from fastapi import FastAPI

app = FastAPI(title="Training Lab API")

@app.get("/")
async def root():
    return {"message": "Training Lab API is running!"}

@app.get("/health")
def health():
    return {"status": "ok"}