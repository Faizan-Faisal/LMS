from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import os

from routers import instructor, student, course  # Add these as you create them

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
# app.include_router(student.router, prefix="/api/students", tags=["Students"])
# app.include_router(course.router, prefix="/api/courses", tags=["Courses"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
