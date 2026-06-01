from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.prediction import Prediction
from app.services.predictive_analytics import PredictiveAnalytics

router = APIRouter(prefix="/predictions", tags=["predictions"])

@router.get("/churn-risk/{user_id}")
async def get_churn_risk(
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get churn risk prediction for a user"""
    if current_user.role not in ["admin", "mentor"] and str(current_user.id) != str(user_id):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    prediction = await PredictiveAnalytics.calculate_churn_risk(db, str(user_id))
    
    # Save prediction
    db_prediction = Prediction(
        user_id=user_id,
        **prediction
    )
    db.add(db_prediction)
    await db.commit()
    
    return prediction

@router.get("/success-probability/{user_id}")
async def get_success_probability(
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get success probability prediction for a user"""
    if current_user.role not in ["admin", "mentor"] and str(current_user.id) != str(user_id):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    prediction = await PredictiveAnalytics.predict_success(db, str(user_id))
    
    # Save prediction
    db_prediction = Prediction(
        user_id=user_id,
        **prediction
    )
    db.add(db_prediction)
    await db.commit()
    
    return prediction

@router.get("/at-risk-learners")
async def get_at_risk_learners(
    cohort_id: UUID = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get list of learners at risk of dropping out"""
    if current_user.role not in ["admin", "mentor"]:
        raise HTTPException(status_code=403, detail="Admin or mentor access required")
    
    at_risk = await PredictiveAnalytics.identify_at_risk_learners(
        db, 
        str(cohort_id) if cohort_id else None
    )
    
    return {
        "total_at_risk": len(at_risk),
        "high_risk": len([l for l in at_risk if l["risk_level"] == "high"]),
        "medium_risk": len([l for l in at_risk if l["risk_level"] == "medium"]),
        "learners": at_risk
    }

@router.get("/dashboard")
async def get_predictions_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get predictive analytics dashboard"""
    if current_user.role not in ["admin"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    at_risk = await PredictiveAnalytics.identify_at_risk_learners(db)
    
    return {
        "total_learners_analyzed": len(at_risk),
        "high_risk_count": len([l for l in at_risk if l["risk_level"] == "high"]),
        "medium_risk_count": len([l for l in at_risk if l["risk_level"] == "medium"]),
        "interventions_needed": len([l for l in at_risk if l["risk_level"] == "high"]),
        "at_risk_learners": at_risk[:10]  # Top 10
    }
