from fastapi import APIRouter, HTTPException, Depends, status, Body
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from database import get_db
from crud.instructor import attendance_records as crud_attendance
from crud.admin import student as crud_student
from models.instructor.attendance_records import Attendance, AttendanceStatusEnum, AttendanceCreate, AttendanceUpdate, AttendanceResponse
from models.admin.student import StudentResponse
from routers.instructor.instructor_auth_router import get_current_instructor

router = APIRouter(prefix="/attendance", tags=["Instructor Attendance"])

# -------------------- ATTENDANCE ROUTES --------------------
@router.get("/offering/{offering_id}", response_model=List[AttendanceResponse])
def get_attendance_records_for_offering(
    offering_id: int,
    db: Session = Depends(get_db),
    current_instructor: Optional[dict] = Depends(get_current_instructor)
):
    if not current_instructor:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated as instructor")
    
    records = crud_attendance.get_attendance_records(db, offering_id)
    return [AttendanceResponse.from_orm(record) for record in records]

@router.get("/offering/{offering_id}/date/{date_val}", response_model=List[AttendanceResponse])
def get_attendance_by_specific_date(
    offering_id: int,
    date_val: date,
    db: Session = Depends(get_db),
    current_instructor: Optional[dict] = Depends(get_current_instructor)
):
    if not current_instructor:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated as instructor")
    
    records = crud_attendance.get_attendance_by_date(db, offering_id, date_val)
    return [AttendanceResponse.from_orm(record) for record in records]

@router.get("/offering/{offering_id}/date-range/", response_model=List[AttendanceResponse])
def get_attendance_by_date_range_api(
    offering_id: int,
    start_date: date,
    end_date: date,
    db: Session = Depends(get_db),
    current_instructor: Optional[dict] = Depends(get_current_instructor)
):
    if not current_instructor:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated as instructor")
    
    records = crud_attendance.get_attendance_by_date_range(db, offering_id, start_date, end_date)
    return [AttendanceResponse.from_orm(record) for record in records]

@router.get("/student/{student_id}", response_model=List[AttendanceResponse])
def get_student_attendance_api(
    student_id: str,
    offering_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_instructor: Optional[dict] = Depends(get_current_instructor)
):
    if not current_instructor:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated as instructor")
    
    records = crud_attendance.get_attendance_by_student(db, student_id, offering_id)
    return [AttendanceResponse.from_orm(record) for record in records]

@router.get("/offering/{offering_id}/students", response_model=List[StudentResponse])
def get_students_in_offering(
    offering_id: int,
    db: Session = Depends(get_db),
    current_instructor: Optional[dict] = Depends(get_current_instructor)
):
    if not current_instructor:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated as instructor")
    
    students = crud_student.get_students_by_offering_id(db, offering_id)
    if not students:
        return []
    return [StudentResponse.from_orm(student) for student in students]

@router.post("", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
def add_attendance_record_api(
    attendance: AttendanceCreate,
    db: Session = Depends(get_db),
    current_instructor: Optional[dict] = Depends(get_current_instructor)
):
    if not current_instructor:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated as instructor")
    
    db_attendance = crud_attendance.create_attendance_record(db, attendance)
    return AttendanceResponse.from_orm(db_attendance)

@router.put("/{record_id}", response_model=AttendanceResponse)
def update_attendance_record_api(
    record_id: int,
    attendance: AttendanceUpdate,
    db: Session = Depends(get_db),
    current_instructor: Optional[dict] = Depends(get_current_instructor)
):
    if not current_instructor:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated as instructor")
    
    updated_attendance = crud_attendance.update_attendance_record(db, record_id, attendance)
    if not updated_attendance:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attendance record not found")
    return AttendanceResponse.from_orm(updated_attendance)

@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_attendance_record_api(
    record_id: int,
    db: Session = Depends(get_db),
    current_instructor: Optional[dict] = Depends(get_current_instructor)
):
    if not current_instructor:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated as instructor")
    
    result = crud_attendance.delete_attendance_record(db, record_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attendance record not found")
