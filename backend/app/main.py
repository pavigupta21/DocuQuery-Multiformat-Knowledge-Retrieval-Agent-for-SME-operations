from fastapi import FastAPI

from .database import Base, engine
from app.models import User
from . import models
from app.routes.auth import router as auth_router
from fastapi.middleware.cors import CORSMiddleware


# Creates tables defined by SQLAlchemy models
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="DocuQuery Backend",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)


@app.get("/")
def root():
    return {
        "message": "DocuQuery backend is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }