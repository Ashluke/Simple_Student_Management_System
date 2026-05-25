from sqlalchemy import Column, ForeignKey, Integer, String, JSON, UniqueConstraint
from sqlalchemy.orm import relationship

from database.school_database import Base


# Database table
class Assessment(Base):
    __tablename__ = "assessments"

    __table_args__ = (
        UniqueConstraint(
            "student_id",
            "class_id",
            "type",
            name="uq_student_assessment_type"
        ),
    )

    id = Column(Integer, primary_key=True, index=True)

    class_id = Column(
        Integer,
        ForeignKey("classes.id", ondelete="CASCADE"),
        index=True,
        nullable=False
    )

    student_id = Column(
        Integer,
        ForeignKey("students.id", ondelete="CASCADE"),
        index=True,
        nullable=False
    )

    type = Column(String, nullable=False)  # score | attendance | exam | grade
    data = Column(JSON, nullable=False, default="{}")


    # Relationships
    student = relationship(
        "Student", 
        back_populates="assessments"
    )
    
    class_ = relationship(
        "Class",
        back_populates="assessments"
    )