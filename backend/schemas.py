from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from models import UserRole, AchievementStatus, AchievementCategory

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str
    role: UserRole
    full_name: str
    # Student fields
    enrollment_no: Optional[str] = None
    department: Optional[str] = None
    program: Optional[str] = None  # e.g., "B.Tech Computer Science"
    enrollment_year: Optional[int] = None
    # Faculty fields
    faculty_department: Optional[str] = None

class UserResponse(UserBase):
    id: int
    role: UserRole
    created_at: datetime
    
    class Config:
        from_attributes = True

class AchievementBase(BaseModel):
    title: str
    description: str
    category: AchievementCategory = AchievementCategory.OTHER
    date_achieved: Optional[datetime] = None

class AchievementCreate(AchievementBase):
    pass

class AchievementResponse(AchievementBase):
    id: int
    status: AchievementStatus
    created_at: datetime
    
    class Config:
        from_attributes = True

class PortfolioResponse(BaseModel):
    student_name: str
    department: Optional[str] = None
    program: Optional[str] = None
    enrollment_year: Optional[int] = None
    gpa: Optional[str] = None
    achievements: List[AchievementResponse]
    is_public: bool
    share_token: Optional[str] = None
