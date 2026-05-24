"""Test mentor endpoints."""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_mentor_profile(client: AsyncClient):
    """Test creating a mentor profile."""
    # First signup as mentor
    signup_response = await client.post(
        "/api/v1/auth/signup",
        json={
            "email": "mentor@example.com",
            "password": "password123",
            "full_name": "Test Mentor",
            "role": "mentor"
        }
    )
    token = signup_response.json()["access_token"]
    
    # Create mentor profile
    response = await client.post(
        "/api/v1/mentors",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "bio": "Experienced mentor",
            "expertise": ["Policy", "Innovation"],
            "skills": ["Leadership"],
            "years_of_experience": 10,
            "is_available": True
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["bio"] == "Experienced mentor"
    assert "Policy" in data["expertise"]


@pytest.mark.asyncio
async def test_search_mentors(client: AsyncClient):
    """Test searching mentors."""
    # Create mentor first
    signup_response = await client.post(
        "/api/v1/auth/signup",
        json={
            "email": "mentor@example.com",
            "password": "password123",
            "full_name": "Test Mentor",
            "role": "mentor"
        }
    )
    token = signup_response.json()["access_token"]
    
    await client.post(
        "/api/v1/mentors",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "expertise": ["Policy"],
            "is_available": True
        }
    )
    
    # Search mentors
    response = await client.post(
        "/api/v1/mentors/search",
        json={
            "expertise": ["Policy"],
            "is_available": True
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
