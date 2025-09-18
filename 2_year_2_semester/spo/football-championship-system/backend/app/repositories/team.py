from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.team import Team
from app.schemas.team import TeamCreate, TeamUpdate
from app.repositories.base import BaseRepository

class TeamRepository(BaseRepository[Team, TeamCreate, TeamUpdate]):
    def __init__(self, db: Session):
        super().__init__(Team, db)
    
    def get_by_name(self, name: str) -> Optional[Team]:
        return self.db.query(Team).filter(Team.name == name).first()
    
    def get_by_city(self, city: str) -> List[Team]:
        return self.db.query(Team).filter(Team.city == city).all()
    
    def search_by_name(self, name: str) -> List[Team]:
        return self.db.query(Team).filter(Team.name.ilike(f"%{name}%")).all()