"""Report API endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.services.report_service import ReportService
import io

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/cohort/{cohort_id}/export")
async def export_cohort_report(
    cohort_id: int,
    format: str = "csv",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export cohort report."""
    if current_user.role not in ['admin', 'program_manager']:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    service = ReportService(db)
    data = service.generate_cohort_report(cohort_id)
    
    if format == "csv":
        csv_content = service.export_to_csv(data)
        return StreamingResponse(
            io.StringIO(csv_content),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=cohort_{cohort_id}_report.csv"}
        )
    
    return {"data": data}


@router.get("/platform/stats")
async def get_platform_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get platform statistics."""
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Not authorized")
    
    service = ReportService(db)
    return service.generate_platform_stats()
