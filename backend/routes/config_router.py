from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import AssessmentConfig, Class

from schemas import (
    AssessmentConfigCreate,
    AssessmentConfigUpdate,
    AssessmentConfigResponse
)

from services import format_config

router = APIRouter(
    prefix="/classes/{class_id}/configs",
    tags=["Assessment Configs"]
)

# For max scores and attendance dates different from assessment_router


# Get config by class
@router.get("/", response_model=list[AssessmentConfigResponse])
def get_configs(class_id: int, db: Session = Depends(get_db)):

    configs = db.query(AssessmentConfig).filter(
        AssessmentConfig.class_id == class_id
    ).all()

    return [format_config(c) for c in configs]


# Create config (upsert)
@router.post("/", response_model=AssessmentConfigResponse)
def create_config(
    class_id: int,
    data: AssessmentConfigCreate,
    db: Session = Depends(get_db)
):

    class_ = db.query(Class).filter(
        Class.id == class_id
    ).first()

    if not class_:
        raise HTTPException(
            status_code=404,
            detail="Class not found"
        )

    existing = db.query(AssessmentConfig).filter(
        AssessmentConfig.class_id == class_id,
        AssessmentConfig.type == data.data.type
    ).first()

    if existing:
        existing.data = data.data.dict()
        db.commit()
        db.refresh(existing)
        return format_config(existing)

    config = AssessmentConfig(
        class_id=class_id,
        type=data.data.type,
        data=data.data.dict()
    )

    db.add(config)
    db.commit()
    db.refresh(config)

    return format_config(config)


# Update config
@router.put("/{config_id}", response_model=AssessmentConfigResponse)
def update_config(
    class_id: int,
    config_id: int,
    data: AssessmentConfigUpdate,
    db: Session = Depends(get_db)
):

    config = db.query(AssessmentConfig).filter(
        AssessmentConfig.id == config_id,
        AssessmentConfig.class_id == class_id
    ).first()

    if not config:
        raise HTTPException(
            status_code=404,
            detail="Config not found"
        )

    config.data = data.data.dict()

    db.commit()
    db.refresh(config)

    return format_config(config)


# Delete
@router.delete("/{config_id}")
def delete_config(
    class_id: int,
    config_id: int,
    db: Session = Depends(get_db)
):

    config = db.query(AssessmentConfig).filter(
        AssessmentConfig.id == config_id,
        AssessmentConfig.class_id == class_id
    ).first()

    if not config:
        raise HTTPException(
            status_code=404,
            detail="Config not found"
        )

    db.delete(config)
    db.commit()

    return {"message": "deleted"}