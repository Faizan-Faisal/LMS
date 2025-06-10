from sqlalchemy import Column, Integer, String, Text, DateTime, Date, Enum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime


from database import Base


class Announcement(Base):
    __tablename__ = "announcements"

    announcement_id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    # recipient_type can be 'all_students', 'all_instructors', 'specific_students', 'specific_instructors', 'department_instructors', or 'all'
    recipient_type = Column(String(50), nullable=False)

    # For specific recipients, store comma-separated IDs. Nullable if recipient_type is not specific
    recipient_ids = Column(Text, nullable=True)

    # department_id is nullable; only applicable if recipient_type is 'department_instructors'
    department_name = Column(Integer, ForeignKey('departments.department_name'), nullable=True)

    priority = Column(Enum('Normal', 'High', name='priority_enum'), default='Normal', nullable=False)

    valid_until = Column(Date, nullable=True) # Date until the announcement is valid

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    # Status can be derived based on valid_until, or explicitly stored if needed for more complex logic
    # For now, we will derive it on the frontend or implicitly handle it

    department = relationship('Department', back_populates='announcements')

    def __repr__(self):
        return f"<Announcement(title='{self.title}', recipient_type='{self.recipient_type}')>" 