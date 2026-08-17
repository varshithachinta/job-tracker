from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base, get_db
from app import models, schemas
from app import auth

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
def create_application(
    application: schemas.ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    new_app = models.Application(**application.model_dump(), user_id=current_user.id)
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    return new_app


@app.get("/applications", response_model=List[schemas.ApplicationOut])
def list_applications(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    query = db.query(models.Application).filter(models.Application.user_id == current_user.id)
    if status:
        query = query.filter(models.Application.status == status)
    return query.order_by(models.Application.created_at.desc()).all()


@app.get("/applications/{application_id}", response_model=schemas.ApplicationOut)
def get_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    app_obj = db.query(models.Application).filter(
        models.Application.id == application_id,
        models.Application.user_id == current_user.id,
    ).first()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found")
    return app_obj


@app.put("/applications/{application_id}", response_model=schemas.ApplicationOut)
def update_application(
    application_id: int,
    updates: schemas.ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    app_obj = db.query(models.Application).filter(
        models.Application.id == application_id,
        models.Application.user_id == current_user.id,
    ).first()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found")

    for field, value in updates.model_dump(exclude_unset=True).items():
        setattr(app_obj, field, value)

    db.commit()
    db.refresh(app_obj)
    return app_obj


@app.delete("/applications/{application_id}")
def delete_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    app_obj = db.query(models.Application).filter(
        models.Application.id == application_id,
        models.Application.user_id == current_user.id,
    ).first()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found")

    db.delete(app_obj)
    db.commit()
    return {"message": "Application deleted successfully"}

@app.post("/signup", response_model=schemas.UserOut)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = auth.hash_password(user.password)
    new_user = models.User(email=user.email, hashed_password=hashed_pw)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@app.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not db_user or not auth.verify_password(form_data.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    access_token = auth.create_access_token(data={"sub": db_user.email})
    return {"access_token": access_token, "token_type": "bearer"}