from fastapi import APIRouter, HTTPException, Depends, status, Body
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from database import get_db
from models.instructor.exam_records import ExamRecord, ExamTypeEnum, ExamRecordCreate, ExamRecordUpdate, ExamRecordResponse
from crud.instructor import exam_records as crud
from routers.instructor.instructor_auth_router import get_current_instructor

router = APIRouter(prefix="/exam-records", tags=["Instructor Exam Records"])

# -------------------- EXAM RECORD ROUTES --------------------
@router.get("/offering/{offering_id}", response_model=List[ExamRecordResponse])
def get_exam_records_for_offering(
    offering_id: int,
    db: Session = Depends(get_db),
    current_instructor: Optional[dict] = Depends(get_current_instructor)
):
    if not current_instructor:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated as instructor")
    
    records = crud.get_exam_records(db, offering_id)
    return [ExamRecordResponse.from_orm(record) for record in records]

@router.get("/offering/{offering_id}/date/{date_val}", response_model=List[ExamRecordResponse])
def get_exam_by_specific_date(
    offering_id: int,
    date_val: datetime,
    db: Session = Depends(get_db),
    current_instructor: Optional[dict] = Depends(get_current_instructor)
):
    if not current_instructor:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated as instructor")
    
    records = crud.get_exam_by_date(db, offering_id, date_val)
    return [ExamRecordResponse.from_orm(record) for record in records]

@router.get("/offering/{offering_id}/date-range/", response_model=List[ExamRecordResponse])
def get_exam_by_date_range_api(
    offering_id: int,
    start_date: datetime,
    end_date: datetime,
    db: Session = Depends(get_db),
    current_instructor: Optional[dict] = Depends(get_current_instructor)
):
    if not current_instructor:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated as instructor")
    
    records = crud.get_exam_by_date_range(db, offering_id, start_date, end_date)
    return [ExamRecordResponse.from_orm(record) for record in records]

@router.post("", response_model=ExamRecordResponse, status_code=status.HTTP_201_CREATED)
def add_exam_record_api(
    exam_record: ExamRecordCreate,
    db: Session = Depends(get_db),
    current_instructor: Optional[dict] = Depends(get_current_instructor)
):
    if not current_instructor:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated as instructor")
    
    db_exam = crud.create_exam_record(db, exam_record)
    return ExamRecordResponse.from_orm(db_exam)

@router.put("/{record_id}", response_model=ExamRecordResponse)
def update_exam_record_api(
    record_id: int,
    exam_record: ExamRecordUpdate,
    db: Session = Depends(get_db),
    current_instructor: Optional[dict] = Depends(get_current_instructor)
):
    if not current_instructor:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated as instructor")
    
    updated_exam = crud.update_exam_record(db, record_id, exam_record)
    if not updated_exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam record not found")
    return ExamRecordResponse.from_orm(updated_exam)

@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_exam_record_api(
    record_id: int,
    db: Session = Depends(get_db),
    current_instructor: Optional[dict] = Depends(get_current_instructor)
):
    if not current_instructor:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated as instructor")
    
    result = crud.delete_exam_record(db, record_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam record not found")
    return

