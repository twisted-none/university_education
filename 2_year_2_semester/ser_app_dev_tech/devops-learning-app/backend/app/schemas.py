from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
from datetime import datetime

# Схемы для пользователя
class UserBase(BaseModel):
    telegram_id: int
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    photo_url: Optional[str] = None

# Добавьте поле init_data в класс UserCreate
class UserCreate(BaseModel):
    telegram_id: int
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    photo_url: Optional[str] = None
    auth_date: int
    hash: str
    init_data: Optional[str] = None  # Добавляем это поле

class UserUpdate(BaseModel):
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    settings: Optional[str] = None

class UserResponse(UserBase):
    id: int
    is_admin: Optional[bool] = False
    email: Optional[str] = None
    
    class Config:
        orm_mode = True

# Схемы для токена
class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Схемы для Node в Roadmap
class RoadmapNodeBase(BaseModel):
    title: str
    description: Optional[str] = None
    parent_id: Optional[int] = None
    order: Optional[int] = 0
    meta_data: Optional[Dict[str, Any]] = None

class RoadmapNodeCreate(RoadmapNodeBase):
    pass

class RoadmapNodeUpdate(RoadmapNodeBase):
    title: Optional[str] = None

class RoadmapNodeResponse(RoadmapNodeBase):
    id: int
    
    class Config:
        orm_mode = True

# Расширенная схема Node с вложенными дочерними элементами и прогрессом
class RoadmapNodeWithProgress(RoadmapNodeResponse):
    children: List['RoadmapNodeWithProgress'] = []
    progress: Optional[Dict[str, Any]] = None
    
    class Config:
        orm_mode = True

# Схемы для прогресса пользователя
class UserProgressBase(BaseModel):
    node_id: int
    is_completed: bool

class UserProgressCreate(UserProgressBase):
    pass

class UserProgressResponse(UserProgressBase):
    id: int
    user_id: int
    updated_at: datetime
    
    class Config:
        orm_mode = True

# Схемы для шаблонов конфигурации
class ConfigTemplateBase(BaseModel):
    name: str
    description: Optional[str] = None
    file_type: str
    category: Optional[str] = None

class ConfigTemplateCreate(ConfigTemplateBase):
    file_path: str

class ConfigTemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    file_type: Optional[str] = None
    category: Optional[str] = None
    file_path: Optional[str] = None

class ConfigTemplateResponse(ConfigTemplateBase):
    id: int
    file_path: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True

# Схемы для активности пользователя
class UserActivityBase(BaseModel):
    title: str
    type: str
    reference_id: Optional[int] = None

class UserActivityCreate(UserActivityBase):
    pass  # Удалено поле user_id, так как оно заполняется из current_user

class UserActivityResponse(UserActivityBase):
    id: int
    user_id: int
    timestamp: datetime
    
    class Config:
        orm_mode = True

# Схема для дашборда
class DashboardResponse(BaseModel):
    roadmapProgress: int
    availableConfigs: int
    recentActivities: List[Dict[str, Any]]
    
    class Config:
        orm_mode = True

# Схемы для проектов
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    stack: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    stack: Optional[str] = None

class ProjectResponse(ProjectBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

# Схемы для серверов
class ServerBase(BaseModel):
    name: str
    ip_address: Optional[str] = None
    provider: Optional[str] = None
    specifications: Optional[str] = None

class ServerCreate(ServerBase):
    pass

class ServerUpdate(BaseModel):
    name: Optional[str] = None
    ip_address: Optional[str] = None
    provider: Optional[str] = None
    specifications: Optional[str] = None

class ServerResponse(ServerBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

# Схемы для окружений
class EnvironmentBase(BaseModel):
    name: str
    description: Optional[str] = None
    env_type: str
    project_id: int

class EnvironmentCreate(EnvironmentBase):
    pass

class EnvironmentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    env_type: Optional[str] = None
    project_id: Optional[int] = None

class EnvironmentResponse(EnvironmentBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

# Схемы для заметок
class NoteBase(BaseModel):
    title: str
    content: Optional[str] = None
    roadmap_node_id: Optional[int] = None
    tags: Optional[str] = None

class NoteCreate(NoteBase):
    pass

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    roadmap_node_id: Optional[int] = None
    tags: Optional[str] = None

class NoteResponse(NoteBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

# Схемы для уведомлений
class NotificationBase(BaseModel):
    title: str
    message: Optional[str] = None
    notification_type: str
    reference_id: Optional[int] = None

class NotificationCreate(NotificationBase):
    user_id: int  # Нужен для создания уведомлений администраторами

class NotificationResponse(NotificationBase):
    id: int
    user_id: int
    read: bool
    read_at: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        orm_mode = True

# Схема для статистики
class RoadmapStats(BaseModel):
    totalNodes: int
    completedNodes: int
    completionPercentage: int
    categoryStats: Dict[str, Dict[str, int]]
    recentCompletions: List[Dict[str, Any]]

# Схема для результатов групповых операций
class BulkOperationResponse(BaseModel):
    affected_items: int

# Решение циклической зависимости для схемы с рекурсивными детьми
RoadmapNodeWithProgress.update_forward_refs()