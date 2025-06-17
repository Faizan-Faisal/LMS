from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from crud.student import attendance as crud_attendance
from database import get_db
from typing import List, Optional
from pydantic import BaseModel
from datetime import date

class AttendanceRecordResponse(BaseModel):
    attendance_id: int
    offering_id: int
    student_id: str
    attendance_date: date
    status: str

    class Config:
        from_attributes = True

router = APIRouter()

@router.get("/students/{student_id}/attendance", response_model=List[AttendanceRecordResponse])
def read_attendance_records(student_id: str, offering_id: Optional[int] = None, db: Session = Depends(get_db)):
    attendance_records = crud_attendance.get_attendance_records(db, student_id=student_id, offering_id=offering_id)
    return attendance_records 