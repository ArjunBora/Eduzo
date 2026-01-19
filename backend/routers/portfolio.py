from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, date
from database import get_db
from models import User, Achievement, AchievementStatus, UserRole, Student
from schemas import AchievementCreate, AchievementResponse, PortfolioResponse, ProfileUpdateRequest
from auth import get_current_user
import uuid

router = APIRouter(
    prefix="/api/portfolio",
    tags=["portfolio"]
)

@router.post("/achievements", response_model=AchievementResponse)
def add_achievement(
    achievement: AchievementCreate, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can add achievements")

    new_achievement = Achievement(
        student_id=current_user.student_profile.id,
        title=achievement.title,
        description=achievement.description,
        category=achievement.category,  # Save category from request
        date_achieved=achievement.date_achieved,  # Save achievement date
        status=AchievementStatus.PENDING
    )
    db.add(new_achievement)
    db.commit()
    db.refresh(new_achievement)
    return new_achievement

def calculate_age(dob):
    """Calculate age from date of birth"""
    if not dob:
        return None
    today = date.today()
    return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))

@router.get("/me", response_model=PortfolioResponse)
def get_my_portfolio(
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Not a student")
    
    student = current_user.student_profile
    return {
        "student_name": student.full_name,
        "email": current_user.email,
        "enrollment_no": student.enrollment_no,
        "department": student.department,
        "program": student.program,
        "enrollment_year": student.enrollment_year,
        "gpa": student.gpa,
        "phone_number": student.phone_number,
        "date_of_birth": student.date_of_birth,
        "age": calculate_age(student.date_of_birth),
        "bio": student.bio,
        "achievements": student.achievements,
        "is_public": student.portfolio.is_public if student.portfolio else False,
        "share_token": student.portfolio.share_token if student.portfolio else None
    }

@router.put("/profile", response_model=PortfolioResponse)
def update_profile(
    profile_data: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update student profile information"""
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Not a student")
    
    student = current_user.student_profile
    
    # Update only provided fields
    if profile_data.phone_number is not None:
        student.phone_number = profile_data.phone_number
    if profile_data.date_of_birth is not None:
        student.date_of_birth = datetime.combine(profile_data.date_of_birth, datetime.min.time())
    if profile_data.bio is not None:
        student.bio = profile_data.bio
    if profile_data.full_name is not None:
        student.full_name = profile_data.full_name
    if profile_data.department is not None:
        student.department = profile_data.department
    if profile_data.program is not None:
        student.program = profile_data.program
    
    db.commit()
    db.refresh(student)
    
    return {
        "student_name": student.full_name,
        "email": current_user.email,
        "enrollment_no": student.enrollment_no,
        "department": student.department,
        "program": student.program,
        "enrollment_year": student.enrollment_year,
        "gpa": student.gpa,
        "phone_number": student.phone_number,
        "date_of_birth": student.date_of_birth,
        "age": calculate_age(student.date_of_birth),
        "bio": student.bio,
        "achievements": student.achievements,
        "is_public": student.portfolio.is_public if student.portfolio else False,
        "share_token": student.portfolio.share_token if student.portfolio else None
    }

@router.get("/achievements/pending", response_model=List[AchievementResponse])
def get_pending_achievements(
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.FACULTY:
        raise HTTPException(status_code=403, detail="Only faculty can view pending achievements")
    
    achievements = db.query(Achievement).filter(Achievement.status == AchievementStatus.PENDING).all()
    return achievements

@router.get("/analytics")
def get_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get analytics data for faculty dashboard"""
    if current_user.role != UserRole.FACULTY:
        raise HTTPException(status_code=403, detail="Only faculty can view analytics")
    
    from models import AchievementCategory
    from sqlalchemy import func
    
    # Total counts by status
    total_achievements = db.query(Achievement).count()
    verified_count = db.query(Achievement).filter(Achievement.status == AchievementStatus.VERIFIED).count()
    pending_count = db.query(Achievement).filter(Achievement.status == AchievementStatus.PENDING).count()
    
    # Category breakdown
    category_stats = db.query(
        Achievement.category,
        func.count(Achievement.id).label('count')
    ).group_by(Achievement.category).all()
    
    category_breakdown = {cat: count for cat, count in category_stats}
    
    # Student count
    total_students = db.query(Student).count()
    
    return {
        "total_achievements": total_achievements,
        "verified_count": verified_count,
        "pending_count": pending_count,
        "total_students": total_students,
        "category_breakdown": category_breakdown
    }

@router.put("/achievements/{achievement_id}/verify")
def verify_achievement(
    achievement_id: int, 
    status: AchievementStatus,
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.FACULTY:
        raise HTTPException(status_code=403, detail="Only faculty can verify achievements")
    
    achievement = db.query(Achievement).filter(Achievement.id == achievement_id).first()
    if not achievement:
        raise HTTPException(status_code=404, detail="Achievement not found")
    
    achievement.status = status
    achievement.verified_by = current_user.faculty_profile.id
    db.commit()
@router.post("/share", response_model=PortfolioResponse)
def share_portfolio(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can share portfolios")
    
    student = current_user.student_profile
    if not student.portfolio:
        # Create portfolio if not exists (though it should ideally exist on registration)
        from models import Portfolio
        new_portfolio = Portfolio(student_id=student.id, is_public=True, share_token=str(uuid.uuid4()))
        db.add(new_portfolio)
        db.commit()
        db.refresh(new_portfolio)
    elif not student.portfolio.share_token:
        student.portfolio.share_token = str(uuid.uuid4())
        student.portfolio.is_public = True
        db.commit()
    else:
        student.portfolio.is_public = True
        db.commit()
    
    return {
        "student_name": student.full_name,
        "department": student.department,
        "program": student.program,
        "enrollment_year": student.enrollment_year,
        "gpa": student.gpa,
        "achievements": student.achievements,
        "is_public": True,
        "share_token": student.portfolio.share_token
    }

@router.get("/public/{share_token}", response_model=PortfolioResponse)
def get_public_portfolio(
    share_token: str,
    db: Session = Depends(get_db)
):
    from models import Portfolio
    portfolio = db.query(Portfolio).filter(Portfolio.share_token == share_token).first()
    
    if not portfolio or not portfolio.is_public:
        raise HTTPException(status_code=404, detail="Portfolio not found or private")
    
    student = portfolio.student
    # Filter only verified achievements
    verified_achievements = [a for a in student.achievements if a.status == AchievementStatus.VERIFIED]
    
    return {
        "student_name": student.full_name,
        "department": student.department,
        "program": student.program,
        "enrollment_year": student.enrollment_year,
        "gpa": student.gpa,
        "achievements": verified_achievements,
        "is_public": True,
        "share_token": share_token
    }
