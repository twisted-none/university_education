from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class Ticket(BaseModel):
    __tablename__ = "tickets"
    
    match_id = Column(Integer, ForeignKey("matches.id"), nullable=False)
    category = Column(String(20), nullable=False)  # VIP, Standard, Economy
    price = Column(Float, nullable=False)
    
    # Relationships
    match = relationship("Match", back_populates="tickets")
    
    def __str__(self):
        return f"{self.category} ticket for {self.match}"