from pydantic import BaseModel
from typing import Optional

# Exam Report
class ExamReportFilter(BaseModel):
    department: Optional[str] = None
    semester: Optional[str] = None
    course: Optional[str] = None
    exam_type: Optional[str] = None

class ExamReportStats(BaseModel):
    total_students: int
    passed_students: int
    failed_students: int
    absent_students: int

# Attendance Report
class AttendanceReportFilter(BaseModel):
    department: Optional[str] = None
    semester: Optional[str] = None
    course: Optional[str] = None
    from_date: Optional[str] = None  # ISO date string
    to_date: Optional[str] = None

class AttendanceReportStats(BaseModel):
    total_students: int
    present: int
    absent: int
    leave: int 