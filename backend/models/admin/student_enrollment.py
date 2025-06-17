from sqlalchemy import Column, Integer, String, ForeignKey, Date, Float, UniqueConstraint
from sqlalchemy.orm import relationship
from database import Base
from pydantic import BaseModel
from datetime import date
from typing import Optional

from models.admin.course_offerings import CourseOfferingResponse # Import the new CourseOfferingResponse

class StudentCourseEnrollment(Base):
    __tablename__ = "student_course_enrollments"

    enrollment_id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(20), ForeignKey("students.student_id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    offering_id = Column(Integer, ForeignKey("course_offerings.offering_id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    enrollment_date = Column(Date, nullable=False, default=date.today)
    grade = Column(String(10), nullable=True) # e.g., A, B, C, F, Pass, Fail

    # Relationships
    student_rel = relationship("Student", back_populates="enrollments")
    offering_rel = relationship("CourseOffering", back_populates="enrollments")

    # Ensure a student can enroll in a specific course offering only once
    __table_args__ = (
        UniqueConstraint('student_id', 'offering_id', name='unique_student_offering_enrollment'),
    )

    def __repr__(self):
        return f"<StudentCourseEnrollment(id={self.enrollment_id}, student_id='{self.student_id}', offering_id={self.offering_id})>"

# Pydantic Models
class StudentCourseEnrollmentBase(BaseModel):
    student_id: str
    offering_id: int
    enrollment_date: Optional[date] = None # Default to today's date if not provided
    grade: Optional[str] = None

class StudentCourseEnrollmentCreate(StudentCourseEnrollmentBase):
    pass

class StudentCourseEnrollmentUpdate(BaseModel):
    enrollment_date: Optional[date] = None
    grade: Optional[str] = None

class StudentCourseEnrollmentResponse(StudentCourseEnrollmentBase):
    enrollment_id: int
    offering_rel: Optional[CourseOfferingResponse] = None # Include the nested CourseOfferingResponse

    class Config:
        from_attributes = True 