from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from .routers import auth, configs, roadmap, user, logging
from .routers import notifications, history

from .database import engine, Base

# Создаем таблицы в БД
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="DevOps Learning API",
    redirect_slashes=False  # Отключение перенаправления URL с/без слешей
)

# Настройка CORS для мини-приложения Telegram
frontend_url = os.environ.get("FRONTEND_URL", "https://devops-learning-project.ru")
allowed_origins = [
    frontend_url,
    "https://web.telegram.org",
    "https://telegram.org",
    "http://localhost:5173",  # Для локальной разработки
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

# Подключаем основные роутеры
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(configs.router, prefix="/api/configs", tags=["configs"])
app.include_router(roadmap.router, prefix="/api/roadmap", tags=["roadmap"])
app.include_router(user.router, prefix="/api/users", tags=["users"])
app.include_router(logging.router, prefix="/api/log", tags=["logging"])

# Подключаем новые роутеры
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])
app.include_router(history.router, prefix="/api/history", tags=["history"])

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "telegram_bot_token_set": bool(os.environ.get("BOT_TOKEN"))}