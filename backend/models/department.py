from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from database import Base

class Department(Base):
    __tablename__ = "departments"

    department_name = Column(String(20), primary_key=True, index=True)

    # Relationship: One department → Many instructors
    instructors = relationship("Instructor", back_populates="department_rel")
    sections = relationship("Section", back_populates="department_rel")
    students = relationship("Student", back_populates="department_rel")