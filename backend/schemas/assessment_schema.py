from typing import List, Literal, Optional, Union, Annotated
from pydantic import BaseModel, Field


# Types
ScoreValue = Annotated[float, Field(ge=0, le=100)]
GradeValue = Annotated[float, Field(ge=0, le=99)]

class ScoreData(BaseModel):
    type: Literal["score"]
    scores: List[Optional[ScoreValue]] = Field(default_factory=list)


class AttendanceData(BaseModel):
    type: Literal["attendance"]
    present: List[bool]


class ExamData(BaseModel):
    type: Literal["exam"]
    midtermScore: Optional[ScoreValue]
    endtermScore: Optional[ScoreValue]


class GradeData(BaseModel):
    type: Literal["grade"]
    midtermGrade: Optional[GradeValue]
    endtermGrade: Optional[GradeValue]
    finalGrade: Optional[GradeValue]
    gwa: Optional[GradeValue]

AssessmentData = Union[
    ScoreData,
    AttendanceData,
    ExamData,
    GradeData
]


# Requests and response
class AssessmentCreate(BaseModel):
    class_id: int
    student_id: int
    data: AssessmentData

class AssessmentUpdate(BaseModel):
    data: AssessmentData

class AssessmentResponse(BaseModel):
    id: int
    class_id: int
    student_id: int
    type: str
    data: dict

    class Config:
        from_attributes = True