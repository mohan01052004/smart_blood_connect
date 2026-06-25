from app.services.geocoding import geocode_location

def resolve_location(location_text: str) -> tuple[float, float]:
    print(f"Resolving location: {location_text}")

    try:
        lat, lon = geocode_location(location_text)
        print(f"Location resolved: {lat}, {lon}")
        return lat, lon
    except Exception as e:
        print("Geocoding failed:", str(e))
        raise ValueError("Location not supported yet") from e
