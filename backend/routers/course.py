from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from crud import course as crud
import shutil
import os

router = APIRouter(prefix="/courses", tags=["Courses"])


# CREATE course
@router.post("/")
def create_course(
    course_id: str = Form(...),
    course_name: str = Form(...),
    course_description: str = Form(...),
    course_credit_hours: int = Form(...),
    db: Session = Depends(get_db)
):
    course_data = {
        "course_id": course_id,
        "course_name": course_name,
        "course_description": course_description,
        "course_credit_hours": course_credit_hours,
    }

    return crud.create_course(db, course_data)

# GET all courses
@router.get("/")
def get_courses(db: Session = Depends(get_db)):
    return crud.get_courses(db)

# SEARCH course by name or ID
@router.get("/search/")
def search_course(keyword: str, db: Session = Depends(get_db)):
    result = crud.search_course(db, keyword)
    if not result:
        raise HTTPException(status_code=404, detail="course not found")
    return result

# VIEW course by ID
@router.get("/{course_name}")
def get_course(course_name: str, db: Session = Depends(get_db)):
    course = crud.get_course_by_name(db, course_name)
    if not course:
        raise HTTPException(status_code=404, detail="course not found")
    return course

# UPDATE course
@router.put("/{course_name}")
def update_course(
    course_id: str,
    course_name: str,
    course_description: str = Form(...),
    course_credit_hours: int = Form(...),
    db: Session = Depends(get_db)
):
    updated_data = {
        # "course_id": course_id,
        "course_name": course_name,
        "course_description": course_description,
        "course_credit_hours": course_credit_hours,
    }

# DELETE course
@router.delete("/{course_id}")
def delete_course(course_id: str, db: Session = Depends(get_db)):
    deleted = crud.delete_course(db, course_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="course not found")
    return {"message": "course deleted successfully"}
