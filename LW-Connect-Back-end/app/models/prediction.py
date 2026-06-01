from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.models.base import Base

class PredictiveModel(Base):
    __tablename__ = "predictive_models"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    model_type = Column(String(100), nullable=False)  # churn, success, risk
    model_version = Column(String(50), nullable=False)
    accuracy = Column(Float)
    trained_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    metadata = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)

class Prediction(Base):
    __tablename__ = "predictions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    model_id = Column(UUID(as_uuid=True), ForeignKey("predictive_models.id"))
    prediction_type = Column(String(100), nullable=False)
    prediction_value = Column(Float, nullable=False)  # 0-1 probability
    confidence = Column(Float, nullable=False)
    risk_level = Column(String(50))  # low, medium, high
    recommended_actions = Column(JSON, default=[])
    features_used = Column(JSON, default={})
    prediction_date = Column(DateTime, default=datetime.utcnow)
    actual_outcome = Column(Boolean)
    metadata = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User")
    model = relationship("PredictiveModel")

class Intervention(Base):
    __tablename__ = "interventions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    prediction_id = Column(UUID(as_uuid=True), ForeignKey("predictions.id", ondelete="CASCADE"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    intervention_type = Column(String(100), nullable=False)
    description = Column(String(500))
    status = Column(String(50), default="pending")  # pending, completed, dismissed
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    due_date = Column(DateTime)
    completed_at = Column(DateTime)
    effectiveness = Column(Float)
    metadata = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    
    prediction = relationship("Prediction")
    user = relationship("User", foreign_keys=[user_id])
