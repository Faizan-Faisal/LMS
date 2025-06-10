from sqlalchemy.orm import Session
from models.course import Course
from models.pre_course import CoursePrerequisite

# CREATE course
def create_course(db: Session, course_data: dict):
    course = Course(**course_data)
    db.add(course)
    db.commit()
    db.refresh(course)
    return course

# GET all courses
def get_courses(db: Session):
    return db.query(Course).all()

# SEARCH course by name 
def search_course(db: Session, keyword: str):
    return db.query(Course).filter(
        (Course.course_name.ilike(f"%{keyword}%")) 
    ).all()

def get_course_by_name(db: Session, course_name: str):
    return db.query(Course).filter(Course.course_name == course_name).first()

def get_course_by_id(db: Session, course_id: str):
    """
    Retrieves a course by its course ID.
    """
    return db.query(Course).filter(Course.course_id == course_id).first()

# UPDATE course
def update_course(db: Session, course_name: str, updated_data: dict):
    course = db.query(Course).filter(Course.course_name == course_name).first()
    if course:
        for key, value in updated_data.items():
            setattr(course, key, value)
        db.commit()
        db.refresh(course)
        return course
    return None

# DELETE course
def delete_course(db: Session, course_id: str):
    # First, delete all prerequisite links where this course is the prerequisite
    db.query(CoursePrerequisite).filter(CoursePrerequisite.prereq_course_id == course_id).delete()
    
    # Now, delete the course itself
    course = db.query(Course).filter(Course.course_id == course_id).first()
    if course:
        db.delete(course)
        db.commit()
        return True
    db.commit() # Commit changes even if course not found (for prereq deletion)
    return False
