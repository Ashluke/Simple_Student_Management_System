from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from database.school_database import Base


# Database table
class Class(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    color = Column(String, default="#3b82f6")
    image = Column(String, nullable=True)


    # Relationships
    students = relationship(
        "Student",
        back_populates="class_",
        cascade="all, delete-orphan"
    )

    assessments = relationship(
        "Assessment",
        back_populates="class_",
        cascade="all, delete-orphan" 
    )

    config = relationship(
        "AssessmentConfig",
        back_populates="class_",
        cascade="all, delete-orphan"
    )