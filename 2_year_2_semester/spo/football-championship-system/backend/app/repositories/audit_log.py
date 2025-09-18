from typing import List, Optional
from datetime import datetime, date
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_
from app.models.audit_log import AuditLog
from app.repositories.base import BaseRepository

class AuditLogRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_log(
        self,
        user_id: int,
        action: str,
        entity_type: str,
        entity_id: int,
        details: Optional[str] = None
    ) -> AuditLog:
        """Create a new audit log entry"""
        log_entry = AuditLog(
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            details=details
        )
        self.db.add(log_entry)
        self.db.commit()
        self.db.refresh(log_entry)
        return log_entry

    def get_by_user(self, user_id: int, skip: int = 0, limit: int = 1000) -> List[AuditLog]:
        """Get audit logs for a specific user"""
        return self.db.query(AuditLog).options(
            joinedload(AuditLog.user)
        ).filter(AuditLog.user_id == user_id).offset(skip).limit(limit).all()

    def get_by_entity(self, entity_type: str, entity_id: int) -> List[AuditLog]:
        """Get audit logs for a specific entity"""
        return self.db.query(AuditLog).options(
            joinedload(AuditLog.user)
        ).filter(
            AuditLog.entity_type == entity_type,
            AuditLog.entity_id == entity_id
        ).order_by(AuditLog.timestamp.desc()).all()

    def get_by_action(self, action: str, skip: int = 0, limit: int = 1000) -> List[AuditLog]:
        """Get audit logs by action type"""
        return self.db.query(AuditLog).options(
            joinedload(AuditLog.user)
        ).filter(AuditLog.action == action).offset(skip).limit(limit).all()

    def get_by_date_range(
        self, 
        start_date: date, 
        end_date: date, 
        skip: int = 0, 
        limit: int = 1000
    ) -> List[AuditLog]:
        """Get audit logs within a date range"""
        return self.db.query(AuditLog).options(
            joinedload(AuditLog.user)
        ).filter(
            and_(
                AuditLog.timestamp >= start_date,
                AuditLog.timestamp <= end_date
            )
        ).order_by(AuditLog.timestamp.desc()).offset(skip).limit(limit).all()

    def get_recent(self, limit: int = 500) -> List[AuditLog]:
        """Get recent audit log entries"""
        return self.db.query(AuditLog).options(
            joinedload(AuditLog.user)
        ).order_by(AuditLog.timestamp.desc()).limit(limit).all()

    def get_all(self, skip: int = 0, limit: int = 1000) -> List[AuditLog]:
        """Get all audit logs"""
        return self.db.query(AuditLog).options(
            joinedload(AuditLog.user)
        ).order_by(AuditLog.timestamp.desc()).offset(skip).limit(limit).all()