from sqlalchemy import Column, ForeignKey, Integer, String, JSON, UniqueConstraint
from sqlalchemy.orm import relationship

from database.school_database import Base


# Database table
class AssessmentConfig(Base):
    __tablename__ = "assessment_configs"

    __table_args__ = (
        UniqueConstraint(
            "class_id",
            "type",
            name="uq_student_assessment_type"
        ),
    )

    id = Column(Integer, primary_key=True, index=True)

    class_id = Column(
        Integer,
        ForeignKey("classes.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    type = Column(String, nullable=False)

    data = Column(JSON, nullable=False, default={})


    # Relationships
    class_ = relationship(
        "Class",
        back_populates="config"
    )