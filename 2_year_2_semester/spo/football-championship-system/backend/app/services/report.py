from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from datetime import datetime

from app.models.team import Team
from app.models.match import Match
from app.schemas.report import (
    TournamentTable,
    TeamStanding,
    MatchStatistics,
    TeamStatistics,
    TopScorer,
    GeneralStatistics,
    SeasonSummary
)
from app.utils.tournament_table import TournamentTableCalculator

class ReportService:
    def __init__(self, db: Session):
        self.db = db
        self.tournament_calculator = TournamentTableCalculator(db)
    
    def get_tournament_table(self) -> TournamentTable:
        """Get current tournament standings"""
        standings = self.tournament_calculator.calculate_standings()
        return TournamentTable(
            standings=standings,
            last_updated=datetime.now()
        )
    
    def get_match_statistics(self) -> MatchStatistics:
        """Get general match statistics"""
        total_matches = self.db.query(Match).count()
        finished_matches = self.db.query(Match).filter(Match.status == "finished").count()
        scheduled_matches = self.db.query(Match).filter(Match.status == "scheduled").count()
        cancelled_matches = self.db.query(Match).filter(Match.status == "cancelled").count()
        
        # Calculate total goals
        total_goals_result = self.db.query(
            func.sum(Match.home_goals + Match.away_goals)
        ).filter(Match.status == "finished").scalar()
        
        total_goals = total_goals_result or 0
        average_goals = total_goals / finished_matches if finished_matches > 0 else 0
        
        # Find highest scoring match
        highest_scoring_match = None
        if finished_matches > 0:
            highest_match = self.db.query(Match).filter(
                Match.status == "finished"
            ).order_by(
                (Match.home_goals + Match.away_goals).desc()
            ).first()
            
            if highest_match:
                highest_scoring_match = {
                    "match_id": highest_match.id,
                    "home_team": highest_match.home_team.name,
                    "away_team": highest_match.away_team.name,
                    "score": f"{highest_match.home_goals}-{highest_match.away_goals}",
                    "total_goals": highest_match.home_goals + highest_match.away_goals,
                    "date": highest_match.date.isoformat()
                }
        
        return MatchStatistics(
            total_matches=total_matches,
            finished_matches=finished_matches,
            scheduled_matches=scheduled_matches,
            cancelled_matches=cancelled_matches,
            total_goals=total_goals,
            average_goals_per_match=round(average_goals, 2),
            highest_scoring_match=highest_scoring_match
        )
    
    def get_team_statistics(self, team_id: int) -> TeamStatistics:
        """Get detailed statistics for a specific team"""
        team = self.db.query(Team).filter(Team.id == team_id).first()
        if not team:
            raise ValueError("Team not found")
        
        # Get home matches
        home_matches = self.db.query(Match).filter(
            and_(Match.home_team_id == team_id, Match.status == "finished")
        ).all()
        
        # Get away matches
        away_matches = self.db.query(Match).filter(
            and_(Match.away_team_id == team_id, Match.status == "finished")
        ).all()
        
        # Calculate home statistics
        home_wins = sum(1 for m in home_matches if m.home_goals > m.away_goals)
        home_draws = sum(1 for m in home_matches if m.home_goals == m.away_goals)
        home_losses = sum(1 for m in home_matches if m.home_goals < m.away_goals)
        home_goals_scored = sum(m.home_goals for m in home_matches)
        home_goals_conceded = sum(m.away_goals for m in home_matches)
        
        # Calculate away statistics
        away_wins = sum(1 for m in away_matches if m.away_goals > m.home_goals)
        away_draws = sum(1 for m in away_matches if m.away_goals == m.home_goals)
        away_losses = sum(1 for m in away_matches if m.away_goals < m.home_goals)
        away_goals_scored = sum(m.away_goals for m in away_matches)
        away_goals_conceded = sum(m.home_goals for m in away_matches)
        
        # Get current form
        current_form = self.tournament_calculator.get_team_form(team_id)
        
        return TeamStatistics(
            team_id=team.id,
            team_name=team.name,
            home_matches=len(home_matches),
            away_matches=len(away_matches),
            home_wins=home_wins,
            away_wins=away_wins,
            home_draws=home_draws,
            away_draws=away_draws,
            home_losses=home_losses,
            away_losses=away_losses,
            home_goals_scored=home_goals_scored,
            away_goals_scored=away_goals_scored,
            home_goals_conceded=home_goals_conceded,
            away_goals_conceded=away_goals_conceded,
            current_form=current_form
        )
    
    def get_top_scoring_teams(self, limit: int = 5) -> List[TopScorer]:
        """Get teams with highest goal scoring averages"""
        teams = self.db.query(Team).all()
        top_scorers = []
        
        for team in teams:
            team_stats = self.tournament_calculator._calculate_team_stats(team.id)
            
            if team_stats['matches_played'] > 0:
                goals_per_match = team_stats['goals_scored'] / team_stats['matches_played']
                
                top_scorer = TopScorer(
                    team_id=team.id,
                    team_name=team.name,
                    total_goals=team_stats['goals_scored'],
                    matches_played=team_stats['matches_played'],
                    goals_per_match=round(goals_per_match, 2)
                )
                top_scorers.append(top_scorer)
        
        # Sort by goals per match descending
        top_scorers.sort(key=lambda x: x.goals_per_match, reverse=True)
        
        return top_scorers[:limit]
    
    def get_general_statistics(self) -> GeneralStatistics:
        """Get general tournament statistics"""
        total_teams = self.db.query(Team).count()
        match_stats = self.get_match_statistics()
        top_scoring_teams = self.get_top_scoring_teams()
        
        return GeneralStatistics(
            total_teams=total_teams,
            total_matches=match_stats.total_matches,
            finished_matches=match_stats.finished_matches,
            total_goals=match_stats.total_goals,
            average_goals_per_match=match_stats.average_goals_per_match,
            top_scoring_teams=top_scoring_teams,
            match_statistics=match_stats
        )
    
    def get_season_summary(self) -> SeasonSummary:
        """Get complete season summary"""
        tournament_table = self.get_tournament_table()
        general_stats = self.get_general_statistics()
        
        return SeasonSummary(
            tournament_table=tournament_table,
            general_statistics=general_stats,
            generated_at=datetime.now()
        )
    
    def get_head_to_head_analysis(self, team1_id: int, team2_id: int) -> Dict[str, Any]:
        """Get head-to-head analysis between two teams"""
        team1 = self.db.query(Team).filter(Team.id == team1_id).first()
        team2 = self.db.query(Team).filter(Team.id == team2_id).first()
        
        if not team1 or not team2:
            raise ValueError("One or both teams not found")
        
        h2h_record = self.tournament_calculator.get_head_to_head_record(team1_id, team2_id)
        
        return {
            "team1": {
                "id": team1.id,
                "name": team1.name,
                "wins": h2h_record['team1_wins'],
                "goals": h2h_record['team1_goals']
            },
            "team2": {
                "id": team2.id,
                "name": team2.name,
                "wins": h2h_record['team2_wins'],
                "goals": h2h_record['team2_goals']
            },
            "draws": h2h_record['draws'],
            "total_matches": h2h_record['total_matches'],
            "summary": f"{team1.name} {h2h_record['team1_wins']}-{h2h_record['draws']}-{h2h_record['team2_wins']} {team2.name}"
        }
    
    def get_team_comparison(self, team1_id: int, team2_id: int) -> Dict[str, Any]:
        """Compare two teams statistics"""
        team1_stats = self.get_team_statistics(team1_id)
        team2_stats = self.get_team_statistics(team2_id)
        h2h_analysis = self.get_head_to_head_analysis(team1_id, team2_id)
        
        return {
            "team1_statistics": team1_stats,
            "team2_statistics": team2_stats,
            "head_to_head": h2h_analysis,
            "comparison": {
                "total_matches": {
                    "team1": team1_stats.home_matches + team1_stats.away_matches,
                    "team2": team2_stats.home_matches + team2_stats.away_matches
                },
                "total_goals": {
                    "team1": team1_stats.home_goals_scored + team1_stats.away_goals_scored,
                    "team2": team2_stats.home_goals_scored + team2_stats.away_goals_scored
                },
                "total_wins": {
                    "team1": team1_stats.home_wins + team1_stats.away_wins,
                    "team2": team2_stats.home_wins + team2_stats.away_wins
                }
            }
        }