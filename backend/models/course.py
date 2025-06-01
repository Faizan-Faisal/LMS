from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Course(Base):
    __tablename__ = "courses"

    course_id = Column(String(20), primary_key=True, index=True)
    course_name = Column(String(100), nullable=False)
    
    course_description = Column(String(255),  nullable=False)
    course_credit_hours = Column(Integer,  nullable=False)
   
