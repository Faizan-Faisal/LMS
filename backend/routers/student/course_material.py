from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from crud.student import course_material as crud_course_material
from database import get_db
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from fastapi.responses import FileResponse
import os
from models.instructor.course_materials import CourseMaterial

class CourseMaterialResponse(BaseModel):
    material_id: int
    offering_id: int
    title: str
    description: Optional[str] = None
    file_path: Optional[str] = None
    uploaded_at: Optional[datetime] = None

    class Config:
        from_attributes = True

router = APIRouter()

@router.get("/students/{student_id}/course_materials", response_model=List[CourseMaterialResponse])
def read_course_materials_by_student(student_id: str, offering_id: Optional[int] = None, db: Session = Depends(get_db)):
    course_materials = crud_course_material.get_course_materials(db, student_id=student_id, offering_id=offering_id)
    return course_materials

@router.get("/offerings/{offering_id}/course_materials", response_model=List[CourseMaterialResponse])
def read_course_materials(offering_id: int, db: Session = Depends(get_db)):
    course_materials = crud_course_material.get_course_materials(db, offering_id=offering_id)
    return course_materials

@router.get("/course_materials/{material_id}/download")
def download_course_material(material_id: int, db: Session = Depends(get_db)):
    course_material = db.query(CourseMaterial).filter(CourseMaterial.material_id == material_id).first()
    if not course_material or not course_material.file_path:
        raise HTTPException(status_code=404, detail="Course material not found or no file associated")

    file_path = course_material.file_path
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on server")
    
    file_name = os.path.basename(file_path)
    return FileResponse(path=file_path, filename=file_name, media_type="application/octet-stream") 