from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_manager_or_admin
from app.models.user import User
from app.schemas.match import (
    Match, 
    MatchCreate, 
    MatchUpdate, 
    MatchResult,
    MatchWithDetails
)
from app.services.match import MatchService

router = APIRouter(
    tags=["matches"]
)

@router.get("", response_model=List[MatchWithDetails])
def get_matches(
    skip: int = Query(0, ge=0),
    limit: int = Query(1000, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Get all matches with pagination"""
    match_service = MatchService(db)
    return match_service.get_matches(skip=skip, limit=limit)

@router.get("/upcoming", response_model=List[MatchWithDetails])
def get_upcoming_matches(
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Get upcoming matches"""
    match_service = MatchService(db)
    return match_service.get_upcoming_matches(limit=limit)

@router.get("/finished", response_model=List[MatchWithDetails])
def get_finished_matches(
    db: Session = Depends(get_db)
):
    """Get finished matches"""
    match_service = MatchService(db)
    return match_service.get_finished_matches()

@router.get("/team/{team_id}", response_model=List[MatchWithDetails])
def get_matches_by_team(
    team_id: int,
    db: Session = Depends(get_db)
):
    """Get matches for a specific team"""
    match_service = MatchService(db)
    return match_service.get_matches_by_team(team_id)

@router.get("/head-to-head/{team1_id}/{team2_id}", response_model=List[MatchWithDetails])
def get_head_to_head(
    team1_id: int,
    team2_id: int,
    db: Session = Depends(get_db)
):
    """Get head-to-head matches between two teams"""
    match_service = MatchService(db)
    return match_service.get_head_to_head(team1_id, team2_id)

@router.get("/{match_id}", response_model=MatchWithDetails)
def get_match(
    match_id: int,
    db: Session = Depends(get_db)
):
    """Get match by ID"""
    match_service = MatchService(db)
    return match_service.get_match_by_id(match_id)

@router.post("", response_model=MatchWithDetails, status_code=status.HTTP_201_CREATED)
def create_match(
    match_data: MatchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_manager_or_admin)
):
    """Create new match (Manager or Admin only)"""
    match_service = MatchService(db)
    return match_service.create_match(match_data, current_user.id)

@router.put("/{match_id}", response_model=MatchWithDetails)
def update_match(
    match_id: int,
    match_data: MatchUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_manager_or_admin)
):
    """Update match (Manager or Admin only)"""
    match_service = MatchService(db)
    return match_service.update_match(match_id, match_data, current_user.id)

@router.put("/{match_id}/result", response_model=MatchWithDetails)
def set_match_result(
    match_id: int,
    result: MatchResult,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_manager_or_admin)
):
    """Set match result (Manager or Admin only)"""
    match_service = MatchService(db)
    return match_service.set_match_result(match_id, result, current_user.id)

@router.put("/{match_id}/cancel", response_model=MatchWithDetails)
def cancel_match(
    match_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_manager_or_admin)
):
    """Cancel match (Manager or Admin only)"""
    match_service = MatchService(db)
    return match_service.cancel_match(match_id, current_user.id)

@router.delete("/{match_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_match(
    match_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_manager_or_admin)
):
    """Delete match (Manager or Admin only)"""
    match_service = MatchService(db)
    match_service.delete_match(match_id, current_user.id)