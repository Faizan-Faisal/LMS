# crud/attendance.py
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from models.instructor.attendance_records import Attendance, AttendanceStatusEnum, AttendanceCreate, AttendanceUpdate

def get_attendance_records(db: Session, offering_id: int) -> List[Attendance]:
    records = db.query(Attendance).filter(Attendance.offering_id == offering_id).all()
    return records

def get_attendance_by_date(db: Session, offering_id: int, date_val: date) -> List[Attendance]:
    records = db.query(Attendance).filter(
        Attendance.offering_id == offering_id,
        Attendance.attendance_date == date_val
    ).all()
    return records

def get_attendance_by_date_range(
    db: Session, 
    offering_id: int, 
    start_date: date, 
    end_date: date
) -> List[Attendance]:
    records = db.query(Attendance).filter(
        Attendance.offering_id == offering_id,
        Attendance.attendance_date >= start_date,
        Attendance.attendance_date <= end_date
    ).all()
    return records

def create_attendance_record(db: Session, attendance: AttendanceCreate) -> Attendance:
    db_attendance = Attendance(
        offering_id=attendance.offering_id,
        student_id=attendance.student_id,
        attendance_date=attendance.attendance_date,
        status=attendance.status
    )
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance

def update_attendance_record(db: Session, record_id: int, attendance: AttendanceUpdate) -> Optional[Attendance]:
    db_attendance = db.query(Attendance).filter(Attendance.attendance_id == record_id).first()
    if not db_attendance:
        return None
    
    if attendance.status is not None:
        db_attendance.status = attendance.status
    
    db.commit()
    db.refresh(db_attendance)
    return db_attendance

def delete_attendance_record(db: Session, record_id: int) -> Optional[Attendance]:
    db_attendance = db.query(Attendance).filter(Attendance.attendance_id == record_id).first()
    if not db_attendance:
        return None
    
    db.delete(db_attendance)
    db.commit()
    return db_attendance