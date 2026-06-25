import requests
import os

GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")


def calculate_distance_google(
    origin_lat: float,
    origin_lng: float,
    dest_lat: float,
    dest_lng: float,
):
    """
    Uses Google Distance Matrix API
    Returns distance_km and duration_min
    """

    if not GOOGLE_MAPS_API_KEY:
        raise RuntimeError("Google Maps API key not set")

    url = "https://maps.googleapis.com/maps/api/distancematrix/json"

    params = {
        "origins": f"{origin_lat},{origin_lng}",
        "destinations": f"{dest_lat},{dest_lng}",
        "key": GOOGLE_MAPS_API_KEY,
    }

    response = requests.get(url, params=params)
    data = response.json()

    if data.get("status") != "OK":
        raise RuntimeError(f"Maps API error: {data}")

    element = data["rows"][0]["elements"][0]

    if element.get("status") != "OK":
        raise RuntimeError("Distance calculation failed")

    distance_km = element["distance"]["value"] / 1000
    duration_min = element["duration"]["value"] / 60

    return {
        "distance_km": round(distance_km, 2),
        "duration_min": round(duration_min, 1),
    }
