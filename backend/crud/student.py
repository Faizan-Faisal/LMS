from sqlalchemy.orm import Session
from models.student import Student

# CREATE student
def create_student(db: Session, student_data: dict):
    student = Student(**student_data)
    db.add(student)
    db.commit()
    db.refresh(student)
    return student

# GET all students
def get_students(db: Session):
    return db.query(Student).all()

# SEARCH student by name or ID
def search_student(db: Session, keyword: str):
    return db.query(Student).filter(
        (Student.student_id.ilike(f"%{keyword}%")) |
        (Student.first_name.ilike(f"%{keyword}%")) |
        (Student.last_name.ilike(f"%{keyword}%"))
    ).all()

def get_student_by_id(db: Session, student_id: str):
    return db.query(Student).filter(Student.student_id == student_id).first()


# UPDATE student
def update_student(db: Session, student_id: str, updated_data: dict):
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if student:
        for key, value in updated_data.items():
            setattr(student, key, value)
        db.commit()
        db.refresh(student)
        return student
    return None

# DELETE student
def delete_student(db: Session, student_id: str):
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if student:
        db.delete(student)
        db.commit()
        return True
    return False
