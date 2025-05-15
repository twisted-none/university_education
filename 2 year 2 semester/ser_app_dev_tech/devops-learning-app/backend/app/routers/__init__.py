from fastapi import APIRouter
from .auth import router as auth_router
from .user import router as user_router
from .roadmap import router as roadmap_router
from .configs import router as configs_router
from .logging import router as logging_router

# Создаем главный роутер для API
api_router = APIRouter(prefix="/api")

# Подключаем все роутеры
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(user_router, prefix="/user", tags=["user"])
api_router.include_router(roadmap_router, prefix="/roadmap", tags=["roadmap"])
api_router.include_router(configs_router, prefix="/configs", tags=["configs"])
api_router.include_router(logging_router, prefix="/log", tags=["logging"])