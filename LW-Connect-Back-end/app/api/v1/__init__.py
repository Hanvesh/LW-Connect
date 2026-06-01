"""API v1 router."""
from fastapi import APIRouter

from app.api.v1 import auth, mentors, bookings, courses, cohorts, dashboard, users, notifications, reports, pathways, sessions, ai_recommendations, user_preferences

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(mentors.router)
api_router.include_router(bookings.router)
api_router.include_router(courses.router)
api_router.include_router(cohorts.router)
api_router.include_router(dashboard.router)
api_router.include_router(users.router)
api_router.include_router(notifications.router)
api_router.include_router(reports.router)
api_router.include_router(pathways.router)
api_router.include_router(sessions.router)
api_router.include_router(ai_recommendations.router)
api_router.include_router(user_preferences.router)
