from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from crud import department as crud
import shutil
import os

router = APIRouter(prefix="/departments", tags=["Departments"])


# CREATE department
@router.post("/")
def create_department(
    department_name: str = Form(...),
    db: Session = Depends(get_db)
):
    department_data = {
        
        "department_name": department_name,
    }

    return crud.create_department(db, department_data)

# GET all departments
@router.get("/")
def get_department(db: Session = Depends(get_db)):
    return crud.get_department(db)

# SEARCH instructor by name 
@router.get("/search/")
def search_department(keyword: str, db: Session = Depends(get_db)):
    result = crud.search_department(db, keyword)
    if not result:
        raise HTTPException(status_code=404, detail="Department not found")
    return result

# # VIEW department by name
# @router.get("/{department_name}")
# def get_department(department_name: str, db: Session = Depends(get_db)):
#     department = crud.get_department_by_name(db, department_name)
#     if not instructor:
#         raise HTTPException(status_code=404, detail="Department not found")
#     return department

# DELETE department
@router.delete("/{department_name}")
def delete_department(department_name: str, db: Session = Depends(get_db)):
    deleted = crud.delete_department(db, department_name)
    if not deleted:
        raise HTTPException(status_code=404, detail="Department not found")
    return {"message": "Department deleted successfully"}
