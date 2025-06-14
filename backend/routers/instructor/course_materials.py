from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, Body
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import shutil
import os

from database import get_db
from models.instructor.course_materials import CourseMaterial
from crud.instructor import course_materials as crud

router = APIRouter()

UPLOAD_DIR = "upload/materials"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# -------------------- COURSE MATERIAL ROUTES --------------------
@router.get("/materials/", response_model=List[dict])
def get_materials(
    offering_id: int,
    search_term: Optional[str] = None,
    db: Session = Depends(get_db)
):
    if search_term:
        return crud.search_materials(db, offering_id, search_term)
    return crud.get_materials(db, offering_id)

@router.get("/materials/date-range/", response_model=List[dict])
def get_materials_by_date_range(
    offering_id: int,
    start_date: datetime,
    end_date: datetime,
    db: Session = Depends(get_db)
):
    return crud.get_materials_by_date_range(db, offering_id, start_date, end_date)

@router.post("/materials/", response_model=dict)
async def add_material(
    offering_id: int = Form(...),
    title: str = Form(...),
    description: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Save the uploaded file
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Create material record
    material_data = {
        "offering_id": offering_id,
        "title": title,
        "description": description,
        "file_path": file_path,
        "upload_date": datetime.utcnow()
    }
    return crud.create_material(db, material_data)

@router.put("/materials/{material_id}", response_model=dict)
def update_material(
    material_id: int,
    title: Optional[str] = Body(None),
    description: Optional[str] = Body(None),
    db: Session = Depends(get_db)
):
    material_data = {
        "title": title,
        "description": description
    }
    # Remove None values
    material_data = {k: v for k, v in material_data.items() if v is not None}
    
    material = crud.update_material(db, material_id, material_data)
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    return {"message": "Material updated successfully"}

@router.delete("/materials/{material_id}", response_model=dict)
def delete_material(material_id: int, db: Session = Depends(get_db)):
    material = crud.delete_material(db, material_id)
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    
    # Delete the associated file
    try:
        os.remove(material["file_path"])
    except OSError:
        pass  # Ignore if file doesn't exist
    
    return {"message": "Material deleted successfully"}
