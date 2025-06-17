from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import date

from models.admin.student_enrollment import StudentCourseEnrollment, StudentCourseEnrollmentCreate, StudentCourseEnrollmentUpdate
from models.admin.course_offerings import CourseOffering
from models.admin.course import Course
from models.admin.instructor import Instructor

def create_student_enrollment(db: Session, enrollment: StudentCourseEnrollmentCreate) -> StudentCourseEnrollment:
    db_enrollment = StudentCourseEnrollment(
        student_id=enrollment.student_id,
        offering_id=enrollment.offering_id,
        enrollment_date=enrollment.enrollment_date or date.today(),
        grade=enrollment.grade
    )
    db.add(db_enrollment)
    db.commit()
    db.refresh(db_enrollment)
    return db_enrollment

def bulk_create_student_enrollments(db: Session, offering_id: int, student_ids: List[str]) -> List[StudentCourseEnrollment]:
    new_enrollments = []
    for student_id in student_ids:
        enrollment = StudentCourseEnrollment(
            student_id=student_id,
            offering_id=offering_id,
            enrollment_date=date.today(),
            grade=None # Grade is initially null
        )
        db.add(enrollment)
        new_enrollments.append(enrollment)
    db.commit()
    for enrollment in new_enrollments:
        db.refresh(enrollment)
    return new_enrollments

def get_all_enrollments(db: Session) -> List[StudentCourseEnrollment]:
    return db.query(StudentCourseEnrollment).all()

def get_enrollment_by_id(db: Session, enrollment_id: int) -> Optional[StudentCourseEnrollment]:
    return db.query(StudentCourseEnrollment).filter(StudentCourseEnrollment.enrollment_id == enrollment_id).first()

def get_enrollments_by_student_id(db: Session, student_id: str) -> List[StudentCourseEnrollment]:
    return db.query(StudentCourseEnrollment)\
        .filter(StudentCourseEnrollment.student_id == student_id)\
        .options(\
            joinedload(StudentCourseEnrollment.offering_rel)
            .joinedload(CourseOffering.course_rel),
            joinedload(StudentCourseEnrollment.offering_rel)
            .joinedload(CourseOffering.instructor_rel)
        )\
        .all()

def get_enrollments_by_offering_id(db: Session, offering_id: int) -> List[StudentCourseEnrollment]:
    return db.query(StudentCourseEnrollment).filter(StudentCourseEnrollment.offering_id == offering_id).all()

def update_student_enrollment(db: Session, enrollment_id: int, enrollment_update: StudentCourseEnrollmentUpdate) -> Optional[StudentCourseEnrollment]:
    db_enrollment = db.query(StudentCourseEnrollment).filter(StudentCourseEnrollment.enrollment_id == enrollment_id).first()
    if db_enrollment:
        for key, value in enrollment_update.dict(exclude_unset=True).items():
            setattr(db_enrollment, key, value)
        db.commit()
        db.refresh(db_enrollment)
    return db_enrollment

def delete_student_enrollment(db: Session, enrollment_id: int) -> bool:
    db_enrollment = db.query(StudentCourseEnrollment).filter(StudentCourseEnrollment.enrollment_id == enrollment_id).first()
    if db_enrollment:
        db.delete(db_enrollment)
        db.commit()
        return True
    return False 