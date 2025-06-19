from sqlalchemy.orm import Session
from typing import Optional
from models.admin.student import Student
from models.admin.course_offerings import CourseOffering
from models.admin.student_enrollment import StudentCourseEnrollment
from models.instructor.exam_records import ExamRecord
from models.instructor.attendance_records import Attendance
from datetime import datetime, timedelta
from models.admin.section import Section
from models.admin.course import Course
from sqlalchemy.orm import joinedload

# Exam Report Stats

def get_exam_report_stats(db: Session, department: Optional[str], semester: Optional[str], course: Optional[str], exam_type: Optional[str]):
    # Filter students by department/semester (join with Section for semester)
    query = db.query(Student)
    if department:
        query = query.filter(Student.program == department)
    if semester:
        query = query.join(Section, Student.section == Section.section_name).filter(Section.semester == semester)
    students = query.all()
    student_ids = [s.student_id for s in students]

    # Filter enrollments by offering_id (course param is now offering_id)
    enrollments = db.query(StudentCourseEnrollment)
    if course:
        enrollments = enrollments.filter(StudentCourseEnrollment.offering_id == course)
    enrollments = enrollments.filter(StudentCourseEnrollment.student_id.in_(student_ids)).all()
    enrolled_student_ids = [e.student_id for e in enrollments]

    # Filter exam records for those students and offering
    exam_query = db.query(ExamRecord).filter(ExamRecord.student_id.in_(enrolled_student_ids))
    if course:
        exam_query = exam_query.filter(ExamRecord.offering_id == course)
    if exam_type:
        exam_query = exam_query.filter(ExamRecord.exam_type == exam_type)
    exams = exam_query.all()

    total_students = len(set(enrolled_student_ids))
    passed_students = sum(1 for e in exams if (e.remarks or '').lower() == 'pass')
    failed_students = sum(1 for e in exams if (e.remarks or '').lower() == 'fail')
    absent_students = sum(1 for e in exams if (e.remarks or '').lower() == 'absent')

    return {
        'total_students': total_students,
        'passed_students': passed_students,
        'failed_students': failed_students,
        'absent_students': absent_students,
    }

# Attendance Report Stats

def get_attendance_report_stats(db: Session, department: Optional[str], semester: Optional[str], course: Optional[str], from_date: Optional[str], to_date: Optional[str]):
    # Filter students by department/semester (join with Section for semester)
    query = db.query(Student)
    if department:
        query = query.filter(Student.program == department)
    if semester:
        query = query.join(Section, Student.section == Section.section_name).filter(Section.semester == semester)
    students = query.all()
    student_ids = [s.student_id for s in students]

    # Filter enrollments by offering_id (course param is now offering_id)
    enrollments = db.query(StudentCourseEnrollment)
    if course:
        enrollments = enrollments.filter(StudentCourseEnrollment.offering_id == course)
    enrollments = enrollments.filter(StudentCourseEnrollment.student_id.in_(student_ids)).all()
    enrolled_student_ids = [e.student_id for e in enrollments]

    # Filter attendance records
    attendance_query = db.query(Attendance).filter(Attendance.student_id.in_(enrolled_student_ids))
    if from_date:
        attendance_query = attendance_query.filter(Attendance.attendance_date >= from_date)
    if to_date:
        attendance_query = attendance_query.filter(Attendance.attendance_date <= to_date)
    records = attendance_query.all()

    total_students = len(set(enrolled_student_ids))
    present = sum(1 for r in records if (getattr(r.status, 'value', r.status).lower() == 'present'))
    absent = sum(1 for r in records if (getattr(r.status, 'value', r.status).lower() == 'absent'))
    leave = sum(1 for r in records if (getattr(r.status, 'value', r.status).lower() == 'leave'))

    return {
        'total_students': total_students,
        'present': present,
        'absent': absent,
        'leave': leave,
    }

def get_exam_report_detailed_rows(db: Session, department: Optional[str], semester: Optional[str], course: Optional[str], exam_type: Optional[str]):
    # Get course info
    course_offering = db.query(CourseOffering).filter(CourseOffering.offering_id == course).first() if course else None
    course_id = course_offering.course_id if course_offering else ''
    course_name = course_offering.course_rel.course_name if course_offering and course_offering.course_rel else ''

    # Filter students by department/semester (join with Section for semester)
    query = db.query(Student)
    if department:
        query = query.filter(Student.program == department)
    if semester:
        query = query.join(Section, Student.section == Section.section_name).filter(Section.semester == semester)
    students = query.all()
    student_ids = [s.student_id for s in students]

    # Filter enrollments by offering_id
    enrollments = db.query(StudentCourseEnrollment)
    if course:
        enrollments = enrollments.filter(StudentCourseEnrollment.offering_id == course)
    enrollments = enrollments.filter(StudentCourseEnrollment.student_id.in_(student_ids)).all()
    enrolled_student_ids = [e.student_id for e in enrollments]

    # Get exam records for those students and offering
    exam_query = db.query(ExamRecord).filter(ExamRecord.student_id.in_(enrolled_student_ids))
    if course:
        exam_query = exam_query.filter(ExamRecord.offering_id == course)
    if exam_type:
        exam_query = exam_query.filter(ExamRecord.exam_type == exam_type)
    exams = exam_query.all()
    exam_map = {(e.student_id): e for e in exams}

    rows = []
    for s in students:
        if s.student_id not in enrolled_student_ids:
            continue
        exam = exam_map.get(s.student_id)
        status = (exam.remarks or '').capitalize() if exam and exam.remarks else 'N/A'
        rows.append({
            'Student Name': f"{s.first_name} {s.last_name}",
            'Student ID': s.student_id,
            'Status': status,
            'Course Name': course_name,
            'Course ID': course_id,
            'Department': department,
            'Semester': semester,
            'Exam Type': exam_type
        })
    return rows

def get_attendance_report_detailed_rows(db: Session, department: Optional[str], semester: Optional[str], course: Optional[str], from_date: Optional[str], to_date: Optional[str]):
    # Get course info with eager loading
    course_offering = (
        db.query(CourseOffering)
        .options(joinedload(CourseOffering.course_rel))
        .filter(CourseOffering.offering_id == course)
        .first()
    ) if course else None
    course_id = course_offering.course_id if course_offering else ''
    course_name = course_offering.course_rel.course_name if course_offering and course_offering.course_rel else ''

    # Filter students by department/semester (join with Section for semester)
    query = db.query(Student)
    if department:
        query = query.filter(Student.program == department)
    if semester:
        query = query.join(Section, Student.section == Section.section_name).filter(Section.semester == semester)
    students = query.all()
    student_ids = [s.student_id for s in students]

    # Filter enrollments by offering_id
    enrollments = db.query(StudentCourseEnrollment)
    if course:
        enrollments = enrollments.filter(StudentCourseEnrollment.offering_id == course)
    enrollments = enrollments.filter(StudentCourseEnrollment.student_id.in_(student_ids)).all()
    enrolled_student_ids = [e.student_id for e in enrollments]

    # Get attendance records for those students and offering
    attendance_query = db.query(Attendance).filter(Attendance.student_id.in_(enrolled_student_ids))
    if course:
        attendance_query = attendance_query.filter(Attendance.offering_id == course)
    if from_date:
        attendance_query = attendance_query.filter(Attendance.attendance_date >= from_date)
    if to_date:
        attendance_query = attendance_query.filter(Attendance.attendance_date <= to_date)
    records = attendance_query.all()

    # Build a map: (student_id, date) -> status
    att_map = {}
    for r in records:
        att_map[(r.student_id, r.attendance_date)] = getattr(r.status, 'value', r.status)

    # Build date range columns
    if from_date and to_date:
        start = datetime.strptime(from_date, '%Y-%m-%d').date()
        end = datetime.strptime(to_date, '%Y-%m-%d').date()
        date_list = [(start + timedelta(days=x)) for x in range((end - start).days + 1)]
    else:
        date_list = sorted(list(set(r.attendance_date for r in records)))

    rows = []
    for s in students:
        if s.student_id not in enrolled_student_ids:
            continue
        row = {
            'Student Name': f"{s.first_name} {s.last_name}",
            'Student ID': s.student_id,
            'Course Name': course_name,
            'Course ID': course_id,
            'Department': department,
            'Semester': semester,
        }
        for d in date_list:
            row[d.strftime('%Y-%m-%d')] = att_map.get((s.student_id, d), '')
        rows.append(row)
    return rows 