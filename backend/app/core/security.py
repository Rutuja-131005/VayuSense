"""
Security Module
================
JWT token creation and verification, password hashing utilities.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.core.config import settings

# Monkeypatch bcrypt module to support modern bcrypt >= 4.0.0 (Python 3.12+ / 3.13+) with passlib
import logging
try:
    import bcrypt
    original_hashpw = bcrypt.hashpw
    original_checkpw = bcrypt.checkpw

    def patched_hashpw(password, salt):
        if isinstance(password, bytes) and len(password) > 72:
            password = password[:72]
        elif isinstance(password, str) and len(password.encode('utf-8')) > 72:
            password = password.encode('utf-8')[:72]
        return original_hashpw(password, salt)

    def patched_checkpw(password, hashed_password):
        if isinstance(password, bytes) and len(password) > 72:
            password = password[:72]
        elif isinstance(password, str) and len(password.encode('utf-8')) > 72:
            password = password.encode('utf-8')[:72]
        return original_checkpw(password, hashed_password)

    bcrypt.hashpw = patched_hashpw
    bcrypt.checkpw = patched_checkpw
except Exception as e:
    logging.warning(f"Failed to patch bcrypt for passlib compatibility: {e}")

# ── Password Hashing ─────────────────────────────────────────────
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ── OAuth2 Scheme ─────────────────────────────────────────────────
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def hash_password(password: str) -> str:
    """Hash a plaintext password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a bcrypt hash."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(
    data: dict, expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a JWT access token.

    Parameters
    ----------
    data : dict
        Payload to encode (must include 'sub' key with user identifier).
    expires_delta : timedelta, optional
        Custom token expiry duration.

    Returns
    -------
    str
        Encoded JWT token.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta
        or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> dict:
    """
    Decode and validate a JWT access token.

    Raises
    ------
    HTTPException
        If the token is invalid or expired.
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """
    FastAPI dependency that extracts the current user from the JWT token.
    """
    payload = decode_access_token(token)
    username: str = payload.get("sub")
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )
    return {"username": username}
