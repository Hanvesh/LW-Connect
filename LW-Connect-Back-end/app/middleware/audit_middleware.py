"""Audit logging middleware."""
from fastapi import Request
from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog
from app.core.database import SessionLocal
import json


async def log_audit(
    user_id: int,
    action: str,
    resource_type: str = None,
    resource_id: int = None,
    details: dict = None,
    ip_address: str = None,
    user_agent: str = None
):
    """Log an audit event."""
    db = SessionLocal()
    try:
        audit_log = AuditLog(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            details=details,
            ip_address=ip_address,
            user_agent=user_agent
        )
        db.add(audit_log)
        db.commit()
    except Exception as e:
        print(f"Audit log error: {e}")
    finally:
        db.close()


def get_client_ip(request: Request) -> str:
    """Get client IP address."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0]
    return request.client.host if request.client else "unknown"


def get_user_agent(request: Request) -> str:
    """Get user agent."""
    return request.headers.get("User-Agent", "unknown")
