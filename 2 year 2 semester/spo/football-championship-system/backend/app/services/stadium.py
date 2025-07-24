from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime

from app.models.stadium import Stadium
from app.repositories.stadium import StadiumRepository
from app.repositories.match import MatchRepository
from app.schemas.stadium import StadiumCreate, StadiumUpdate
from app.services.audit import AuditService

class StadiumService:
    def __init__(self, db: Session):
        self.db = db
        self.stadium_repo = StadiumRepository(db)
        self.match_repo = MatchRepository(db)
        self.audit_service = AuditService(db)
    
    def get_stadiums(self, skip: int = 0, limit: int = 100, search: Optional[str] = None) -> List[Stadium]:
        """Get stadiums with optional search"""
        if search:
            return self.stadium_repo.search_by_name(search)
        return self.stadium_repo.get_multi(skip=skip, limit=limit)
    
    def get_stadium_by_id(self, stadium_id: int) -> Stadium:
        """Get stadium by ID with error handling"""
        stadium = self.stadium_repo.get(stadium_id)
        if not stadium:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Stadium not found"
            )
        return stadium
    
    def create_stadium(self, stadium_data: StadiumCreate, user_id: int) -> Stadium:
        """Create new stadium with validation"""
        # Check if stadium name already exists
        existing_stadium = self.stadium_repo.get_by_name(stadium_data.name)
        if existing_stadium:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Stadium with this name already exists"
            )
        
        # Create stadium
        stadium = self.stadium_repo.create(obj_in=stadium_data)
        
        # Log action
        self.audit_service.log_action(
            user_id=user_id,
            action="CREATE",
            entity_type="Stadium",
            entity_id=stadium.id,
            details=f"Created stadium: {stadium.name}"
        )
        
        return stadium
    
    def update_stadium(self, stadium_id: int, stadium_data: StadiumUpdate, user_id: int) -> Stadium:
        """Update stadium with validation"""
        stadium = self.get_stadium_by_id(stadium_id)
        
        # Check if new name conflicts with existing stadium
        if stadium_data.name and stadium_data.name != stadium.name:
            existing_stadium = self.stadium_repo.get_by_name(stadium_data.name)
            if existing_stadium:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Stadium with this name already exists"
                )
        
        # Update stadium
        updated_stadium = self.stadium_repo.update(db_obj=stadium, obj_in=stadium_data)
        
        # Log action
        self.audit_service.log_action(
            user_id=user_id,
            action="UPDATE",
            entity_type="Stadium",
            entity_id=stadium.id,
            details=f"Updated stadium: {updated_stadium.name}"
        )
        
        return updated_stadium
    
    def delete_stadium(self, stadium_id: int, user_id: int) -> None:
        """Delete stadium with validation"""
        stadium = self.get_stadium_by_id(stadium_id)
        
        # Check if stadium has scheduled matches
        matches = self.match_repo.get_by_stadium(stadium_id)
        upcoming_matches = [m for m in matches if m.date > datetime.now() and m.status == "scheduled"]
        
        if upcoming_matches:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot delete stadium. It has {len(upcoming_matches)} upcoming matches"
            )
        
        # Log action before deletion
        self.audit_service.log_action(
            user_id=user_id,
            action="DELETE",
            entity_type="Stadium",
            entity_id=stadium.id,
            details=f"Deleted stadium: {stadium.name}"
        )
        
        # Delete stadium
        self.stadium_repo.remove(id=stadium_id)
    
    def get_stadiums_by_city(self, city: str) -> List[Stadium]:
        """Get stadiums by city"""
        return self.stadium_repo.get_by_city(city)
    
    def get_stadiums_by_capacity_range(self, min_capacity: int, max_capacity: int) -> List[Stadium]:
        """Get stadiums within capacity range"""
        return self.stadium_repo.get_by_capacity_range(min_capacity, max_capacity)
    
    def get_available_stadiums_for_date(self, date: datetime) -> List[Stadium]:
        """Get stadiums available for a specific date"""
        return self.stadium_repo.get_available_for_date(date)
    
    def get_stadium_statistics(self, stadium_id: int) -> dict:
        """Get stadium statistics"""
        stadium = self.get_stadium_by_id(stadium_id)
        matches = self.match_repo.get_by_stadium(stadium_id)
        
        finished_matches = [m for m in matches if m.status == "finished"]
        upcoming_matches = [m for m in matches if m.date > datetime.now() and m.status == "scheduled"]
        
        stats = {
            "stadium_name": stadium.name,
            "city": stadium.city,
            "capacity": stadium.capacity,
            "total_matches": len(matches),
            "finished_matches": len(finished_matches),
            "upcoming_matches": len(upcoming_matches),
            "cancelled_matches": len([m for m in matches if m.status == "cancelled"]),
            "utilization_rate": round((len(matches) / 12) * 100, 1) if matches else 0  # Assuming 12 matches per season
        }
        
        return stats