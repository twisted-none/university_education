from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime, timedelta

from ..database import get_db
from .. import models, schemas
from ..dependencies import get_current_user

router = APIRouter()

@router.get("/activities", response_model=List[schemas.UserActivityResponse])
async def get_user_activities(
    limit: int = Query(20, gt=0, le=100),
    offset: int = Query(0, ge=0),
    activity_type: Optional[str] = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Получение истории активности пользователя с пагинацией и фильтрацией"""
    query = db.query(models.UserActivity).filter(models.UserActivity.user_id == current_user.id)
    
    if activity_type:
        query = query.filter(models.UserActivity.type == activity_type)
    
    total = query.count()
    
    activities = query.order_by(desc(models.UserActivity.timestamp)).offset(offset).limit(limit).all()
    
    # Преобразуем объекты в словари и добавляем user_id явно
    result = []
    for activity in activities:
        activity_dict = {
            "id": activity.id,
            "user_id": activity.user_id,
            "title": activity.title,
            "type": activity.type,
            "reference_id": activity.reference_id,
            "timestamp": activity.timestamp
        }
        result.append(activity_dict)
    
    return result

@router.delete("/activities/{activity_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_activity(
    activity_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Удаление записи активности пользователя"""
    activity = db.query(models.UserActivity).filter(
        models.UserActivity.id == activity_id,
        models.UserActivity.user_id == current_user.id
    ).first()
    
    if not activity:
        raise HTTPException(status_code=404, detail="Запись активности не найдена")
    
    db.delete(activity)
    db.commit()
    
    return None

@router.delete("/activities", status_code=status.HTTP_204_NO_CONTENT)
async def clear_activities_history(
    activity_type: Optional[str] = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Очистка истории активности пользователя с возможностью фильтрации по типу"""
    query = db.query(models.UserActivity).filter(models.UserActivity.user_id == current_user.id)
    
    if activity_type:
        query = query.filter(models.UserActivity.type == activity_type)
    
    query.delete(synchronize_session=False)
    db.commit()
    
    return None