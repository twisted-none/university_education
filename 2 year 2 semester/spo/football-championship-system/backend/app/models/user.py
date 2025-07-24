from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class User(BaseModel):
    __tablename__ = "users"
    
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(100), nullable=False)
    role = Column(String(20), nullable=False, default="manager")  # admin, manager
    is_active = Column(Boolean, default=True)
    
    # Relationships
    audit_logs = relationship("AuditLog", back_populates="user")