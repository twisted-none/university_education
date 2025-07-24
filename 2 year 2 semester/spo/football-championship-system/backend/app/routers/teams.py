from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_manager_or_admin
from app.models.user import User
from app.repositories.team import TeamRepository
from app.schemas.team import Team, TeamCreate, TeamUpdate, TeamWithPlayers
from app.services.audit import AuditService

router = APIRouter()

@router.get("", response_model=List[Team])
async def get_teams(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_manager_or_admin)
):
    team_repo = TeamRepository(db)
    
    if search:
        teams = team_repo.search_by_name(search)
    else:
        teams = team_repo.get_multi(skip=skip, limit=limit)
    
    return teams

@router.get("/{team_id}", response_model=TeamWithPlayers)
async def get_team(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_manager_or_admin)
):
    team_repo = TeamRepository(db)
    team = team_repo.get(team_id)
    
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    return team

@router.post("", response_model=Team)
async def create_team(
    team_in: TeamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_manager_or_admin)
):
    team_repo = TeamRepository(db)
    
    # Check if team name already exists
    existing_team = team_repo.get_by_name(team_in.name)
    if existing_team:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Team with this name already exists"
        )
    
    team = team_repo.create(obj_in=team_in)
    
    # Log the action
    audit_service = AuditService(db)
    audit_service.log_action(
        user_id=current_user.id,
        action="CREATE",
        entity_type="Team",
        entity_id=team.id,
        details=f"Created team: {team.name}"
    )
    
    return team

@router.put("/{team_id}", response_model=Team)
async def update_team(
    team_id: int,
    team_in: TeamUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_manager_or_admin)
):
    team_repo = TeamRepository(db)
    team = team_repo.get(team_id)
    
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    # Check if new name conflicts with existing team
    if team_in.name and team_in.name != team.name:
        existing_team = team_repo.get_by_name(team_in.name)
        if existing_team:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Team with this name already exists"
            )
    
    team = team_repo.update(db_obj=team, obj_in=team_in)
    
    # Log the action
    audit_service = AuditService(db)
    audit_service.log_action(
        user_id=current_user.id,
        action="UPDATE",
        entity_type="Team",
        entity_id=team.id,
        details=f"Updated team: {team.name}"
    )
    
    return team

@router.delete("/{team_id}")
async def delete_team(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_manager_or_admin)
):
    team_repo = TeamRepository(db)
    team = team_repo.get(team_id)
    
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    # Log the action before deletion
    audit_service = AuditService(db)
    audit_service.log_action(
        user_id=current_user.id,
        action="DELETE",
        entity_type="Team",
        entity_id=team.id,
        details=f"Deleted team: {team.name}"
    )
    
    team_repo.remove(id=team_id)
    
    return {"message": "Team deleted successfully"}