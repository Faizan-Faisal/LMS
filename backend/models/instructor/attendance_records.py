from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint, Enum, Text, Date, DateTime
from sqlalchemy.orm import relationship
from database import Base
import enum
from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

class AttendanceStatusEnum(enum.Enum):
    Present = "Present"
    Absent = "Absent"
    Leave = "Leave"

class Attendance(Base):
    __tablename__ = "attendance_records"

    attendance_id = Column(Integer, primary_key=True, autoincrement=True)
    offering_id = Column(Integer, ForeignKey("course_offerings.offering_id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    student_id = Column(String(20), ForeignKey("students.student_id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    attendance_date = Column(Date, nullable=False)
    status = Column(Enum(AttendanceStatusEnum), nullable=False)

    offering = relationship("CourseOffering", back_populates="attendances_records")
    student = relationship("Student", back_populates="attendances_records")

    __table_args__ = (
        UniqueConstraint('offering_id', 'student_id', 'attendance_date', name='unique_attendance_entry'),
    )

    def to_dict(self):
        return {
            "attendance_id": self.attendance_id,
            "offering_id": self.offering_id,
            "student_id": self.student_id,
            "attendance_date": self.attendance_date.isoformat(),
            "status": self.status.value
        }

# Pydantic Models
class AttendanceBase(BaseModel):
    offering_id: int
    student_id: str
    attendance_date: date
    status: AttendanceStatusEnum

class AttendanceCreate(AttendanceBase):
    pass

class AttendanceUpdate(BaseModel):
    status: AttendanceStatusEnum

class AttendanceResponse(AttendanceBase):
    attendance_id: int

    class Config:
        from_attributes = True
