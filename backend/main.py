from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import os


from routers.admin import instructor, student, course, department , section , pre_course, course_offerings
from routers.shared import announcements
from routers.instructor import instructor_auth_router # Import the new instructor_auth_router
from routers.student import student_auth_router # Import the new student_auth_router
from routers.admin import admin_auth_router # Import the new admin_auth_router
from routers.instructor import instructor_course_router # Import the new instructor course router

app = FastAPI(
    title="University LMS API",
    description="Learning Management System API",
    version="1.0.0"
)

# Ensure the upload directory exists
UPLOAD_DIR = "upload"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Mount the static files directory to serve uploaded images
app.mount("/upload", StaticFiles(directory=UPLOAD_DIR), name="upload")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
app.include_router(instructor_auth_router.router, prefix="/api/instructor", tags=["Instructor Auth"]) # Include the new instructor auth router
app.include_router(student.router, prefix="/api/students", tags=["Students"])
app.include_router(student_auth_router.router, prefix="/api/student", tags=["Student Auth"]) # Include the new student auth router
app.include_router(department.router, prefix="/api/departments", tags=["Departments"])
app.include_router(section.router, prefix="/api/sections", tags=["Sections"])
app.include_router(course.router, prefix="/api/courses", tags=["Courses"])
app.include_router(pre_course.router, prefix="/api/course_prerequisites", tags=["Course Prerequisites"])
app.include_router(course_offerings.router, prefix="/api/course_offerings", tags=["Course Offerings"])
app.include_router(announcements.router, prefix="/api/announcements", tags=["Announcements"]) # Include the new announcements router
app.include_router(admin_auth_router.router) # Include the new admin auth router
app.include_router(instructor_course_router.router, prefix="/api", tags=["Instructor Courses"]) # Include the new instructor course router

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
