from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import BloodBank
from app.schemas import BloodBankSignup, BloodBankLogin, BloodBankOut, TokenResponse
from app.security import hash_password, verify_password, create_access_token, get_current_blood_bank

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/signup", response_model=TokenResponse)
def signup(
    data: BloodBankSignup,
    db: Session = Depends(get_db)
):
    """
    Register a new blood bank.
    """
    # Check if email already exists
    existing = db.query(BloodBank).filter(BloodBank.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new blood bank
    hashed_password = hash_password(data.password)
    blood_bank = BloodBank(
        name=data.name,
        email=data.email,
        password=hashed_password,
        phone=data.phone,
        address=data.address,
        latitude=data.latitude,
        longitude=data.longitude,
        is_active=True
    )
    
    db.add(blood_bank)
    db.commit()
    db.refresh(blood_bank)
    
    # Generate token
    access_token = create_access_token(blood_bank.id)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "blood_bank": BloodBankOut.from_orm(blood_bank)
    }


@router.post("/login", response_model=TokenResponse)
def login(
    data: BloodBankLogin,
    db: Session = Depends(get_db)
):
    """
    Login with email and password.
    """
    blood_bank = db.query(BloodBank).filter(BloodBank.email == data.email).first()
    
    if not blood_bank or not verify_password(data.password, blood_bank.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not blood_bank.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Blood bank account is inactive"
        )
    
    # Generate token
    access_token = create_access_token(blood_bank.id)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "blood_bank": BloodBankOut.from_orm(blood_bank)
    }


@router.get("/me", response_model=BloodBankOut)
def get_current_user(
    blood_bank: BloodBank = Depends(get_current_blood_bank)
):
    """
    Get current authenticated blood bank profile.
    """
    return BloodBankOut.from_orm(blood_bank)
