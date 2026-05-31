"""Report generation service."""
from sqlalchemy.orm import Session
from app.models.cohort import Cohort, CohortEnrollment
from app.models.booking import Booking
from app.models.user import User
from typing import List, Dict
import csv
import io


class ReportService:
    """Report generation and export."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def generate_cohort_report(self, cohort_id: int) -> List[Dict]:
        """Generate cohort progress report."""
        cohort = self.db.query(Cohort).filter(Cohort.id == cohort_id).first()
        if not cohort:
            return []
        
        enrollments = self.db.query(CohortEnrollment).filter(
            CohortEnrollment.cohort_id == cohort_id
        ).all()
        
        report_data = []
        for enrollment in enrollments:
            user = self.db.query(User).filter(User.id == enrollment.learner_id).first()
            sessions = self.db.query(Booking).filter(
                Booking.learner_id == enrollment.learner_id,
                Booking.status == 'completed'
            ).count()
            
            report_data.append({
                'learner_name': user.name if user else 'Unknown',
                'learner_email': user.email if user else '',
                'enrollment_date': enrollment.enrolled_at.strftime('%Y-%m-%d') if enrollment.enrolled_at else '',
                'status': enrollment.status or 'active',
                'completed_sessions': sessions,
                'progress': f"{min(sessions * 10, 100)}%"
            })
        
        return report_data
    
    def export_to_csv(self, data: List[Dict]) -> str:
        """Export data to CSV format."""
        if not data:
            return ""
        
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=data[0].keys())
        writer.writeheader()
        writer.writerows(data)
        return output.getvalue()
    
    def generate_platform_stats(self) -> Dict:
        """Generate platform-wide statistics."""
        total_users = self.db.query(User).count()
        total_sessions = self.db.query(Booking).filter(Booking.status == 'completed').count()
        total_cohorts = self.db.query(Cohort).count()
        
        return {
            'total_users': total_users,
            'total_sessions': total_sessions,
            'total_cohorts': total_cohorts,
            'active_learners': self.db.query(User).filter(User.role == 'learner').count(),
            'active_mentors': self.db.query(User).filter(User.role == 'mentor').count()
        }
