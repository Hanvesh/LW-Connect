"""Pathway model."""
import uuid
from sqlalchemy import Column, Integer, String, Text, Table, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base

pathway_courses = Table(
    'pathway_courses',
    Base.metadata,
    Column('pathway_id', UUID(as_uuid=True), ForeignKey('pathways.id')),
    Column('course_id', UUID(as_uuid=True), ForeignKey('courses.id')),
    Column('sequence', Integer, default=0)
)


class Pathway(Base):
    """Learning pathway model."""
    
    __tablename__ = "pathways"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    duration_weeks = Column(Integer)
    difficulty = Column(String(50))  # beginner, intermediate, advanced
    
    courses = relationship("Course", secondary=pathway_courses, back_populates="pathways")
