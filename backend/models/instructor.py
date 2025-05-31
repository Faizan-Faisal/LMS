from sqlalchemy import Column, String, Integer
from database import Base

class Instructor(Base):
    __tablename__ = "instructors"

    instructor_id = Column(String(20), primary_key=True, index=True)  # Not auto-increment
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    phone_number = Column(String(100), unique=True, nullable=False)
    cnic = Column(String(25), unique=True, nullable=False)
    department = Column(String(100))
    qualification = Column(String(100))
    specialization = Column(String(100))
    year_of_experience = Column(Integer)
    picture = Column(String(255))  # This stores image file name or path
