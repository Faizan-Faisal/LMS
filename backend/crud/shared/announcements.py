from sqlalchemy.orm import Session, joinedload
from datetime import date
from models.shared.announcements import Announcement
from models.admin.department import Department  # Import Department model

# Helper to convert string date to date object
def _convert_date_string_to_date(date_str: str | None) -> date | None:
    if not date_str:
        return None
    try:
        return date.fromisoformat(date_str) # Assumes YYYY-MM-DD format
    except (ValueError, TypeError):
        return None # Handle invalid date string gracefully

# CREATE announcement
def create_announcement(
    db: Session,
    title: str,
    message: str,
    recipient_type: str,
    recipient_ids: str | None,
    priority: str,
    valid_until: str | None,
    department_name: str | None = None,
    sender_type: str = 'Admin',  # New: Default to Admin
    sender_id: str | None = None   # New: Optional sender_id
):
    print(f"[DEBUG] CRUD - create_announcement: received valid_until='{valid_until}', sender_type='{sender_type}', sender_id='{sender_id}'")
    try:
        valid_until_date = _convert_date_string_to_date(valid_until)
        print(f"[DEBUG] CRUD - Converted valid_until_date='{valid_until_date}'")
        announcement = Announcement(
            title=title,
            message=message,
            recipient_type=recipient_type,
            recipient_ids=recipient_ids,
            priority=priority,
            valid_until=valid_until_date,
            department_name=department_name,
            sender_type=sender_type,  # Assign sender_type
            sender_id=sender_id       # Assign sender_id
        )
        db.add(announcement)
        db.commit()
        db.refresh(announcement)
        print(f"[DEBUG] CRUD - Announcement added to DB with ID: {announcement.announcement_id}")
        return announcement
    except Exception as e:
        db.rollback()
        print(f"[DEBUG] CRUD - Error in create_announcement: {str(e)}")
        raise Exception(f"Error creating announcement: {str(e)}")

# GET all announcements
def get_all_announcements(db: Session):
    return db.query(Announcement).options(joinedload(Announcement.department)).all()

# GET announcement by ID
def get_announcement_by_id(db: Session, announcement_id: int):
    return db.query(Announcement).options(joinedload(Announcement.department)).filter(Announcement.announcement_id == announcement_id).first()

# UPDATE announcement
def update_announcement(
    db: Session,
    announcement_id: int,
    title: str | None = None,
    message: str | None = None,
    recipient_type: str | None = None,
    recipient_ids: str | None = None,
    priority: str | None = None,
    valid_until: str | None = None,
    department_name: str | None = None # Add department_id
):
    announcement = db.query(Announcement).filter(Announcement.announcement_id == announcement_id).first()
    if announcement:
        if title is not None: announcement.title = title
        if message is not None: announcement.message = message
        if recipient_type is not None: announcement.recipient_type = recipient_type
        if recipient_ids is not None: announcement.recipient_ids = recipient_ids
        if priority is not None: announcement.priority = priority
        if valid_until is not None: 
            announcement.valid_until = _convert_date_string_to_date(valid_until)
        if department_name is not None: announcement.department_name = department_name # Update department_id
        db.commit()
        db.refresh(announcement)
        return announcement
    return None

# DELETE announcement
def delete_announcement(db: Session, announcement_id: int):
    announcement = db.query(Announcement).filter(Announcement.announcement_id == announcement_id).first()
    if announcement:
        db.delete(announcement)
        db.commit()
        return True
    return False

# SEARCH announcements (example: by title or recipient_type)
def search_announcements(db: Session, keyword: str):
    return db.query(Announcement).options(joinedload(Announcement.department)).filter(
        (Announcement.title.ilike(f"%{keyword}%")) |
        (Announcement.message.ilike(f"%{keyword}%")) |
        (Announcement.recipient_type.ilike(f"%{keyword}%"))
    ).all() 