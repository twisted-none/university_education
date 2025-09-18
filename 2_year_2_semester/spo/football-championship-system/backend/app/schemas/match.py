# backend/app/schemas/match.py

from typing import Optional
from pydantic import BaseModel, validator
from datetime import datetime

# --- ИЗМЕНЕНИЕ: Валидатор даты удален из базовой схемы ---
class MatchBase(BaseModel):
    date: datetime
    home_team_id: int
    away_team_id: int
    stadium_id: int

# --- ИЗМЕНЕНИЕ: Валидатор даты перенесен сюда ---
class MatchCreate(MatchBase):
    @validator('date')
    def validate_date_not_in_past(cls, v):
        # Этот валидатор будет работать только при создании нового матча
        if v < datetime.now():
            raise ValueError('Match date cannot be in the past')
        return v

    @validator('away_team_id')
    def validate_teams_different(cls, v, values):
        if 'home_team_id' in values and v == values['home_team_id']:
            raise ValueError('Home team and away team must be different')
        return v

class MatchUpdate(BaseModel):
    date: Optional[datetime] = None
    home_team_id: Optional[int] = None
    away_team_id: Optional[int] = None
    stadium_id: Optional[int] = None
    home_goals: Optional[int] = None
    away_goals: Optional[int] = None
    status: Optional[str] = None
    
    @validator('home_goals', 'away_goals')
    def validate_goals(cls, v):
        if v is not None and v < 0:
            raise ValueError('Goals cannot be negative')
        return v
    
    @validator('status')
    def validate_status(cls, v):
        if v is not None:
            valid_statuses = ['scheduled', 'finished', 'cancelled']
            if v not in valid_statuses:
                raise ValueError(f'Status must be one of {valid_statuses}')
        return v

class MatchResult(BaseModel):
    home_goals: int
    away_goals: int
    
    @validator('home_goals', 'away_goals')
    def validate_goals(cls, v):
        if v < 0:
            raise ValueError('Goals cannot be negative')
        return v

class MatchInDBBase(MatchBase):
    id: int
    home_goals: Optional[int] = None
    away_goals: Optional[int] = None
    status: str = "scheduled"
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True # ИЗМЕНЕНО: orm_mode -> from_attributes

class Match(MatchInDBBase):
    pass

class MatchWithDetails(MatchInDBBase):
    home_team: 'Team'
    away_team: 'Team'
    stadium: 'Stadium'
    
    class Config:
        from_attributes = True # ИЗМЕНЕНО: orm_mode -> from_attributes

# Avoid circular imports
from app.schemas.team import Team
from app.schemas.stadium import Stadium
MatchWithDetails.update_forward_refs()