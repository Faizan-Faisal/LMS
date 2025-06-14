from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from pydantic import BaseModel
from typing import Optional

class Student(Base):
    __tablename__ = "students"

    student_id = Column(String(20), primary_key=True, index=True)  # Not auto-increment
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    phone_number = Column(String(100), unique=True, nullable=False)
    cnic = Column(String(25), unique=True, nullable=False)
    program = Column(String(255),  ForeignKey("departments.department_name"))
    section = Column(String(255),  ForeignKey("sections.section_name"))
    enrollment_year = Column(Integer, nullable=False)
    picture = Column(String(255))  # This stores image file name or path

    # Relationship to Department
    department_rel = relationship("Department", back_populates="students")
    section_rel = relationship("Section", back_populates="students")
    
    # Relationships for attendance and exam records
    attendances_records = relationship("Attendance", back_populates="student")
    exam_records = relationship("ExamRecord", back_populates="student")
    enrollments = relationship("StudentCourseEnrollment", back_populates="student_rel")

# Pydantic Model for response
class StudentResponse(BaseModel):
    student_id: str
    first_name: str
    last_name: str
    email: str
    phone_number: str
    cnic: str
    program: Optional[str] = None
    section: Optional[str] = None
    enrollment_year: int
    picture: Optional[str] = None

    class Config:
        from_attributes = True