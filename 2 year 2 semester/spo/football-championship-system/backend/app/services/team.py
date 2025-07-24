from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.team import Team
from app.repositories.team import TeamRepository
from app.repositories.player import PlayerRepository
from app.schemas.team import TeamCreate, TeamUpdate
from app.services.audit import AuditService

class TeamService:
    def __init__(self, db: Session):
        self.db = db
        self.team_repo = TeamRepository(db)
        self.player_repo = PlayerRepository(db)
        self.audit_service = AuditService(db)
    
    def get_teams(self, skip: int = 0, limit: int = 100, search: Optional[str] = None) -> List[Team]:
        """Get teams with optional search"""
        if search:
            return self.team_repo.search_by_name(search)
        return self.team_repo.get_multi(skip=skip, limit=limit)
    
    def get_team_by_id(self, team_id: int) -> Team:
        """Get team by ID with error handling"""
        team = self.team_repo.get(team_id)
        if not team:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Team not found"
            )
        return team
    
    def create_team(self, team_data: TeamCreate, user_id: int) -> Team:
        """Create new team with validation"""
        # Check if team name already exists
        existing_team = self.team_repo.get_by_name(team_data.name)
        if existing_team:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Team with this name already exists"
            )
        
        # Create team
        team = self.team_repo.create(obj_in=team_data)
        
        # Log action
        self.audit_service.log_action(
            user_id=user_id,
            action="CREATE",
            entity_type="Team",
            entity_id=team.id,
            details=f"Created team: {team.name}"
        )
        
        return team
    
    def update_team(self, team_id: int, team_data: TeamUpdate, user_id: int) -> Team:
        """Update team with validation"""
        team = self.get_team_by_id(team_id)
        
        # Check if new name conflicts with existing team
        if team_data.name and team_data.name != team.name:
            existing_team = self.team_repo.get_by_name(team_data.name)
            if existing_team:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Team with this name already exists"
                )
        
        # Update team
        updated_team = self.team_repo.update(db_obj=team, obj_in=team_data)
        
        # Log action
        self.audit_service.log_action(
            user_id=user_id,
            action="UPDATE",
            entity_type="Team",
            entity_id=team.id,
            details=f"Updated team: {updated_team.name}"
        )
        
        return updated_team
    
    def delete_team(self, team_id: int, user_id: int) -> None:
        """Delete team with validation"""
        team = self.get_team_by_id(team_id)
        
        # Check if team has players
        players_count = self.player_repo.count_by_team(team_id)
        if players_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot delete team. It has {players_count} players assigned"
            )
        
        # Log action before deletion
        self.audit_service.log_action(
            user_id=user_id,
            action="DELETE",
            entity_type="Team",
            entity_id=team.id,
            details=f"Deleted team: {team.name}"
        )
        
        # Delete team
        self.team_repo.remove(id=team_id)
    
    def get_team_statistics(self, team_id: int) -> dict:
        """Get team statistics"""
        team = self.get_team_by_id(team_id)
        players = self.player_repo.get_by_team(team_id)
        
        # Calculate statistics
        stats = {
            "team_name": team.name,
            "total_players": len(players),
            "positions": {},
            "average_age": 0,
            "age_range": {"min": 0, "max": 0}
        }
        
        if players:
            # Position distribution
            for player in players:
                position = player.position
                stats["positions"][position] = stats["positions"].get(position, 0) + 1
            
            # Age statistics
            ages = [player.age for player in players]
            stats["average_age"] = round(sum(ages) / len(ages), 1)
            stats["age_range"]["min"] = min(ages)
            stats["age_range"]["max"] = max(ages)
        
        return stats