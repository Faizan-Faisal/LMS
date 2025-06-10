from fastapi import APIRouter, Depends, HTTPException, Form, status
from sqlalchemy.orm import Session
from database import get_db
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date, datetime

from crud import announcements as crud_announcement
from models.announcements import Announcement as AnnouncementModel # Alias to avoid name conflict

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

class AnnouncementCreate(AnnouncementBase):
    pass

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
@router.post("/", response_model=AnnouncementRead, status_code=status.HTTP_201_CREATED)
def create_announcement_endpoint(
    title: str = Form(...),
    message: str = Form(...),
    recipient_type: str = Form(...),
    recipient_ids: Optional[str] = Form(None),
    department_name: Optional[str] = Form(None), # Add department_id Form parameter
    priority: str = Form('Normal'),
    valid_until: Optional[date] = Form(None),
    db: Session = Depends(get_db)
):
    announcement = crud_announcement.create_announcement(
        db=db,
        title=title,
        message=message,
        recipient_type=recipient_type,
        recipient_ids=recipient_ids,
        department_name=department_name, # Pass department_id to CRUD function
        priority=priority,
        valid_until=valid_until.isoformat() if valid_until else None # Convert date to string for CRUD
    )
    return announcement

# GET All Announcements
@router.get("/", response_model=List[AnnouncementRead])
def get_all_announcements_endpoint(db: Session = Depends(get_db)):
    announcements = crud_announcement.get_all_announcements(db)
    return announcements

# GET Announcement by ID
@router.get("/{announcement_id}", response_model=AnnouncementRead)
def get_announcement_by_id_endpoint(announcement_id: int, db: Session = Depends(get_db)):
    announcement = crud_announcement.get_announcement_by_id(db, announcement_id)
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return announcement

# UPDATE Announcement
@router.put("/{announcement_id}", response_model=AnnouncementRead)
def update_announcement_endpoint(
    announcement_id: int,
    title: Optional[str] = Form(None),
    message: Optional[str] = Form(None),
    recipient_type: Optional[str] = Form(None),
    recipient_ids: Optional[str] = Form(None),
    department_name: Optional[str] = Form(None), # Add department_id Form parameter
    priority: Optional[str] = Form(None),
    valid_until: Optional[date] = Form(None),
    db: Session = Depends(get_db)
):
    # Convert valid_until date to string if present, before passing to crud
    update_data = {
        k: v.isoformat() if isinstance(v, date) else v
        for k, v in locals().items() # Gather all arguments passed to function
        if k in ["title", "message", "recipient_type", "recipient_ids", "priority", "valid_until", "department_name"] and v is not None
    }
    
    # Ensure we pass None if the field is explicitly set to None for update
    if "valid_until" in locals() and locals()["valid_until"] is None: # Check if valid_until was explicitly passed as None
        update_data["valid_until"] = None
    # Handle department_id explicitly for null updates if it was passed
    if "department_name" in locals() and locals()["department_name"] is None: # Check if department_id was explicitly passed as None
        update_data["department_name"] = None

    announcement = crud_announcement.update_announcement(
        db=db,
        announcement_id=announcement_id,
        **update_data
    )
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return announcement

# DELETE Announcement
@router.delete("/{announcement_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_announcement_endpoint(announcement_id: int, db: Session = Depends(get_db)):
    deleted = crud_announcement.delete_announcement(db, announcement_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return {"message": "Announcement deleted successfully"}

# SEARCH Announcements
@router.get("/search/", response_model=List[AnnouncementRead])
def search_announcements_endpoint(keyword: str, db: Session = Depends(get_db)):
    announcements = crud_announcement.search_announcements(db, keyword)
    return announcements 