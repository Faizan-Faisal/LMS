from sqlalchemy.orm import Session
from models.admin.student import Student # Import the Student model

def get_student_by_id(db: Session, student_id: str):
    return db.query(Student).filter(Student.student_id == student_id).first()

def verify_student_password(db: Session, student_id: str, cnic: str):
    student = get_student_by_id(db, student_id)
    if student and student.cnic == cnic:
        return student
    return None

# NOTE: As with instructors, in a real-world application, passwords should be hashed and securely stored. 