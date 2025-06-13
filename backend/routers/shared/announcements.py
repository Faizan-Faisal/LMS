from fastapi import APIRouter, Depends, HTTPException, Form, status
from sqlalchemy.orm import Session
from database import get_db
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date, datetime

from crud.shared import announcements as crud_announcement
from models.shared.announcements import Announcement as AnnouncementModel, AnnouncementCreate, AnnouncementResponse
from routers.admin.admin_auth_router import get_current_admin # Import admin auth dependency
from routers.instructor.instructor_auth_router import get_current_instructor # Import instructor auth dependency

router = APIRouter(tags=["Announcements"])

# Pydantic Schemas for Department (minimal for embedding in AnnouncementRead)
class DepartmentRead(BaseModel):
    # department_id: int
    department_name: str

    class Config:
        orm_mode = True

# --- Pydantic Schemas for Announcements ---
class AnnouncementBase(BaseModel):
    title: str
    message: str
    recipient_type: str = Field(..., description="Can be 'all_students', 'all_instructors', 'specific_students', 'specific_instructors', 'department_instructors', or 'all'")
    recipient_ids: Optional[str] = Field(None, description="Comma-separated IDs if recipient_type is 'specific_students' or 'specific_instructors'")
    department_name: Optional[str] = Field(None, description="Department Name if recipient_type is 'department_instructors'")
    priority: str = Field('Normal', description="Can be 'Normal' or 'High'")
    valid_until: Optional[date]

class AnnouncementUpdate(BaseModel):
    title: Optional[str] = None
    message: Optional[str] = None
    recipient_type: Optional[str] = Field(None, description="Can be 'all_students', 'all_instructors', 'specific_students', 'specific_instructors', 'department_instructors', or 'all'")
    recipient_ids: Optional[str] = Field(None, description="Comma-separated IDs if recipient_type is 'specific_students' or 'specific_instructors'")
    department_name: Optional[str] = Field(None, description="Department Name if recipient_type is 'department_instructors'")
    priority: Optional[str] = Field(None, description="Can be 'Normal' or 'High'")
    valid_until: Optional[date] = None

class AnnouncementRead(AnnouncementBase):
    announcement_id: int
    created_at: datetime
    department: Optional[DepartmentRead] = None # Include department details

    class Config:
        orm_mode = True

# --- API Endpoints ---

# CREATE Announcement
@router.post("/", response_model=AnnouncementResponse, status_code=status.HTTP_201_CREATED)
def create_announcement_endpoint(
    announcement: AnnouncementCreate,
    db: Session = Depends(get_db),
    admin: Optional[dict] = Depends(get_current_admin),
    instructor: Optional[dict] = Depends(get_current_instructor)
):
    print(f"[DEBUG] create_announcement_endpoint: admin={admin}, instructor={instructor}")
    try:
        # Check authentication
        if not admin and not instructor:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated as Admin or Instructor"
            )

        # Determine sender type and ID
        sender_id = None
        sender_type = None

        if admin:
            sender_type = 'Admin'
            print(f"[DEBUG] Admin detected: sender_type={sender_type}")
        elif instructor:
            sender_id = instructor.get("instructor_id")
            sender_type = 'Instructor'
            print(f"[DEBUG] Instructor detected: sender_type={sender_type}, sender_id={sender_id}")

        if not sender_type:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication. Neither Admin nor Instructor token found."
            )

        if sender_type == 'Instructor' and not sender_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Instructor sender_id is required."
            )

        print(f"[DEBUG] Final sender_type={sender_type}, sender_id={sender_id}")
        print(f"[DEBUG] Received valid_until from frontend: {announcement.valid_until}, type: {type(announcement.valid_until)}")

        # Convert valid_until date to string if present, before passing to crud
        valid_until_str = announcement.valid_until

        try:
            created_announcement = crud_announcement.create_announcement(
                db=db,
                title=announcement.title,
                message=announcement.message,
                recipient_type=announcement.recipient_type,
                recipient_ids=announcement.recipient_ids,
                department_name=announcement.department_name,
                priority=announcement.priority,
                valid_until=valid_until_str,
                sender_type=sender_type,
                sender_id=sender_id
            )
            print(f"[DEBUG] Announcement created: {created_announcement.announcement_id}")
            return created_announcement
        except Exception as e:
            print(f"Database error in router: {str(e)}")  # Add debug logging
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Database error: {str(e)}"
            )
    except HTTPException:
        raise
    except Exception as e:
        print(f"General error in router: {str(e)}")  # Add debug logging
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create announcement: {str(e)}"
        )

# GET All Announcements
@router.get("/", response_model=List[AnnouncementResponse])
def get_all_announcements_endpoint(db: Session = Depends(get_db)):
    announcements = crud_announcement.get_all_announcements(db)
    return announcements

# GET Announcement by ID
@router.get("/{announcement_id}", response_model=AnnouncementResponse)
def get_announcement_by_id_endpoint(announcement_id: int, db: Session = Depends(get_db)):
    announcement = crud_announcement.get_announcement_by_id(db, announcement_id)
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return announcement

# UPDATE Announcement
@router.put("/{announcement_id}", response_model=AnnouncementResponse)
def update_announcement_endpoint(
    announcement_id: int,
    announcement: AnnouncementCreate,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    # Convert valid_until date to string if present, before passing to crud
    valid_until_str = announcement.valid_until.isoformat() if announcement.valid_until else None

    updated_announcement = crud_announcement.update_announcement(
        db=db,
        announcement_id=announcement_id,
        title=announcement.title,
        message=announcement.message,
        recipient_type=announcement.recipient_type,
        recipient_ids=announcement.recipient_ids,
        department_name=announcement.department_name,
        priority=announcement.priority,
        valid_until=valid_until_str
    )
    if not updated_announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return updated_announcement

# DELETE Announcement
@router.delete("/{announcement_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_announcement_endpoint(announcement_id: int, db: Session = Depends(get_db), admin: dict = Depends(get_current_admin)):
    deleted = crud_announcement.delete_announcement(db, announcement_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return {"message": "Announcement deleted successfully"}

# SEARCH Announcements
@router.get("/search/", response_model=List[AnnouncementResponse])
def search_announcements_endpoint(keyword: str, db: Session = Depends(get_db)):
    announcements = crud_announcement.search_announcements(db, keyword)
    return announcements 