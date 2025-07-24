from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.team import Team
from app.models.match import Match
from app.schemas.report import TeamStanding

class TournamentTableCalculator:
    """Calculator for tournament standings"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def calculate_standings(self) -> List[TeamStanding]:
        """Calculate current tournament standings"""
        teams = self.db.query(Team).all()
        standings = []
        
        for team in teams:
            team_stats = self._calculate_team_stats(team.id)
            standing = TeamStanding(
                position=0,  # Will be set after sorting
                team_id=team.id,
                team_name=team.name,
                team_city=team.city,
                matches_played=team_stats['matches_played'],
                wins=team_stats['wins'],
                draws=team_stats['draws'],
                losses=team_stats['losses'],
                goals_scored=team_stats['goals_scored'],
                goals_conceded=team_stats['goals_conceded'],
                goal_difference=team_stats['goal_difference'],
                points=team_stats['points']
            )
            standings.append(standing)
        
        # Sort by points (desc), then goal difference (desc), then goals scored (desc)
        standings.sort(key=lambda x: (-x.points, -x.goal_difference, -x.goals_scored))
        
        # Set positions
        for i, standing in enumerate(standings, 1):
            standing.position = i
        
        return standings
    
    def _calculate_team_stats(self, team_id: int) -> Dict[str, Any]:
        """Calculate statistics for a specific team"""
        # Get all finished matches for the team
        home_matches = self.db.query(Match).filter(
            and_(
                Match.home_team_id == team_id,
                Match.status == "finished"
            )
        ).all()
        
        away_matches = self.db.query(Match).filter(
            and_(
                Match.away_team_id == team_id,
                Match.status == "finished"
            )
        ).all()
        
        stats = {
            'matches_played': 0,
            'wins': 0,
            'draws': 0,
            'losses': 0,
            'goals_scored': 0,
            'goals_conceded': 0,
            'goal_difference': 0,
            'points': 0
        }
        
        # Process home matches
        for match in home_matches:
            stats['matches_played'] += 1
            stats['goals_scored'] += match.home_goals
            stats['goals_conceded'] += match.away_goals
            
            if match.home_goals > match.away_goals:
                stats['wins'] += 1
                stats['points'] += 3
            elif match.home_goals == match.away_goals:
                stats['draws'] += 1
                stats['points'] += 1
            else:
                stats['losses'] += 1
        
        # Process away matches
        for match in away_matches:
            stats['matches_played'] += 1
            stats['goals_scored'] += match.away_goals
            stats['goals_conceded'] += match.home_goals
            
            if match.away_goals > match.home_goals:
                stats['wins'] += 1
                stats['points'] += 3
            elif match.away_goals == match.home_goals:
                stats['draws'] += 1
                stats['points'] += 1
            else:
                stats['losses'] += 1
        
        stats['goal_difference'] = stats['goals_scored'] - stats['goals_conceded']
        
        return stats
    
    def get_team_form(self, team_id: int, last_matches: int = 5) -> List[str]:
        """Get team's recent form (W/D/L for last N matches)"""
        # Get last N finished matches for the team
        home_matches = self.db.query(Match).filter(
            and_(
                Match.home_team_id == team_id,
                Match.status == "finished"
            )
        ).order_by(Match.date.desc()).limit(last_matches).all()
        
        away_matches = self.db.query(Match).filter(
            and_(
                Match.away_team_id == team_id,
                Match.status == "finished"
            )
        ).order_by(Match.date.desc()).limit(last_matches).all()
        
        # Combine and sort by date
        all_matches = home_matches + away_matches
        all_matches.sort(key=lambda x: x.date, reverse=True)
        
        # Take only the last N matches
        recent_matches = all_matches[:last_matches]
        
        form = []
        for match in recent_matches:
            if match.home_team_id == team_id:
                # Team played at home
                if match.home_goals > match.away_goals:
                    form.append('W')
                elif match.home_goals == match.away_goals:
                    form.append('D')
                else:
                    form.append('L')
            else:
                # Team played away
                if match.away_goals > match.home_goals:
                    form.append('W')
                elif match.away_goals == match.home_goals:
                    form.append('D')
                else:
                    form.append('L')
        
        return form
    
    def get_head_to_head_record(self, team1_id: int, team2_id: int) -> Dict[str, Any]:
        """Get head-to-head record between two teams"""
        matches = self.db.query(Match).filter(
            and_(
                Match.status == "finished",
                or_(
                    and_(Match.home_team_id == team1_id, Match.away_team_id == team2_id),
                    and_(Match.home_team_id == team2_id, Match.away_team_id == team1_id)
                )
            )
        ).all()
        
        team1_wins = 0
        team2_wins = 0
        draws = 0
        team1_goals = 0
        team2_goals = 0
        
        for match in matches:
            if match.home_team_id == team1_id:
                team1_goals += match.home_goals
                team2_goals += match.away_goals
                if match.home_goals > match.away_goals:
                    team1_wins += 1
                elif match.home_goals == match.away_goals:
                    draws += 1
                else:
                    team2_wins += 1
            else:
                team1_goals += match.away_goals
                team2_goals += match.home_goals
                if match.away_goals > match.home_goals:
                    team1_wins += 1
                elif match.away_goals == match.home_goals:
                    draws += 1
                else:
                    team2_wins += 1
        
        return {
            'total_matches': len(matches),
            'team1_wins': team1_wins,
            'team2_wins': team2_wins,
            'draws': draws,
            'team1_goals': team1_goals,
            'team2_goals': team2_goals
        }