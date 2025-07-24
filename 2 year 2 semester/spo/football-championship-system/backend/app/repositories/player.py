# backend/app/repositories/player.py

from typing import Optional, List
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from app.models.player import Player
from app.schemas.player import PlayerCreate, PlayerUpdate
from app.repositories.base import BaseRepository

class PlayerRepository(BaseRepository[Player, PlayerCreate, PlayerUpdate]):
    def __init__(self, db: Session):
        super().__init__(Player, db)

    def get_filtered(
        self,
        skip: int = 0,
        limit: int = 1000,
        team_id: Optional[int] = None,
        position: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[Player]:
        """
        Get a list of players with combined filters, pagination, and eager-loaded team info.
        """
        query = self.db.query(self.model).options(joinedload(self.model.team))

        if team_id:
            query = query.filter(self.model.team_id == team_id)
        
        if position:
            query = query.filter(self.model.position == position)

        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    self.model.first_name.ilike(search_term),
                    self.model.last_name.ilike(search_term)
                )
            )
        
        # Сортируем по умолчанию для предсказуемого результата
        query = query.order_by(self.model.last_name, self.model.first_name)
        
        return query.offset(skip).limit(limit).all()

    def get_with_team(self, player_id: int) -> Optional[Player]:
        """Get a single player with team information."""
        return self.db.query(self.model).options(joinedload(self.model.team)).filter(self.model.id == player_id).first()

    def get_by_jersey_number_and_team(self, jersey_number: int, team_id: int) -> Optional[Player]:
        """Check if a jersey number is taken in a specific team."""
        return self.db.query(self.model).filter(
            self.model.jersey_number == jersey_number,
            self.model.team_id == team_id
        ).first()
    
    def get_by_age_range(self, min_age: int, max_age: int) -> List[Player]:
        """Get players within a specific age range."""
        return self.db.query(self.model).options(joinedload(self.model.team)).filter(
            self.model.age >= min_age,
            self.model.age <= max_age
        ).order_by(self.model.age).all()
    
    def count_by_team(self, team_id: int) -> int:
        """Count players in a specific team."""
        return self.db.query(self.model).filter(self.model.team_id == team_id).count()