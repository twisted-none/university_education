# backend/app/core/deps.py

from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_token
from app.repositories.user import UserRepository
from app.models.user import User

# Используем OAuth2PasswordBearer, так как это стандарт для JWT с Bearer токенами
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    """
    Зависимость для получения текущего пользователя из JWT токена.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = verify_token(token)
    
    if payload is None:
        raise credentials_exception
    
    # Извлекаем ID пользователя из поля "sub"
    user_id_str: str | None = payload.get("sub")
    if user_id_str is None:
        raise credentials_exception
    
    try:
        user_id = int(user_id_str)
    except (ValueError, TypeError):
        raise credentials_exception

    user_repo = UserRepository(db)
    user = user_repo.get(user_id) # Ищем пользователя по ID
    
    if user is None:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Inactive user")
        
    return user

def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    """
    Зависимость, которая проверяет, является ли текущий пользователь администратором.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user does not have enough privileges. Administrator role required."
        )
    return current_user

def get_current_manager_or_admin(current_user: User = Depends(get_current_user)) -> User:
    """
    Зависимость, которая проверяет, является ли текущий пользователь менеджером или администратором.
    """
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user does not have enough privileges. Manager or Administrator role required."
        )
    return current_user