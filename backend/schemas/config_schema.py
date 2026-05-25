from typing import List, Optional, Annotated
from pydantic import BaseModel, Field, ConfigDict

ScoreValue = Annotated[float, Field(ge=0, le=100)]


# Types
class ScoreConfig(BaseModel):
    type: str = "score"
    max_scores: List[Optional[ScoreValue]] = Field(default_factory=list)

class AttendanceConfig(BaseModel):
    type: str = "attendance"
    dates: List[str] = Field(default_factory=list)

class ExamConfig(BaseModel):
    type: str = "exam"
    maxMidtermScore: Optional[ScoreValue] = None
    maxEndtermScore: Optional[ScoreValue] = None

AssessmentConfigData = (
    ScoreConfig |
    AttendanceConfig |
    ExamConfig
)


# Requests and response
class AssessmentConfigCreate(BaseModel):
    class_id: int
    data: AssessmentConfigData

class AssessmentConfigUpdate(BaseModel):
    data: AssessmentConfigData

class AssessmentConfigResponse(BaseModel):
    id: int
    class_id: int
    data: dict

    model_config = ConfigDict(from_attributes=True)