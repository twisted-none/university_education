from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.report import (
    TournamentTable,
    MatchStatistics,
    TeamStatistics,
    TopScorer,
    GeneralStatistics,
    SeasonSummary
)
from app.services.report import ReportService

router = APIRouter(
    tags=["reports"]
)

@router.get("/standings", response_model=TournamentTable)
def get_tournament_standings(
    db: Session = Depends(get_db)
):
    """Get current tournament standings"""
    report_service = ReportService(db)
    return report_service.get_tournament_table()

@router.get("/match-statistics", response_model=MatchStatistics)
def get_match_statistics(
    db: Session = Depends(get_db)
):
    """Get general match statistics"""
    report_service = ReportService(db)
    return report_service.get_match_statistics()

@router.get("/team-statistics/{team_id}", response_model=TeamStatistics)
def get_team_statistics(
    team_id: int,
    db: Session = Depends(get_db)
):
    """Get detailed statistics for a specific team"""
    report_service = ReportService(db)
    try:
        return report_service.get_team_statistics(team_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

@router.get("/top-scorers", response_model=List[TopScorer])
def get_top_scoring_teams(
    limit: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db)
):
    """Get teams with highest goal scoring averages"""
    report_service = ReportService(db)
    return report_service.get_top_scoring_teams(limit)

@router.get("/general-statistics", response_model=GeneralStatistics)
def get_general_statistics(
    db: Session = Depends(get_db)
):
    """Get general tournament statistics"""
    report_service = ReportService(db)
    return report_service.get_general_statistics()

@router.get("/season-summary", response_model=SeasonSummary)
def get_season_summary(
    db: Session = Depends(get_db)
):
    """Get complete season summary report"""
    report_service = ReportService(db)
    return report_service.get_season_summary()

@router.get("/head-to-head/{team1_id}/{team2_id}")
def get_head_to_head_analysis(
    team1_id: int,
    team2_id: int,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get head-to-head analysis between two teams"""
    if team1_id == team2_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Team IDs must be different"
        )
    
    report_service = ReportService(db)
    try:
        return report_service.get_head_to_head_analysis(team1_id, team2_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

@router.get("/team-comparison/{team1_id}/{team2_id}")
def get_team_comparison(
    team1_id: int,
    team2_id: int,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Compare statistics of two teams"""
    if team1_id == team2_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Team IDs must be different"
        )
    
    report_service = ReportService(db)
    try:
        return report_service.get_team_comparison(team1_id, team2_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )