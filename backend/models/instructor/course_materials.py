from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint, Enum, Text, Date, DateTime
from sqlalchemy.orm import relationship
from database import Base
import enum

class CourseMaterial(Base):
    __tablename__ = "course_materials"
    __table_args__ = {'extend_existing': True}

    material_id = Column(Integer, primary_key=True, index=True)
    offering_id = Column(Integer, ForeignKey("course_offerings.offering_id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    file_path = Column(String(255), nullable=False)
    uploaded_at = Column(DateTime)

    offering = relationship("CourseOffering", back_populates="course_materials")

    __table_args__ = (
        UniqueConstraint('file_path', name='unique_file_path'),
    )

    def to_dict(self):
        return {
            "material_id": self.material_id,
            "offering_id": self.offering_id,
            "title": self.title,
            "description": self.description,
            "file_path": self.file_path,
            "uploaded_at": self.uploaded_at.isoformat() if self.uploaded_at else None
        }

