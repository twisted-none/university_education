# backend/models.py (ИСПРАВЛЕННЫЙ)
from sqlalchemy import Column, Integer, String, ForeignKey, Date  # <-- УБРАН DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base 

# --- МОДЕЛЬ ПОЛЬЗОВАТЕЛЯ ---

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    # Role - строка, хранящая значение из схемы (Инженер, Менеджер, Руководитель)
    role = Column(String, default="Инженер") 

    # Обратные связи
    created_defects = relationship("Defect", foreign_keys="Defect.creator_id", back_populates="creator")
    executed_defects = relationship("Defect", foreign_keys="Defect.executor_id", back_populates="executor")

# --- МОДЕЛЬ КОММЕНТАРИЯ ---

class Comment(Base):
    __tablename__ = "comments"
    
    id = Column(Integer, primary_key=True, index=True)
    content = Column(String)
    # ИСПРАВЛЕНИЕ: Используем String вместо DateTime
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat()) # Время создания как строка
    
    # ... (остальные поля Comment)
    defect_id = Column(Integer, ForeignKey("defects.id"), index=True, nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    
    # ... (ORM связи)
    author = relationship("User", backref="comments_made")
    defect = relationship("Defect", back_populates="comments")


# --- МОДЕЛЬ ДЕФЕКТА ---
class Defect(Base):
    __tablename__ = "defects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    status = Column(String, default="Новая")
    priority = Column(String)
    due_date = Column(Date, nullable=True)
    
    creator_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    executor_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)

    # ORM связи
    creator = relationship("User", foreign_keys=[creator_id], back_populates="created_defects")
    executor = relationship("User", foreign_keys=[executor_id], back_populates="executed_defects")
    
    # НОВОЕ: Добавляем связь с комментариями
    comments = relationship("Comment", order_by=Comment.created_at, back_populates="defect")