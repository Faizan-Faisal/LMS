from pydantic import BaseModel
from typing import Optional

# Pydantic Models for Instructor Course Offering

class CourseRead(BaseModel):
    course_id: str
    course_name: str
    course_description: Optional[str] = None
    course_credit_hours: int

    class Config:
        from_attributes = True

class SectionRead(BaseModel):
    section_name: str
    # Made optional as per previous discussions for instructor view
    program_id: Optional[str] = None
    shift: Optional[str] = None

    class Config:
        from_attributes = True

class CourseOfferingResponse(BaseModel):
    offering_id: int
    course_id: str
    section_name: str
    instructor_id: str
    capacity: int
    course_rel: Optional[CourseRead] = None
    section_rel: Optional[SectionRead] = None

    class Config:
        from_attributes = True 