# FILE-BY-FILE CHANGE TRACKER
**Remediation Implementation Tracking**

---

## FRONTEND CHANGES (LW-Connect-UI)

### NEW FILES TO CREATE

| File Path | Purpose | Issue | Lines | Effort |
|-----------|---------|-------|-------|--------|
| `src/app/(dashboard)/mentors/[id]/page.tsx` | Mentor profile page | ISSUE-001 | ~200 | 4h |
| `src/components/features/mentor-profile-view.tsx` | Mentor profile component | ISSUE-001 | ~150 | 3h |
| `src/services/ai.service.ts` | AI API integration | ISSUE-002 | ~50 | 2h |
| `src/components/features/ai-recommendations.tsx` | AI recommendation widget | ISSUE-002 | ~100 | 3h |
| `src/components/layout/notification-bell.tsx` | Notification bell icon | ISSUE-003 | ~50 | 2h |
| `src/components/features/notification-list.tsx` | Notification dropdown | ISSUE-003 | ~100 | 3h |
| `src/app/(dashboard)/admin/reports/page.tsx` | Reports page | ISSUE-004 | ~150 | 4h |
| `src/components/features/report-generator.tsx` | Report generation UI | ISSUE-004 | ~100 | 3h |
| `src/app/(dashboard)/pathways/page.tsx` | Pathways list page | ISSUE-005 | ~120 | 3h |
| `src/app/(dashboard)/pathways/[id]/page.tsx` | Pathway detail page | ISSUE-005 | ~150 | 4h |
| `src/components/features/pathway-builder.tsx` | Pathway creation UI | ISSUE-005 | ~200 | 6h |
| `src/components/features/pathway-card.tsx` | Pathway display card | ISSUE-005 | ~80 | 2h |

**Total New Frontend Files**: 12  
**Total Lines**: ~1,450  
**Total Effort**: 39 hours (~5 days)

---

### FILES TO MODIFY

| File Path | Changes | Issue | Impact | Risk |
|-----------|---------|-------|--------|------|
| `src/app/(dashboard)/mentors/page.tsx` | Add Link to profile | ISSUE-001 | Minimal | LOW |
| `src/app/(dashboard)/dashboard/page.tsx` | Add AI recommendations section | ISSUE-002 | Additive | LOW |
| `src/components/layout/dashboard-header.tsx` | Add notification bell | ISSUE-003 | Additive | LOW |
| `src/app/(dashboard)/layout.tsx` | Add notification provider | ISSUE-003 | Minimal | LOW |
| `.env.local` | Add AI_API_URL | ISSUE-002 | Config only | NONE |
| `.env.example` | Add AI_API_URL | ISSUE-002 | Config only | NONE |

**Total Modified Frontend Files**: 6  
**Regression Risk**: LOW (all changes are additive)

---

## BACKEND CHANGES (LW-Connect-Back-end)

### NEW FILES TO CREATE

| File Path | Purpose | Issue | Lines | Effort |
|-----------|---------|-------|-------|--------|
| `app/models/notification.py` | Notification model | ISSUE-003 | ~30 | 1h |
| `app/schemas/notification.py` | Notification schemas | ISSUE-003 | ~40 | 1h |
| `app/repositories/notification_repository.py` | Notification data access | ISSUE-003 | ~80 | 2h |
| `app/services/notification_service.py` | Notification business logic | ISSUE-003 | ~100 | 3h |
| `app/api/v1/notifications.py` | Notification endpoints | ISSUE-003 | ~60 | 2h |
| `app/models/audit_log.py` | Audit log model | ISSUE-006 | ~30 | 1h |
| `app/middleware/audit_middleware.py` | Audit logging middleware | ISSUE-006 | ~80 | 3h |
| `app/api/v1/audit.py` | Audit log endpoints | ISSUE-006 | ~40 | 1h |
| `app/services/report_service.py` | Report generation | ISSUE-004 | ~150 | 4h |
| `app/api/v1/reports.py` | Report endpoints | ISSUE-004 | ~80 | 2h |
| `app/utils/export_utils.py` | Export utilities | ISSUE-004 | ~100 | 3h |
| `app/models/pathway.py` | Pathway model | ISSUE-005 | ~40 | 1h |
| `app/schemas/pathway.py` | Pathway schemas | ISSUE-005 | ~50 | 1h |
| `app/repositories/pathway_repository.py` | Pathway data access | ISSUE-005 | ~100 | 3h |
| `app/services/pathway_service.py` | Pathway business logic | ISSUE-005 | ~120 | 4h |
| `app/api/v1/pathways.py` | Pathway endpoints | ISSUE-005 | ~80 | 2h |
| `app/middleware/rate_limit_middleware.py` | Rate limiting | ISSUE-007 | ~60 | 2h |
| `app/middleware/csrf_middleware.py` | CSRF protection | ISSUE-008 | ~50 | 2h |
| `alembic/versions/002_add_notifications.py` | Notification migration | ISSUE-003 | ~40 | 1h |
| `alembic/versions/003_add_pathways.py` | Pathway migration | ISSUE-005 | ~50 | 1h |
| `alembic/versions/004_add_audit_logs.py` | Audit log migration | ISSUE-006 | ~40 | 1h |

**Total New Backend Files**: 21  
**Total Lines**: ~1,420  
**Total Effort**: 41 hours (~5 days)

---

### FILES TO MODIFY

| File Path | Changes | Issue | Impact | Risk |
|-----------|---------|-------|--------|------|
| `app/main.py` | Add middleware, routers | Multiple | Minimal | LOW |
| `app/api/v1/__init__.py` | Import new routers | Multiple | Minimal | NONE |
| `app/models/__init__.py` | Import new models | Multiple | Minimal | NONE |
| `requirements.txt` | Add slowapi, openpyxl | ISSUE-007, 004 | Dependencies | LOW |
| `.env.example` | Add new config vars | Multiple | Config only | NONE |

**Total Modified Backend Files**: 5  
**Regression Risk**: LOW (middleware is transparent)

---

## AI LAYER CHANGES (LW-Connect-Langchain)

### NEW FILES TO CREATE

| File Path | Purpose | Issue | Lines | Effort |
|-----------|---------|-------|-------|--------|
| `app/ranking_service.py` | Mentor ranking logic | ISSUE-002 | ~80 | 3h |
| `tests/test_recommendations.py` | Recommendation tests | ISSUE-009 | ~150 | 4h |
| `tests/test_retrieval.py` | Retrieval tests | ISSUE-009 | ~120 | 3h |

**Total New AI Files**: 3  
**Total Lines**: ~350  
**Total Effort**: 10 hours (~1.5 days)

---

### FILES TO MODIFY

| File Path | Changes | Issue | Impact | Risk |
|-----------|---------|-------|--------|------|
| `app/mentor_recommendation.py` | Add ranking layer | ISSUE-002 | Enhancement | LOW |
| `app/main.py` | Add ranking endpoint | ISSUE-002 | Additive | LOW |

**Total Modified AI Files**: 2  
**Regression Risk**: LOW (existing logic preserved)

---

## DATABASE CHANGES

### NEW TABLES

| Table Name | Purpose | Issue | Columns | Migration |
|------------|---------|-------|---------|-----------|
| `notifications` | Store notifications | ISSUE-003 | 9 | 002_add_notifications.py |
| `audit_logs` | Store audit trail | ISSUE-006 | 9 | 004_add_audit_logs.py |
| `pathways` | Store learning pathways | ISSUE-005 | 6 | 003_add_pathways.py |
| `pathway_courses` | Pathway-course mapping | ISSUE-005 | 3 | 003_add_pathways.py |

**Total New Tables**: 4  
**Existing Tables Modified**: 0  
**Data Migration Required**: NO

---

## TESTING FILES TO CREATE

### Unit Tests

| File Path | Purpose | Coverage | Effort |
|-----------|---------|----------|--------|
| `backend/app/tests/test_notifications.py` | Notification tests | ISSUE-003 | 3h |
| `backend/app/tests/test_audit.py` | Audit log tests | ISSUE-006 | 2h |
| `backend/app/tests/test_reports.py` | Report tests | ISSUE-004 | 3h |
| `backend/app/tests/test_pathways.py` | Pathway tests | ISSUE-005 | 4h |
| `backend/app/tests/test_rate_limit.py` | Rate limit tests | ISSUE-007 | 2h |

**Total Test Files**: 5  
**Total Effort**: 14 hours (~2 days)

---

### Integration Tests

| File Path | Purpose | Coverage | Effort |
|-----------|---------|----------|--------|
| `backend/app/tests/integration/test_notification_flow.py` | End-to-end notification | ISSUE-003 | 2h |
| `backend/app/tests/integration/test_booking_with_notifications.py` | Booking + notifications | ISSUE-003 | 2h |
| `backend/app/tests/integration/test_pathway_enrollment.py` | Pathway enrollment | ISSUE-005 | 3h |

**Total Integration Test Files**: 3  
**Total Effort**: 7 hours (~1 day)

---

## CONFIGURATION CHANGES

### Environment Variables to Add

**Backend (.env)**:
```bash
# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_PER_MINUTE=60

# CSRF Protection
CSRF_SECRET_KEY=<generate-secret>

# Notifications
NOTIFICATION_EMAIL_ENABLED=false
NOTIFICATION_RETENTION_DAYS=90

# Reports
REPORT_EXPORT_PATH=/tmp/reports
```

**Frontend (.env.local)**:
```bash
# AI Service
NEXT_PUBLIC_AI_API_URL=http://localhost:8001

# Notifications
NEXT_PUBLIC_NOTIFICATION_POLL_INTERVAL=30000
```

---

## DEPENDENCY CHANGES

### Backend (requirements.txt)

**Add**:
```
slowapi==0.1.9          # Rate limiting
openpyxl==3.1.2         # Excel export
python-multipart==0.0.6 # File uploads
```

**No Removals**

### Frontend (package.json)

**No New Dependencies Required**  
(All features use existing libraries)

---

## DOCUMENTATION UPDATES

### Files to Update

| File | Changes | Effort |
|------|---------|--------|
| `backend/README.md` | Add new endpoints | 1h |
| `backend/API_DOCS.md` | Document new APIs | 2h |
| `frontend/README.md` | Add new routes | 1h |
| `ai-assistant/README.md` | Document ranking | 1h |
| `DEPLOYMENT.md` | Add migration steps | 1h |

**Total Documentation Effort**: 6 hours

---

## SUMMARY

### Total Changes

| Category | New Files | Modified Files | Total |
|----------|-----------|----------------|-------|
| Frontend | 12 | 6 | 18 |
| Backend | 21 | 5 | 26 |
| AI Layer | 3 | 2 | 5 |
| Tests | 8 | 0 | 8 |
| **Total** | **44** | **13** | **57** |

### Total Effort Breakdown

| Category | Effort | Percentage |
|----------|--------|------------|
| Frontend Development | 5 days | 20% |
| Backend Development | 5 days | 20% |
| AI Development | 1.5 days | 6% |
| Testing | 3 days | 12% |
| Documentation | 1 day | 4% |
| Integration & QA | 2.5 days | 10% |
| Buffer | 7 days | 28% |
| **Total** | **25 days** | **100%** |

### Risk Assessment

| Risk Level | File Count | Percentage |
|------------|------------|------------|
| NONE (New files) | 44 | 77% |
| LOW (Additive changes) | 13 | 23% |
| MEDIUM | 0 | 0% |
| HIGH | 0 | 0% |

**Overall Risk**: LOW

---

## IMPLEMENTATION SEQUENCE

### Phase 1: Critical Features (Week 1-2)
- ISSUE-001: Mentor Profile (3 days)
- ISSUE-002: AI Integration (5 days)
- ISSUE-003: Notifications (5 days)

### Phase 2: Core Features (Week 3-4)
- ISSUE-004: Reports (4 days)
- ISSUE-005: Pathways (8 days)

### Phase 3: Security (Week 4-5)
- ISSUE-006: Audit Logging (4 days)
- ISSUE-007: Rate Limiting (2 days)
- ISSUE-008: CSRF Protection (2 days)

### Phase 4: Testing (Week 5-6)
- Unit Tests (2 days)
- Integration Tests (1 day)
- E2E Tests (2 days)

### Phase 5: Polish & Deploy (Week 6)
- Documentation (1 day)
- Final QA (2 days)
- Deployment (1 day)

---

## ROLLBACK STRATEGY

### Per-Issue Rollback

Each issue is implemented in a separate Git branch:
- `feature/issue-001-mentor-profile`
- `feature/issue-002-ai-integration`
- etc.

**Rollback Process**:
1. Identify problematic issue
2. Revert merge commit
3. Remove database migrations (if any)
4. Deploy previous version
5. Notify team

**Rollback Time**: < 15 minutes per issue

---

## VALIDATION CHECKLIST

### Before Each Merge:
- [ ] Code review completed
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] No console errors
- [ ] Documentation updated
- [ ] Migration tested

### Before Deployment:
- [ ] All tests passing
- [ ] Staging environment tested
- [ ] Performance acceptable
- [ ] Security scan passed
- [ ] Rollback plan ready

---

**Status**: READY FOR IMPLEMENTATION  
**Start Date**: Immediate  
**Target Completion**: 6 weeks  
**Next Review**: Weekly progress check
