"""Authentication routes for Cognito username/password login and signup."""

from datetime import datetime, timedelta, timezone
from typing import Optional

import boto3
from botocore.exceptions import ClientError
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, Field

from app.core.config import settings

router = APIRouter()


def _cognito_client():
    """Create a Cognito IDP client using configured region."""
    return boto3.client("cognito-idp", region_name=settings.COGNITO_REGION)


def _build_auth_tokens(auth_result: dict):
    """Normalize Cognito AuthenticationResult into our token shape."""
    expires_in = auth_result.get("ExpiresIn", 3600)
    expires_at = datetime.now(timezone.utc) + timedelta(seconds=expires_in)
    return {
        "access_token": auth_result.get("AccessToken"),
        "id_token": auth_result.get("IdToken"),
        "refresh_token": auth_result.get("RefreshToken"),
        "expires_in": expires_in,
        "expires_at": int(expires_at.timestamp() * 1000),  # ms for frontend
    }


class LoginRequest(BaseModel):
    username_or_email: str = Field(..., description="Cognito username or email")
    password: str = Field(..., min_length=6)


class LoginResponse(BaseModel):
    access_token: str
    id_token: str
    refresh_token: Optional[str] = None
    expires_in: int
    expires_at: int


class SignupRequest(BaseModel):
    username: str = Field(..., min_length=3)
    password: str = Field(..., min_length=8)
    email: EmailStr
    first_name: str = Field(..., alias="firstName")
    last_name: str = Field(..., alias="lastName")
    nickname: str
    birthdate: str = Field(..., description="YYYY-MM-DD")


class SignupResponse(BaseModel):
    user_sub: str
    user_confirmed: bool
    message: str


class ForgotPasswordRequest(BaseModel):
    username: str = Field(..., description="Cognito username or email (login identifier)")


class ForgotPasswordResponse(BaseModel):
    message: str


class ConfirmForgotPasswordRequest(BaseModel):
    model_config = {"populate_by_name": True}
    username: str = Field(..., description="Cognito username or email")
    confirmation_code: str = Field(..., min_length=6, max_length=6, alias="confirmationCode")
    new_password: str = Field(..., min_length=8, alias="newPassword")


@router.post("/forgot-password", response_model=ForgotPasswordResponse, tags=["auth"])
def forgot_password(request: ForgotPasswordRequest):
    """Send password reset code to the user's email via Cognito."""
    if settings.DEV_AUTH_BYPASS:
        return ForgotPasswordResponse(message="If this account existed, a reset code would have been sent (dev mode).")
    client = _cognito_client()
    try:
        client.forgot_password(
            ClientId=settings.COGNITO_CLIENT_ID,
            Username=request.username.strip(),
        )
        return ForgotPasswordResponse(message="Reset code sent. Check your email.")
    except ClientError as exc:
        code = exc.response["Error"].get("Code")
        message_map = {
            "UserNotFoundException": "No account found with this email.",
            "LimitExceededException": "Too many attempts. Try again later.",
            "InvalidParameterException": "Invalid email or username.",
        }
        detail = message_map.get(code, "Could not send reset code.")
        status = 400 if code in message_map else 500
        raise HTTPException(status_code=status, detail=detail) from exc
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail="Failed to send reset code.") from exc


@router.post("/confirm-forgot-password", response_model=ForgotPasswordResponse, tags=["auth"])
def confirm_forgot_password(request: ConfirmForgotPasswordRequest):
    """Confirm forgot password with code and set new password."""
    if settings.DEV_AUTH_BYPASS:
        return ForgotPasswordResponse(message="Password reset successful (dev mode).")
    client = _cognito_client()
    try:
        client.confirm_forgot_password(
            ClientId=settings.COGNITO_CLIENT_ID,
            Username=request.username.strip(),
            ConfirmationCode=request.confirmation_code.strip(),
            Password=request.new_password,
        )
        return ForgotPasswordResponse(message="Password has been reset. You can sign in with your new password.")
    except ClientError as exc:
        code = exc.response["Error"].get("Code")
        message_map = {
            "CodeMismatchException": "Invalid or expired code. Request a new one.",
            "ExpiredCodeException": "Code has expired. Request a new one.",
            "UserNotFoundException": "No account found with this email.",
            "InvalidPasswordException": "Password does not meet requirements.",
        }
        detail = message_map.get(code, "Could not reset password.")
        status = 400 if code in message_map else 500
        raise HTTPException(status_code=status, detail=detail) from exc
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail="Failed to reset password.") from exc


@router.post("/login", response_model=LoginResponse, tags=["auth"])
def login(request: LoginRequest):
    """Authenticate user against Cognito without Hosted UI."""
    # Dev bypass: return fake tokens
    if settings.DEV_AUTH_BYPASS:
        fake_tokens = {
            "access_token": "dev-access-token",
            "id_token": "dev-id-token",
            "refresh_token": "dev-refresh-token",
            "expires_in": 3600,
            "expires_at": int((datetime.now(timezone.utc) + timedelta(seconds=3600)).timestamp() * 1000),
        }
        return LoginResponse(**fake_tokens)
    
    client = _cognito_client()
    try:
        resp = client.initiate_auth(
            AuthFlow="USER_PASSWORD_AUTH",
            AuthParameters={
                "USERNAME": request.username_or_email,
                "PASSWORD": request.password,
            },
            ClientId=settings.COGNITO_CLIENT_ID,
        )
        tokens = _build_auth_tokens(resp["AuthenticationResult"])
        return LoginResponse(**tokens)
    except ClientError as exc:
        code = exc.response["Error"].get("Code")
        message_map = {
            "NotAuthorizedException": "Incorrect username or password.",
            "UserNotFoundException": "User not found.",
            "PasswordResetRequiredException": "Password reset required.",
            "UserNotConfirmedException": "User is not confirmed. Please verify your email.",
        }
        detail = message_map.get(code, "Authentication failed.")
        raise HTTPException(status_code=401, detail=detail) from exc
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail="Login failed.") from exc


@router.post("/signup", response_model=SignupResponse, tags=["auth"])
def signup(request: SignupRequest):
    """Register a new user in Cognito without redirecting to Hosted UI."""
    # Dev bypass: return fake success response
    if settings.DEV_AUTH_BYPASS:
        return SignupResponse(
            user_sub="dev-user-123",
            user_confirmed=True,
            message="Signup successful (dev mode).",
        )
    
    client = _cognito_client()
    try:
        resp = client.sign_up(
            ClientId=settings.COGNITO_CLIENT_ID,
            Username=request.username,
            Password=request.password,
            UserAttributes=[
                {"Name": "email", "Value": request.email},
                {"Name": "given_name", "Value": request.first_name},
                {"Name": "family_name", "Value": request.last_name},
                {"Name": "nickname", "Value": request.nickname},
                {"Name": "birthdate", "Value": request.birthdate},
            ],
        )
        return SignupResponse(
            user_sub=resp.get("UserSub"),
            user_confirmed=resp.get("UserConfirmed", False),
            message="Signup successful. Please check your email to verify your account."
            if not resp.get("UserConfirmed")
            else "Signup successful.",
        )
    except ClientError as exc:
        code = exc.response["Error"].get("Code")
        message_map = {
            "UsernameExistsException": "Username already exists.",
            "InvalidPasswordException": "Password not strong enough.",
            "InvalidParameterException": "Invalid input provided.",
        }
        detail = message_map.get(code, "Signup failed.")
        status = 400 if code in message_map else 500
        raise HTTPException(status_code=status, detail=detail) from exc
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail="Signup failed.") from exc

