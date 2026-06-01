from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from onelogin.saml2.auth import OneLogin_Saml2_Auth
from onelogin.saml2.utils import OneLogin_Saml2_Utils
import os

from app.core.database import get_db
from app.core.security import create_access_token
from app.models.user import User
from sqlalchemy import select

router = APIRouter(prefix="/sso", tags=["sso"])

def init_saml_auth(req):
    """Initialize SAML auth"""
    auth = OneLogin_Saml2_Auth(req, custom_base_path=os.path.join(os.path.dirname(__file__), '../../saml'))
    return auth

def prepare_flask_request(request: Request):
    """Prepare request for SAML"""
    return {
        'https': 'on' if request.url.scheme == 'https' else 'off',
        'http_host': request.client.host,
        'script_name': request.url.path,
        'server_port': request.url.port,
        'get_data': dict(request.query_params),
        'post_data': {}
    }

@router.get("/login")
async def sso_login(request: Request):
    """Initiate SSO login"""
    req = prepare_flask_request(request)
    auth = init_saml_auth(req)
    return RedirectResponse(auth.login())

@router.post("/acs")
async def sso_acs(request: Request, db: AsyncSession = Depends(get_db)):
    """Assertion Consumer Service - handle SSO callback"""
    req = prepare_flask_request(request)
    req['post_data'] = await request.form()
    
    auth = init_saml_auth(req)
    auth.process_response()
    
    errors = auth.get_errors()
    if errors:
        raise HTTPException(status_code=400, detail=f"SAML error: {', '.join(errors)}")
    
    if not auth.is_authenticated():
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Get user attributes
    attributes = auth.get_attributes()
    email = attributes.get('email', [None])[0]
    name = attributes.get('name', [None])[0]
    
    if not email:
        raise HTTPException(status_code=400, detail="Email not provided by SSO")
    
    # Find or create user
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    
    if not user:
        user = User(
            email=email,
            full_name=name or email,
            role="learner",
            is_verified=True,
            hashed_password=""  # SSO users don't need password
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    
    # Create access token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    # Redirect to frontend with token
    return RedirectResponse(
        url=f"{os.getenv('FRONTEND_URL')}/auth/callback?token={access_token}",
        status_code=302
    )

@router.get("/metadata")
async def sso_metadata(request: Request):
    """Return SAML metadata"""
    req = prepare_flask_request(request)
    auth = init_saml_auth(req)
    settings = auth.get_settings()
    metadata = settings.get_sp_metadata()
    errors = settings.validate_metadata(metadata)
    
    if errors:
        raise HTTPException(status_code=500, detail=f"Metadata error: {', '.join(errors)}")
    
    return Response(content=metadata, media_type="application/xml")

@router.get("/logout")
async def sso_logout(request: Request):
    """Initiate SSO logout"""
    req = prepare_flask_request(request)
    auth = init_saml_auth(req)
    return RedirectResponse(auth.logout())
