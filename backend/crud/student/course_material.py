from sqlalchemy.orm import Session
from models.instructor.course_materials import CourseMaterial
from models.admin.student_enrollment import StudentCourseEnrollment
from models.admin.course_offerings import CourseOffering
from typing import Optional

def get_course_materials(db: Session, student_id: str, offering_id: Optional[int] = None):
    query = db.query(CourseMaterial).join(
        CourseOffering, CourseMaterial.offering_id == CourseOffering.offering_id
    ).join(
        StudentCourseEnrollment, CourseOffering.offering_id == StudentCourseEnrollment.offering_id
    ).filter(
        StudentCourseEnrollment.student_id == student_id
    )
    if offering_id:
        query = query.filter(CourseMaterial.offering_id == offering_id)
    return query.all() 