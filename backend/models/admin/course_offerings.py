from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from database import Base
from pydantic import BaseModel
from typing import Optional

from models.admin.course import CourseResponse
from models.admin.instructor import InstructorResponse

class CourseOffering(Base):
    __tablename__ = "course_offerings"

    offering_id = Column(Integer, primary_key=True, autoincrement=True)
  
    course_id = Column(String(20), ForeignKey("courses.course_id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    section_name = Column(String(255), ForeignKey("sections.section_name", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    instructor_id = Column(String(20), ForeignKey("instructors.instructor_id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    
    capacity = Column(Integer, nullable=False, default=50)

    # Relationships
    course_rel = relationship("Course", back_populates="offerings")
    section_rel = relationship("Section", back_populates="offerings")
    instructor_rel = relationship("Instructor", back_populates="offerings")

    course_materials = relationship("CourseMaterial", back_populates="offering")
    exam_records = relationship("ExamRecord", back_populates="offering")
    attendances_records = relationship("Attendance", back_populates="offering")
    enrollments = relationship("StudentCourseEnrollment", back_populates="offering_rel")
    # Enforce unique constraint (course_id, section_name)
    __table_args__ = (
        UniqueConstraint("course_id", "section_name", name="unique_course_section"),
    )

    def __repr__(self):
        return f"<CourseOffering(offering_id={self.offering_id}, course_id='{self.course_id}', section_name='{self.section_name}')>"


# Pydantic Models for Course Offering (Admin context)
class CourseOfferingBase(BaseModel):
    course_id: str
    section_name: str
    instructor_id: str
    capacity: int

class CourseOfferingCreate(CourseOfferingBase):
    pass # No additional fields needed for creation currently

class CourseOfferingResponse(CourseOfferingBase):
    offering_id: int
    course_rel: Optional[CourseResponse] = None
    instructor_rel: Optional[InstructorResponse] = None

    class Config:
        from_attributes = True


