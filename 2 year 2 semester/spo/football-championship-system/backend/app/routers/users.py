from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, get_current_admin
from app.models.user import User
from app.schemas.user import (
    UserCreate, 
    UserUpdate, 
    User as UserSchema,
    UserInDB
)
from app.services.user import UserService

router = APIRouter(
    tags=["users"],
    responses={404: {"description": "Not found"}},
)


@router.get("", response_model=List[UserSchema])
def get_users(
    skip: int = Query(0, ge=0, description="Number of users to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of users to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Получение списка пользователей (только для администраторов).
    
    - **skip**: количество пользователей для пропуска (для пагинации)
    - **limit**: максимальное количество пользователей для возврата
    """
    user_service = UserService(db)
    users = user_service.get_users(skip=skip, limit=limit)
    return users


@router.get("/me", response_model=UserSchema)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Получение информации о текущем пользователе.
    """
    return current_user


@router.get("/active", response_model=List[UserSchema])
def get_active_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Получение списка активных пользователей (только для администраторов).
    """
    user_service = UserService(db)
    active_users = user_service.get_active_users()
    return active_users


@router.get("/statistics", response_model=Dict[str, Any])
def get_user_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Получение статистики по пользователям (только для администраторов).
    
    Возвращает:
    - Общее количество пользователей
    - Количество активных пользователей
    - Количество неактивных пользователей  
    - Распределение по ролям
    - Дата последней регистрации
    """
    user_service = UserService(db)
    statistics = user_service.get_user_statistics()
    return statistics


@router.get("/{user_id}", response_model=UserSchema)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Получение информации о пользователе по ID.
    
    - Администратор может просматривать любого пользователя
    - Обычный пользователь может просматривать только свой профиль
    """
    # Проверка прав доступа
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to view this user"
        )
    
    user_service = UserService(db)
    user = user_service.get_user(user_id)
    return user


@router.post("", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Создание нового пользователя (только для администраторов).
    
    - **username**: уникальное имя пользователя (3-50 символов)
    - **email**: уникальный email адрес
    - **password**: пароль (минимум 6 символов)
    - **role**: роль пользователя (admin, manager)
    - **is_active**: статус активности пользователя
    """
    user_service = UserService(db)
    new_user = user_service.create_user(user_data, current_user)
    return new_user


@router.put("/{user_id}", response_model=UserSchema)
def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Обновление информации о пользователе.
    
    - Администратор может обновлять любого пользователя
    - Обычный пользователь может обновлять только свой профиль
    - Только администратор может изменять роли и статус активности
    """
    user_service = UserService(db)
    updated_user = user_service.update_user(user_id, user_data, current_user)
    return updated_user


@router.delete("/{user_id}", response_model=Dict[str, str])
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Удаление пользователя (только для администраторов).
    
    - Нельзя удалить самого себя
    - Удаление необратимо
    """
    user_service = UserService(db)
    result = user_service.delete_user(user_id, current_user)
    return result


@router.post("/{user_id}/activate", response_model=UserSchema)
def activate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Активация пользователя (только для администраторов).
    """
    user_service = UserService(db)
    activated_user = user_service.activate_user(user_id, current_user)
    return activated_user


@router.post("/{user_id}/deactivate", response_model=UserSchema)
def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Деактивация пользователя (только для администраторов).
    
    - Нельзя деактивировать самого себя
    """
    user_service = UserService(db)
    deactivated_user = user_service.deactivate_user(user_id, current_user)
    return deactivated_user


@router.post("/{user_id}/change-password", response_model=Dict[str, str])
def change_user_password(
    user_id: int,
    password_data: Dict[str, str],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Смена пароля пользователя администратором (только для администраторов).
    
    Тело запроса должно содержать:
    ```json
    {
        "new_password": "новый_пароль"
    }
    ```
    """
    new_password = password_data.get("new_password")
    if not new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="new_password is required"
        )
    
    if len(new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long"
        )
    
    user_service = UserService(db)
    result = user_service.change_user_password(user_id, new_password, current_user)
    return result


@router.get("/search/username/{username}", response_model=UserSchema)
def get_user_by_username(
    username: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Поиск пользователя по имени пользователя (только для администраторов).
    """
    user_service = UserService(db)
    user = user_service.get_user_by_username(username)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


@router.get("/search/email/{email}", response_model=UserSchema)
def get_user_by_email(
    email: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Поиск пользователя по email (только для администраторов).
    """
    user_service = UserService(db)
    user = user_service.get_user_by_email(email)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user