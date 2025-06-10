from sqlalchemy.orm import Session
from models.admin.department import Department

# CREATE department
def create_department(db: Session, department_data: dict):
    department = Department(**department_data)
    db.add(department)
    db.commit()
    db.refresh(department)
    return department

# GET all department
def get_department(db: Session):
    return db.query(Department).all()

# SEARCH department by name 
def search_department(db: Session, keyword: str):
    return db.query(Department).filter(
        (Department.department_name.ilike(f"%{keyword}%"))
    ).all()

# DELETE department
def delete_department(db: Session, department_name: str):
    department = db.query(Department).filter(Department.department_name == department_name).first()
    if department:
        db.delete(department)
        db.commit()
        return True
    return False
