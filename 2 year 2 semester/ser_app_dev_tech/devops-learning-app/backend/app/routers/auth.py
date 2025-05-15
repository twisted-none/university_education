from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from ..database import get_db
from .. import models, schemas
from ..dependencies import create_access_token, verify_telegram_data, get_current_user

router = APIRouter()

@router.post("/telegram", response_model=schemas.Token)
async def login_with_telegram(user_data: schemas.UserCreate, db: Session = Depends(get_db)):

    print(f"Received auth request from user: {user_data.telegram_id}, username: {user_data.username}")
    if not user_data.telegram_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Telegram ID не предоставлен"
        )

    user = db.query(models.User).filter(models.User.telegram_id == user_data.telegram_id).first()
    
    # Если пользователь не найден - создаем нового
    if not user:
        print(f"Creating new user with telegram_id: {user_data.telegram_id}")
        user = models.User(
            telegram_id=user_data.telegram_id,
            username=user_data.username,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            photo_url=user_data.photo_url,
            auth_date=user_data.auth_date
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Обновляем информацию о пользователе
        print(f"Updating existing user: {user.id}, telegram_id: {user_data.telegram_id}")
        user.username = user_data.username
        user.first_name = user_data.first_name
        user.last_name = user_data.last_name
        user.photo_url = user_data.photo_url
        user.auth_date = user_data.auth_date
        db.commit()
        db.refresh(user)
    
    # Создаем токен доступа
    access_token = create_access_token({"sub": str(user.id)})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/validate-token", response_model=schemas.UserResponse)
async def validate_token(current_user: models.User = Depends(get_current_user)):
    # Просто возвращаем текущего пользователя, если токен валиден
    return current_user