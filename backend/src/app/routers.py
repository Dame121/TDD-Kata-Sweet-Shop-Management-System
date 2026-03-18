"""
Main API router.
Aggregates all API version routers and defines application-level endpoints.
"""
from fastapi import APIRouter

# Import API version routers
from ..modules.V1.V1Router import v1_router

# Create the main API router
api_router = APIRouter()

# Include all API version routers
api_router.include_router(v1_router, prefix="/api/v1")

__all__ = ["api_router"]
