from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
 
# Assuming your Course model is defined as discussed previously:
class Course(Base):
    __tablename__ = "courses"

    course_id = Column(String(20), primary_key=True, index=True, nullable=False)
    course_name = Column(String(100), nullable=False)
    course_description = Column(String(255), nullable=False)
    course_credit_hours = Column(Integer, nullable=False)

    # Relationship to get all CoursePrerequisite objects where THIS course is the main course
    # (i.e., list of prerequisites that THIS course has)
    prerequisites_for_this_course = relationship(
        "CoursePrerequisite",
        foreign_keys="[CoursePrerequisite.course_id]", # Specifies which FK in CoursePrerequisite this list maps to
        back_populates="main_course"
    )

    # Relationship to get all CoursePrerequisite objects where THIS course IS the prerequisite
    # (i.e., list of courses for which THIS course is a prerequisite)
    is_prerequisite_for_courses = relationship(
        "CoursePrerequisite",
        foreign_keys="[CoursePrerequisite.prereq_course_id]", # Specifies which FK in CoursePrerequisite this list maps to
        back_populates="prerequisite_course"
    )

    # Other relationships (like offerings) would also go here
    # offerings = relationship("CourseOffering", back_populates="course_rel")

    def __repr__(self):
        return f"<Course(course_id='{self.course_id}', course_name='{self.course_name}')>"