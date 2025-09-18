from typing import Dict
from app.models.team import Team
from app.models.stadium import Stadium

class TicketCalculator:
    # Category multipliers
    CATEGORY_MULTIPLIERS: Dict[str, float] = {
        'VIP': 2.5,
        'Standard': 1.0,
        'Economy': 0.7
    }
    
    @staticmethod
    def calculate_ticket_price(
        home_team: Team,
        away_team: Team,
        stadium: Stadium,
        category: str
    ) -> Dict[str, float]:
        """
        Calculate ticket price based on the algorithm:
        1. Base price = 500 - (Stadium capacity / 10000) * 50
        2. Prestige coefficient = (21 - (Team1 place + Team2 place) / 2) / 10
        3. Final price = Base price * Prestige coefficient * Category multiplier
        """
        
        # Step 1: Calculate base price
        base_price = 500 - (stadium.capacity / 10000) * 50
        base_price = max(base_price, 100)  # Minimum base price
        
        # Step 2: Calculate prestige coefficient
        average_place = (home_team.last_season_place + away_team.last_season_place) / 2
        prestige_coefficient = (21 - average_place) / 10
        prestige_coefficient = max(prestige_coefficient, 0.1)  # Minimum coefficient
        
        # Step 3: Get category multiplier
        category_multiplier = TicketCalculator.CATEGORY_MULTIPLIERS.get(category, 1.0)
        
        # Step 4: Calculate final price
        final_price = base_price * prestige_coefficient * category_multiplier
        final_price = round(final_price, 2)
        
        return {
            'base_price': round(base_price, 2),
            'prestige_coefficient': round(prestige_coefficient, 2),
            'category_multiplier': category_multiplier,
            'final_price': final_price
        }
    
    @staticmethod
    def calculate_all_categories(
        home_team: Team,
        away_team: Team,
        stadium: Stadium
    ) -> Dict[str, Dict[str, float]]:
        """Calculate prices for all ticket categories"""
        results = {}
        
        for category in TicketCalculator.CATEGORY_MULTIPLIERS.keys():
            results[category] = TicketCalculator.calculate_ticket_price(
                home_team, away_team, stadium, category
            )
        
        return results