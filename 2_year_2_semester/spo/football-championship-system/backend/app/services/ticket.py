from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.ticket import Ticket
from app.models.match import Match
from app.models.team import Team
from app.models.stadium import Stadium
from app.repositories.ticket import TicketRepository
from app.schemas.ticket import (
    TicketCreate, 
    TicketBase, 
    TicketCalculationRequest,
    TicketCalculationResponse
)
from app.utils.ticket_calculator import TicketCalculator
from app.core.database import get_db


class TicketService:
    def __init__(self, db: Session):
        self.db = db
        self.repository = TicketRepository(db)
    
    def get_all(self, skip: int = 0, limit: int = 100) -> List[Ticket]:
        """Get all tickets with pagination"""
        return self.repository.get_all_with_match_details(skip=skip, limit=limit)
    
    def get_by_id(self, ticket_id: int) -> Optional[Ticket]:
        """Get ticket by ID with match details"""
        ticket = self.repository.get_with_match_details(ticket_id)
        if not ticket:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ticket not found"
            )
        return ticket
    
    def get_by_match(self, match_id: int) -> List[Ticket]:
        """Get all tickets for a specific match"""
        # Verify match exists
        match = self.db.query(Match).filter(Match.id == match_id).first()
        if not match:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Match not found"
            )
        
        return self.repository.get_by_match(match_id)
    
    def get_by_category(self, category: str) -> List[Ticket]:
        """Get all tickets by category"""
        valid_categories = ['VIP', 'Standard', 'Economy']
        if category not in valid_categories:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid category. Must be one of: {valid_categories}"
            )
        
        return self.repository.get_by_category(category)
    
    def get_by_price_range(self, min_price: float, max_price: float) -> List[Ticket]:
        """Get tickets within price range"""
        if min_price < 0 or max_price < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Prices must be non-negative"
            )
        
        if min_price > max_price:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Minimum price cannot be greater than maximum price"
            )
        
        return self.repository.get_by_price_range(min_price, max_price)
    
    def create(self, ticket_data: TicketCreate) -> Ticket:
        """Create a new ticket"""
        # Verify match exists
        match = self.db.query(Match).filter(Match.id == ticket_data.match_id).first()
        if not match:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Match not found"
            )
        
        # Check if ticket with same match and category already exists
        existing_ticket = self.repository.get_by_match_and_category(
            ticket_data.match_id, 
            ticket_data.category
        )
        if existing_ticket:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ticket with category '{ticket_data.category}' already exists for this match"
            )
        
        return self.repository.create(obj_in=ticket_data)
    
    def update(self, ticket_id: int, ticket_data: TicketBase) -> Ticket:
        """Update a ticket"""
        ticket = self.repository.get(ticket_id)
        if not ticket:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ticket not found"
            )
        
        # If updating match_id, verify new match exists
        if ticket_data.match_id != ticket.match_id:
            match = self.db.query(Match).filter(Match.id == ticket_data.match_id).first()
            if not match:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Match not found"
                )
        
        # Check for duplicate category in the same match (if category or match changed)
        if (ticket_data.category != ticket.category or 
            ticket_data.match_id != ticket.match_id):
            existing_ticket = self.repository.get_by_match_and_category(
                ticket_data.match_id, 
                ticket_data.category
            )
            if existing_ticket and existing_ticket.id != ticket_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Ticket with category '{ticket_data.category}' already exists for this match"
                )
        
        return self.repository.update(db_obj=ticket, obj_in=ticket_data)
    
    def delete(self, ticket_id: int) -> bool:
        """Delete a ticket"""
        ticket = self.repository.get(ticket_id)
        if not ticket:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ticket not found"
            )
        
        return self.repository.delete(id=ticket_id)
    
    def delete_by_match(self, match_id: int) -> int:
        """Delete all tickets for a specific match"""
        # Verify match exists
        match = self.db.query(Match).filter(Match.id == match_id).first()
        if not match:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Match not found"
            )
        
        return self.repository.delete_by_match(match_id)
    
    def calculate_ticket_price(self, request: TicketCalculationRequest) -> TicketCalculationResponse:
        """Calculate ticket price based on teams, stadium, and category"""
        # Get home team
        home_team = self.db.query(Team).filter(Team.id == request.home_team_id).first()
        if not home_team:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Home team not found"
            )
        
        # Get away team
        away_team = self.db.query(Team).filter(Team.id == request.away_team_id).first()
        if not away_team:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Away team not found"
            )
        
        # Get stadium
        stadium = self.db.query(Stadium).filter(Stadium.id == request.stadium_id).first()
        if not stadium:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Stadium not found"
            )
        
        # Validate teams are different
        if request.home_team_id == request.away_team_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Home team and away team must be different"
            )
        
        # Calculate price
        calculation_result = TicketCalculator.calculate_ticket_price(
            home_team=home_team,
            away_team=away_team,
            stadium=stadium,
            category=request.category
        )
        
        return TicketCalculationResponse(
            category=request.category,
            price=calculation_result['final_price'],
            base_price=calculation_result['base_price'],
            prestige_coefficient=calculation_result['prestige_coefficient'],
            category_multiplier=calculation_result['category_multiplier']
        )
    
    def calculate_all_categories_for_match(
        self, 
        home_team_id: int, 
        away_team_id: int, 
        stadium_id: int
    ) -> Dict[str, TicketCalculationResponse]:
        """Calculate prices for all categories for a match"""
        # Get teams and stadium
        home_team = self.db.query(Team).filter(Team.id == home_team_id).first()
        if not home_team:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Home team not found"
            )
        
        away_team = self.db.query(Team).filter(Team.id == away_team_id).first()
        if not away_team:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Away team not found"
            )
        
        stadium = self.db.query(Stadium).filter(Stadium.id == stadium_id).first()
        if not stadium:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Stadium not found"
            )
        
        # Validate teams are different
        if home_team_id == away_team_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Home team and away team must be different"
            )
        
        # Calculate for all categories
        all_calculations = TicketCalculator.calculate_all_categories(
            home_team=home_team,
            away_team=away_team,
            stadium=stadium
        )
        
        # Format response
        result = {}
        for category, calculation in all_calculations.items():
            result[category] = TicketCalculationResponse(
                category=category,
                price=calculation['final_price'],
                base_price=calculation['base_price'],
                prestige_coefficient=calculation['prestige_coefficient'],
                category_multiplier=calculation['category_multiplier']
            )
        
        return result
    
    def create_tickets_for_match(
        self, 
        match_id: int, 
        auto_calculate_prices: bool = True
    ) -> List[Ticket]:
        """Create tickets for all categories for a specific match"""
        # Verify match exists and get match details
        match = (self.db.query(Match)
                .filter(Match.id == match_id)
                .first())
        
        if not match:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Match not found"
            )
        
        # Check if tickets already exist for this match
        existing_tickets = self.repository.get_by_match(match_id)
        if existing_tickets:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tickets already exist for this match"
            )
        
        if auto_calculate_prices:
            # Calculate prices for all categories
            all_calculations = self.calculate_all_categories_for_match(
                match.home_team_id,
                match.away_team_id,
                match.stadium_id
            )
            
            # Create tickets with calculated prices
            categories_and_prices = []
            for category, calculation in all_calculations.items():
                categories_and_prices.append({
                    'category': category,
                    'price': calculation.price
                })
        else:
            # Use default prices
            categories_and_prices = [
                {'category': 'VIP', 'price': 1000.0},
                {'category': 'Standard', 'price': 500.0},
                {'category': 'Economy', 'price': 250.0}
            ]
        
        return self.repository.bulk_create_for_match(match_id, categories_and_prices)