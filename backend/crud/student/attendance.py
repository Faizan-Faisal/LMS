from sqlalchemy.orm import Session
from models.instructor.attendance_records import Attendance
from typing import Optional

def get_attendance_records(db: Session, student_id: str, offering_id: Optional[int] = None):
    query = db.query(Attendance).filter(Attendance.student_id == student_id)
    if offering_id:
        query = query.filter(Attendance.offering_id == offering_id)
    return query.all() 