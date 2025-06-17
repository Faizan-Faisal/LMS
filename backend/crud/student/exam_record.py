from sqlalchemy.orm import Session
from models.instructor.exam_records import ExamRecord
from typing import Optional

def get_exam_records(db: Session, student_id: str, offering_id: Optional[int] = None):
    query = db.query(ExamRecord).filter(ExamRecord.student_id == student_id)
    if offering_id:
        query = query.filter(ExamRecord.offering_id == offering_id)
    return query.all() 