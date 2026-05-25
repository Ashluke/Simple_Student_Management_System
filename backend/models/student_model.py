from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from database.school_database import Base


# Database table
class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    class_id = Column(Integer, ForeignKey("classes.id", ondelete="CASCADE"), nullable=False)


    # Relationships
    class_ = relationship(
        "Class", 
        back_populates="students"
    )

    assessments = relationship(
        "Assessment",
        back_populates="student",
        cascade="all, delete-orphan"
    )