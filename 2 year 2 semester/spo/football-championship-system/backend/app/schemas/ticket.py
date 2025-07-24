from pydantic import BaseModel, validator
from datetime import datetime

class TicketCalculationRequest(BaseModel):
    home_team_id: int
    away_team_id: int
    stadium_id: int
    category: str
    
    @validator('category')
    def validate_category(cls, v):
        valid_categories = ['VIP', 'Standard', 'Economy']
        if v not in valid_categories:
            raise ValueError(f'Category must be one of {valid_categories}')
        return v

class TicketCalculationResponse(BaseModel):
    category: str
    price: float
    base_price: float
    prestige_coefficient: float
    category_multiplier: float

class TicketBase(BaseModel):
    match_id: int
    category: str
    price: float
    
    @validator('category')
    def validate_category(cls, v):
        valid_categories = ['VIP', 'Standard', 'Economy']
        if v not in valid_categories:
            raise ValueError(f'Category must be one of {valid_categories}')
        return v
    
    @validator('price')
    def validate_price(cls, v):
        if v <= 0:
            raise ValueError('Price must be positive')
        return v

class TicketCreate(TicketBase):
    pass

class TicketInDBBase(TicketBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

class Ticket(TicketInDBBase):
    pass

class TicketWithMatch(TicketInDBBase):
    match: 'MatchWithDetails'
    
    class Config:
        orm_mode = True

# Avoid circular imports
from app.schemas.match import MatchWithDetails
TicketWithMatch.update_forward_refs()