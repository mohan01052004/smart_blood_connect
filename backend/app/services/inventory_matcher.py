from app.models import Inventory, BloodBank
from app.services.google_maps import get_distances
from sqlalchemy.orm import Session


def find_matching_inventory(db: Session, blood_group):
    """Find all inventory items matching the blood group across all blood banks."""
    # Normalize blood group to match enum format
    if isinstance(blood_group, str):
        blood_group = blood_group.upper().strip()
    
    results = db.query(Inventory).filter(
        Inventory.blood_group == blood_group,
        Inventory.quantity > 0
    ).all()
    
    return results


def rank_inventory_by_distance(inventory, user_lat=None, user_lon=None, db=None):
    """
    Rank inventory by distance and quantity.
    Uses blood bank coordinates from BloodBank table for distance calculation.
    """
    if not inventory or not db:
        return []

    ranked = []
    bank_locations = []
    bank_ids = [inv.blood_bank_id for inv in inventory]
    
    # Get blood bank coordinates from database
    blood_banks = db.query(BloodBank).filter(BloodBank.id.in_(bank_ids)).all()
    bank_coords = {bb.id: (bb.latitude, bb.longitude) for bb in blood_banks}
    
    # Collect locations
    for inv in inventory:
        if inv.blood_bank_id in bank_coords:
            bank_locations.append(bank_coords[inv.blood_bank_id])
        else:
            bank_locations.append(None)
    
    # If we have valid user location and at least one bank location, get distances
    distances = []
    if user_lat and user_lon and user_lat != 0 and user_lon != 0 and any(loc is not None for loc in bank_locations):
        try:
            valid_locations = [loc for loc in bank_locations if loc is not None]
            distances = get_distances((user_lat, user_lon), valid_locations)
        except Exception as e:
            print(f"Failed to get distances: {e}")
    
    # Build ranked list with distance info
    distance_idx = 0
    for idx, inv in enumerate(inventory):
        bank_coords_tuple = bank_coords.get(inv.blood_bank_id)
        blood_bank = db.query(BloodBank).filter(BloodBank.id == inv.blood_bank_id).first()
        
        bank_name = blood_bank.name if blood_bank else "Unknown Bank"
        bank_phone = blood_bank.phone if blood_bank else "N/A"
        bank_address = blood_bank.address if blood_bank else "N/A"
        
        item = {
            "bank_name": bank_name,
            "bank_phone": bank_phone,
            "bank_address": bank_address,
            "blood_group": inv.blood_group.value,
            "units": inv.quantity,
            "distance_km": 0,
            "duration_min": 0,
        }
        
        # Add distance if available
        if bank_locations[idx] is not None and distance_idx < len(distances):
            if distances[distance_idx] is not None:
                item["distance_km"] = distances[distance_idx]["distance_km"]
                item["duration_min"] = distances[distance_idx]["duration_min"]
            distance_idx += 1
        
        ranked.append(item)
    
    # Sort by distance first, then by quantity
    ranked.sort(key=lambda x: (x["distance_km"] if x["distance_km"] > 0 else float('inf'), -x["units"]))
    return ranked
