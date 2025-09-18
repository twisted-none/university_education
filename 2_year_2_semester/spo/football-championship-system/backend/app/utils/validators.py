import re
from typing import List, Optional
from datetime import datetime, date
from email_validator import validate_email, EmailNotValidError


class ValidationError(Exception):
    """Custom validation error"""
    pass


class Validators:
    """Collection of validation utilities"""
    
    # Regular expressions for common validations
    NAME_PATTERN = re.compile(r'^[a-zA-Zа-яА-ЯёЁ\s\-\.\']{2,100}$')
    USERNAME_PATTERN = re.compile(r'^[a-zA-Z0-9_]{3,50}$')
    CITY_PATTERN = re.compile(r'^[a-zA-Zа-яА-ЯёЁ\s\-\.\']{2,100}$')
    
    @staticmethod
    def validate_name(name: str, field_name: str = "Name") -> str:
        """
        Validate person/team/stadium name
        - Must be 2-100 characters
        - Only letters, spaces, hyphens, dots, apostrophes
        """
        if not name or not name.strip():
            raise ValidationError(f"{field_name} cannot be empty")
        
        name = name.strip()
        
        if not Validators.NAME_PATTERN.match(name):
            raise ValidationError(
                f"{field_name} must be 2-100 characters and contain only letters, "
                "spaces, hyphens, dots, and apostrophes"
            )
        
        return name
    
    @staticmethod
    def validate_username(username: str) -> str:
        """
        Validate username
        - Must be 3-50 characters
        - Only letters, numbers, underscores
        """
        if not username or not username.strip():
            raise ValidationError("Username cannot be empty")
        
        username = username.strip()
        
        if not Validators.USERNAME_PATTERN.match(username):
            raise ValidationError(
                "Username must be 3-50 characters and contain only letters, "
                "numbers, and underscores"
            )
        
        return username
    
    @staticmethod
    def validate_email(email: str) -> str:
        """Validate email address"""
        if not email or not email.strip():
            raise ValidationError("Email cannot be empty")
        
        email = email.strip().lower()
        
        try:
            # Use email-validator library for proper validation
            valid = validate_email(email)
            email = valid.email
        except EmailNotValidError:
            raise ValidationError("Invalid email format")
        
        return email
    
    @staticmethod
    def validate_password(password: str) -> str:
        """
        Validate password strength
        - At least 8 characters
        - At least one uppercase letter
        - At least one lowercase letter
        - At least one digit
        """
        if not password:
            raise ValidationError("Password cannot be empty")
        
        if len(password) < 8:
            raise ValidationError("Password must be at least 8 characters long")
        
        if not re.search(r'[A-Z]', password):
            raise ValidationError("Password must contain at least one uppercase letter")
        
        if not re.search(r'[a-z]', password):
            raise ValidationError("Password must contain at least one lowercase letter")
        
        if not re.search(r'\d', password):
            raise ValidationError("Password must contain at least one digit")
        
        return password
    
    @staticmethod
    def validate_city(city: str) -> str:
        """Validate city name"""
        if not city or not city.strip():
            raise ValidationError("City cannot be empty")
        
        city = city.strip()
        
        if not Validators.CITY_PATTERN.match(city):
            raise ValidationError(
                "City must be 2-100 characters and contain only letters, "
                "spaces, hyphens, dots, and apostrophes"
            )
        
        return city
    
    @staticmethod
    def validate_age(age: int, min_age: int = 16, max_age: int = 45) -> int:
        """
        Validate player age
        Default range for football players: 16-45 years
        """
        if not isinstance(age, int):
            raise ValidationError("Age must be an integer")
        
        if age < min_age or age > max_age:
            raise ValidationError(f"Age must be between {min_age} and {max_age}")
        
        return age
    
    @staticmethod
    def validate_jersey_number(number: int, min_num: int = 1, max_num: int = 99) -> int:
        """
        Validate jersey number
        Typically 1-99 for football
        """
        if not isinstance(number, int):
            raise ValidationError("Jersey number must be an integer")
        
        if number < min_num or number > max_num:
            raise ValidationError(f"Jersey number must be between {min_num} and {max_num}")
        
        return number
    
    @staticmethod
    def validate_position(position: str) -> str:
        """Validate player position"""
        valid_positions = [
            'Goalkeeper', 'Defender', 'Midfielder', 'Forward',
            'GK', 'DF', 'MF', 'FW'  # Short forms
        ]
        
        if not position or not position.strip():
            raise ValidationError("Position cannot be empty")
        
        position = position.strip()
        
        if position not in valid_positions:
            raise ValidationError(f"Position must be one of: {', '.join(valid_positions)}")
        
        return position
    
    @staticmethod
    def validate_stadium_capacity(capacity: int) -> int:
        """
        Validate stadium capacity
        Minimum 1000 seats for official matches
        """
        if not isinstance(capacity, int):
            raise ValidationError("Stadium capacity must be an integer")
        
        if capacity < 1000:
            raise ValidationError("Stadium capacity must be at least 1000")
        
        if capacity > 200000:  # Reasonable upper limit
            raise ValidationError("Stadium capacity cannot exceed 200,000")
        
        return capacity
    
    @staticmethod
    def validate_season_place(place: int, max_teams: int = 20) -> int:
        """
        Validate last season place
        Typically 1-20 for top division
        """
        if not isinstance(place, int):
            raise ValidationError("Season place must be an integer")
        
        if place < 1 or place > max_teams:
            raise ValidationError(f"Season place must be between 1 and {max_teams}")
        
        return place
    
    @staticmethod
    def validate_match_date(match_date: datetime) -> datetime:
        """Validate match date"""
        if not isinstance(match_date, datetime):
            raise ValidationError("Match date must be a datetime object")
        
        # Match cannot be in the past (with some tolerance for editing)
        now = datetime.now()
        if match_date < now.replace(hour=0, minute=0, second=0, microsecond=0):
            raise ValidationError("Match date cannot be in the past")
        
        # Match cannot be too far in the future (e.g., 2 years)
        max_future = now.replace(year=now.year + 2)
        if match_date > max_future:
            raise ValidationError("Match date cannot be more than 2 years in the future")
        
        return match_date
    
    @staticmethod
    def validate_match_status(status: str) -> str:
        """Validate match status"""
        valid_statuses = ['scheduled', 'finished', 'cancelled', 'postponed']
        
        if not status or not status.strip():
            raise ValidationError("Match status cannot be empty")
        
        status = status.strip().lower()
        
        if status not in valid_statuses:
            raise ValidationError(f"Match status must be one of: {', '.join(valid_statuses)}")
        
        return status
    
    @staticmethod
    def validate_goals(goals: Optional[int]) -> Optional[int]:
        """Validate goals scored"""
        if goals is None:
            return goals
        
        if not isinstance(goals, int):
            raise ValidationError("Goals must be an integer")
        
        if goals < 0:
            raise ValidationError("Goals cannot be negative")
        
        if goals > 20:  # Reasonable upper limit
            raise ValidationError("Goals cannot exceed 20 per team")
        
        return goals
    
    @staticmethod
    def validate_ticket_category(category: str) -> str:
        """Validate ticket category"""
        valid_categories = ['VIP', 'Standard', 'Economy']
        
        if not category or not category.strip():
            raise ValidationError("Ticket category cannot be empty")
        
        category = category.strip()
        
        if category not in valid_categories:
            raise ValidationError(f"Ticket category must be one of: {', '.join(valid_categories)}")
        
        return category
    
    @staticmethod
    def validate_price(price: float, min_price: float = 0.01) -> float:
        """Validate price"""
        if not isinstance(price, (int, float)):
            raise ValidationError("Price must be a number")
        
        if price < min_price:
            raise ValidationError(f"Price must be at least {min_price}")
        
        if price > 100000:  # Reasonable upper limit
            raise ValidationError("Price cannot exceed 100,000")
        
        return round(float(price), 2)
    
    @staticmethod
    def validate_user_role(role: str) -> str:
        """Validate user role"""
        valid_roles = ['admin', 'manager']
        
        if not role or not role.strip():
            raise ValidationError("User role cannot be empty")
        
        role = role.strip().lower()
        
        if role not in valid_roles:
            raise ValidationError(f"User role must be one of: {', '.join(valid_roles)}")
        
        return role
    
    @staticmethod
    def validate_unique_values(values: List[any], field_name: str = "Value") -> List[any]:
        """Validate that all values in list are unique"""
        if len(values) != len(set(values)):
            raise ValidationError(f"{field_name} must be unique")
        
        return values
    
    @staticmethod
    def validate_list_not_empty(values: List[any], field_name: str = "List") -> List[any]:
        """Validate that list is not empty"""
        if not values:
            raise ValidationError(f"{field_name} cannot be empty")
        
        return values
    
    @staticmethod
    def validate_phone_number(phone: str) -> str:
        """
        Validate phone number
        Accepts various formats: +1234567890, (123) 456-7890, 123-456-7890, etc.
        """
        if not phone or not phone.strip():
            raise ValidationError("Phone number cannot be empty")
        
        # Remove all non-digit characters except +
        cleaned = re.sub(r'[^\d+]', '', phone.strip())
        
        # Check if it's a valid format
        if len(cleaned) < 10 or len(cleaned) > 15:
            raise ValidationError("Phone number must be 10-15 digits")
        
        # Must start with + for international or be at least 10 digits for national
        if not (cleaned.startswith('+') or len(cleaned) >= 10):
            raise ValidationError("Invalid phone number format")
        
        return cleaned


class MatchValidators:
    """Specialized validators for match-related operations"""
    
    @staticmethod
    def validate_match_teams(home_team_id: int, away_team_id: int):
        """Validate that home and away teams are different"""
        if home_team_id == away_team_id:
            raise ValidationError("Home team and away team must be different")
    
    @staticmethod
    def validate_match_result(home_goals: Optional[int], away_goals: Optional[int], status: str):
        """Validate match result consistency"""
        if status == 'finished':
            if home_goals is None or away_goals is None:
                raise ValidationError("Finished matches must have goals recorded")
        elif status == 'scheduled':
            if home_goals is not None or away_goals is not None:
                raise ValidationError("Scheduled matches cannot have goals recorded")


class BusinessValidators:
    """Business logic validators"""
    
    @staticmethod
    def validate_team_player_limit(current_player_count: int, max_players: int = 30):
        """Validate team doesn't exceed player limit"""
        if current_player_count >= max_players:
            raise ValidationError(f"Team cannot have more than {max_players} players")
    
    @staticmethod
    def validate_jersey_number_unique_in_team(
        jersey_number: int, 
        team_id: int, 
        existing_numbers: List[int]
    ):
        """Validate jersey number is unique within team"""
        if jersey_number in existing_numbers:
            raise ValidationError(f"Jersey number {jersey_number} is already taken in this team")