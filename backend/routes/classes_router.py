from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Class
from schemas import ClassCreate, ClassResponse, ClassUpdate


router = APIRouter(prefix="/classes", tags=["Classes"])


# Get all class
@router.get("/", response_model=list[ClassResponse])
def get_classes(db: Session = Depends(get_db)):
    classes = db.query(Class).all()

    return [
        {
            "id": c.id,
            "name": c.name,
            "color": c.color,
            "image": c.image,
        }
        for c in classes
    ]


# Get a class
@router.get("/{class_id}", response_model=ClassResponse)
def get_class(class_id: int, db: Session = Depends(get_db)):
    c = db.query(Class).filter(Class.id == class_id).first()

    if not c:
        raise HTTPException(status_code=404, detail="Class not found")

    return {
        "id": c.id,
        "name": c.name,
        "color": c.color,
        "image": c.image,
    }


# Create class
@router.post("/", response_model=ClassResponse)
def create_class(data: ClassCreate, db: Session = Depends(get_db)):
    new_class = Class(
        name=data.name,
        color=data.color,
        image=data.image,
    )

    db.add(new_class)
    db.commit()
    db.refresh(new_class)

    return {
        "id": new_class.id,
        "name": new_class.name,
        "color": new_class.color,
        "image": new_class.image,
    }


# Update class (not used yet)
@router.put("/{class_id}", response_model=ClassResponse)
def update_class(
    class_id: int,
    data: ClassUpdate,
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

    if data.name is not None:
        class_.name = data.name

    if data.color is not None:
        class_.color = data.color

    if data.image is not None:
        class_.image = data.image

    db.commit()
    db.refresh(class_)

    return class_


# Delete class
@router.delete("/{class_id}")
def delete_class(class_id: int, db: Session = Depends(get_db)):
    c = db.query(Class).filter(Class.id == class_id).first()

    if not c:
        raise HTTPException(status_code=404, detail="Class not found")

    db.delete(c)
    db.commit()

    return {"message": "deleted"}