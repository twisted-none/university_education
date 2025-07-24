from typing import List, Optional
from datetime import datetime, date
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_
from app.models.match import Match
from app.schemas.match import MatchCreate, MatchUpdate
from app.repositories.base import BaseRepository

class MatchRepository(BaseRepository[Match, MatchCreate, MatchUpdate]):
    def __init__(self, db: Session):
        super().__init__(Match, db)
    
    def get_with_details(self, match_id: int) -> Optional[Match]:
        """Get match with related team and stadium data"""
        return self.db.query(Match).options(
            joinedload(Match.home_team),
            joinedload(Match.away_team),
            joinedload(Match.stadium)
        ).filter(Match.id == match_id).first()
    
    def get_all_with_details(self, skip: int = 0, limit: int = 1000) -> List[Match]:
        """Get all matches with related data"""
        return self.db.query(Match).options(
            joinedload(Match.home_team),
            joinedload(Match.away_team),
            joinedload(Match.stadium)
        ).offset(skip).limit(limit).all()
    
    def get_by_team(self, team_id: int) -> List[Match]:
        """Get all matches for a specific team"""
        return self.db.query(Match).filter(
            or_(Match.home_team_id == team_id, Match.away_team_id == team_id)
        ).options(
            joinedload(Match.home_team),
            joinedload(Match.away_team),
            joinedload(Match.stadium)
        ).all()
    
    def get_by_stadium(self, stadium_id: int) -> List[Match]:
        """Get all matches for a specific stadium"""
        return self.db.query(Match).filter(Match.stadium_id == stadium_id).options(
            joinedload(Match.home_team),
            joinedload(Match.away_team),
            joinedload(Match.stadium)
        ).all()
    
    def get_by_date_range(self, start_date: datetime, end_date: datetime) -> List[Match]:
        """Get matches within date range"""
        return self.db.query(Match).filter(
            and_(Match.date >= start_date, Match.date <= end_date)
        ).options(
            joinedload(Match.home_team),
            joinedload(Match.away_team),
            joinedload(Match.stadium)
        ).all()
    
    def get_by_status(self, status: str) -> List[Match]:
        """Get matches by status"""
        return self.db.query(Match).filter(Match.status == status).options(
            joinedload(Match.home_team),
            joinedload(Match.away_team),
            joinedload(Match.stadium)
        ).all()
    
    def get_finished_matches(self) -> List[Match]:
        """Get all finished matches"""
        return self.get_by_status("finished")
    
    def get_upcoming_matches(self, limit: int = 1000) -> List[Match]:
        """Get upcoming matches"""
        return self.db.query(Match).filter(
            Match.date > datetime.now(),
            Match.status == "scheduled"
        ).order_by(Match.date).limit(limit).options(
            joinedload(Match.home_team),
            joinedload(Match.away_team),
            joinedload(Match.stadium)
        ).all()
    
    def check_team_availability(self, team_id: int, match_date: datetime, exclude_match_id: Optional[int] = None) -> bool:
        """Check if team is available for a match on given date"""
        query = self.db.query(Match).filter(
            or_(Match.home_team_id == team_id, Match.away_team_id == team_id),
            Match.date == match_date,
            Match.status != "cancelled"
        )
        
        if exclude_match_id:
            query = query.filter(Match.id != exclude_match_id)
        
        return query.first() is None
    
    def check_stadium_availability(self, stadium_id: int, match_date: datetime, exclude_match_id: Optional[int] = None) -> bool:
        """Check if stadium is available for a match on given date"""
        query = self.db.query(Match).filter(
            Match.stadium_id == stadium_id,
            Match.date == match_date,
            Match.status != "cancelled"
        )
        
        if exclude_match_id:
            query = query.filter(Match.id != exclude_match_id)
        
        return query.first() is None
    
    def get_head_to_head(self, team1_id: int, team2_id: int) -> List[Match]:
        """Get head-to-head matches between two teams"""
        return self.db.query(Match).filter(
            or_(
                and_(Match.home_team_id == team1_id, Match.away_team_id == team2_id),
                and_(Match.home_team_id == team2_id, Match.away_team_id == team1_id)
            )
        ).options(
            joinedload(Match.home_team),
            joinedload(Match.away_team),
            joinedload(Match.stadium)
        ).all()