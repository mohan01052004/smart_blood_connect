from app.models import Donor, DonorStatus
from app.services.maps import calculate_distance_google
from datetime import datetime, timedelta

COOLING_PERIOD_DAYS = 180  # 6 months


def find_matching_donors(db, blood_group):
    cooling_cutoff = datetime.utcnow() - timedelta(days=COOLING_PERIOD_DAYS)
    return (
        db.query(Donor)
        .filter(
            Donor.blood_group == blood_group,
            Donor.status == DonorStatus.AVAILABLE,
            # Extra safety: exclude donors who donated within cooling period
            (Donor.last_donated_at == None) | (Donor.last_donated_at <= cooling_cutoff)
        )
        .all()
    )


def rank_donors_by_distance(donors, user_lat, user_lon):
    ranked = []

    for donor in donors:
        if donor.latitude is None or donor.longitude is None:
            continue

        # If user location is not available (0,0), skip distance calculation
        if user_lat == 0 and user_lon == 0:
            ranked.append({
                "name": donor.name,
                "email": donor.email,
                "phone": donor.phone,
                "distance_km": None,
                "duration_min": None
            })
        else:
            distance = calculate_distance_google(
                user_lat, user_lon,
                donor.latitude, donor.longitude
            )

            ranked.append({
                "name": donor.name,
                "email": donor.email,
                "phone": donor.phone,
                "distance_km": distance["distance_km"],
                "duration_min": distance["duration_min"]
            })

    # Sort by distance only if distances are available
    if ranked and ranked[0]["distance_km"] is not None:
        ranked.sort(key=lambda x: x["distance_km"])
    return ranked[:5]   # Top 5 nearest donors
