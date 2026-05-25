from .classes_router import router as classes_router
from .students_router import router as students_router
from .assessments_router import router as assessments_router
from .config_router import router as config_router

__all__ = ["classes_router", "students_router", "assessments_router", "config_router"]