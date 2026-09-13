from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.routers import auth, ideas, alerts, marketplace, users, issues, budgeting
from app.database import engine
from app.models import Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Supra Enclave Community App API",
    description="A platform for ideas, safety, marketplace, and expense sharing",
    version="1.0.0"
)

# CORS middleware
# `os.environ.get(key, default)` only falls back when the key is absent, not
# when it's present-but-blank (e.g. an env var saved empty in a host's
# dashboard) — `or` catches that case too, since an empty string is falsy.
cors_origins_raw = os.environ.get("CORS_ORIGINS") or "http://localhost:3000"
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in cors_origins_raw.split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(ideas.router, prefix="/api/ideas", tags=["ideas"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["alerts"])
app.include_router(marketplace.router, prefix="/api/marketplace", tags=["marketplace"])
app.include_router(issues.router, prefix="/api/issues", tags=["issues"])
app.include_router(budgeting.router, prefix="/api/budgeting", tags=["budgeting"])

@app.get("/")
async def root():
    return {"message": "Supra Enclave Community App API is running!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
