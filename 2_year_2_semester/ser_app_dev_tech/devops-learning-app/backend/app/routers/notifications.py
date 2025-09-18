from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime

from ..database import get_db
from .. import models, schemas
from ..dependencies import get_current_user

router = APIRouter()

@router.get("", response_model=List[schemas.NotificationResponse])
async def get_notifications(
    unread_only: bool = False,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Получение уведомлений пользователя"""
    query = db.query(models.Notification).filter(models.Notification.user_id == current_user.id)
    
    if unread_only:
        query = query.filter(models.Notification.read == False)
    
    notifications = query.order_by(desc(models.Notification.created_at)).all()
    return notifications

@router.post("", response_model=schemas.NotificationResponse, status_code=status.HTTP_201_CREATED)
async def create_notification(
    notification: schemas.NotificationCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Создание нового уведомления (для админов или системы)"""
    # Проверка прав на создание уведомлений для других пользователей
    if notification.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Недостаточно прав для создания уведомлений"
        )
    
    new_notification = models.Notification(
        user_id=notification.user_id,
        title=notification.title,
        message=notification.message,
        notification_type=notification.notification_type,
        reference_id=notification.reference_id,
        read=False
    )
    db.add(new_notification)
    db.commit()
    db.refresh(new_notification)
    
    return new_notification

@router.patch("/{notification_id}/read", response_model=schemas.NotificationResponse)
async def mark_notification_as_read(
    notification_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Отметка уведомления как прочитанного"""
    notification = db.query(models.Notification).filter(
        models.Notification.id == notification_id,
        models.Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Уведомление не найдено")
    
    notification.read = True
    notification.read_at = datetime.now()
    db.commit()
    db.refresh(notification)
    
    return notification

@router.patch("/read-all", response_model=schemas.BulkOperationResponse)
async def mark_all_notifications_as_read(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Отметка всех уведомлений пользователя как прочитанных"""
    now = datetime.now()
    
    result = db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id,
        models.Notification.read == False
    ).update(
        {"read": True, "read_at": now},
        synchronize_session=False
    )
    
    db.commit()
    
    return {"affected_items": result}

@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(
    notification_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Удаление уведомления"""
    notification = db.query(models.Notification).filter(
        models.Notification.id == notification_id,
        models.Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Уведомление не найдено")
    
    db.delete(notification)
    db.commit()
    
    return None