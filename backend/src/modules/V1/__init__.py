"""API V1 modules."""
from .AuthManager import router as auth_router
from .SweetsManager import router as sweets_router

__all__ = ["auth_router", "sweets_router"]
