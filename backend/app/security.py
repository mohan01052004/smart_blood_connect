import os
import hashlib
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.db import get_db
from app.models import BloodBank
from sqlalchemy.orm import Session

# JWT config
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

security = HTTPBearer()


def hash_password(password: str) -> str:
    """Hash a password using SHA256 with salt."""
    salt = "blooddot_salt_2024"  # In production, use a random salt per user
    return hashlib.sha256((password + salt).encode()).hexdigest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return hash_password(plain_password) == hashed_password


def create_access_token(
    blood_bank_id: int, 
    expires_delta: Optional[timedelta] = None
) -> str:
    """Create a JWT access token."""
    if expires_delta is None:
        expires_delta = timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    
    expire = datetime.utcnow() + expires_delta
    to_encode = {
        "blood_bank_id": blood_bank_id,
        "exp": expire
    }
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> dict:
    """Decode and validate a JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        blood_bank_id: int = payload.get("blood_bank_id")
        if blood_bank_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        return {"blood_bank_id": blood_bank_id}
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )


async def get_current_blood_bank(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> BloodBank:
    """Get the current authenticated blood bank from the JWT token."""
    token_data = decode_token(credentials.credentials)
    blood_bank_id = token_data["blood_bank_id"]
    
    blood_bank = db.query(BloodBank).filter(BloodBank.id == blood_bank_id).first()
    if not blood_bank:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Blood bank not found"
        )
    
    if not blood_bank.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Blood bank account is inactive"
        )
    
    return blood_bank
