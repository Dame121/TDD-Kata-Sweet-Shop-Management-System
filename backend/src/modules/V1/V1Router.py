"""
API V1 router.
Aggregates all V1 module routers.
"""
from fastapi import APIRouter

# Import module routers
from .AuthManager import router as auth_router
from .SweetsManager import router as sweets_router

# Create the V1 router
v1_router = APIRouter(tags=["V1"])

# Include all module routers
v1_router.include_router(auth_router)
v1_router.include_router(sweets_router)

__all__ = ["v1_router"]
