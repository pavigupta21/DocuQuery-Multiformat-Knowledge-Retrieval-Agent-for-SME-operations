import random

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.email import send_verification_otp
from app.models import User
from app.schemas import UserCreate, UserLogin, UserResponse,LoginResponse, VerifyEmail, ForgotPasswordRequest, ResetPasswordRequest
from app.security import hash_password, verify_password, create_access_token
from datetime import datetime, timedelta, timezone

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    existing_user = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered"
        )

    # Generate 6-digit verification code
    otp_code = str(random.randint(100000, 999999))

    new_user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        is_verified=False,
        verification_code=otp_code
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Send verification email via Gmail SMTP
    send_verification_otp(new_user.email, otp_code)

    return new_user


@router.post("/verify-email", response_model=UserResponse)
def verify_email(
    data: VerifyEmail,
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(User.email == data.email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if user.is_verified:
        return user

    if not user.verification_code or user.verification_code != data.code.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code. Please check your email inbox."
        )

    user.is_verified = True
    user.verification_code = None
    db.commit()
    db.refresh(user)

    return user


@router.post("/login", response_model=LoginResponse)
def login_user(
    credentials: UserLogin,
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(User.email == credentials.email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is not verified yet. Please enter the 6-digit code sent to your email."
        )

    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "email": user.email,
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


@router.post("/forgot-password")
def forgot_password(
    data: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(User.email == data.email)
        .first()
    )

    # Do not reveal whether the email exists.
    if not user:
        return {
            "message": "If this email is registered, a password reset code has been sent."
        }

    reset_code = str(random.randint(100000, 999999))

    user.reset_code = reset_code
    user.reset_code_expires_at = datetime.utcnow() + timedelta(minutes=5)

    db.commit()

    send_verification_otp(user.email, reset_code)

    return {
        "message": "If this email is registered, a password reset code has been sent."
    }

@router.post("/reset-password")
def reset_password(
    data: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(User.email == data.email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset code."
        )

    if not user.reset_code or user.reset_code != data.code.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset code."
        )

    if (
        not user.reset_code_expires_at
        or user.reset_code_expires_at < datetime.utcnow()
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset code."
        )

    user.password_hash = hash_password(data.new_password)
    user.reset_code = None
    user.reset_code_expires_at = None

    db.commit()

    return {
        "message": "Password reset successfully. You can now log in."
    }