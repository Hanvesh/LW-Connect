"""Pathway API endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.pathway import Pathway
from app.models.course import Course
from app.schemas.pathway import PathwayCreate, PathwayResponse, PathwayWithCourses
from typing import List

router = APIRouter(prefix="/pathways", tags=["pathways"])


@router.get("/", response_model=List[PathwayResponse])
async def list_pathways(db: Session = Depends(get_db)):
    """List all pathways."""
    return db.query(Pathway).all()


@router.post("/", response_model=PathwayResponse)
async def create_pathway(
    pathway: PathwayCreate,
    db: Session = Depends(get_db)
):
    """Create a new pathway."""
    db_pathway = Pathway(
        title=pathway.title,
        description=pathway.description,
        duration_weeks=pathway.duration_weeks,
        difficulty=pathway.difficulty
    )
    
    if pathway.course_ids:
        courses = db.query(Course).filter(Course.id.in_(pathway.course_ids)).all()
        db_pathway.courses = courses
    
    db.add(db_pathway)
    db.commit()
    db.refresh(db_pathway)
    return db_pathway


@router.get("/{pathway_id}", response_model=PathwayWithCourses)
async def get_pathway(pathway_id: int, db: Session = Depends(get_db)):
    """Get pathway details."""
    pathway = db.query(Pathway).filter(Pathway.id == pathway_id).first()
    if not pathway:
        raise HTTPException(status_code=404, detail="Pathway not found")
    
    return {
        **pathway.__dict__,
        "courses": [{"id": c.id, "title": c.title, "description": c.description} for c in pathway.courses]
    }


@router.put("/{pathway_id}", response_model=PathwayResponse)
async def update_pathway(
    pathway_id: int,
    pathway: PathwayCreate,
    db: Session = Depends(get_db)
):
    """Update pathway."""
    db_pathway = db.query(Pathway).filter(Pathway.id == pathway_id).first()
    if not db_pathway:
        raise HTTPException(status_code=404, detail="Pathway not found")
    
    db_pathway.title = pathway.title
    db_pathway.description = pathway.description
    db_pathway.duration_weeks = pathway.duration_weeks
    db_pathway.difficulty = pathway.difficulty
    
    if pathway.course_ids:
        courses = db.query(Course).filter(Course.id.in_(pathway.course_ids)).all()
        db_pathway.courses = courses
    
    db.commit()
    db.refresh(db_pathway)
    return db_pathway
