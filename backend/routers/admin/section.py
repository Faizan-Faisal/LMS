from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from crud.admin  import section as crud
import shutil
import os

router = APIRouter( tags=["Sections"])


# CREATE section
@router.post("/")
def create_section(
    section_name: str = Form(...),
    department: str = Form(...),
    semester: str = Form(...),
    db: Session = Depends(get_db)
):
    section_data = {
        "section_name": section_name,
        "department": department,
        "semester": semester,
    }

    return crud.create_section(db, section_data)

# GET all sections
@router.get("/")
def get_sections(db: Session = Depends(get_db)):
    return crud.get_sections(db)

# SEARCH section by name or ID
@router.get("/search/")
def search_section(keyword: str, db: Session = Depends(get_db)):
    result = crud.search_section(db, keyword)
    if not result:
        raise HTTPException(status_code=404, detail="section not found")
    return result

# VIEW section by ID
@router.get("/{section_name}")
def get_section(section_name: str, db: Session = Depends(get_db)):
    section = crud.get_section_by_name(db, section_name)
    if not section:
        raise HTTPException(status_code=404, detail="section not found")
    return section

# UPDATE section
@router.put("/{section_name}")
def update_section(
    section_name: str,
    department: str = Form(...),
    semester: str = Form(...),
    db: Session = Depends(get_db)
):
    updated_data = {
        "department": department,
        "semester": semester,
    }

    updated_section = crud.update_section(db, section_name, updated_data)

    if not updated_section:
        raise HTTPException(status_code=404, detail="Section not found or no changes made")
    return updated_section

# DELETE section
@router.delete("/{section_name}")
def delete_section(section_name: str, db: Session = Depends(get_db)):
    deleted = crud.delete_section(db, section_name)
    if not deleted:
        raise HTTPException(status_code=404, detail="section not found")
    return {"message": "section deleted successfully"}
