from typing import Optional

from pydantic import BaseModel


# Requests and response
class ClassCreate(BaseModel):
    name: str
    color: Optional[str] = "#3b82f6"
    image: Optional[str] = None

class ClassResponse(BaseModel):
    id: int
    name: str
    color: str
    image: Optional[str]

    class Config:
        from_attributes = True

class ClassUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None
    image: Optional[str] = None