from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_manager_or_admin
from app.models.user import User
from app.schemas.player import Player, PlayerCreate, PlayerUpdate, PlayerWithTeam
from app.services.player import PlayerService

router = APIRouter()

@router.get("", response_model=List[PlayerWithTeam])
async def get_players(
    skip: int = Query(0, ge=0),
    limit: int = Query(1000, ge=1, le=1000),
    team_id: Optional[int] = Query(None),
    position: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Get players with optional filters"""
    player_service = PlayerService(db)
    players = player_service.get_players(
        skip=skip, 
        limit=limit, 
        team_id=team_id,
        position=position,
        search=search
    )
    return players

@router.get("/{player_id}", response_model=PlayerWithTeam)
async def get_player(
    player_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_manager_or_admin)
):
    """Get player by ID"""
    player_service = PlayerService(db)
    player = player_service.get_player_by_id(player_id)
    return player

@router.post("", response_model=Player)
async def create_player(
    player_in: PlayerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_manager_or_admin)
):
    """Create new player"""
    player_service = PlayerService(db)
    player = player_service.create_player(player_in, current_user.id)
    return player

@router.put("/{player_id}", response_model=Player)
async def update_player(
    player_id: int,
    player_in: PlayerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_manager_or_admin)
):
    """Update player"""
    player_service = PlayerService(db)
    player = player_service.update_player(player_id, player_in, current_user.id)
    return player

@router.delete("/{player_id}")
async def delete_player(
    player_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_manager_or_admin)
):
    """Delete player"""
    player_service = PlayerService(db)
    player_service.delete_player(player_id, current_user.id)
    return {"message": "Player deleted successfully"}

@router.get("/age-range/", response_model=List[PlayerWithTeam])
async def get_players_by_age_range(
    min_age: int = Query(..., ge=16, le=45),
    max_age: int = Query(..., ge=16, le=45),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_manager_or_admin)
):
    """Get players within age range"""
    if min_age > max_age:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Minimum age cannot be greater than maximum age"
        )
    
    player_service = PlayerService(db)
    players = player_service.get_players_by_age_range(min_age, max_age)
    return players

@router.post("/{player_id}/transfer")
async def transfer_player(
    player_id: int,
    new_team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_manager_or_admin)
):
    """Transfer player to another team"""
    player_service = PlayerService(db)
    player = player_service.transfer_player(player_id, new_team_id, current_user.id)
    return {
        "message": "Player transferred successfully",
        "player": player
    }