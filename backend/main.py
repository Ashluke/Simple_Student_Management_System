from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import uvicorn

from database import Base, engine
from models import Class, Student, Assessment, AssessmentConfig # Bugs for some reason if not here

from routes import (
    classes_router, 
    students_router, 
    assessments_router, 
    config_router
)


# Database init
@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


# App
app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # development only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Static files
app.mount("/static", StaticFiles(directory="frontend/public"), name="public")
app.mount("/src", StaticFiles(directory="frontend/src"), name="src")
app.mount("/dist", StaticFiles(directory="frontend/dist"), name="dist")


# Pages
@app.get("/")
def dashboard():
    return FileResponse("frontend/public/class.html")


@app.get("/student.html")
def student_page():
    return FileResponse("frontend/public/student.html")


# Routers
app.include_router(classes_router)
app.include_router(students_router)
app.include_router(assessments_router)
app.include_router(config_router)


# Main entry point
if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)