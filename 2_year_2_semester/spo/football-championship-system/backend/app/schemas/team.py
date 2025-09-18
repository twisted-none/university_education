from typing import List, Optional
from pydantic import BaseModel, validator
from datetime import datetime

class TeamBase(BaseModel):
    name: str
    city: str
    coach: str
    last_season_place: int
    
    @validator('last_season_place')
    def validate_place(cls, v):
        if v < 1 or v > 20:
            raise ValueError('Place must be between 1 and 20')
        return v

class TeamCreate(TeamBase):
    pass

class TeamUpdate(BaseModel):
    name: Optional[str] = None
    city: Optional[str] = None
    coach: Optional[str] = None
    last_season_place: Optional[int] = None
    
    @validator('last_season_place')
    def validate_place(cls, v):
        if v is not None and (v < 1 or v > 20):
            raise ValueError('Place must be between 1 and 20')
        return v

class TeamInDBBase(TeamBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

class Team(TeamInDBBase):
    pass

class TeamWithPlayers(TeamInDBBase):
    players: List['Player'] = []
    
    class Config:
        orm_mode = True

# Avoid circular imports
from app.schemas.player import Player
TeamWithPlayers.update_forward_refs()