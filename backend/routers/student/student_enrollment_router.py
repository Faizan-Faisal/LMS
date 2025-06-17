from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from database import get_db
from crud.admin import student_enrollment_crud
from models.admin.student_enrollment import StudentCourseEnrollmentCreate, StudentCourseEnrollmentUpdate, StudentCourseEnrollmentResponse
from models.admin.student import StudentResponse

router = APIRouter(prefix="/enrollments", tags=["Student Enrollments"])

@router.post("", response_model=StudentCourseEnrollmentResponse, status_code=status.HTTP_201_CREATED)
def create_enrollment(
    enrollment: StudentCourseEnrollmentCreate,
    db: Session = Depends(get_db)
):
    try:
        db_enrollment = student_enrollment_crud.create_student_enrollment(db, enrollment)
        return db_enrollment
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Error creating enrollment: {e}")

@router.post("/bulk-enroll/{offering_id}", response_model=List[StudentCourseEnrollmentResponse], status_code=status.HTTP_201_CREATED)
def bulk_enroll_students(
    offering_id: int,
    student_ids: List[str],
    db: Session = Depends(get_db)
):
    """Bulk enrolls a list of students into a specific course offering."""
    try:
        new_enrollments = student_enrollment_crud.bulk_create_student_enrollments(db, offering_id, student_ids)
        return [StudentCourseEnrollmentResponse.from_orm(enrollment) for enrollment in new_enrollments]
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Error during bulk enrollment: {e}")

@router.get("", response_model=List[StudentCourseEnrollmentResponse])
def get_all_enrollments(db: Session = Depends(get_db)):
    enrollments = student_enrollment_crud.get_all_enrollments(db)
    return [StudentCourseEnrollmentResponse.from_orm(enrollment) for enrollment in enrollments]

@router.get("/{enrollment_id}", response_model=StudentCourseEnrollmentResponse)
def get_enrollment_by_id(
    enrollment_id: int,
    db: Session = Depends(get_db)
):
    enrollment = student_enrollment_crud.get_enrollment_by_id(db, enrollment_id)
    if not enrollment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enrollment not found")
    return StudentCourseEnrollmentResponse.from_orm(enrollment)

@router.get("/student/{student_id}", response_model=List[StudentCourseEnrollmentResponse])
def get_enrollments_by_student_id(
    student_id: str,
    db: Session = Depends(get_db)
):
    enrollments = student_enrollment_crud.get_enrollments_by_student_id(db, student_id)
    return [StudentCourseEnrollmentResponse.from_orm(enrollment) for enrollment in enrollments]

@router.get("/offering/{offering_id}", response_model=List[StudentCourseEnrollmentResponse])
def get_enrollments_by_offering_id(
    offering_id: int,
    db: Session = Depends(get_db)
):
    enrollments = student_enrollment_crud.get_enrollments_by_offering_id(db, offering_id)
    return [StudentCourseEnrollmentResponse.from_orm(enrollment) for enrollment in enrollments]

@router.put("/{enrollment_id}", response_model=StudentCourseEnrollmentResponse)
def update_enrollment(
    enrollment_id: int,
    enrollment_update: StudentCourseEnrollmentUpdate,
    db: Session = Depends(get_db)
):
    updated_enrollment = student_enrollment_crud.update_student_enrollment(db, enrollment_id, enrollment_update)
    if not updated_enrollment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enrollment not found")
    return StudentCourseEnrollmentResponse.from_orm(updated_enrollment)

@router.delete("/{enrollment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_enrollment(
    enrollment_id: int,
    db: Session = Depends(get_db)
):
    deleted = student_enrollment_crud.delete_student_enrollment(db, enrollment_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enrollment not found")
    return 