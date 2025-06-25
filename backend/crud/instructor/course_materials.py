# crud/course_materials.py
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from models.instructor.course_materials import CourseMaterial

def get_materials(db: Session, offering_id: int) -> List[dict]:
    records = db.query(CourseMaterial).filter(CourseMaterial.offering_id == offering_id).all()
    return [record.to_dict() for record in records]

def get_materials_by_date_range(
    db: Session, 
    offering_id: int, 
    start_date: datetime, 
    end_date: datetime
) -> List[dict]:
    records = db.query(CourseMaterial).filter(
        CourseMaterial.offering_id == offering_id,
        CourseMaterial.upload_date >= start_date,
        CourseMaterial.upload_date <= end_date
    ).all()
    return [record.to_dict() for record in records]

def search_materials(db: Session, offering_id: int, search_term: str) -> List[dict]:
    records = db.query(CourseMaterial).filter(
        CourseMaterial.offering_id == offering_id,
        CourseMaterial.title.ilike(f"%{search_term}%")
    ).all()
    return [record.to_dict() for record in records]

def create_material(db: Session, material_data: dict) -> dict:
    material = CourseMaterial(**material_data)
    db.add(material)
    db.commit()
    db.refresh(material)
    return material.to_dict()

def update_material(db: Session, material_id: int, material_data: dict) -> Optional[dict]:
    material = db.query(CourseMaterial).filter(CourseMaterial.id == material_id).first()
    if not material:
        return None
    
    for key, value in material_data.items():
        setattr(material, key, value)
    
    db.commit()
    db.refresh(material)
    return material.to_dict()

def delete_material(db: Session, material_id: int) -> Optional[dict]:
    material = db.query(CourseMaterial).filter(CourseMaterial.material_id == material_id).first()
    if not material:
        return None
    
    db.delete(material)
    db.commit()
    return material.to_dict()
