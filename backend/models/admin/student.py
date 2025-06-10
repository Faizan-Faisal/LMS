from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

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