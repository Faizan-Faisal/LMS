from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from typing import Optional
from crud.admin import report as crud_report
from models.admin.report import ExamReportStats, AttendanceReportStats
from database import get_db
import io
import pandas as pd

router = APIRouter(prefix="/reports", tags=["Admin Reports"])

@router.get("/exam", response_model=ExamReportStats)
def get_exam_report(
    department: Optional[str] = Query(None),
    semester: Optional[str] = Query(None),
    course: Optional[str] = Query(None),
    exam_type: Optional[str] = Query(None),
    export: Optional[bool] = Query(False),
    db: Session = Depends(get_db)
):
    stats = crud_report.get_exam_report_stats(db, department, semester, course, exam_type)
    if export:
        # Detailed export
        detailed_rows = crud_report.get_exam_report_detailed_rows(db, department, semester, course, exam_type)
        df = pd.DataFrame(detailed_rows)
        # Add filter info as a header row
        filter_info = {
            'Department': department,
            'Semester': semester,
            'Course ID': detailed_rows[0]['Course ID'] if detailed_rows else course,
            'Course Name': detailed_rows[0]['Course Name'] if detailed_rows else '',
            'Exam Type': exam_type
        }
        # Insert filter info as the first row (optional)
        df_filters = pd.DataFrame([filter_info])
        df = pd.concat([df_filters, df], ignore_index=True)
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
            df.to_excel(writer, index=False, sheet_name='Exam Report')
        output.seek(0)
        headers = {'Content-Disposition': 'attachment; filename=exam_report.xlsx'}
        return Response(content=output.read(), media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', headers=headers)
    return stats

@router.get("/attendance", response_model=AttendanceReportStats)
def get_attendance_report(
    department: Optional[str] = Query(None),
    semester: Optional[str] = Query(None),
    course: Optional[str] = Query(None),
    from_date: Optional[str] = Query(None),
    to_date: Optional[str] = Query(None),
    export: Optional[bool] = Query(False),
    db: Session = Depends(get_db)
):
    stats = crud_report.get_attendance_report_stats(db, department, semester, course, from_date, to_date)
    if export:
        detailed_rows = crud_report.get_attendance_report_detailed_rows(db, department, semester, course, from_date, to_date)
        df = pd.DataFrame(detailed_rows)
        # Build filter row with all columns from df
        filter_info = {col: '' for col in df.columns}
        filter_info.update({
            'Department': department,
            'Semester': semester,
            'Course ID': detailed_rows[0]['Course ID'] if detailed_rows and 'Course ID' in detailed_rows[0] else course,
            'Course Name': detailed_rows[0]['Course Name'] if detailed_rows and 'Course Name' in detailed_rows[0] else '',
            'From Date': from_date,
            'To Date': to_date
        })
        df_filters = pd.DataFrame([filter_info])
        df = pd.concat([df_filters, df], ignore_index=True)
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
            df.to_excel(writer, index=False, sheet_name='Attendance Report')
        output.seek(0)
        headers = {'Content-Disposition': 'attachment; filename=attendance_report.xlsx'}
        return Response(content=output.read(), media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', headers=headers)
    return stats 