import os
import requests
from dotenv import load_dotenv

load_dotenv()

GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")
BASE_URL = "https://maps.googleapis.com/maps/api/distancematrix/json"


def get_distances(origin, destinations):
    """
    origin: (lat, lon)
    destinations: list of (lat, lon)
    """

    if not GOOGLE_MAPS_API_KEY:
        raise RuntimeError("Google Maps API key not set")

    origin_str = f"{origin[0]},{origin[1]}"
    destination_str = "|".join(
        [f"{lat},{lon}" for lat, lon in destinations]
    )

    params = {
        "origins": origin_str,
        "destinations": destination_str,
        "key": GOOGLE_MAPS_API_KEY,
        "units": "metric",
    }

    response = requests.get(BASE_URL, params=params)
    data = response.json()

    if data["status"] != "OK":
        raise RuntimeError(f"Google Maps API error: {data}")

    elements = data["rows"][0]["elements"]

    distances = []
    for element in elements:
        if element["status"] == "OK":
            distances.append({
                "distance_km": element["distance"]["value"] / 1000,
                "duration_min": element["duration"]["value"] / 60,
            })
        else:
            distances.append(None)

    return distances
