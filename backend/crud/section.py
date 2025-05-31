from sqlalchemy.orm import Session
from models.section import Section

# CREATE section
def create_section(db: Session, section_data: dict):
    section = Section(**section_data)
    db.add(section)
    db.commit()
    db.refresh(section)
    return section

# GET all sections
def get_sections(db: Session):
    return db.query(Section).all()

# SEARCH section by name 
def search_section(db: Session, keyword: str):
    return db.query(Section).filter(
        (Section.section_name.ilike(f"%{keyword}%")) 
    ).all()

def get_section_by_name(db: Session, section_name: str):
    return db.query(Section).filter(Section.section_name == section_name).first()


# UPDATE section
def update_section(db: Session, section_name: str, updated_data: dict):
    section = db.query(Section).filter(Section.section_name == section_name).first()
    if section:
        for key, value in updated_data.items():
            setattr(section, key, value)
        db.commit()
        db.refresh(section)
        return section
    return None

# DELETE section
def delete_section(db: Session, section_name: str):
    section = db.query(Section).filter(Section.section_name == section_name).first()
    if section:
        db.delete(section)
        db.commit()
        return True
    return False
