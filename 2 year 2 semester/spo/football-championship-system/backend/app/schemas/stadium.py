from typing import Optional
from pydantic import BaseModel, validator
from datetime import datetime

class StadiumBase(BaseModel):
    name: str
    city: str
    capacity: int
    
    @validator('capacity')
    def validate_capacity(cls, v):
        if v < 1000 or v > 100000:
            raise ValueError('Capacity must be between 1000 and 100000')
        return v

class StadiumCreate(StadiumBase):
    pass

class StadiumUpdate(BaseModel):
    name: Optional[str] = None
    city: Optional[str] = None
    capacity: Optional[int] = None
    
    @validator('capacity')
    def validate_capacity(cls, v):
        if v is not None and (v < 1000 or v > 100000):
            raise ValueError('Capacity must be between 1000 and 100000')
        return v

class StadiumInDBBase(StadiumBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

class Stadium(StadiumInDBBase):
    pass