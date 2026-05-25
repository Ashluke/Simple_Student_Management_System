from typing import List, Optional

from pydantic import BaseModel


# Requests and response
class StudentCreate(BaseModel):
    name: str
    class_id: int


class StudentUpdate(BaseModel):
    name: str
    class_id: int


class StudentResponse(BaseModel):
    id: int
    name: str
    class_id: int

    class Config:
        from_attributes = True