from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.core.security import get_password_hash, verify_password
from app.repositories.user import UserRepository
from app.models.user import User
from app.models.audit_log import AuditLog
from app.schemas.user import UserCreate, UserUpdate, UserInDB


class UserService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repository = UserRepository(db)
    
    def get_users(self, skip: int = 0, limit: int = 100) -> List[User]:
        """Получение списка пользователей"""
        return self.user_repository.get_multi(skip=skip, limit=limit)
    
    def get_user(self, user_id: int) -> Optional[User]:
        """Получение пользователя по ID"""
        user = self.user_repository.get(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return user
    
    def get_user_by_username(self, username: str) -> Optional[User]:
        """Получение пользователя по имени пользователя"""
        return self.user_repository.get_by_username(username)
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """Получение пользователя по email"""
        return self.user_repository.get_by_email(email)
    
    def create_user(self, user_data: UserCreate, current_user: User) -> User:
        """Создание нового пользователя"""
        # Проверка уникальности username
        existing_user = self.user_repository.get_by_username(user_data.username)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered"
            )
        
        # Проверка уникальности email
        existing_email = self.user_repository.get_by_email(user_data.email)
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        try:
            # Хеширование пароля
            password_hash = get_password_hash(user_data.password)
            
            # Создание пользователя
            db_user = User(
                username=user_data.username,
                email=user_data.email,
                password_hash=password_hash,
                role=user_data.role,
                is_active=user_data.is_active
            )
            
            created_user = self.user_repository.create(db_user)
            
            # Логирование создания пользователя
            self._log_action(
                user_id=current_user.id,
                action="CREATE",
                entity_type="USER",
                entity_id=created_user.id,
                details=f"Created user {created_user.username} with role {created_user.role}"
            )
            
            return created_user
            
        except IntegrityError:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User creation failed due to database constraints"
            )
    
    def update_user(self, user_id: int, user_data: UserUpdate, current_user: User) -> User:
        """Обновление пользователя"""
        user = self.get_user(user_id)
        
        # Проверка, что пользователь может редактировать только себя или админ может редактировать всех
        if current_user.role != "admin" and current_user.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to update this user"
            )
        
        update_data = {}
        changes = []
        
        # Обновление username
        if user_data.username is not None and user_data.username != user.username:
            existing_user = self.user_repository.get_by_username(user_data.username)
            if existing_user and existing_user.id != user_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already taken"
                )
            update_data["username"] = user_data.username
            changes.append(f"username: {user.username} -> {user_data.username}")
        
        # Обновление email
        if user_data.email is not None and user_data.email != user.email:
            existing_email = self.user_repository.get_by_email(user_data.email)
            if existing_email and existing_email.id != user_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already taken"
                )
            update_data["email"] = user_data.email
            changes.append(f"email: {user.email} -> {user_data.email}")
        
        # Обновление пароля
        if user_data.password is not None:
            update_data["password_hash"] = get_password_hash(user_data.password)
            changes.append("password updated")
        
        # Обновление роли (только админ может менять роли)
        if user_data.role is not None and user_data.role != user.role:
            if current_user.role != "admin":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only admin can change user roles"
                )
            update_data["role"] = user_data.role
            changes.append(f"role: {user.role} -> {user_data.role}")
        
        # Обновление статуса активности (только админ может деактивировать пользователей)
        if user_data.is_active is not None and user_data.is_active != user.is_active:
            if current_user.role != "admin":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only admin can change user active status"
                )
            update_data["is_active"] = user_data.is_active
            status_text = "activated" if user_data.is_active else "deactivated"
            changes.append(f"user {status_text}")
        
        if not update_data:
            return user
        
        try:
            updated_user = self.user_repository.update(user, update_data)
            
            # Логирование обновления пользователя
            self._log_action(
                user_id=current_user.id,
                action="UPDATE",
                entity_type="USER",
                entity_id=user_id,
                details=f"Updated user {user.username}: {', '.join(changes)}"
            )
            
            return updated_user
            
        except IntegrityError:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User update failed due to database constraints"
            )
    
    def delete_user(self, user_id: int, current_user: User) -> Dict[str, str]:
        """Удаление пользователя (только админ)"""
        if current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admin can delete users"
            )
        
        user = self.get_user(user_id)
        
        # Нельзя удалить самого себя
        if current_user.id == user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete your own account"
            )
        
        username = user.username
        self.user_repository.remove(user_id)
        
        # Логирование удаления пользователя
        self._log_action(
            user_id=current_user.id,
            action="DELETE",
            entity_type="USER",
            entity_id=user_id,
            details=f"Deleted user {username}"
        )
        
        return {"message": f"User {username} deleted successfully"}
    
    def activate_user(self, user_id: int, current_user: User) -> User:
        """Активация пользователя (только админ)"""
        if current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admin can activate users"
            )
        
        user = self.get_user(user_id)
        
        if user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already active"
            )
        
        updated_user = self.user_repository.update(user, {"is_active": True})
        
        # Логирование активации пользователя
        self._log_action(
            user_id=current_user.id,
            action="UPDATE",
            entity_type="USER",
            entity_id=user_id,
            details=f"Activated user {user.username}"
        )
        
        return updated_user
    
    def deactivate_user(self, user_id: int, current_user: User) -> User:
        """Деактивация пользователя (только админ)"""
        if current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admin can deactivate users"
            )
        
        user = self.get_user(user_id)
        
        # Нельзя деактивировать самого себя
        if current_user.id == user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot deactivate your own account"
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already inactive"
            )
        
        updated_user = self.user_repository.update(user, {"is_active": False})
        
        # Логирование деактивации пользователя
        self._log_action(
            user_id=current_user.id,
            action="UPDATE",
            entity_type="USER",
            entity_id=user_id,
            details=f"Deactivated user {user.username}"
        )
        
        return updated_user
    
    def change_user_password(self, user_id: int, new_password: str, current_user: User) -> Dict[str, str]:
        """Смена пароля пользователя (админом)"""
        if current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admin can change user passwords"
            )
        
        user = self.get_user(user_id)
        
        password_hash = get_password_hash(new_password)
        self.user_repository.update(user, {"password_hash": password_hash})
        
        # Логирование смены пароля
        self._log_action(
            user_id=current_user.id,
            action="UPDATE",
            entity_type="USER",
            entity_id=user_id,
            details=f"Changed password for user {user.username}"
        )
        
        return {"message": f"Password changed successfully for user {user.username}"}
    
    def get_active_users(self) -> List[User]:
        """Получение списка активных пользователей"""
        return self.user_repository.get_active_users()
    
    def get_user_statistics(self) -> Dict[str, Any]:
        """Получение статистики по пользователям"""
        all_users = self.user_repository.get_multi(skip=0, limit=1000)
        
        total_users = len(all_users)
        active_users = len([u for u in all_users if u.is_active])
        inactive_users = total_users - active_users
        
        roles_count = {}
        for user in all_users:
            roles_count[user.role] = roles_count.get(user.role, 0) + 1
        
        return {
            "total_users": total_users,
            "active_users": active_users,
            "inactive_users": inactive_users,
            "roles_distribution": roles_count,
            "last_registered": max(all_users, key=lambda x: x.created_at).created_at if all_users else None
        }
    
    def _log_action(self, user_id: int, action: str, entity_type: str, 
                   entity_id: int, details: str = None) -> None:
        """Внутренний метод для логирования действий"""
        audit_log = AuditLog(
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            details=details,
            timestamp=datetime.utcnow()
        )
        self.db.add(audit_log)
        self.db.commit()