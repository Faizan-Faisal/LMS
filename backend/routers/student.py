from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from crud import student as crud
import shutil
import os

router = APIRouter(prefix="/students", tags=["Students"])
UPLOAD_DIR = "upload_student_img/"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# CREATE student
@router.post("/")
def create_student(
    student_id: str = Form(...),
    first_name: str = Form(...),
    last_name: str = Form(...),
    email: str = Form(...),
    phone_number: str = Form(...),
    cnic: str = Form(...),
    program: str = Form(...),
    section: str = Form(...),
    enrollment_year: int = Form(...),
    picture: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Save uploaded image
    file_path = f"{UPLOAD_DIR}{picture.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(picture.file, buffer)

    student_data = {
        "student_id": student_id,
        "first_name": first_name,
        "last_name": last_name,
        "email": email,
        "phone_number": phone_number,
        "cnic": cnic,
        "program": program,
        "section": section,
        "enrollment_year": enrollment_year,
        "picture": picture.filename
    }

    return crud.create_student(db, student_data)

# GET all students
@router.get("/")
def get_students(db: Session = Depends(get_db)):
    return crud.get_students(db)

# SEARCH student by name or ID
@router.get("/search/")
def search_student(keyword: str, db: Session = Depends(get_db)):
    result = crud.search_student(db, keyword)
    if not result:
        raise HTTPException(status_code=404, detail="student not found")
    return result

# VIEW student by ID
@router.get("/{student_id}")
def get_student(student_id: str, db: Session = Depends(get_db)):
    student = crud.get_student_by_id(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="student not found")
    return student

# UPDATE student
@router.put("/{student_id}")
def update_student(
    student_id: str,
    first_name: str = Form(...),
    last_name: str = Form(...),
    email: str = Form(...),
    cnic: str = Form(...),
    program: str = Form(...),
    section: str = Form(...),
    enrollment_year: int = Form(...),
    picture: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    updated_data = {
        "first_name": first_name,
        "last_name": last_name,
        "email": email,
        "phone_number": phone_number,
        "cnic": cnic,
        "program": program,
        "section": section,
        "enrollment_year": enrollment_year,
    }

    # Optional picture update
    if picture:
        file_path = f"{UPLOAD_DIR}{picture.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(picture.file, buffer)
        updated_data["picture"] = picture.filename

    updated = crud.update_student(db, student_id, updated_data)
    if not updated:
        raise HTTPException(status_code=404, detail="student not found")
    return updated



# DELETE student
@router.delete("/{student_id}")
def delete_student(student_id: str, db: Session = Depends(get_db)):
    deleted = crud.delete_student(db, student_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="student not found")
    return {"message": "student deleted successfully"}
