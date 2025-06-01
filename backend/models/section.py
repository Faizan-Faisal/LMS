from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Section(Base):
    __tablename__ = "sections"

    section_name = Column(String(255), primary_key=True, index=True)  # Not auto-increment
    department = Column(String(20), ForeignKey("departments.department_name"))
    semester = Column(String(255),  nullable=False)

    # Relationship to Department
    department_rel = relationship("Department", back_populates="sections")
    students = relationship("Student", back_populates="section_rel")