from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from pydantic import BaseModel
from typing import Optional
# from models.course_offerings import CourseOffering

class Instructor(Base):
    __tablename__ = "instructors"

    instructor_id = Column(String(20), primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    phone_number = Column(String(100), unique=True, nullable=False)
    cnic = Column(String(25), unique=True, nullable=False)

    # 🔗 Use ForeignKey to reference departments.department_name
    department = Column(String(255), ForeignKey("departments.department_name"))

    qualification = Column(String(255))
    specialization = Column(String(255))
    year_of_experience = Column(Integer)
    picture = Column(String(255))

    # Relationship to Department
    department_rel = relationship("Department", back_populates="instructors")
    # offerings = relationship(lambda: CourseOffering, back_populates="instructor_rel")

    offerings = relationship("CourseOffering", back_populates="instructor_rel")

class InstructorBase(BaseModel):
    instructor_id: str
    first_name: str
    last_name: str
    email: str
    phone_number: str
    cnic: str
    department: Optional[str] = None
    qualification: Optional[str] = None
    specialization: Optional[str] = None
    year_of_experience: Optional[int] = None
    picture: Optional[str] = None

class InstructorResponse(InstructorBase):
    class Config:
        from_attributes = True
