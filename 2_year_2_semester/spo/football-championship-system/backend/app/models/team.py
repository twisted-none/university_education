from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class Team(BaseModel):
    __tablename__ = "teams"
    
    name = Column(String(100), nullable=False, unique=True, index=True)
    city = Column(String(100), nullable=False)
    coach = Column(String(100), nullable=False)
    last_season_place = Column(Integer, nullable=False)
    
    # Relationships
    players = relationship("Player", back_populates="team", cascade="all, delete-orphan")
    home_matches = relationship("Match", foreign_keys="Match.home_team_id", back_populates="home_team")
    away_matches = relationship("Match", foreign_keys="Match.away_team_id", back_populates="away_team")