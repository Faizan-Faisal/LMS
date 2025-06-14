from fastapi import APIRouter, Depends, HTTPException, Form, status
from sqlalchemy.orm import Session
from database import get_db
from pydantic import BaseModel
from crud.admin  import course_offerings as crud_offering
from crud.admin  import course as crud_course
from crud.admin  import instructor as crud_instructor
from crud.admin  import section as crud_section  # if exists

router = APIRouter( tags=["Course Offerings"])

# --- Schemas ---
class CourseOfferingCreate(BaseModel):
    course_id: str
    section_name: str
    instructor_id: str
    capacity: int

class CourseOfferingUpdate(BaseModel):
    course_id: str # Allow changing course_id
    section_name: str # Allow changing section_name
    instructor_id: str # Allow changing instructor_id
    capacity: int # Allow changing capacity

class CourseOfferingRead(CourseOfferingCreate):
    offering_id: int

    class Config:
        orm_mode = True

class CourseOfferingDetails(BaseModel):
    offering_id: int
    capacity: int
    course_name: str
    instructor_first_name: str
    instructor_last_name: str

    class Config:
        orm_mode = True # To allow SQLAlchemy models to be returned

class InstructorRel(BaseModel):
    first_name: str
    last_name: str

class CourseRel(BaseModel):
    course_name: str

class CourseOfferingNestedResponse(BaseModel):
    offering_id: int
    capacity: int
    section_name: str
    course_rel: CourseRel
    instructor_rel: InstructorRel

    class Config:
        orm_mode = True

# --- Create ---
@router.post("/", response_model=CourseOfferingRead, status_code=status.HTTP_201_CREATED)
def create_offering(
    course_id: str = Form(...),
    section_name: str = Form(...),
    instructor_id: str = Form(...),
    capacity: int = Form(...),
    db: Session = Depends(get_db)
):
    # Validate foreign keys
    if not crud_course.get_course_by_id(db, course_id):
        raise HTTPException(status_code=404, detail="Course not found.")

    if not crud_instructor.get_instructor_by_id(db, instructor_id):
        raise HTTPException(status_code=404, detail="Instructor not found.")

    if not crud_section.get_section_by_name(db, section_name):
        raise HTTPException(status_code=404, detail="Section not found.")

    new_offering = crud_offering.create_course_offering(
        db, course_id, section_name, instructor_id, capacity
    )
    if not new_offering:
        raise HTTPException(status_code=409, detail="Course offering already exists with this course and section.")

    return new_offering


# --- Get All ---
@router.get("/", response_model=list[CourseOfferingRead])
def get_all_offerings(db: Session = Depends(get_db)):
    return crud_offering.get_all_course_offerings(db)


# --- Get by ID ---
@router.get("/{offering_id}", response_model=CourseOfferingRead)
def get_offering_by_id(offering_id: int, db: Session = Depends(get_db)):
    offering = crud_offering.get_course_offering_by_id(db, offering_id)
    if not offering:
        raise HTTPException(status_code=404, detail="Course offering not found.")
    return offering


# --- Get by Course ---
@router.get("/course/{course_id}", response_model=list[CourseOfferingRead])
def get_offerings_by_course(course_id: str, db: Session = Depends(get_db)):
    return crud_offering.get_offerings_by_course(db, course_id)


# --- Get by Instructor ---
@router.get("/instructor/{instructor_id}", response_model=list[CourseOfferingRead])
def get_offerings_by_instructor(instructor_id: str, db: Session = Depends(get_db)):
    return crud_offering.get_offerings_by_instructor(db, instructor_id)


# --- Update ---
@router.put("/{offering_id}", response_model=CourseOfferingRead)
def update_offering(
    offering_id: int,
    course_id: str = Form(...),
    section_name: str = Form(...),
    instructor_id: str = Form(...),
    capacity: int = Form(...),
    db: Session = Depends(get_db)
):
    # Validate foreign keys for updated fields
    if not crud_course.get_course_by_id(db, course_id):
        raise HTTPException(status_code=404, detail="Course not found.")

    if not crud_instructor.get_instructor_by_id(db, instructor_id):
        raise HTTPException(status_code=404, detail="Instructor not found.")

    if not crud_section.get_section_by_name(db, section_name):
        raise HTTPException(status_code=404, detail="Section not found.")

    updated_data = {
        "course_id": course_id,
        "section_name": section_name,
        "instructor_id": instructor_id,
        "capacity": capacity,
    }

    updated_offering = crud_offering.update_course_offering(db, offering_id, updated_data)
    if not updated_offering:
        raise HTTPException(status_code=404, detail="Course offering not found.")
    return updated_offering


# --- Get by Section with Details (New Functionality) ---
@router.get("/section/{section_name}/details", response_model=list[CourseOfferingNestedResponse])
def get_offerings_by_section_details(
    section_name: str,
    db: Session = Depends(get_db)
):
    details = crud_offering.get_course_offerings_by_section_details(db, section_name)
    if not details:
        raise HTTPException(status_code=404, detail="No course offerings found for this section.")

    # Map the returned tuples/rows to the nested Pydantic model
    return [
        CourseOfferingNestedResponse(
            offering_id=d[0],
            capacity=d[1],
            section_name=section_name,
            course_rel={"course_name": d[2]},
            instructor_rel={"first_name": d[3], "last_name": d[4]}
        )
        for d in details
    ]

# --- Delete ---
@router.delete("/{offering_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_offering(offering_id: int, db: Session = Depends(get_db)):
    deleted = crud_offering.delete_course_offering(db, offering_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Offering not found.")
    return {"message": "Deleted successfully."}
