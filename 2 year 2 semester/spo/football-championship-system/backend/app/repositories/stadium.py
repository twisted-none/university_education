from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.stadium import Stadium
from app.schemas.stadium import StadiumCreate, StadiumUpdate
from app.repositories.base import BaseRepository

class StadiumRepository(BaseRepository[Stadium, StadiumCreate, StadiumUpdate]):
    def __init__(self, db: Session):
        super().__init__(Stadium, db)
    
    def get_by_name(self, name: str) -> Optional[Stadium]:
        return self.db.query(Stadium).filter(Stadium.name == name).first()
    
    def get_by_city(self, city: str) -> List[Stadium]:
        return self.db.query(Stadium).filter(Stadium.city == city).all()
    
    def search_by_name(self, name: str) -> List[Stadium]:
        return self.db.query(Stadium).filter(Stadium.name.ilike(f"%{name}%")).all()
    
    def get_by_capacity_range(self, min_capacity: int, max_capacity: int) -> List[Stadium]:
        return self.db.query(Stadium).filter(
            Stadium.capacity >= min_capacity,
            Stadium.capacity <= max_capacity
        ).all()
    
    def get_available_for_date(self, date) -> List[Stadium]:
        """Get stadiums that don't have matches on the given date"""
        from app.models.match import Match
        booked_stadium_ids = self.db.query(Match.stadium_id).filter(
            Match.date == date,
            Match.status != "cancelled"
        ).subquery()
        
        return self.db.query(Stadium).filter(
            ~Stadium.id.in_(booked_stadium_ids)
        ).all()