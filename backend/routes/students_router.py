from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Student, Class
from schemas import StudentCreate, StudentResponse, StudentUpdate


router = APIRouter(prefix="/classes/{class_id}/students", tags=["Students"])


# Get students by class
@router.get("/", response_model=list[StudentResponse])
def get_students(class_id: int | None = None, db: Session = Depends(get_db)):
    query = db.query(Student)

    if class_id is not None:
        query = query.filter(Student.class_id == class_id)

    students = query.all()

    return students


# Create student
@router.post("/", response_model=StudentResponse)
def create_student(data: StudentCreate, db: Session = Depends(get_db)):

    class_ = db.query(Class).filter(
        Class.id == data.class_id
    ).first()

    if not class_:
        raise HTTPException(
            status_code=404,
            detail="Class not found"
        )

    new_student = Student(
        name=data.name,
        class_id=data.class_id,
    )

    db.add(new_student)
    db.commit()
    db.refresh(new_student)

    return {
        "id": new_student.id,
        "name": new_student.name,
        "class_id": new_student.class_id,
    }


# Update student (not used yet)
@router.put("/{student_id}", response_model=StudentResponse)
def update_student(student_id: int, data: StudentUpdate, db: Session = Depends(get_db)):

    student = db.query(Student).filter(Student.id == student_id).first()

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    student.name = data.name
    student.class_id = data.class_id

    db.commit()
    db.refresh(student)

    return {
        "id": student.id,
        "name": student.name,
        "class_id": student.class_id
    }


# Delete student
@router.delete("/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    db.delete(student)
    db.commit()

    return {"message": "deleted"}