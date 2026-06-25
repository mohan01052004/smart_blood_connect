from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import logging

from app.db import get_db
from app.models import Inventory, BloodBank
from app.schemas import InventoryCreate, InventoryOut
from app.security import get_current_blood_bank

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/inventory", tags=["Inventory"])


@router.get("/", response_model=List[InventoryOut])
def get_inventory(
    blood_bank: BloodBank = Depends(get_current_blood_bank),
    db: Session = Depends(get_db)
):
    """Get all inventory for the current blood bank."""
    try:
        logger.info(f"Getting inventory for blood bank {blood_bank.id}")
        inventory_items = db.query(Inventory).filter(Inventory.blood_bank_id == blood_bank.id).all()
        logger.info(f"Found {len(inventory_items)} inventory items")
        return inventory_items
    except Exception as e:
        logger.error(f"Error getting inventory: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.post("/", response_model=InventoryOut)
def create_inventory(
    inventory: InventoryCreate,
    blood_bank: BloodBank = Depends(get_current_blood_bank),
    db: Session = Depends(get_db)
):
    """Create a new inventory entry for the current blood bank."""
    db_item = Inventory(
        blood_bank_id=blood_bank.id,
        blood_group=inventory.blood_group,
        quantity=inventory.quantity
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.put("/{inventory_id}", response_model=InventoryOut)
def update_inventory(
    inventory_id: int,
    inventory: InventoryCreate,
    blood_bank: BloodBank = Depends(get_current_blood_bank),
    db: Session = Depends(get_db)
):
    """Update inventory entry (only for the current blood bank's items)."""
    db_item = db.query(Inventory).filter(
        Inventory.id == inventory_id,
        Inventory.blood_bank_id == blood_bank.id
    ).first()
    
    if not db_item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    
    db_item.blood_group = inventory.blood_group
    db_item.quantity = inventory.quantity
    db.commit()
    db.refresh(db_item)
    return db_item


@router.delete("/{inventory_id}")
def delete_inventory(
    inventory_id: int,
    blood_bank: BloodBank = Depends(get_current_blood_bank),
    db: Session = Depends(get_db)
):
    """Delete inventory entry (only for the current blood bank's items)."""
    db_item = db.query(Inventory).filter(
        Inventory.id == inventory_id,
        Inventory.blood_bank_id == blood_bank.id
    ).first()
    
    if not db_item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    
    db.delete(db_item)
    db.commit()
    return {"message": "Deleted successfully"}
