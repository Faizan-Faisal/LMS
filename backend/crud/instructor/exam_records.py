# crud/exam_records.py
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from models.instructor.exam_records import ExamRecord, ExamTypeEnum, ExamRecordCreate, ExamRecordUpdate

def get_exam_records(db: Session, offering_id: int) -> List[ExamRecord]:
    records = db.query(ExamRecord).filter(ExamRecord.offering_id == offering_id).all()
    return records

def get_exam_by_date(db: Session, offering_id: int, date_val: datetime) -> List[ExamRecord]:
    records = db.query(ExamRecord).filter(
        ExamRecord.offering_id == offering_id,
        ExamRecord.exam_date == date_val
    ).all()
    return records

def get_exam_by_date_range(
    db: Session, 
    offering_id: int, 
    start_date: datetime, 
    end_date: datetime
) -> List[ExamRecord]:
    records = db.query(ExamRecord).filter(
        ExamRecord.offering_id == offering_id,
        ExamRecord.exam_date >= start_date,
        ExamRecord.exam_date <= end_date
    ).all()
    return records

def create_exam_record(db: Session, exam_record: ExamRecordCreate) -> ExamRecord:
    db_exam = ExamRecord(
        offering_id=exam_record.offering_id,
        student_id=exam_record.student_id,
        exam_type=exam_record.exam_type,
        marks_obtained=exam_record.marks_obtained,
        total_marks=exam_record.total_marks,
        exam_date=exam_record.exam_date,
        remarks=exam_record.remarks
    )
    db.add(db_exam)
    db.commit()
    db.refresh(db_exam)
    return db_exam

def update_exam_record(db: Session, record_id: int, exam_record: ExamRecordUpdate) -> Optional[ExamRecord]:
    db_exam = db.query(ExamRecord).filter(ExamRecord.id == record_id).first()
    if not db_exam:
        return None
    
    if exam_record.marks_obtained is not None:
        db_exam.marks_obtained = exam_record.marks_obtained
    if exam_record.total_marks is not None:
        db_exam.total_marks = exam_record.total_marks
    if exam_record.exam_date is not None:
        db_exam.exam_date = exam_record.exam_date
    if exam_record.remarks is not None:
        db_exam.remarks = exam_record.remarks
    
    db.commit()
    db.refresh(db_exam)
    return db_exam

def delete_exam_record(db: Session, record_id: int) -> Optional[ExamRecord]:
    db_exam = db.query(ExamRecord).filter(ExamRecord.id == record_id).first()
    if not db_exam:
        return None
    
    db.delete(db_exam)
    db.commit()
    return db_exam
