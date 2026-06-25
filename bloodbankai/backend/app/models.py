from sqlalchemy import Column, Integer, String, Enum, DateTime, Float, ForeignKey, Boolean
from datetime import datetime
import enum
from app.db import Base


class BloodGroup(str, enum.Enum):
    A_POS = "A+"
    A_NEG = "A-"
    B_POS = "B+"
    B_NEG = "B-"
    O_POS = "O+"
    O_NEG = "O-"
    AB_POS = "AB+"
    AB_NEG = "AB-"


class DonorStatus(str, enum.Enum):
    AVAILABLE = "available"
    UNAVAILABLE = "unavailable"


class BloodBank(Base):
    __tablename__ = "blood_bank"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Donor(Base):
    __tablename__ = "donors"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    phone = Column(String, unique=True, nullable=False)
    email = Column(String, nullable=True)
    blood_group = Column(Enum(BloodGroup), nullable=False)
    location = Column(String, nullable=False)

    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    status = Column(Enum(DonorStatus), default=DonorStatus.AVAILABLE)
    last_donated_at = Column(DateTime, nullable=True)
    added_by_bank_id = Column(Integer, ForeignKey("blood_bank.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True)
    blood_bank_id = Column(Integer, ForeignKey("blood_bank.id"), nullable=False)
    blood_group = Column(Enum(BloodGroup), nullable=False)
    quantity = Column(Integer, default=0)
    updated_at = Column(DateTime, default=datetime.utcnow)


class ProcessedEmail(Base):
    __tablename__ = "processed_emails"

    id = Column(Integer, primary_key=True)
    message_id = Column(String, unique=True, index=True, nullable=False)
    sender = Column(String, nullable=False)
    subject = Column(String, nullable=True)
    processed_at = Column(DateTime, default=datetime.utcnow)
