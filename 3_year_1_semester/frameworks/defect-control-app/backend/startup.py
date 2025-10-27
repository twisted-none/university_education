# backend/startup.py

import sys
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from sqlalchemy.exc import OperationalError

import models
from database import SessionLocal, engine
from schemas import UserRole # Импортируем роли из schemas

# Контекст для хеширования паролей
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_default_users(db: Session):
    """Создает тестовых пользователей, если они не существуют."""
    
    default_users_data = [
        ("инженер_тест", "password", UserRole.ENGINEER),
        ("менеджер_тест", "password", UserRole.MANAGER),
        ("руководитель_тест", "password", UserRole.OBSERVER),
    ]

    for username, password, role in default_users_data:
        # Проверяем, существует ли пользователь по имени
        if not db.query(models.User).filter(models.User.username == username).first():
            hashed_password = pwd_context.hash(password)
            db_user = models.User(
                username=username, 
                hashed_password=hashed_password, 
                role=role.value
            )
            db.add(db_user)
            db.commit()
            print(f"✅ Default user '{username}' ({role.value}) created.")
        else:
             print(f"💡 Default user '{username}' already exists.")

def init_db():
    """Инициализация базы данных: создание таблиц и пользователей."""
    print("🚀 Initializing database...")
    
    try:
        # 1. Создание всех таблиц (если они еще не существуют)
        models.Base.metadata.create_all(bind=engine) 
        print("✅ Database tables created successfully.")
        
        # 2. Создание тестовых пользователей
        db = SessionLocal()
        try:
            create_default_users(db)
        finally:
            db.close()
            
    except OperationalError as e:
        print("❌ FATAL: Could not connect to the database. Make sure PostgreSQL is running and configured correctly.")
        print(f"Error details: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ An unexpected error occurred during initialization: {e}")
        sys.exit(1)
        
    print("✨ Database initialization complete.")

if __name__ == "__main__":
    init_db()