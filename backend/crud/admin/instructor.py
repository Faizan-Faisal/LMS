from sqlalchemy.orm import Session
from models.admin.instructor import Instructor

# CREATE instructor
def create_instructor(db: Session, instructor_data: dict):
    instructor = Instructor(**instructor_data)
    db.add(instructor)
    db.commit()
    db.refresh(instructor)
    return instructor

# GET all instructors
def get_instructors(db: Session):
    return db.query(Instructor).all()

# SEARCH instructor by name or ID
def search_instructor(db: Session, keyword: str):
    return db.query(Instructor).filter(
        (Instructor.instructor_id.ilike(f"%{keyword}%")) |
        (Instructor.first_name.ilike(f"%{keyword}%")) |
        (Instructor.last_name.ilike(f"%{keyword}%"))
    ).all()

def get_instructor_by_id(db: Session, instructor_id: str):
    return db.query(Instructor).filter(Instructor.instructor_id == instructor_id).first()


# UPDATE instructor
def update_instructor(db: Session, instructor_id: str, updated_data: dict):
    instructor = db.query(Instructor).filter(Instructor.instructor_id == instructor_id).first()
    if instructor:
        for key, value in updated_data.items():
            setattr(instructor, key, value)
        db.commit()
        db.refresh(instructor)
        return instructor
    return None

# DELETE instructor
def delete_instructor(db: Session, instructor_id: str):
    instructor = db.query(Instructor).filter(Instructor.instructor_id == instructor_id).first()
    if instructor:
        db.delete(instructor)
        db.commit()
        return True
    return False
