from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from datetime import datetime, timedelta
from typing import Dict, List
import numpy as np

from app.models.user import User
from app.models.session import Session
from app.models.booking import Booking
from app.models.prediction import Prediction, PredictiveModel

class PredictiveAnalytics:
    """Simple predictive analytics using statistical methods"""
    
    @staticmethod
    async def calculate_churn_risk(db: AsyncSession, user_id: str) -> Dict:
        """Calculate churn risk based on engagement patterns"""
        
        # Get user activity in last 30 days
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        
        # Sessions attended
        sessions_result = await db.execute(
            select(func.count(Session.id))
            .where(and_(
                Session.learner_id == user_id,
                Session.scheduled_at >= thirty_days_ago,
                Session.status == "completed"
            ))
        )
        sessions_count = sessions_result.scalar() or 0
        
        # Bookings made
        bookings_result = await db.execute(
            select(func.count(Booking.id))
            .where(and_(
                Booking.learner_id == user_id,
                Booking.created_at >= thirty_days_ago
            ))
        )
        bookings_count = bookings_result.scalar() or 0
        
        # Calculate risk score (0-1)
        # Low activity = high risk
        activity_score = min((sessions_count + bookings_count) / 10, 1.0)
        churn_risk = 1.0 - activity_score
        
        # Determine risk level
        if churn_risk >= 0.7:
            risk_level = "high"
            actions = [
                "Schedule immediate check-in call",
                "Offer personalized learning path",
                "Connect with mentor for motivation"
            ]
        elif churn_risk >= 0.4:
            risk_level = "medium"
            actions = [
                "Send engagement reminder",
                "Suggest relevant courses",
                "Invite to upcoming cohort activities"
            ]
        else:
            risk_level = "low"
            actions = ["Continue regular engagement"]
        
        return {
            "prediction_type": "churn_risk",
            "prediction_value": round(churn_risk, 3),
            "confidence": 0.75,
            "risk_level": risk_level,
            "recommended_actions": actions,
            "features_used": {
                "sessions_30d": sessions_count,
                "bookings_30d": bookings_count,
                "activity_score": round(activity_score, 3)
            }
        }
    
    @staticmethod
    async def predict_success(db: AsyncSession, user_id: str) -> Dict:
        """Predict likelihood of program completion success"""
        
        # Get completion rate
        sessions_result = await db.execute(
            select(
                func.count(Session.id).label("total"),
                func.sum(func.cast(Session.status == "completed", func.Integer)).label("completed")
            )
            .where(Session.learner_id == user_id)
        )
        sessions_data = sessions_result.first()
        
        completion_rate = (sessions_data.completed / sessions_data.total) if sessions_data.total else 0
        
        # Success probability based on completion rate
        success_probability = min(completion_rate * 1.2, 1.0)
        
        if success_probability >= 0.7:
            actions = ["On track for success", "Continue current pace"]
        elif success_probability >= 0.4:
            actions = ["Increase session frequency", "Set weekly goals"]
        else:
            actions = ["Urgent intervention needed", "Assign dedicated mentor", "Create recovery plan"]
        
        return {
            "prediction_type": "success_probability",
            "prediction_value": round(success_probability, 3),
            "confidence": 0.80,
            "risk_level": "high" if success_probability < 0.4 else "medium" if success_probability < 0.7 else "low",
            "recommended_actions": actions,
            "features_used": {
                "completion_rate": round(completion_rate, 3),
                "total_sessions": sessions_data.total or 0,
                "completed_sessions": sessions_data.completed or 0
            }
        }
    
    @staticmethod
    async def identify_at_risk_learners(db: AsyncSession, cohort_id: str = None) -> List[Dict]:
        """Identify learners at risk of dropping out"""
        
        # Get all learners
        query = select(User).where(User.role == "learner")
        if cohort_id:
            from app.models.cohort import CohortEnrollment
            query = query.join(CohortEnrollment).where(CohortEnrollment.cohort_id == cohort_id)
        
        result = await db.execute(query)
        learners = result.scalars().all()
        
        at_risk = []
        for learner in learners:
            risk_data = await PredictiveAnalytics.calculate_churn_risk(db, str(learner.id))
            
            if risk_data["risk_level"] in ["high", "medium"]:
                at_risk.append({
                    "user_id": str(learner.id),
                    "user_name": learner.full_name,
                    "email": learner.email,
                    "risk_score": risk_data["prediction_value"],
                    "risk_level": risk_data["risk_level"],
                    "recommended_actions": risk_data["recommended_actions"]
                })
        
        # Sort by risk score descending
        at_risk.sort(key=lambda x: x["risk_score"], reverse=True)
        
        return at_risk
