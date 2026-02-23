"""Authentication routes for Cognito username/password login and signup."""

import base64
import hashlib
import hmac
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

import boto3
from botocore.exceptions import ClientError, ParamValidationError
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()


def _cognito_client():
    """Create a Cognito IDP client using configured region."""
    return boto3.client("cognito-idp", region_name=settings.COGNITO_REGION)


def _secret_hash(username: str) -> str:
    """Compute Cognito SecretHash for apps with client secret."""
    msg = username + settings.COGNITO_CLIENT_ID
    dig = hmac.new(
        settings.COGNITO_CLIENT_SECRET.encode("utf-8"),
        msg.encode("utf-8"),
        hashlib.sha256,
    ).digest()
    return base64.b64encode(dig).decode("utf-8")


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
    model_config = ConfigDict(populate_by_name=True)

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


class ConfirmSignupRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    username: str = Field(..., description="Cognito username")
    confirmation_code: str = Field(..., min_length=6, max_length=6, alias="confirmationCode")


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
            "expires_at": int(
                (datetime.now(timezone.utc) + timedelta(seconds=3600)).timestamp() * 1000
            ),
        }
        return LoginResponse(**fake_tokens)

    if not settings.COGNITO_CLIENT_ID:
        raise HTTPException(
            status_code=503,
            detail="Auth not configured. Set COGNITO_CLIENT_ID or DEV_AUTH_BYPASS=true for local development.",
        )

    client = _cognito_client()
    auth_params: dict = {
        "USERNAME": request.username_or_email,
        "PASSWORD": request.password,
    }
    if settings.COGNITO_CLIENT_SECRET:
        auth_params["SECRET_HASH"] = _secret_hash(request.username_or_email)
    try:
        resp = client.initiate_auth(
            AuthFlow="USER_PASSWORD_AUTH",
            AuthParameters=auth_params,
            ClientId=settings.COGNITO_CLIENT_ID,
        )
        tokens = _build_auth_tokens(resp["AuthenticationResult"])
        return LoginResponse(**tokens)
    except ClientError as exc:
        code = exc.response["Error"].get("Code")
        cognito_msg = exc.response["Error"].get("Message", "")
        logger.warning("Cognito login error: %s - %s", code, cognito_msg)
        message_map = {
            "NotAuthorizedException": "Incorrect username or password.",
            "UserNotFoundException": "User not found.",
            "PasswordResetRequiredException": "Password reset required.",
            "UserNotConfirmedException": "User is not confirmed. Please verify your email.",
        }
        detail = message_map.get(code, cognito_msg or "Authentication failed.")
        raise HTTPException(status_code=401, detail=detail) from exc
    except Exception as exc:  # pragma: no cover
        logger.exception("Login failed: %s", exc)
        detail = "Login failed."
        if "credentials" in str(exc).lower() or "NoCredentialsError" in type(exc).__name__:
            detail = (
                "AWS credentials not configured. Set DEV_AUTH_BYPASS=true for local development."
            )
        raise HTTPException(status_code=500, detail=detail) from exc


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

    if not settings.COGNITO_CLIENT_ID:
        raise HTTPException(
            status_code=503,
            detail="Auth not configured. Set COGNITO_CLIENT_ID or DEV_AUTH_BYPASS=true for local development.",
        )

    client = _cognito_client()
    sign_up_kwargs: dict = {
        "ClientId": settings.COGNITO_CLIENT_ID,
        "Username": request.username,
        "Password": request.password,
        "UserAttributes": [
            {"Name": "email", "Value": request.email},
            {"Name": "given_name", "Value": request.first_name},
            {"Name": "family_name", "Value": request.last_name},
            {"Name": "nickname", "Value": request.nickname},
            {"Name": "birthdate", "Value": request.birthdate},
            {"Name": "preferred_username", "Value": request.username},
        ],
    }
    if settings.COGNITO_CLIENT_SECRET:
        sign_up_kwargs["SecretHash"] = _secret_hash(request.username)
    try:
        resp = client.sign_up(**sign_up_kwargs)
        return SignupResponse(
            user_sub=resp.get("UserSub"),
            user_confirmed=resp.get("UserConfirmed", False),
            message="Signup successful. Please check your email to verify your account."
            if not resp.get("UserConfirmed")
            else "Signup successful.",
        )
    except ClientError as exc:
        code = exc.response["Error"].get("Code")
        cognito_msg = exc.response["Error"].get("Message", "")
        logger.warning("Cognito signup error: %s - %s", code, cognito_msg)
        message_map = {
            "UsernameExistsException": "Username already exists. Try signing in or use a different username.",
            "InvalidPasswordException": "Password does not meet requirements. Use at least 8 characters with uppercase, lowercase, numbers and special characters.",
            "InvalidParameterException": cognito_msg or "Invalid input provided.",
            "CodeMismatchException": cognito_msg or "Invalid code.",
        }
        detail = message_map.get(code, cognito_msg or str(exc))
        status = 400 if code in message_map else 500
        raise HTTPException(status_code=status, detail=detail) from exc
    except ParamValidationError as exc:  # pragma: no cover
        logger.warning("Cognito signup param validation: %s", exc)
        raise HTTPException(status_code=400, detail="Invalid signup data (e.g. date format). Use YYYY-MM-DD for birthdate.") from exc
    except Exception as exc:  # pragma: no cover
        logger.exception("Signup failed: %s", exc)
        detail = "Signup failed."
        if "credentials" in str(exc).lower() or "NoCredentialsError" in type(exc).__name__:
            detail = (
                "AWS credentials not configured. Set DEV_AUTH_BYPASS=true for local development."
            )
        else:
            err_msg = str(exc).strip()
            if err_msg:
                detail = f"Signup failed: {err_msg}"
        raise HTTPException(status_code=500, detail=detail) from exc


@router.post("/confirm-signup", response_model=SignupResponse, tags=["auth"])
def confirm_signup(request: ConfirmSignupRequest):
    """Confirm signup with the verification code sent to email."""
    if settings.DEV_AUTH_BYPASS:
        return SignupResponse(
            user_sub="dev-user-123",
            user_confirmed=True,
            message="Account verified (dev mode).",
        )
    if not settings.COGNITO_CLIENT_ID:
        raise HTTPException(status_code=503, detail="Auth not configured.")
    client = _cognito_client()
    confirm_kwargs: dict = {
        "ClientId": settings.COGNITO_CLIENT_ID,
        "Username": request.username.strip(),
        "ConfirmationCode": request.confirmation_code.strip(),
    }
    if settings.COGNITO_CLIENT_SECRET:
        confirm_kwargs["SecretHash"] = _secret_hash(request.username)
    try:
        client.confirm_sign_up(**confirm_kwargs)
        return SignupResponse(
            user_sub="",
            user_confirmed=True,
            message="Account verified. You can sign in now.",
        )
    except ClientError as exc:
        code = exc.response["Error"].get("Code")
        message_map = {
            "CodeMismatchException": "Invalid or expired code. Request a new one.",
            "ExpiredCodeException": "Code has expired. Request a new one.",
            "UserNotFoundException": "User not found.",
        }
        detail = message_map.get(code, exc.response["Error"].get("Message", "Verification failed."))
        raise HTTPException(status_code=400, detail=detail) from exc


@router.post("/resend-signup-code", response_model=ForgotPasswordResponse, tags=["auth"])
def resend_signup_code(request: ForgotPasswordRequest):
    """Resend the signup verification code to the user's email."""
    if settings.DEV_AUTH_BYPASS:
        return ForgotPasswordResponse(message="Verification code sent (dev mode).")
    if not settings.COGNITO_CLIENT_ID:
        raise HTTPException(status_code=503, detail="Auth not configured.")
    client = _cognito_client()
    resend_kwargs: dict = {
        "ClientId": settings.COGNITO_CLIENT_ID,
        "Username": request.username.strip(),
    }
    if settings.COGNITO_CLIENT_SECRET:
        resend_kwargs["SecretHash"] = _secret_hash(request.username)
    try:
        client.resend_confirmation_code(**resend_kwargs)
        return ForgotPasswordResponse(message="Verification code sent. Check your email.")
    except ClientError as exc:
        code = exc.response["Error"].get("Code")
        message_map = {
            "LimitExceededException": "Too many attempts. Try again later.",
            "UserNotFoundException": "User not found.",
        }
        detail = message_map.get(code, "Could not send code.")
        raise HTTPException(status_code=400, detail=detail) from exc
