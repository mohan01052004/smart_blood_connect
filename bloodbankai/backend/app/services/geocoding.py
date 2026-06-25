import requests
import os
from dotenv import load_dotenv

load_dotenv()

GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")


def _geocode_google(location_text: str) -> tuple[float, float]:
    """Try Google Maps Geocoding API."""
    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {"address": location_text, "key": GOOGLE_MAPS_API_KEY}
    response = requests.get(url, params=params, timeout=5)
    data = response.json()
    print("Google geocoding response:", data.get("status"))
    if data.get("status") != "OK":
        raise ValueError(f"Google geocoding failed: {data.get('status')}")
    loc = data["results"][0]["geometry"]["location"]
    return loc["lat"], loc["lng"]


def _geocode_nominatim(location_text: str) -> tuple[float, float]:
    """Fallback: OpenStreetMap Nominatim (free, no API key needed)."""
    url = "https://nominatim.openstreetmap.org/search"
    params = {"q": location_text, "format": "json", "limit": 1}
    headers = {"User-Agent": "BloodDot/1.0"}
    response = requests.get(url, params=params, headers=headers, timeout=5)
    results = response.json()
    print("Nominatim geocoding results count:", len(results))
    if not results:
        raise ValueError(f"Nominatim: no results for '{location_text}'")
    return float(results[0]["lat"]), float(results[0]["lon"])


def geocode_location(location_text: str) -> tuple[float, float]:
    """Geocode a location string to (lat, lon). Tries Google Maps first, falls back to Nominatim."""
    # Try Google Maps if API key is available
    if GOOGLE_MAPS_API_KEY:
        try:
            return _geocode_google(location_text)
        except Exception as e:
            print(f"Google Maps geocoding failed ({e}), trying Nominatim fallback...")

    # Fallback to Nominatim
    return _geocode_nominatim(location_text)
