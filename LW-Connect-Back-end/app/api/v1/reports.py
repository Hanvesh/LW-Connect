"""Report API endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID
import csv
import io

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.session import Session
from app.models.outcome import LearningOutcome, ROICalculation

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/program-summary")
async def get_program_summary(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Generate comprehensive program summary report"""
    if current_user.role not in ["admin"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    if not start_date:
        start_date = datetime.utcnow() - timedelta(days=90)
    if not end_date:
        end_date = datetime.utcnow()
    
    learners_result = await db.execute(select(func.count(User.id)).where(User.role == "learner"))
    total_learners = learners_result.scalar() or 0
    
    sessions_result = await db.execute(
        select(
            func.count(Session.id).label("total"),
            func.sum(func.cast(Session.status == "completed", func.Integer)).label("completed")
        ).where(and_(Session.scheduled_at >= start_date, Session.scheduled_at <= end_date))
    )
    sessions_data = sessions_result.first()
    
    outcomes_result = await db.execute(select(func.avg(LearningOutcome.improvement_percentage)))
    avg_improvement = outcomes_result.scalar() or 0
    
    roi_result = await db.execute(select(func.avg(ROICalculation.roi_percentage)))
    avg_roi = roi_result.scalar() or 0
    
    return {
        "report_type": "program_summary",
        "period": {"start": start_date.isoformat(), "end": end_date.isoformat()},
        "metrics": {
            "total_learners": total_learners,
            "total_sessions": sessions_data.total or 0,
            "completed_sessions": sessions_data.completed or 0,
            "completion_rate": round((sessions_data.completed / sessions_data.total * 100) if sessions_data.total else 0, 2),
            "average_skill_improvement": round(avg_improvement, 2),
            "average_roi": round(avg_roi, 2)
        },
        "generated_at": datetime.utcnow().isoformat()
    }

@router.get("/compliance")
async def get_compliance_report(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Generate compliance report"""
    if current_user.role not in ["admin"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    from app.models.audit_log import AuditLog
    
    audit_result = await db.execute(select(func.count(AuditLog.id)))
    total_audits = audit_result.scalar() or 0
    
    return {
        "report_type": "compliance",
        "audit_logs": {"total_events": total_audits},
        "compliance_status": "compliant",
        "generated_at": datetime.utcnow().isoformat()
    }

@router.get("/export/csv")
async def export_report_csv(
    report_type: str = "program_summary",
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Export report as CSV"""
    if current_user.role not in ["admin"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    report = await get_program_summary(None, None, current_user, db) if report_type == "program_summary" else await get_compliance_report(current_user, db)
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Report Type", report_type])
    writer.writerow(["Generated At", report["generated_at"]])
    writer.writerow([])
    
    if report_type == "program_summary":
        writer.writerow(["Metric", "Value"])
        for key, value in report["metrics"].items():
            writer.writerow([key.replace("_", " ").title(), value])
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={report_type}_{datetime.utcnow().strftime('%Y%m%d')}.csv"}
    )
