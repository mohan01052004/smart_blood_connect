from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
from pydantic import BaseModel

from app.db import get_db
from app.models import Donor, BloodBank, DonorStatus
from app.schemas import DonorCreate, DonorOut
from app.services.location_resolver import resolve_location
from app.security import get_current_blood_bank

COOLING_PERIOD_DAYS = 180  # 6 months

router = APIRouter(prefix="/donors", tags=["Donors"])


class LastDonatedUpdate(BaseModel):
    last_donated_at: Optional[datetime] = None


@router.post("/", response_model=DonorOut)
def create_donor(
    donor: DonorCreate,
    blood_bank: BloodBank = Depends(get_current_blood_bank),
    db: Session = Depends(get_db)
):
    # Check duplicate phone
    existing_donor = db.query(Donor).filter(Donor.phone == donor.phone).first()
    if existing_donor:
        raise HTTPException(status_code=400, detail="Phone already registered")

    # Convert location to lat/lng
    try:
        lat, lng = resolve_location(donor.location)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid donor location")

    # Determine eligibility based on last donation date
    status = DonorStatus.AVAILABLE
    if donor.last_donated_at:
        cooling_cutoff = datetime.utcnow() - timedelta(days=COOLING_PERIOD_DAYS)
        if donor.last_donated_at > cooling_cutoff:
            status = DonorStatus.UNAVAILABLE

    new_donor = Donor(
        name=donor.name,
        phone=donor.phone,
        email=donor.email,
        blood_group=donor.blood_group,
        location=donor.location,
        latitude=lat,
        longitude=lng,
        last_donated_at=donor.last_donated_at,
        status=status,
        added_by_bank_id=blood_bank.id
    )

    db.add(new_donor)
    db.commit()
    db.refresh(new_donor)
    return new_donor


@router.get("/", response_model=list[DonorOut])
def list_donors(db: Session = Depends(get_db)):
    return db.query(Donor).all()


@router.patch("/{donor_id}/last-donated", response_model=DonorOut)
def update_last_donated(
    donor_id: int,
    body: LastDonatedUpdate,
    _: BloodBank = Depends(get_current_blood_bank),  # any authenticated bank
    db: Session = Depends(get_db)
):
    """Update a donor's last donation date. Any blood bank can do this.
    Status is automatically recomputed based on the 6-month cooling period."""
    donor = db.query(Donor).filter(Donor.id == donor_id).first()
    if not donor:
        raise HTTPException(status_code=404, detail="Donor not found")

    donor.last_donated_at = body.last_donated_at

    # Recompute status
    if body.last_donated_at:
        cooling_cutoff = datetime.utcnow() - timedelta(days=COOLING_PERIOD_DAYS)
        donor.status = DonorStatus.UNAVAILABLE if body.last_donated_at > cooling_cutoff else DonorStatus.AVAILABLE
    else:
        donor.status = DonorStatus.AVAILABLE

    db.commit()
    db.refresh(donor)
    return donor


@router.delete("/{donor_id}")
def delete_donor(
    donor_id: int,
    blood_bank: BloodBank = Depends(get_current_blood_bank),
    db: Session = Depends(get_db)
):
    """Delete a donor — only allowed if this blood bank registered them."""
    donor = db.query(Donor).filter(Donor.id == donor_id).first()

    if not donor:
        raise HTTPException(status_code=404, detail="Donor not found")

    if donor.added_by_bank_id != blood_bank.id:
        raise HTTPException(
            status_code=403,
            detail="You can only delete donors that your blood bank registered"
        )

    db.delete(donor)
    db.commit()
    return {"message": "Donor deleted successfully"}
