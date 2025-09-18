from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime

from app.models.match import Match
from app.repositories.match import MatchRepository
from app.repositories.team import TeamRepository
from app.repositories.stadium import StadiumRepository
from app.repositories.ticket import TicketRepository
from app.schemas.match import MatchCreate, MatchUpdate, MatchResult
from app.services.audit import AuditService
from app.utils.ticket_calculator import TicketCalculator

class MatchService:
    def __init__(self, db: Session):
        self.db = db
        self.match_repo = MatchRepository(db)
        self.team_repo = TeamRepository(db)
        self.stadium_repo = StadiumRepository(db)
        self.ticket_repo = TicketRepository(db)
        self.audit_service = AuditService(db)
        self.ticket_calculator = TicketCalculator()
    
    def get_matches(self, skip: int = 0, limit: int = 100) -> List[Match]:
        """Get matches with details"""
        return self.match_repo.get_all_with_details(skip=skip, limit=limit)
    
    def get_match_by_id(self, match_id: int) -> Match:
        """Get match by ID with error handling"""
        match = self.match_repo.get_with_details(match_id)
        if not match:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Match not found"
            )
        return match
    
    def create_match(self, match_data: MatchCreate, user_id: int) -> Match:
        """Create new match with validation"""
        # Validate teams exist
        home_team = self.team_repo.get(match_data.home_team_id)
        away_team = self.team_repo.get(match_data.away_team_id)
        stadium = self.stadium_repo.get(match_data.stadium_id)
        
        if not home_team:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Home team not found"
            )
        
        if not away_team:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Away team not found"
            )
        
        if not stadium:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Stadium not found"
            )
        
        # Check team availability
        if not self.match_repo.check_team_availability(match_data.home_team_id, match_data.date):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Home team is not available on this date"
            )
        
        if not self.match_repo.check_team_availability(match_data.away_team_id, match_data.date):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Away team is not available on this date"
            )
        
        # Check stadium availability
        if not self.match_repo.check_stadium_availability(match_data.stadium_id, match_data.date):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Stadium is not available on this date"
            )
        
        # Create match
        match = self.match_repo.create(obj_in=match_data)
        
        # Generate tickets for all categories
        self._generate_tickets_for_match(match)
        
        # Log action
        self.audit_service.log_action(
            user_id=user_id,
            action="CREATE",
            entity_type="Match",
            entity_id=match.id,
            details=f"Created match: {home_team.name} vs {away_team.name}"
        )
        
        return match
    
    def update_match(self, match_id: int, match_data: MatchUpdate, user_id: int) -> Match:
        """Update match with validation"""
        match = self.get_match_by_id(match_id)
        
        # Check if match is finished
        if match.status == "finished":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot update finished match"
            )
        
        # Validate new data if provided
        if match_data.home_team_id:
            if not self.team_repo.get(match_data.home_team_id):
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Home team not found"
                )
        
        if match_data.away_team_id:
            if not self.team_repo.get(match_data.away_team_id):
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Away team not found"
                )
        
        if match_data.stadium_id:
            if not self.stadium_repo.get(match_data.stadium_id):
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Stadium not found"
                )
        
        # Check availability for new date/teams/stadium
        check_date = match_data.date or match.date
        check_home_team = match_data.home_team_id or match.home_team_id
        check_away_team = match_data.away_team_id or match.away_team_id
        check_stadium = match_data.stadium_id or match.stadium_id
        
        if not self.match_repo.check_team_availability(check_home_team, check_date, match_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Home team is not available on this date"
            )
        
        if not self.match_repo.check_team_availability(check_away_team, check_date, match_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Away team is not available on this date"
            )
        
        if not self.match_repo.check_stadium_availability(check_stadium, check_date, match_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Stadium is not available on this date"
            )
        
        # Update match
        updated_match = self.match_repo.update(db_obj=match, obj_in=match_data)
        
        # Regenerate tickets if teams or stadium changed
        if match_data.home_team_id or match_data.away_team_id or match_data.stadium_id:
            self.ticket_repo.delete_by_match(match_id)
            self._generate_tickets_for_match(updated_match)
        
        # Log action
        self.audit_service.log_action(
            user_id=user_id,
            action="UPDATE",
            entity_type="Match",
            entity_id=match.id,
            details=f"Updated match: {updated_match.home_team.name} vs {updated_match.away_team.name}"
        )
        
        return updated_match
    
    def set_match_result(self, match_id: int, result: MatchResult, user_id: int) -> Match:
        """Set match result"""
        match = self.get_match_by_id(match_id)
        
        if match.status == "finished":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Match is already finished"
            )
        
        if match.date > datetime.now():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot set result for future match"
            )
        
        # Update match with result
        match_update = MatchUpdate(
            home_goals=result.home_goals,
            away_goals=result.away_goals,
            status="finished"
        )
        
        updated_match = self.match_repo.update(db_obj=match, obj_in=match_update)
        
        # Log action
        self.audit_service.log_action(
            user_id=user_id,
            action="UPDATE",
            entity_type="Match",
            entity_id=match.id,
            details=f"Set result: {match.home_team.name} {result.home_goals}-{result.away_goals} {match.away_team.name}"
        )
        
        return updated_match
    
    def cancel_match(self, match_id: int, user_id: int) -> Match:
        """Cancel match"""
        match = self.get_match_by_id(match_id)
        
        if match.status == "finished":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot cancel finished match"
            )
        
        # Update match status
        match_update = MatchUpdate(status="cancelled")
        updated_match = self.match_repo.update(db_obj=match, obj_in=match_update)
        
        # Log action
        self.audit_service.log_action(
            user_id=user_id,
            action="UPDATE",
            entity_type="Match",
            entity_id=match.id,
            details=f"Cancelled match: {match.home_team.name} vs {match.away_team.name}"
        )
        
        return updated_match
    
    def delete_match(self, match_id: int, user_id: int) -> None:
        """Delete match"""
        match = self.get_match_by_id(match_id)
        
        # Log action before deletion
        self.audit_service.log_action(
            user_id=user_id,
            action="DELETE",
            entity_type="Match",
            entity_id=match.id,
            details=f"Deleted match: {match.home_team.name} vs {match.away_team.name}"
        )
        
        # Delete match (tickets will be deleted by cascade)
        self.match_repo.remove(id=match_id)
    
    def get_matches_by_team(self, team_id: int) -> List[Match]:
        """Get matches for a specific team"""
        return self.match_repo.get_by_team(team_id)
    
    def get_upcoming_matches(self, limit: int = 10) -> List[Match]:
        """Get upcoming matches"""
        return self.match_repo.get_upcoming_matches(limit)
    
    def get_finished_matches(self) -> List[Match]:
        """Get finished matches"""
        return self.match_repo.get_finished_matches()
    
    def get_head_to_head(self, team1_id: int, team2_id: int) -> List[Match]:
        """Get head-to-head matches between teams"""
        return self.match_repo.get_head_to_head(team1_id, team2_id)
    
    def _generate_tickets_for_match(self, match: Match) -> None:
        """Generate tickets for all categories for a match"""
        categories = ["VIP", "Standard", "Economy"]
        tickets_data = []
        
        for category in categories:
            price = self.ticket_calculator.calculate_price(
                home_team_place=match.home_team.last_season_place,
                away_team_place=match.away_team.last_season_place,
                stadium_capacity=match.stadium.capacity,
                category=category
            )
            
            tickets_data.append({
                "category": category,
                "price": price
            })
        
        self.ticket_repo.bulk_create_for_match(match.id, tickets_data)