from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class Player(BaseModel):
    __tablename__ = "players"
    
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    age = Column(Integer, nullable=False)
    jersey_number = Column(Integer, nullable=False)
    position = Column(String(20), nullable=False)  # GK, DEF, MID, FWD
    
    # Relationships
    team = relationship("Team", back_populates="players")
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} (#{self.jersey_number})"