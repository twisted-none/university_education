from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class Stadium(BaseModel):
    __tablename__ = "stadiums"
    
    name = Column(String(100), nullable=False, unique=True, index=True)
    city = Column(String(100), nullable=False)
    capacity = Column(Integer, nullable=False)
    
    # Relationships
    matches = relationship("Match", back_populates="stadium")
    
    def __str__(self):
        return f"{self.name} ({self.city})"