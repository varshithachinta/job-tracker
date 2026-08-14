from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class ApplicationBase(BaseModel):
    company_name: str
    role_title: str
    job_link: Optional[str] = None
    status: str = "applied"
    applied_date: Optional[date] = None

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationUpdate(BaseModel):
    company_name: Optional[str] = None
    role_title: Optional[str] = None
    job_link: Optional[str] = None
    status: Optional[str] = None
    applied_date: Optional[date] = None

class ApplicationOut(ApplicationBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True