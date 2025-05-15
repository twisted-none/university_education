from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional

from ..database import get_db
from .. import models, schemas
from ..dependencies import get_current_user

router = APIRouter()

@router.get("/me", response_model=schemas.UserResponse)
async def get_current_user_info(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.get("/dashboard", response_model=schemas.DashboardResponse)
async def get_dashboard(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Получаем общее количество узлов в roadmap
    total_nodes = db.query(func.count(models.RoadmapNode.id)).scalar()
    
    # Получаем количество завершенных узлов для текущего пользователя
    completed_nodes = db.query(func.count(models.UserProgress.id)).filter(
        models.UserProgress.user_id == current_user.id,
        models.UserProgress.is_completed == True
    ).scalar()
    
    # Вычисляем процент прогресса (избегаем деления на ноль)
    roadmap_progress = int((completed_nodes / total_nodes) * 100) if total_nodes > 0 else 0
    
    # Получаем количество доступных конфигураций
    available_configs = db.query(func.count(models.ConfigTemplate.id)).scalar()
    
    # Получаем последние действия пользователя с включением user_id в ответ
    recent_activities = db.query(models.UserActivity).filter(
        models.UserActivity.user_id == current_user.id
    ).order_by(desc(models.UserActivity.timestamp)).limit(5).all()
    
    # Создаем список активностей с добавлением user_id
    activities_with_user_id = []
    for activity in recent_activities:
        activity_dict = {
            "id": activity.id,
            "user_id": activity.user_id,
            "title": activity.title,
            "type": activity.type,
            "reference_id": activity.reference_id,
            "timestamp": activity.timestamp
        }
        activities_with_user_id.append(activity_dict)
    
    return {
        "roadmapProgress": roadmap_progress,
        "availableConfigs": available_configs,
        "recentActivities": activities_with_user_id
    }

@router.post("/activities", response_model=schemas.UserActivityResponse)
async def create_activity(
    activity: schemas.UserActivityCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_activity = models.UserActivity(
        user_id=current_user.id,
        title=activity.title,
        type=activity.type,
        reference_id=activity.reference_id
    )
    db.add(new_activity)
    db.commit()
    db.refresh(new_activity)
    
    # Преобразуем объект в словарь и добавляем user_id явно
    response = {
        "id": new_activity.id,
        "user_id": new_activity.user_id,
        "title": new_activity.title,
        "type": new_activity.type,
        "reference_id": new_activity.reference_id,
        "timestamp": new_activity.timestamp
    }
    
    return response

@router.patch("/me", response_model=schemas.UserResponse)
async def update_current_user(
    user_update: schemas.UserUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Обновление информации о текущем пользователе"""
    # Обновляем только разрешенные поля
    for field, value in user_update.dict(exclude_unset=True).items():
        if field in ["username", "first_name", "last_name", "email", "settings"]:
            setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    
    return current_user

@router.get("/users", response_model=List[schemas.UserResponse])
async def get_users(
    skip: int = 0,
    limit: int = 10,
    username: Optional[str] = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Получение списка пользователей (для админов)"""
    # Проверяем права администратора
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Недостаточно прав для просмотра списка пользователей"
        )
    
    query = db.query(models.User)
    
    if username:
        query = query.filter(models.User.username.contains(username))
    
    users = query.offset(skip).limit(limit).all()
    return users

@router.get("/users/{user_id}", response_model=schemas.UserResponse)
async def get_user_by_id(
    user_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Получение информации о пользователе по ID (для админов)"""
    # Проверяем права администратора или самого пользователя
    if not current_user.is_admin and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Недостаточно прав для просмотра информации о пользователе"
        )
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    return user