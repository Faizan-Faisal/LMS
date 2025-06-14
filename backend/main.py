from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import RequestValidationError
import os
import logging

from routers.admin import instructor, student, course, department, section, pre_course, course_offerings, student_enrollment_router
from routers.shared import announcements
from routers.instructor import (
    instructor_auth_router,
    instructor_course_router,
    attendance_records,
    exam_records,
    course_materials
)
from routers.student import student_auth_router
from routers.admin import admin_auth_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="University LMS API",
    description="Learning Management System API",
    version="1.0.0",
    # docs_url="/api/docs",
    # redoc_url="/api/redoc",
    # openapi_url="/api/openapi.json"
)

# Ensure the upload directories exist
UPLOAD_DIR = "upload"
MATERIALS_DIR = os.path.join(UPLOAD_DIR, "materials")
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(MATERIALS_DIR, exist_ok=True)

# Mount the static files directories
app.mount("/upload", StaticFiles(directory=UPLOAD_DIR), name="upload")
app.mount("/upload/materials", StaticFiles(directory=MATERIALS_DIR), name="materials")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Error handling middleware
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(f"Validation error: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unexpected error: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred"}
    )

@app.get("/")
async def root():
    return {"message": "Welcome to University LMS API"}

@app.get("/health")
async def health_check():
    return JSONResponse(
        status_code=200,
        content={"status": "healthy", "message": "API is running"}
    )

# Include routers
app.include_router(instructor.router, prefix="/api/instructors", tags=["Instructors"])
app.include_router(instructor_auth_router.router, prefix="/api/instructor", tags=["Instructor Auth"])
app.include_router(student.router, prefix="/api/students", tags=["Students"])
app.include_router(student_auth_router.router, prefix="/api/student", tags=["Student Auth"])
app.include_router(department.router, prefix="/api/departments", tags=["Departments"])
app.include_router(section.router, prefix="/api/sections", tags=["Sections"])
app.include_router(course.router, prefix="/api/courses", tags=["Courses"])
app.include_router(pre_course.router, prefix="/api/course_prerequisites", tags=["Course Prerequisites"])
app.include_router(course_offerings.router, prefix="/api/course_offerings", tags=["Course Offerings"])
app.include_router(announcements.router, prefix="/api/announcements", tags=["Announcements"])
app.include_router(admin_auth_router.router, prefix="/api/admin", tags=["Admin Auth"])
app.include_router(instructor_course_router.router, prefix="/api/instructor", tags=["Instructor Courses"])
app.include_router(student_enrollment_router.router, prefix="/api", tags=["Student Enrollments"])

# Include instructor-specific routers under the instructor prefix
app.include_router(attendance_records.router, prefix="/api/instructor", tags=["Instructor Attendance"])
app.include_router(exam_records.router, prefix="/api/instructor", tags=["Instructor Exams"])
app.include_router(course_materials.router, prefix="/api/instructor", tags=["Instructor Materials"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
