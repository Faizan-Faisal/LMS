from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
from crud.instructor import instructor_course_crud
from models.instructor.course_offerings import CourseOfferingResponse
from routers.instructor.instructor_auth_router import get_current_instructor

router = APIRouter(prefix="/instructor", tags=["Instructor Courses"])

@router.get("/courses", response_model=List[CourseOfferingResponse])
def get_instructor_courses(
    db: Session = Depends(get_db),
    current_instructor: Optional[dict] = Depends(get_current_instructor)
):
    if not current_instructor:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated as instructor")
    
    instructor_id = current_instructor.get("instructor_id")
    if not instructor_id:
        print(f"DEBUG: instructor_id is missing or None from token: {current_instructor}") # Debugging line
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Instructor ID not found in token.")

    # Debugging line: Print the instructor_id being used
    print(f"DEBUG: Fetching courses for instructor_id: {instructor_id}")

    try:
        courses = instructor_course_crud.get_course_offerings_by_instructor_id(db, instructor_id)
        # Debugging line: Print the full course object before returning
        for course_obj in courses:
            print(f"DEBUG: Full CourseOffering object from CRUD: {course_obj.__dict__}")
            if hasattr(course_obj, 'course_rel') and course_obj.course_rel:
                print(f"DEBUG: course_rel attributes: {course_obj.course_rel.__dict__}")

        if not courses:
            return [] # Return empty list if no courses found
        return courses
    except Exception as e:
        print(f"DEBUG: Error in get_course_offerings_by_instructor_id: {e}") # Debugging line
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to fetch courses: {e}") 