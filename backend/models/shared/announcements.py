from sqlalchemy import Column, Integer, String, Text, DateTime, Date, Enum, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, date
from pydantic import BaseModel, Field
from typing import Optional, List

from database import Base

# SQLAlchemy model
class Announcement(Base):
    __tablename__ = "announcements"

    announcement_id = Column(Integer, primary_key=True, index=True)
    
    # NEW sender fields
    sender_type = Column(String(50), nullable=False, default='Admin')
    sender_id = Column(String(20), nullable=True)  # Same type as instructor_id

    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    recipient_type = Column(String(50), nullable=False)
    recipient_ids = Column(Text, nullable=True)
    department_name = Column(String(255), ForeignKey('departments.department_name'), nullable=True)
    priority = Column(Enum('Normal', 'High', name='priority_enum'), default='Normal', nullable=False)
    valid_until = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    department = relationship('Department', back_populates='announcements')

    def __repr__(self):
        return f"<Announcement(title='{self.title}', sender='{self.sender_type}', recipient_type='{self.recipient_type}')>"


# Pydantic models
class AnnouncementBase(BaseModel):
    title: str = Field(..., max_length=255)
    message: str
    recipient_type: str = Field(..., max_length=50)
    recipient_ids: Optional[str] = None # Comma-separated IDs
    department_name: Optional[str] = None
    priority: str = Field('Normal', pattern="^(Normal|High)$")
    valid_until: Optional[date] = None

class AnnouncementCreate(AnnouncementBase):
    # sender_id is optional for admins, will be filled by instructor for instructors
    sender_id: Optional[str] = None
    sender_type: Optional[str] = 'Admin' # Default to Admin, can be overridden by instructor

class AnnouncementResponse(AnnouncementBase):
    announcement_id: int
    sender_type: str
    sender_id: Optional[str]
    created_at: datetime
    valid_until: Optional[date] = None

    class Config:
        from_attributes = True
