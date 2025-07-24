from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.database import get_db
from app.core.deps import get_current_manager_or_admin, get_current_user
from app.services.stadium import StadiumService
from app.schemas.stadium import Stadium, StadiumCreate, StadiumUpdate
from app.models.user import User

router = APIRouter(tags=["stadiums"])

@router.get("", response_model=List[Stadium])
def get_stadiums(
    skip: int = Query(0, ge=0, description="Number of stadiums to skip"),
    limit: int = Query(1000, ge=1, le=10000, description="Number of stadiums to return"),
    search: Optional[str] = Query(None, description="Search stadiums by name"),
    city: Optional[str] = Query(None, description="Filter stadiums by city"),
    min_capacity: Optional[int] = Query(None, ge=1000, description="Minimum stadium capacity"),
    max_capacity: Optional[int] = Query(None, le=100000, description="Maximum stadium capacity"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get list of stadiums with optional filtering
    
    - **skip**: number of stadiums to skip (for pagination)
    - **limit**: maximum number of stadiums to return
    - **search**: search stadiums by name (partial match)
    - **city**: filter stadiums by city
    - **min_capacity**: minimum stadium capacity
    - **max_capacity**: maximum stadium capacity
    """
    stadium_service = StadiumService(db)
    
    # Apply different filters based on query parameters
    if city:
        stadiums = stadium_service.get_stadiums_by_city(city)
    elif min_capacity is not None or max_capacity is not None:
        min_cap = min_capacity or 1000
        max_cap = max_capacity or 100000
        stadiums = stadium_service.get_stadiums_by_capacity_range(min_cap, max_cap)
    else:
        stadiums = stadium_service.get_stadiums(skip=skip, limit=limit, search=search)
    
    return stadiums

@router.get("/{stadium_id}", response_model=Stadium)
def get_stadium(
    stadium_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get stadium by ID
    
    - **stadium_id**: stadium ID to retrieve
    """
    stadium_service = StadiumService(db)
    return stadium_service.get_stadium_by_id(stadium_id)

@router.post("", response_model=Stadium, status_code=status.HTTP_201_CREATED)
def create_stadium(
    stadium_data: StadiumCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_manager_or_admin)
):
    """
    Create new stadium
    
    Only managers and administrators can create stadiums.
    
    - **name**: stadium name (must be unique)
    - **city**: city where stadium is located
    - **capacity**: stadium capacity (between 1000 and 100000)
    """
    stadium_service = StadiumService(db)
    return stadium_service.create_stadium(stadium_data, current_user.id)

@router.put("/{stadium_id}", response_model=Stadium)
def update_stadium(
    stadium_id: int,
    stadium_data: StadiumUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_manager_or_admin)
):
    """
    Update stadium
    
    Only managers and administrators can update stadiums.
    
    - **stadium_id**: stadium ID to update
    - **name**: new stadium name (optional, must be unique if provided)
    - **city**: new city (optional)
    - **capacity**: new capacity (optional, between 1000 and 100000)
    """
    stadium_service = StadiumService(db)
    return stadium_service.update_stadium(stadium_id, stadium_data, current_user.id)

@router.delete("/{stadium_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_stadium(
    stadium_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_manager_or_admin)
):
    """
    Delete stadium
    
    Only managers and administrators can delete stadiums.
    Stadium cannot be deleted if it has upcoming matches.
    
    - **stadium_id**: stadium ID to delete
    """
    stadium_service = StadiumService(db)
    stadium_service.delete_stadium(stadium_id, current_user.id)

@router.get("/{stadium_id}/statistics")
def get_stadium_statistics(
    stadium_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get stadium statistics
    
    Returns detailed statistics about stadium usage:
    - Total matches played
    - Finished matches
    - Upcoming matches  
    - Cancelled matches
    - Utilization rate
    
    - **stadium_id**: stadium ID for statistics
    """
    stadium_service = StadiumService(db)
    return stadium_service.get_stadium_statistics(stadium_id)

@router.get("/available/{date}")
def get_available_stadiums(
    date: datetime,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_manager_or_admin)
):
    """
    Get stadiums available for a specific date
    
    Returns list of stadiums that don't have matches scheduled for the given date.
    Only managers and administrators can access this endpoint.
    
    - **date**: date to check availability (ISO format: YYYY-MM-DDTHH:MM:SS)
    """
    stadium_service = StadiumService(db)
    return stadium_service.get_available_stadiums_for_date(date)

@router.get("/cities/list")
def get_stadium_cities(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get list of all cities that have stadiums
    
    Returns unique list of cities for filtering purposes.
    """
    stadium_service = StadiumService(db)
    stadiums = stadium_service.get_stadiums()
    cities = list(set(stadium.city for stadium in stadiums))
    return {"cities": sorted(cities)}