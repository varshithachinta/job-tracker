from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import engine, Base, get_db
from app import models, schemas

Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Job Tracker API is running"}

@app.get("/test-db")
def test_db():
    try:
        conn = engine.connect()
        conn.close()
        return {"status": "Database connected successfully"}
    except Exception as e:
        return {"status": "Database connection failed", "error": str(e)}


@app.post("/applications", response_model=schemas.ApplicationOut)
def create_application(application: schemas.ApplicationCreate, db: Session = Depends(get_db)):
    new_app = models.Application(**application.model_dump())
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    return new_app


@app.get("/applications", response_model=List[schemas.ApplicationOut])
def list_applications(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.Application)
    if status:
        query = query.filter(models.Application.status == status)
    return query.order_by(models.Application.created_at.desc()).all()


@app.get("/applications/{application_id}", response_model=schemas.ApplicationOut)
def get_application(application_id: int, db: Session = Depends(get_db)):
    app_obj = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found")
    return app_obj


@app.put("/applications/{application_id}", response_model=schemas.ApplicationOut)
def update_application(application_id: int, updates: schemas.ApplicationUpdate, db: Session = Depends(get_db)):
    app_obj = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found")

    for field, value in updates.model_dump(exclude_unset=True).items():
        setattr(app_obj, field, value)

    db.commit()
    db.refresh(app_obj)
    return app_obj


@app.delete("/applications/{application_id}")
def delete_application(application_id: int, db: Session = Depends(get_db)):
    app_obj = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found")

    db.delete(app_obj)
    db.commit()
    return {"message": "Application deleted successfully"}