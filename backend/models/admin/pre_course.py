from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class CoursePrerequisite(Base):
    __tablename__ = "course_prerequisites"

    prerequisite_id = Column(Integer, primary_key=True, index=True, nullable=False, autoincrement=True)
    course_id = Column(String(20), ForeignKey("courses.course_id"), nullable=False) # The course that HAS this prereq
    prereq_course_id = Column(String(20), ForeignKey("courses.course_id"), nullable=False) # The course that IS the prereq

    # 'main_course' is the Course object for which this row defines a prerequisite
    main_course = relationship(
        "Course",
        foreign_keys=[course_id], # Explicitly state the FK used for this relationship
        back_populates="prerequisites_for_this_course" # Points to the list on the Course model
    )

    # 'prerequisite_course' is the Course object that IS the prerequisite
    prerequisite_course = relationship(
        "Course",
        foreign_keys=[prereq_course_id], # Explicitly state the FK used for this relationship
        back_populates="is_prerequisite_for_courses" # Points to another list on the Course model
    )

    def __repr__(self):
        return f"<CoursePrerequisite(course_id='{self.course_id}', prereq_course_id='{self.prereq_course_id}')>"