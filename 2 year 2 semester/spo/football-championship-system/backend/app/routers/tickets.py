from typing import List, Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_manager_or_admin, get_current_user
from app.models.user import User
from app.schemas.ticket import (
    Ticket,
    TicketCreate,
    TicketBase,
    TicketCalculationRequest,
    TicketCalculationResponse,
    TicketWithMatch
)
from app.services.ticket import TicketService
from app.services.audit import AuditService

router = APIRouter(tags=["tickets"])

@router.get("", response_model=List[Ticket])
def get_tickets(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all tickets with pagination.
    Requires authentication.
    """
    ticket_service = TicketService(db)
    tickets = ticket_service.get_all(skip=skip, limit=limit)
    return tickets

@router.get("/{ticket_id}", response_model=TicketWithMatch)
def get_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific ticket by ID with match details.
    Requires authentication.
    """
    ticket_service = TicketService(db)
    ticket = ticket_service.get_by_id(ticket_id)
    return ticket

@router.get("/match/{match_id}", response_model=List[Ticket])
def get_tickets_by_match(
    match_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all tickets for a specific match.
    Requires authentication.
    """
    ticket_service = TicketService(db)
    tickets = ticket_service.get_by_match(match_id)
    return tickets

@router.get("/category/{category}", response_model=List[Ticket])
def get_tickets_by_category(
    category: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all tickets by category (VIP, Standard, Economy).
    Requires authentication.
    """
    ticket_service = TicketService(db)
    tickets = ticket_service.get_by_category(category)
    return tickets

@router.get("/price-range/", response_model=List[Ticket])
def get_tickets_by_price_range(
    min_price: float = Query(..., ge=0, description="Minimum price"),
    max_price: float = Query(..., ge=0, description="Maximum price"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get tickets within a price range.
    Requires authentication.
    """
    ticket_service = TicketService(db)
    tickets = ticket_service.get_by_price_range(min_price, max_price)
    return tickets

@router.post("", response_model=Ticket, status_code=status.HTTP_201_CREATED)
def create_ticket(
    ticket_data: TicketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_manager_or_admin)
):
    """
    Create a new ticket.
    Requires manager or admin privileges.
    """
    ticket_service = TicketService(db)
    audit_service = AuditService(db)
    
    # Create ticket
    ticket = ticket_service.create(ticket_data)
    
    # Log the action
    audit_service.log_action(
        user_id=current_user.id,
        action="CREATE",
        entity_type="ticket",
        entity_id=ticket.id,
        details=f"Created ticket for match {ticket.match_id}, category: {ticket.category}, price: {ticket.price}"
    )
    
    return ticket

@router.put("/{ticket_id}", response_model=Ticket)
def update_ticket(
    ticket_id: int,
    ticket_data: TicketBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_manager_or_admin)
):
    """
    Update a ticket.
    Requires manager or admin privileges.
    """
    ticket_service = TicketService(db)
    audit_service = AuditService(db)
    
    # Get old ticket data for audit
    old_ticket = ticket_service.get_by_id(ticket_id)
    
    # Update ticket
    updated_ticket = ticket_service.update(ticket_id, ticket_data)
    
    # Log the action
    audit_service.log_action(
        user_id=current_user.id,
        action="UPDATE",
        entity_type="ticket",
        entity_id=ticket_id,
        details=f"Updated ticket {ticket_id}: category {old_ticket.category} -> {ticket_data.category}, price {old_ticket.price} -> {ticket_data.price}"
    )
    
    return updated_ticket

@router.delete("/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_manager_or_admin)
):
    """
    Delete a ticket.
    Requires manager or admin privileges.
    """
    ticket_service = TicketService(db)
    audit_service = AuditService(db)
    
    # Get ticket data for audit before deletion
    ticket = ticket_service.get_by_id(ticket_id)
    
    # Delete ticket
    ticket_service.delete(ticket_id)
    
    # Log the action
    audit_service.log_action(
        user_id=current_user.id,
        action="DELETE",
        entity_type="ticket",
        entity_id=ticket_id,
        details=f"Deleted ticket {ticket_id} for match {ticket.match_id}, category: {ticket.category}"
    )

@router.delete("/match/{match_id}", response_model=dict)
def delete_tickets_by_match(
    match_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_manager_or_admin)
):
    """
    Delete all tickets for a specific match.
    Requires manager or admin privileges.
    """
    ticket_service = TicketService(db)
    audit_service = AuditService(db)
    
    # Delete tickets
    deleted_count = ticket_service.delete_by_match(match_id)
    
    # Log the action
    audit_service.log_action(
        user_id=current_user.id,
        action="BULK_DELETE",
        entity_type="ticket",
        entity_id=match_id,
        details=f"Deleted {deleted_count} tickets for match {match_id}"
    )
    
    return {"message": f"Deleted {deleted_count} tickets for match {match_id}"}

@router.post("/calculate", response_model=TicketCalculationResponse)
def calculate_ticket_price(
    request: TicketCalculationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Calculate ticket price for specific teams, stadium, and category.
    Requires authentication.
    """
    ticket_service = TicketService(db)
    return ticket_service.calculate_ticket_price(request)

@router.get("/calculate/match/{match_id}", response_model=Dict[str, TicketCalculationResponse])
def calculate_all_categories_for_match(
    home_team_id: int = Query(..., description="Home team ID"),
    away_team_id: int = Query(..., description="Away team ID"),
    stadium_id: int = Query(..., description="Stadium ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Calculate ticket prices for all categories for a specific match.
    Requires authentication.
    """
    ticket_service = TicketService(db)
    return ticket_service.calculate_all_categories_for_match(
        home_team_id, away_team_id, stadium_id
    )

@router.post("/match/{match_id}/create-all", response_model=List[Ticket])
def create_tickets_for_match(
    match_id: int,
    auto_calculate_prices: bool = Query(True, description="Automatically calculate prices based on teams and stadium"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_manager_or_admin)
):
    """
    Create tickets for all categories for a specific match.
    Optionally auto-calculate prices based on the pricing algorithm.
    Requires manager or admin privileges.
    """
    ticket_service = TicketService(db)
    audit_service = AuditService(db)
    
    # Create tickets
    tickets = ticket_service.create_tickets_for_match(match_id, auto_calculate_prices)
    
    # Log the action
    audit_service.log_action(
        user_id=current_user.id,
        action="BULK_CREATE",
        entity_type="ticket",
        entity_id=match_id,
        details=f"Created {len(tickets)} tickets for match {match_id} with auto_calculate_prices={auto_calculate_prices}"
    )
    
    return tickets

@router.get("/stats/by-category", response_model=Dict[str, int])
def get_ticket_stats_by_category(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get ticket statistics grouped by category.
    Requires authentication.
    """
    ticket_service = TicketService(db)
    
    # Get counts for each category
    stats = {}
    categories = ['VIP', 'Standard', 'Economy']
    
    for category in categories:
        tickets = ticket_service.get_by_category(category)
        stats[category] = len(tickets)
    
    return stats

@router.get("/stats/price-summary", response_model=Dict[str, float])
def get_price_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get price statistics (min, max, average) for all tickets.
    Requires authentication.
    """
    ticket_service = TicketService(db)
    tickets = ticket_service.get_all()
    
    if not tickets:
        return {
            "min_price": 0.0,
            "max_price": 0.0,
            "average_price": 0.0,
            "total_tickets": 0
        }
    
    prices = [ticket.price for ticket in tickets]
    
    return {
        "min_price": min(prices),
        "max_price": max(prices),
        "average_price": sum(prices) / len(prices),
        "total_tickets": len(tickets)
    }