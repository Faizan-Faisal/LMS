from sqlalchemy.orm import Session
from sqlalchemy import and_
from models.course_offerings import CourseOffering
from models.course import Course # Import Course model for joins
from models.instructor import Instructor # Import Instructor model for joins


def create_course_offering(db: Session, course_id: str, section_name: str, instructor_id: str, capacity: int):
    # Check for duplicate course + section
    existing = db.query(CourseOffering).filter(
        and_(
            CourseOffering.course_id == course_id,
            CourseOffering.section_name == section_name
        )
    ).first()
    if existing:
        return None  # Already exists

    new_offering = CourseOffering(
        course_id=course_id,
        section_name=section_name,
        instructor_id=instructor_id,
        capacity=capacity
    )
    db.add(new_offering)
    db.commit()
    db.refresh(new_offering)
    return new_offering


def get_all_course_offerings(db: Session):
    return db.query(CourseOffering).all()


def get_course_offering_by_id(db: Session, offering_id: int):
    return db.query(CourseOffering).filter(CourseOffering.offering_id == offering_id).first()


def get_offerings_by_course(db: Session, course_id: str):
    return db.query(CourseOffering).filter(CourseOffering.course_id == course_id).all()


def get_offerings_by_instructor(db: Session, instructor_id: str):
    return db.query(CourseOffering).filter(CourseOffering.instructor_id == instructor_id).all()


def update_course_offering(db: Session, offering_id: int, updated_data: dict):
    offering = db.query(CourseOffering).filter(CourseOffering.offering_id == offering_id).first()
    if offering:
        for key, value in updated_data.items():
            setattr(offering, key, value)
        db.commit()
        db.refresh(offering)
        return offering
    return None


def delete_course_offering(db: Session, offering_id: int):
    offering = get_course_offering_by_id(db, offering_id)
    if offering:
        db.delete(offering)
        db.commit()
        return True
    return False

# New function to view course offerings by section name with details
def get_course_offerings_by_section_details(db: Session, section_name: str):
    return (
        db.query(
            CourseOffering.offering_id,
            CourseOffering.capacity,
            Course.course_name, # Access course name from joined Course model
            Instructor.first_name, # Access instructor first name from joined Instructor model
            Instructor.last_name # Access instructor last name from joined Instructor model
        )
        .join(Course, CourseOffering.course_id == Course.course_id)
        .join(Instructor, CourseOffering.instructor_id == Instructor.instructor_id)
        .filter(CourseOffering.section_name == section_name)
        .all()
    )
