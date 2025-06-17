from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from crud.student import exam_record as crud_exam_record
from database import get_db
from typing import List, Optional
from pydantic import BaseModel
from datetime import date

class ExamRecordResponse(BaseModel):
    id: int
    offering_id: int
    student_id: str
    exam_type: str
    total_marks: int
    obtained_marks: int
    exam_date: date
    remarks: Optional[str] = None

    class Config:
        from_attributes = True

router = APIRouter()

@router.get("/students/{student_id}/exam_records", response_model=List[ExamRecordResponse])
def read_exam_records(student_id: str, offering_id: Optional[int] = None, db: Session = Depends(get_db)):
    exam_records = crud_exam_record.get_exam_records(db, student_id=student_id, offering_id=offering_id)
    return exam_records 