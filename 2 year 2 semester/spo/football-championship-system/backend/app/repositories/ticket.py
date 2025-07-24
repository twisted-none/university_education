from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from app.models.ticket import Ticket
from app.schemas.ticket import TicketCreate, TicketBase
from app.repositories.base import BaseRepository

class TicketRepository(BaseRepository[Ticket, TicketCreate, TicketBase]):
    def __init__(self, db: Session):
        super().__init__(Ticket, db)
    
    def get_by_match(self, match_id: int) -> List[Ticket]:
        """Get all tickets for a specific match"""
        return self.db.query(Ticket).filter(Ticket.match_id == match_id).all()
    
    def get_by_match_and_category(self, match_id: int, category: str) -> Optional[Ticket]:
        """Get ticket by match and category"""
        return self.db.query(Ticket).filter(
            Ticket.match_id == match_id,
            Ticket.category == category
        ).first()
    
    def get_with_match_details(self, ticket_id: int) -> Optional[Ticket]:
        """Get ticket with match details"""
        return self.db.query(Ticket).options(
            joinedload(Ticket.match).joinedload('home_team'),
            joinedload(Ticket.match).joinedload('away_team'),
            joinedload(Ticket.match).joinedload('stadium')
        ).filter(Ticket.id == ticket_id).first()
    
    def get_all_with_match_details(self, skip: int = 0, limit: int = 1000) -> List[Ticket]:
        """Get all tickets with match details"""
        return self.db.query(Ticket).options(
            joinedload(Ticket.match).joinedload('home_team'),
            joinedload(Ticket.match).joinedload('away_team'),
            joinedload(Ticket.match).joinedload('stadium')
        ).offset(skip).limit(limit).all()
    
    def get_by_price_range(self, min_price: float, max_price: float) -> List[Ticket]:
        """Get tickets within price range"""
        return self.db.query(Ticket).filter(
            Ticket.price >= min_price,
            Ticket.price <= max_price
        ).all()
    
    def get_by_category(self, category: str) -> List[Ticket]:
        """Get all tickets by category"""
        return self.db.query(Ticket).filter(Ticket.category == category).all()
    
    def delete_by_match(self, match_id: int) -> int:
        """Delete all tickets for a specific match"""
        deleted_count = self.db.query(Ticket).filter(Ticket.match_id == match_id).count()
        self.db.query(Ticket).filter(Ticket.match_id == match_id).delete()
        self.db.commit()
        return deleted_count
    
    def bulk_create_for_match(self, match_id: int, categories_and_prices: List[dict]) -> List[Ticket]:
        """Create multiple tickets for a match"""
        tickets = []
        for category_data in categories_and_prices:
            ticket_data = TicketCreate(
                match_id=match_id,
                category=category_data['category'],
                price=category_data['price']
            )
            ticket = self.create(obj_in=ticket_data)
            tickets.append(ticket)
        return tickets