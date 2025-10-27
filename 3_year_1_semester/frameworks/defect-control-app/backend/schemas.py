# backend/schemas.py (ИСПРАВЛЕННЫЙ)

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date
from enum import Enum

# --- ENUMS (Роли и Статусы) ---

class UserRole(str, Enum):
    """Определяет возможные роли пользователей."""
    ENGINEER = "Инженер"
    MANAGER = "Менеджер"
    OBSERVER = "Руководитель"

class DefectStatus(str, Enum):
    """Определяет возможные статусы дефектов."""
    NEW = "Новая"
    IN_PROGRESS = "В работе"
    FOR_REVIEW = "На проверке"
    CLOSED = "Закрыта"
    REOPENED = "Переоткрыта"

class DefectPriority(str, Enum):
    """Определяет возможные приоритеты дефектов."""
    LOW = "Низкий"
    MEDIUM = "Средний"
    HIGH = "Высокий"
    CRITICAL = "Критический"

# --- ПОЛЬЗОВАТЕЛИ ---

class UserBase(BaseModel):
    username: str = Field(min_length=3, max_length=50)

class UserCreate(UserBase):
    password: str = Field(min_length=6)
    role: UserRole = UserRole.ENGINEER # По умолчанию "Инженер"

class User(UserBase):
    id: int
    role: UserRole

    class Config:
        from_attributes = True

# --- ДЕФЕКТЫ ---

class DefectBase(BaseModel):
    title: str = Field(max_length=255)
    description: str = Field(max_length=2000)
    # priority теперь обязателен при создании
    priority: DefectPriority = DefectPriority.MEDIUM 
    due_date: Optional[date] = None
    executor_id: Optional[int] = None

class DefectCreate(DefectBase):
    """Схема для создания дефекта (поля, которые приходят с фронтенда)."""
    # Статус и creator_id устанавливаются на бэкенде.
    pass 

class DefectUpdate(BaseModel):
    """Схема для обновления дефекта (все поля опциональны)."""
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[DefectStatus] = None
    priority: Optional[DefectPriority] = None
    due_date: Optional[date] = None
    executor_id: Optional[int] = None
    
class CommentBase(BaseModel):
    content: str = Field(min_length=1, max_length=1000)

class CommentCreate(CommentBase):
    pass # При создании нужно только content, остальное - на бэкенде

class Comment(CommentBase):
    id: int
    defect_id: int
    author_id: int
    created_at: str  # ИСПРАВЛЕНИЕ: теперь строка вместо datetime
    
    # Связанный объект для отображения имени автора
    author: Optional['User'] = None 

    class Config:
        from_attributes = True

# --- ОБНОВЛЕНИЕ ДЕФЕКТА (для связки комментариев) ---
# Обновите Defect, чтобы он мог возвращать список комментариев
class Defect(DefectBase):
    """Полная схема дефекта для ответа API."""
    id: int
    status: DefectStatus
    creator_id: int
    
    # Связанные объекты для отображения
    creator: Optional[User] = None
    executor: Optional[User] = None
    
    # НОВОЕ: Добавляем список комментариев
    comments: List[Comment] = [] 

    class Config:
        from_attributes = True