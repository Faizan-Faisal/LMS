from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from crud.admin  import instructor as crud
import shutil
import os

router = APIRouter(tags=["Instructors"])
UPLOAD_DIR = "upload/"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# CREATE instructor
@router.post("/")
def create_instructor(
    instructor_id: str = Form(...),
    first_name: str = Form(...),
    last_name: str = Form(...),
    email: str = Form(...),
    phone_number: str = Form(...),
    cnic: str = Form(...),
    department: str = Form(...),
    qualification: str = Form(...),
    specialization: str = Form(...),
    year_of_experience: int = Form(...),
    picture: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Save uploaded image
    file_path = f"{UPLOAD_DIR}{picture.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(picture.file, buffer)

    instructor_data = {
        "instructor_id": instructor_id,
        "first_name": first_name,
        "last_name": last_name,
        "email": email,
        "phone_number": phone_number,
        "cnic": cnic,
        "department": department,
        "qualification": qualification,
        "specialization": specialization,
        "year_of_experience": year_of_experience,
        "picture": picture.filename
    }

    return crud.create_instructor(db, instructor_data)

# GET all instructors
@router.get("/")
def get_instructors(db: Session = Depends(get_db)):
    return crud.get_instructors(db)

# SEARCH instructor by name or ID
@router.get("/search/")
def search_instructor(keyword: str, db: Session = Depends(get_db)):
    result = crud.search_instructor(db, keyword)
    if not result:
        raise HTTPException(status_code=404, detail="Instructor not found")
    return result

# VIEW instructor by ID
@router.get("/{instructor_id}")
def get_instructor(instructor_id: str, db: Session = Depends(get_db)):
    instructor = crud.get_instructor_by_id(db, instructor_id)
    if not instructor:
        raise HTTPException(status_code=404, detail="Instructor not found")
    return instructor

# UPDATE instructor
@router.put("/{instructor_id}")
def update_instructor(
    instructor_id: str,
    first_name: str = Form(...),
    last_name: str = Form(...),
    email: str = Form(...),
    phone_number: str = Form(...),
    cnic: str = Form(...),
    department: str = Form(...),
    qualification: str = Form(...),
    specialization: str = Form(...),
    year_of_experience: int = Form(...),
    picture: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    updated_data = {
        "first_name": first_name,
        "last_name": last_name,
        "email": email,
        "phone_number": phone_number,
        "cnic": cnic,
        "department": department,
        "qualification": qualification,
        "specialization": specialization,
        "year_of_experience": year_of_experience,
    }

    # Optional picture update
    if picture:
        file_path = f"{UPLOAD_DIR}{picture.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(picture.file, buffer)
        updated_data["picture"] = picture.filename

    updated = crud.update_instructor(db, instructor_id, updated_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Instructor not found")
    return updated

# DELETE instructor
@router.delete("/{instructor_id}")
def delete_instructor(instructor_id: str, db: Session = Depends(get_db)):
    deleted = crud.delete_instructor(db, instructor_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Instructor not found")
    return {"message": "Instructor deleted successfully"}
