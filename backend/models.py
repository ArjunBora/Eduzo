from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Enum, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from database import Base

class UserRole(str, enum.Enum):
    STUDENT = "student"
    FACULTY = "faculty"
    ADMIN = "admin"

class AchievementStatus(str, enum.Enum):
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"

class AchievementCategory(str, enum.Enum):
    ACADEMIC = "ACADEMIC"
    EXTRACURRICULAR = "EXTRACURRICULAR"
    SPORTS = "SPORTS"
    CULTURAL = "CULTURAL"
    TECHNICAL = "TECHNICAL"
    RESEARCH = "RESEARCH"
    COMMUNITY_SERVICE = "COMMUNITY_SERVICE"
    LEADERSHIP = "LEADERSHIP"
    OTHER = "OTHER"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default=UserRole.STUDENT)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    student_profile = relationship("Student", back_populates="user", uselist=False)
    faculty_profile = relationship("Faculty", back_populates="user", uselist=False)

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    enrollment_no = Column(String, unique=True, index=True)
    full_name = Column(String)
    department = Column(String, nullable=True)
    program = Column(String, nullable=True)  # e.g., "B.Tech", "M.Sc"
    enrollment_year = Column(Integer, nullable=True)
    current_semester = Column(Integer, nullable=True)
    gpa = Column(String, nullable=True)  # Store as string to allow "3.5/4.0" format
    
    user = relationship("User", back_populates="student_profile")
    achievements = relationship("Achievement", back_populates="student")
    portfolio = relationship("Portfolio", back_populates="student", uselist=False)

class Faculty(Base):
    __tablename__ = "faculty"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    department = Column(String)
    full_name = Column(String)

    user = relationship("User", back_populates="faculty_profile")

class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    title = Column(String)
    description = Column(Text)
    category = Column(String, default=AchievementCategory.OTHER)
    date_achieved = Column(DateTime(timezone=True), nullable=True)
    evidence_url = Column(String, nullable=True)  # For future file upload support
    status = Column(String, default=AchievementStatus.PENDING)
    verified_by = Column(Integer, ForeignKey("faculty.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("Student", back_populates="achievements")

class Portfolio(Base):
    __tablename__ = "portfolios"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    is_public = Column(Boolean, default=False)
    share_token = Column(String, unique=True, index=True, nullable=True)

    student = relationship("Student", back_populates="portfolio")
