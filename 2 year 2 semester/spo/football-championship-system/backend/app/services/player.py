# backend/app/services/player.py

from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.player import Player
from app.repositories.player import PlayerRepository
from app.repositories.team import TeamRepository
from app.schemas.player import PlayerCreate, PlayerUpdate
from app.services.audit import AuditService

class PlayerService:
    def __init__(self, db: Session):
        self.db = db
        self.player_repo = PlayerRepository(db)
        self.team_repo = TeamRepository(db)
        self.audit_service = AuditService(db)
    
    def get_players(
        self, 
        skip: int = 0, 
        limit: int = 100, 
        team_id: Optional[int] = None,
        position: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[Player]:
        """
        Get players with combined filters, handling empty filter values.
        """
        # Игнорируем 'all' как значение для фильтра по позиции
        if position == 'all':
            position = None
            
        # Игнорируем пустую строку или строку из пробелов как значение для поиска
        if search and not search.strip():
            search = None

        return self.player_repo.get_filtered(
            skip=skip,
            limit=limit,
            team_id=team_id,
            position=position,
            search=search
        )
    
    def get_player_by_id(self, player_id: int) -> Player:
        """Get player by ID with team information."""
        player = self.player_repo.get_with_team(player_id)
        if not player:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Player not found"
            )
        return player
    
    def create_player(self, player_data: PlayerCreate, user_id: int) -> Player:
        """Create new player with validation."""
        team = self.team_repo.get(player_data.team_id)
        if not team:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")
        
        existing_player = self.player_repo.get_by_jersey_number_and_team(player_data.jersey_number, player_data.team_id)
        if existing_player:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Jersey number {player_data.jersey_number} is already taken in this team")
        
        players_count = self.player_repo.count_by_team(player_data.team_id)
        if players_count >= 25:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Team has reached maximum number of players (25)")
        
        player = self.player_repo.create(obj_in=player_data)
        
        self.audit_service.log_action(
            user_id=user_id,
            action="CREATE",
            entity_type="Player",
            entity_id=player.id,
            details=f"Created player: {player.first_name} {player.last_name} (#{player.jersey_number})"
        )
        return player
    
    def update_player(self, player_id: int, player_data: PlayerUpdate, user_id: int) -> Player:
        """Update player with validation."""
        player = self.player_repo.get(player_id)
        if not player:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Player not found")
        
        if player_data.team_id and player_data.team_id != player.team_id:
            team = self.team_repo.get(player_data.team_id)
            if not team:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")
            
            players_count = self.player_repo.count_by_team(player_data.team_id)
            if players_count >= 25:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Target team has reached maximum number of players (25)")
        
        if player_data.jersey_number and player_data.jersey_number != player.jersey_number:
            team_id = player_data.team_id if player_data.team_id else player.team_id
            existing_player = self.player_repo.get_by_jersey_number_and_team(player_data.jersey_number, team_id)
            if existing_player and existing_player.id != player_id:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Jersey number {player_data.jersey_number} is already taken in this team")
        
        updated_player = self.player_repo.update(db_obj=player, obj_in=player_data)
        
        self.audit_service.log_action(
            user_id=user_id,
            action="UPDATE",
            entity_type="Player",
            entity_id=player.id,
            details=f"Updated player: {updated_player.first_name} {updated_player.last_name}"
        )
        return updated_player
    
    def delete_player(self, player_id: int, user_id: int) -> None:
        """Delete player."""
        player = self.player_repo.get(player_id)
        if not player:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Player not found")
        
        self.audit_service.log_action(
            user_id=user_id,
            action="DELETE",
            entity_type="Player",
            entity_id=player.id,
            details=f"Deleted player: {player.first_name} {player.last_name}"
        )
        
        self.player_repo.remove(id=player_id)
    
    def get_players_by_age_range(self, min_age: int, max_age: int) -> List[Player]:
        """Get players within age range."""
        return self.player_repo.get_by_age_range(min_age, max_age)
    
    def transfer_player(self, player_id: int, new_team_id: int, user_id: int) -> Player:
        """Transfer player to another team."""
        player = self.player_repo.get(player_id)
        if not player:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Player not found")
        
        new_team = self.team_repo.get(new_team_id)
        if not new_team:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target team not found")
        
        if player.team_id == new_team_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Player is already in this team")
        
        players_count = self.player_repo.count_by_team(new_team_id)
        if players_count >= 25:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Target team has reached maximum number of players (25)")
        
        existing_player = self.player_repo.get_by_jersey_number_and_team(player.jersey_number, new_team_id)
        if existing_player:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Jersey number {player.jersey_number} is already taken in target team")
        
        old_team_name = player.team.name
        
        player.team_id = new_team_id
        updated_player = self.player_repo.save(player)
        
        self.audit_service.log_action(
            user_id=user_id,
            action="TRANSFER",
            entity_type="Player",
            entity_id=player.id,
            details=f"Transferred player {player.first_name} {player.last_name} from {old_team_name} to {new_team.name}"
        )
        return updated_player