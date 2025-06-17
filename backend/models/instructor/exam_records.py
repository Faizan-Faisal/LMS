import enum
from sqlalchemy import Column, Integer, String, Float, ForeignKey, Enum, DateTime
from sqlalchemy.orm import relationship
from database import Base
import enum
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ExamTypeEnum(enum.Enum):
    midterm = "midterm"
    final = "final"
    quiz = "quiz"
    assignment = "assignment"


class ExamRecord(Base):
    __tablename__ = "exam_records"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    offering_id = Column(Integer, ForeignKey("course_offerings.offering_id"))
    student_id = Column(String(50), ForeignKey("students.student_id"))
    exam_type = Column(Enum(ExamTypeEnum))
    obtained_marks = Column(Float)
    total_marks = Column(Float)
    exam_date = Column(DateTime)
    remarks = Column(String(500), nullable=True)

    # Relationships
    offering = relationship("CourseOffering", back_populates="exam_records")
    student = relationship("Student", back_populates="exam_records")

    def to_dict(self):
        return {
            "id": self.id,
            "offering_id": self.offering_id,
            "student_id": self.student_id,
            "exam_type": self.exam_type.value if self.exam_type else None,
            "obtained_marks": self.obtained_marks,
            "total_marks": self.total_marks,
            "exam_date": self.exam_date.isoformat() if self.exam_date else None,
            "remarks": self.remarks
        }

# Pydantic Models
class ExamRecordBase(BaseModel):
    offering_id: int
    student_id: str
    exam_type: ExamTypeEnum
    obtained_marks: float
    total_marks: float
    exam_date: datetime
    remarks: Optional[str] = None

class ExamRecordCreate(ExamRecordBase):
    pass

class ExamRecordUpdate(BaseModel):
    obtained_marks: Optional[float] = None
    total_marks: Optional[float] = None
    exam_date: Optional[datetime] = None
    remarks: Optional[str] = None

class ExamRecordResponse(ExamRecordBase):
    id: int

    class Config:
        from_attributes = True
