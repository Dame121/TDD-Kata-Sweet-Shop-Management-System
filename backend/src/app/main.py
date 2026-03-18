"""
FastAPI application initialization and configuration.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from .database import engine, Base, init_models
from .settings import settings
from .routers import api_router

# Load environment variables
load_dotenv()

# Initialize models and create tables
init_models()

# Create FastAPI app
app = FastAPI(
    title=settings.APP_TITLE,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
    openapi_url="/api/openapi.json",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include main API router (which includes all versioned routers)
app.include_router(api_router)


@app.get("/")
def read_root():
    """Root endpoint."""
    return {
        "message": "Sweet Shop Management System API",
        "version": settings.APP_VERSION,
        "docs": "/api/docs",
        "redoc": "/api/redoc"
    }


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "app": settings.APP_TITLE
    }
