# routers/course_prerequisites.py

from fastapi import APIRouter, Depends, Form, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from crud.admin  import pre_course as crud_prereq # Your new CRUD file
from crud.admin  import course as crud_course # Assuming you have a separate CRUD for main Courses

from pydantic import BaseModel

class CoursePrerequisiteCreate(BaseModel):
    course_id: str
    prereq_course_id: str

class CoursePrerequisiteRead(CoursePrerequisiteCreate):
    prerequisite_id: int
    class Config:
        orm_mode = True

router = APIRouter( tags=["Course Prerequisites"])

# --- Endpoint to Assign (CREATE) a Prerequisite ---
@router.post("/", response_model=CoursePrerequisiteRead, status_code=status.HTTP_201_CREATED)
def assign_prerequisite(
    course_id: str = Form(...), # The main course that will have this prerequisite
    prereq_course_id: str = Form(...), # The course that IS the prerequisite
    db: Session = Depends(get_db)
    # Using Pydantic model: prereq_data: CoursePrerequisiteCreate
):
    # --- Step 1: Validate if both course_id and prereq_course_id exist in the 'courses' table ---
    main_course_exists = crud_course.get_course_by_id(db, course_id)
    prereq_course_exists = crud_course.get_course_by_id(db, prereq_course_id)

    if not main_course_exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Main course with ID '{course_id}' not found.")
    if not prereq_course_exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Prerequisite course with ID '{prereq_course_id}' not found.")

    # --- Step 2: Prevent self-prerequisite (course cannot be its own prerequisite) ---
    if course_id == prereq_course_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A course cannot be a prerequisite for itself.")

    # --- Step 3: Prevent circular dependencies (e.g., A requires B, B requires A) - More complex, might require a graph traversal ---
    # This is advanced logic, consider implementing later if needed.

    # --- Step 4: Create the prerequisite link ---
    # Using raw strings for now based on your CRUD, but Pydantic is better
    new_link = crud_prereq.create_prerequisite_link(db, course_id, prereq_course_id)
    
    if not new_link:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Prerequisite link already exists.")
    
    return new_link

# --- Endpoint to Get All Prerequisite Links (for admin overview) ---
@router.get("/", response_model=list[CoursePrerequisiteRead])
def get_all_prerequisite_links(db: Session = Depends(get_db)):
    return crud_prereq.get_all_prerequisite_links(db)

# --- Endpoint to Get Prerequisites FOR a specific main course ---
@router.get("/{main_course_id}/prerequisites", response_model=list[CoursePrerequisiteRead])
def get_prerequisites_for_a_specific_course(main_course_id: str, db: Session = Depends(get_db)):
    # Optional: Check if main_course_id actually exists in 'courses'
    if not crud_course.get_course_by_id(db, main_course_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Course with ID '{main_course_id}' not found.")

    prerequisites = crud_prereq.get_prerequisites_for_course(db, main_course_id)
    # if not prerequisites: # Decide if 404 for no prereqs or empty list is better
    #     raise HTTPException(status_code=404, detail=f"No prerequisites found for course {main_course_id}")
    return prerequisites

# --- Endpoint to Get Courses FOR WHICH a specific course IS a prerequisite ---
@router.get("/{prereq_course_id}/required_by", response_model=list[CoursePrerequisiteRead])
def get_courses_requiring_this_prereq_course(prereq_course_id: str, db: Session = Depends(get_db)):
    # Optional: Check if prereq_course_id actually exists in 'courses'
    if not crud_course.get_course_by_id(db, prereq_course_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Prerequisite course with ID '{prereq_course_id}' not found.")
        
    courses_requiring_it = crud_prereq.get_courses_requiring_this_prereq(db, prereq_course_id)
    # if not courses_requiring_it: # Decide if 404 for no courses or empty list is better
    #     raise HTTPException(status_code=404, detail=f"Course {prereq_course_id} is not a prerequisite for any other course")
    return courses_requiring_it

# --- Endpoint to Delete a specific Prerequisite Link ---
@router.delete("/{course_id}/{prereq_course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_prerequisite_link(course_id: str, prereq_course_id: str, db: Session = Depends(get_db)):
    deleted = crud_prereq.delete_prerequisite_link(db, course_id, prereq_course_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prerequisite link not found.")
    return {"message": "Prerequisite link deleted successfully."}