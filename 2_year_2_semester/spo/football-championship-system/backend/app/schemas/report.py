from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

class TeamStanding(BaseModel):
    """Team standing in tournament table"""
    position: int
    team_id: int
    team_name: str
    team_city: str
    matches_played: int
    wins: int
    draws: int
    losses: int
    goals_scored: int
    goals_conceded: int
    goal_difference: int
    points: int
    
    class Config:
        orm_mode = True

class TournamentTable(BaseModel):
    """Complete tournament table"""
    standings: List[TeamStanding]
    last_updated: datetime
    
    class Config:
        orm_mode = True

class MatchStatistics(BaseModel):
    """Match statistics"""
    total_matches: int
    finished_matches: int
    scheduled_matches: int
    cancelled_matches: int
    total_goals: int
    average_goals_per_match: float
    highest_scoring_match: Optional[dict] = None
    
    class Config:
        orm_mode = True

class TeamStatistics(BaseModel):
    """Team statistics"""
    team_id: int
    team_name: str
    home_matches: int
    away_matches: int
    home_wins: int
    away_wins: int
    home_draws: int
    away_draws: int
    home_losses: int
    away_losses: int
    home_goals_scored: int
    away_goals_scored: int
    home_goals_conceded: int
    away_goals_conceded: int
    current_form: List[str]  # Last 5 matches: W, D, L
    
    class Config:
        orm_mode = True

class TopScorer(BaseModel):
    """Top scorer information"""
    team_id: int
    team_name: str
    total_goals: int
    matches_played: int
    goals_per_match: float
    
    class Config:
        orm_mode = True

class GeneralStatistics(BaseModel):
    """General tournament statistics"""
    total_teams: int
    total_matches: int
    finished_matches: int
    total_goals: int
    average_goals_per_match: float
    top_scoring_teams: List[TopScorer]
    match_statistics: MatchStatistics
    
    class Config:
        orm_mode = True

class SeasonSummary(BaseModel):
    """Season summary report"""
    tournament_table: TournamentTable
    general_statistics: GeneralStatistics
    generated_at: datetime
    
    class Config:
        orm_mode = True