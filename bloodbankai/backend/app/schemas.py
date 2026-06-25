from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime
from enum import Enum


class BloodGroup(str, Enum):
    A_POS = "A+"
    A_NEG = "A-"
    B_POS = "B+"
    B_NEG = "B-"
    O_POS = "O+"
    O_NEG = "O-"
    AB_POS = "AB+"
    AB_NEG = "AB-"


class DonorStatus(str, Enum):
    AVAILABLE = "available"
    UNAVAILABLE = "unavailable"


# ========================
# Blood Bank Auth Schemas
# ========================
class BloodBankSignup(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    address: Optional[str] = None
    latitude: float
    longitude: float


class BloodBankLogin(BaseModel):
    email: EmailStr
    password: str


class BloodBankOut(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    latitude: float
    longitude: float
    is_active: bool
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    blood_bank: BloodBankOut


# ========================
# Donor Schemas
# ========================
class DonorCreate(BaseModel):
    name: str
    phone: str
    email: str
    blood_group: BloodGroup
    location: str
    last_donated_at: Optional[datetime] = None


class DonorOut(BaseModel):
    id: int
    name: str
    phone: str
    email: Optional[str] = None
    blood_group: BloodGroup
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: DonorStatus
    last_donated_at: Optional[datetime] = None
    added_by_bank_id: Optional[int] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ========================
# Inventory Schemas
# ========================
class InventoryCreate(BaseModel):
    blood_group: BloodGroup
    quantity: int = 0


class InventoryOut(BaseModel):
    id: int
    blood_bank_id: int
    blood_group: BloodGroup
    quantity: int
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
