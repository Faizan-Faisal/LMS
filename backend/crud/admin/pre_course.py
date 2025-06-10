# crud/course_prerequisite.py

from sqlalchemy.orm import Session
from sqlalchemy import and_
from models.pre_course import CoursePrerequisite # Your model
from models.course import Course # You'll need this to validate course_ids later, and for joins

# --- Create Operations ---
def create_prerequisite_link(db: Session, course_id: str, prereq_course_id: str):
    """
    Creates a new prerequisite link between a main course and its prerequisite.
    Returns the created link, or None if it already exists.
    """
    # Optional: Basic validation if the courses themselves exist (highly recommended)
    # from crud.course import get_course_by_id # Assuming you have this in your course crud
    # if not get_course_by_id(db, course_id) or not get_course_by_id(db, prereq_course_id):
    #     return None # Or raise a specific error for invalid course IDs

    # Check if the prerequisite link already exists
    existing_link = db.query(CoursePrerequisite).filter(
        and_(
            CoursePrerequisite.course_id == course_id,
            CoursePrerequisite.prereq_course_id == prereq_course_id
        )
    ).first()

    if existing_link:
        return None # Link already exists, perhaps raise a custom exception in real app

    new_prereq_link = CoursePrerequisite(
        course_id=course_id,
        prereq_course_id=prereq_course_id
    )
    db.add(new_prereq_link)
    db.commit()
    db.refresh(new_prereq_link)
    return new_prereq_link

# --- Read Operations ---
def get_all_prerequisite_links(db: Session):
    """
    Retrieves all prerequisite links in the database.
    """
    return db.query(CoursePrerequisite).all()

def get_prerequisites_for_course(db: Session, main_course_id: str):
    """
    Retrieves all prerequisite courses for a given main course ID.
    Returns a list of CoursePrerequisite objects.
    """
    # You might want to eager load the prerequisite_course details here for display
    return db.query(CoursePrerequisite).\
        filter(CoursePrerequisite.course_id == main_course_id).\
        all()

def get_courses_requiring_this_prereq(db: Session, prereq_course_id: str):
    """
    Retrieves all courses that require a given prerequisite course ID.
    Returns a list of CoursePrerequisite objects.
    """
    return db.query(CoursePrerequisite).\
        filter(CoursePrerequisite.prereq_course_id == prereq_course_id).\
        all()

# --- Delete Operations ---
def delete_prerequisite_link(db: Session, course_id: str, prereq_course_id: str):
    """
    Deletes a specific prerequisite link between a main course and its prerequisite.
    Returns True if deleted, False if not found.
    """
    link_to_delete = db.query(CoursePrerequisite).filter(
        and_(
            CoursePrerequisite.course_id == course_id,
            CoursePrerequisite.prereq_course_id == prereq_course_id
        )
    ).first()

    if link_to_delete:
        db.delete(link_to_delete)
        db.commit()
        return True
    return False

