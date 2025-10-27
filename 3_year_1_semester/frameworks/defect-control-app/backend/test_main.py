import pytest
import sys
import os

# Добавляем текущую директорию в путь для импорта
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import database
from database import Base
import main
from main import app, get_db, pwd_context
import models
import schemas

# Создаем тестовую БД в памяти
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Переопределяем зависимость get_db для тестов
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

# Фикстура для настройки и очистки БД
@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


# ========== ТЕСТ 1: Создание пользователя ==========
def test_create_user():
    """Проверяет успешное создание нового пользователя"""
    response = client.post(
        "/users/",
        json={
            "username": "test_engineer",
            "password": "password123",
            "role": "Инженер"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "test_engineer"
    assert data["role"] == "Инженер"
    assert "id" in data
    # Проверяем, что пароль не возвращается
    assert "password" not in data
    assert "hashed_password" not in data


# ========== ТЕСТ 2: Дублирование username ==========
def test_create_duplicate_user():
    """Проверяет, что нельзя создать пользователя с существующим username"""
    # Создаем первого пользователя
    client.post(
        "/users/",
        json={
            "username": "duplicate_user",
            "password": "password123",
            "role": "Инженер"
        }
    )
    
    # Пытаемся создать второго с таким же username
    response = client.post(
        "/users/",
        json={
            "username": "duplicate_user",
            "password": "another_password",
            "role": "Менеджер"
        }
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Username already registered"


# ========== ТЕСТ 3: Успешная аутентификация ==========
def test_login_success():
    """Проверяет успешный логин с правильными учетными данными"""
    # Создаем пользователя
    client.post(
        "/users/",
        json={
            "username": "login_test",
            "password": "mypassword",
            "role": "Менеджер"
        }
    )
    
    # Пытаемся залогиниться
    response = client.post(
        "/token",
        data={
            "username": "login_test",
            "password": "mypassword"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["access_token"] == "login_test"
    assert data["token_type"] == "bearer"
    assert data["role"] == "Менеджер"


# ========== ТЕСТ 4: Неудачная аутентификация ==========
def test_login_wrong_password():
    """Проверяет отказ в доступе при неправильном пароле"""
    # Создаем пользователя
    client.post(
        "/users/",
        json={
            "username": "secure_user",
            "password": "correct_password",
            "role": "Инженер"
        }
    )
    
    # Пытаемся залогиниться с неправильным паролем
    response = client.post(
        "/token",
        data={
            "username": "secure_user",
            "password": "wrong_password"
        }
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect username or password"


# ========== ТЕСТ 5: Создание дефекта авторизованным пользователем ==========
def test_create_defect_as_engineer():
    """Проверяет создание дефекта инженером"""
    # Создаем и логиним инженера
    client.post(
        "/users/",
        json={
            "username": "engineer1",
            "password": "pass123",
            "role": "Инженер"
        }
    )
    
    login_response = client.post(
        "/token",
        data={
            "username": "engineer1",
            "password": "pass123"
        }
    )
    token = login_response.json()["access_token"]
    
    # Создаем дефект
    response = client.post(
        "/defects/",
        json={
            "title": "Критическая ошибка",
            "description": "Система не запускается",
            "priority": "Критический",
            "due_date": "2025-12-31",
            "executor_id": None
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Критическая ошибка"
    assert data["status"] == "Новая"
    assert data["priority"] == "Критический"
    assert data["creator_id"] is not None
    assert "id" in data