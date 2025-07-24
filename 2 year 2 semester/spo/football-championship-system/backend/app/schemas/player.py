from typing import Optional
from pydantic import BaseModel, validator
from datetime import datetime

class PlayerBase(BaseModel):
    first_name: str
    last_name: str
    age: int
    jersey_number: int
    position: str
    
    @validator('age')
    def validate_age(cls, v):
        if v < 16 or v > 45:
            raise ValueError('Age must be between 16 and 45')
        return v
    
    @validator('jersey_number')
    def validate_jersey_number(cls, v):
        if v < 1 or v > 99:
            raise ValueError('Jersey number must be between 1 and 99')
        return v
    
    @validator('position')
    def validate_position(cls, v):
        valid_positions = ['GK', 'DEF', 'MID', 'FWD']
        if v not in valid_positions:
            raise ValueError(f'Position must be one of {valid_positions}')
        return v

class PlayerCreate(PlayerBase):
    team_id: int

class PlayerUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    age: Optional[int] = None
    jersey_number: Optional[int] = None
    position: Optional[str] = None
    team_id: Optional[int] = None
    
    @validator('age')
    def validate_age(cls, v):
        if v is not None and (v < 16 or v > 45):
            raise ValueError('Age must be between 16 and 45')
        return v
    
    @validator('jersey_number')
    def validate_jersey_number(cls, v):
        if v is not None and (v < 1 or v > 99):
            raise ValueError('Jersey number must be between 1 and 99')
        return v
    
    @validator('position')
    def validate_position(cls, v):
        if v is not None:
            valid_positions = ['GK', 'DEF', 'MID', 'FWD']
            if v not in valid_positions:
                raise ValueError(f'Position must be one of {valid_positions}')
        return v

class PlayerInDBBase(PlayerBase):
    id: int
    team_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

class Player(PlayerInDBBase):
    pass

class PlayerWithTeam(PlayerInDBBase):
    team: 'Team'
    
    class Config:
        orm_mode = True

# Avoid circular imports
from app.schemas.team import Team
PlayerWithTeam.update_forward_refs()