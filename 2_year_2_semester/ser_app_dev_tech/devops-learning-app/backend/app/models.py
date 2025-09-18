from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text, Table, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
from datetime import datetime, timezone, timedelta

def moscow_time():
    return datetime.now(timezone(timedelta(hours=3)))

# Модель пользователя
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    telegram_id = Column(Integer, unique=True, index=True)
    username = Column(String, nullable=True, index=True)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    photo_url = Column(String, nullable=True)
    auth_date = Column(Integer, nullable=True)
    is_admin = Column(Boolean, default=False)  # Добавлено поле для прав администратора
    email = Column(String, nullable=True)  # Добавлено поле для email
    settings = Column(Text, nullable=True)  # Добавлено поле для пользовательских настроек
    
    # Отношения
    progresses = relationship("UserProgress", back_populates="user")
    activities = relationship("UserActivity", back_populates="user")
    projects = relationship("Project", back_populates="user")  # Новое отношение
    servers = relationship("Server", back_populates="user")  # Новое отношение
    environments = relationship("Environment", back_populates="user")  # Новое отношение
    notes = relationship("Note", back_populates="user")  # Новое отношение
    notifications = relationship("Notification", back_populates="user")  # Новое отношение

# Модель узла дорожной карты (roadmap)
class RoadmapNode(Base):
    __tablename__ = "roadmap_nodes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    parent_id = Column(Integer, ForeignKey("roadmap_nodes.id"), nullable=True)
    order = Column(Integer, default=0)
    meta_data = Column(Text, nullable=True)  # JSON с дополнительными данными (ресурсы и т.д.)
    
    # Связи между узлами
    parent = relationship("RoadmapNode", remote_side=[id], backref="children")
    
    # Отношения
    user_progresses = relationship("UserProgress", back_populates="node")
    notes = relationship("Note", back_populates="node")  # Новое отношение

# Модель прогресса пользователя
class UserProgress(Base):
    __tablename__ = "user_progresses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    node_id = Column(Integer, ForeignKey("roadmap_nodes.id"))
    is_completed = Column(Boolean, default=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Отношения
    user = relationship("User", back_populates="progresses")
    node = relationship("RoadmapNode", back_populates="user_progresses")

# Модель шаблона конфигурации
class ConfigTemplate(Base):
    __tablename__ = "config_templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # yml, ini, conf, etc.
    category = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

# Модель активности пользователя
class UserActivity(Base):
    __tablename__ = "user_activities"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    type = Column(String, nullable=False)  # roadmap, config, etc.
    reference_id = Column(Integer, nullable=True)  # ID связанного элемента (узла roadmap, config и т.д.)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), onupdate=moscow_time)
    
    # Отношения
    user = relationship("User", back_populates="activities")

# Новые модели для проектов и инфраструктуры

# Модель проекта
class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    stack = Column(Text, nullable=True)  # JSON со стеком технологий
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Отношения
    user = relationship("User", back_populates="projects")
    environments = relationship("Environment", back_populates="project")  # Новое отношение

# Модель сервера
class Server(Base):
    __tablename__ = "servers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    ip_address = Column(String, nullable=True)
    provider = Column(String, nullable=True)
    specifications = Column(Text, nullable=True)  # JSON с характеристиками
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Отношения
    user = relationship("User", back_populates="servers")

# Модель окружения
class Environment(Base):
    __tablename__ = "environments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    env_type = Column(String, nullable=False)  # dev, staging, prod
    project_id = Column(Integer, ForeignKey("projects.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Отношения
    project = relationship("Project", back_populates="environments")
    user = relationship("User", back_populates="environments")

# Модель заметки
class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=True)
    roadmap_node_id = Column(Integer, ForeignKey("roadmap_nodes.id"), nullable=True)
    tags = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Отношения
    user = relationship("User", back_populates="notes")
    node = relationship("RoadmapNode", back_populates="notes")

# Модель уведомления
class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    message = Column(Text, nullable=True)
    notification_type = Column(String, nullable=False)  # system, roadmap, project, etc.
    reference_id = Column(Integer, nullable=True)
    read = Column(Boolean, default=False)
    read_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Отношения
    user = relationship("User", back_populates="notifications")