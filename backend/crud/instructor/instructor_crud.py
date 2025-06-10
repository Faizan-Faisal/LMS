from sqlalchemy.orm import Session
from models.admin.instructor import Instructor # Import the Instructor model

def get_instructor_by_id(db: Session, instructor_id: str):
    return db.query(Instructor).filter(Instructor.instructor_id == instructor_id).first()

def verify_instructor_password(db: Session, instructor_id: str, cnic: str):
    instructor = get_instructor_by_id(db, instructor_id)
    if instructor and instructor.cnic == cnic:
        return instructor
    return None

# NOTE: In a real-world application, passwords (like cnic here) should be hashed and securely stored.
# This example directly compares the cnic for demonstration purposes. 