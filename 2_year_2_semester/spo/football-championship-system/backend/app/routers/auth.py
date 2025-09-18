from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.auth import LoginResponse, LoginRequest
from app.services.auth import AuthService

router = APIRouter()

@router.post("/login", response_model=LoginResponse)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    # Используем AuthService для логики аутентификации
    auth_service = AuthService(db)
    
    # Создаем объект LoginRequest из формы
    login_data = LoginRequest(
        username=form_data.username,
        password=form_data.password
    )
    
    # Используем метод login из AuthService
    return auth_service.login(login_data)

@router.post("/logout")
async def logout():
    # In a real application, you might want to blacklist the token
    # For now, we'll just return a success message
    return {"message": "Successfully logged out"}