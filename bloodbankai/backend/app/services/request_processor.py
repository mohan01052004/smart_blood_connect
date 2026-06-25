from app.services.normalizer import normalize_blood_group
from app.services.location_resolver import resolve_location

from app.services.inventory_matcher import (
    find_matching_inventory,
    rank_inventory_by_distance
)

from app.services.donor_matcher import (
    find_matching_donors,
    rank_donors_by_distance
)


def process_blood_request(parsed, db):
    blood_group = normalize_blood_group(parsed["blood_group"])
    location = parsed["location"]

    user_lat, user_lon = resolve_location(location)

    # 1️⃣ Try inventory
    inventory = find_matching_inventory(db, blood_group)
    if inventory:
        ranked_inventory = rank_inventory_by_distance(
            inventory, user_lat, user_lon, db
        )
        if ranked_inventory:
            return {
                "type": "inventory",
                "results": ranked_inventory
            }

    # 2️⃣ Donor fallback
    donors = find_matching_donors(db, blood_group)
    if donors:
        ranked_donors = rank_donors_by_distance(
            donors, user_lat, user_lon
        )
        return {
            "type": "donor",
            "results": ranked_donors
        }

    return {
        "type": "none",
        "results": []
    }
