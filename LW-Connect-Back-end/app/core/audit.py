from fastapi import Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.audit_log import AuditLog
from typing import Optional, Any
import json

async def log_audit(
    db: AsyncSession,
    user_id: Optional[str],
    action: str,
    resource_type: str,
    resource_id: Optional[str] = None,
    before_state: Optional[dict] = None,
    after_state: Optional[dict] = None,
    request: Optional[Request] = None,
    metadata: dict = {}
):
    """Log an audit event"""
    audit_log = AuditLog(
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        before_state=before_state,
        after_state=after_state,
        ip_address=request.client.host if request else None,
        user_agent=request.headers.get("user-agent") if request else None,
        metadata=metadata
    )
    db.add(audit_log)
    await db.commit()
    return audit_log
