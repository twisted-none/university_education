from sqlalchemy import Column, String, Boolean, Text
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Role(BaseModel):
    __tablename__ = "roles"
    
    name = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Разрешения для роли
    can_manage_teams = Column(Boolean, default=False, nullable=False)
    can_manage_players = Column(Boolean, default=False, nullable=False)
    can_manage_stadiums = Column(Boolean, default=False, nullable=False)
    can_manage_matches = Column(Boolean, default=False, nullable=False)
    can_manage_tickets = Column(Boolean, default=False, nullable=False)
    can_view_reports = Column(Boolean, default=False, nullable=False)
    can_manage_users = Column(Boolean, default=False, nullable=False)
    can_view_audit_logs = Column(Boolean, default=False, nullable=False)
    
    # Связь с пользователями
    users = relationship("User", back_populates="role")
    
    def __repr__(self):
        return f"<Role(id={self.id}, name='{self.name}')>"
    
    @property
    def permissions(self):
        """Возвращает список разрешений роли"""
        perms = []
        if self.can_manage_teams:
            perms.append("manage_teams")
        if self.can_manage_players:
            perms.append("manage_players")
        if self.can_manage_stadiums:
            perms.append("manage_stadiums")
        if self.can_manage_matches:
            perms.append("manage_matches")
        if self.can_manage_tickets:
            perms.append("manage_tickets")
        if self.can_view_reports:
            perms.append("view_reports")
        if self.can_manage_users:
            perms.append("manage_users")
        if self.can_view_audit_logs:
            perms.append("view_audit_logs")
        return perms
    
    def has_permission(self, permission: str) -> bool:
        """Проверяет наличие определенного разрешения"""
        permission_mapping = {
            "manage_teams": self.can_manage_teams,
            "manage_players": self.can_manage_players,
            "manage_stadiums": self.can_manage_stadiums,
            "manage_matches": self.can_manage_matches,
            "manage_tickets": self.can_manage_tickets,
            "view_reports": self.can_view_reports,
            "manage_users": self.can_manage_users,
            "view_audit_logs": self.can_view_audit_logs,
        }
        return permission_mapping.get(permission, False)