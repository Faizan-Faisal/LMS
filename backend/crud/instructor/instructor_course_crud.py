from sqlalchemy.orm import Session, joinedload
from models.admin.course_offerings import CourseOffering
from models.admin.course import Course
from models.admin.section import Section

def get_course_offerings_by_instructor_id(db: Session, instructor_id: str):
    return db.query(CourseOffering)\
        .filter(CourseOffering.instructor_id == instructor_id)\
        .options(joinedload(CourseOffering.course_rel))\
        .options(joinedload(CourseOffering.section_rel))\
        .all() 