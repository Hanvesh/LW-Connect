"""Test authentication endpoints."""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_signup(client: AsyncClient):
    """Test user signup."""
    response = await client.post(
        "/api/v1/auth/signup",
        json={
            "email": "test@example.com",
            "password": "password123",
            "full_name": "Test User",
            "role": "learner"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "test@example.com"


@pytest.mark.asyncio
async def test_login(client: AsyncClient):
    """Test user login."""
    # First signup
    await client.post(
        "/api/v1/auth/signup",
        json={
            "email": "test@example.com",
            "password": "password123",
            "full_name": "Test User",
            "role": "learner"
        }
    )
    
    # Then login
    response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "test@example.com",
            "password": "password123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data


@pytest.mark.asyncio
async def test_get_current_user(client: AsyncClient):
    """Test get current user."""
    # Signup and get token
    signup_response = await client.post(
        "/api/v1/auth/signup",
        json={
            "email": "test@example.com",
            "password": "password123",
            "full_name": "Test User",
            "role": "learner"
        }
    )
    token = signup_response.json()["access_token"]
    
    # Get current user
    response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
