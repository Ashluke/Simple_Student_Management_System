from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Assessment, Student, Class

from schemas import (
    AssessmentCreate,
    AssessmentUpdate,
    AssessmentResponse
)

from services import (
    build_assessment_payload,
    apply_assessment_update,
    format_assessment
)

router = APIRouter(prefix="/classes/{class_id}/assessments", tags=["Assessments"])


# Get by class
@router.get("/", response_model=list[AssessmentResponse])
def get_assessments(class_id: int, db: Session = Depends(get_db)):

    assessments = db.query(Assessment).filter(
        Assessment.class_id == class_id
    ).all()

    return [format_assessment(a) for a in assessments]


# Create assessment
@router.post("/", response_model=AssessmentResponse)
def create_assessment(data: AssessmentCreate, db: Session = Depends(get_db)):

    student = db.query(Student).filter(
        Student.id == data.student_id
    ).first()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )
    
    class_ = db.query(Class).filter(
        Class.id == data.class_id
    ).first()

    if not class_:
        raise HTTPException(
            status_code=404,
            detail="Class not found"
        )
    
    if student.class_id != data.class_id:
        raise HTTPException(
            status_code=400,
            detail="Student does not belong to this class"
        )

    payload = build_assessment_payload(data)

    new_assessment = Assessment(**payload)

    db.add(new_assessment)
    db.commit()
    db.refresh(new_assessment)

    return format_assessment(new_assessment)


# Update assessment
@router.put("/{assessment_id}", response_model=AssessmentResponse)
def update_assessment(assessment_id: int, data: AssessmentUpdate, db: Session = Depends(get_db)):

    assessment = db.query(Assessment).filter(
        Assessment.id == assessment_id
    ).first()

    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    assessment = apply_assessment_update(assessment, data)

    db.commit()
    db.refresh(assessment)

    return format_assessment(assessment)


# Delete assessment
@router.delete("/{assessment_id}")
def delete_assessment(assessment_id: int, db: Session = Depends(get_db)):

    assessment = db.query(Assessment).filter(
        Assessment.id == assessment_id
    ).first()

    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    db.delete(assessment)
    db.commit()

    return {"message": "deleted"}