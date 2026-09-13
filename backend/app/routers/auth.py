import os
import secrets
import hashlib
from datetime import datetime, timedelta
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, PasswordResetToken
from ..schemas import (
    UserCreate,
    User as UserSchema,
    Token,
    LoginRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
)
from ..auth import (
    authenticate_user,
    create_access_token,
    get_password_hash,
    get_user_by_username,
    get_user_by_email,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from ..email_utils import send_password_reset_email

router = APIRouter()

RESET_TOKEN_EXPIRE_MINUTES = 15

@router.post("/register", response_model=UserSchema)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check if username already exists
    if get_user_by_username(db, user.username):
        raise HTTPException(
            status_code=400,
            detail="Username already registered"
        )
    
    # Check if email already exists
    if get_user_by_email(db, user.email):
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        address=user.address,
        villa_number=user.villa_number,
        hashed_password=hashed_password
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user

@router.get("/check-villa/{villa_number}")
async def check_villa_number(villa_number: str, db: Session = Depends(get_db)):
    """Check whether a villa number is already registered to a resident.

    Public (no auth) since this is used on the registration form before a
    user has an account. Only returns a boolean -- no user details.
    """
    exists = db.query(User).filter(User.villa_number == villa_number).first() is not None
    return {"exists": exists}

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login user and return access token."""
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/forgot-password")
async def forgot_password(
    request: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Request a password reset link.

    Always returns the same generic message whether or not the email is
    registered, so this endpoint can't be used to enumerate accounts.
    """
    user = get_user_by_email(db, request.email)
    if user:
        # Invalidate any earlier unused links so only the latest one works.
        db.query(PasswordResetToken).filter(
            PasswordResetToken.user_id == user.id,
            PasswordResetToken.used_at.is_(None)
        ).delete()

        raw_token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
        db.add(PasswordResetToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=datetime.utcnow() + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES),
        ))
        db.commit()

        frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
        reset_link = f"{frontend_url}/reset-password?token={raw_token}"
        background_tasks.add_task(
            send_password_reset_email, user.email, user.full_name, reset_link
        )

    return {"message": "If an account with that email exists, a password reset link has been sent."}

@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset a password using a token issued by /forgot-password."""
    token_hash = hashlib.sha256(request.token.encode()).hexdigest()
    reset_token = db.query(PasswordResetToken).filter(
        PasswordResetToken.token_hash == token_hash
    ).first()

    if (
        reset_token is None
        or reset_token.used_at is not None
        or reset_token.expires_at < datetime.utcnow()
    ):
        raise HTTPException(status_code=400, detail="Invalid or expired reset link")

    user = db.query(User).filter(User.id == reset_token.user_id).first()
    if user is None:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link")

    user.hashed_password = get_password_hash(request.new_password)
    reset_token.used_at = datetime.utcnow()
    db.commit()

    return {"message": "Password has been reset successfully"}

@router.post("/login-json", response_model=Token)
async def login_json(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Login user with JSON data and return access token."""
    user = authenticate_user(db, login_data.username, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}