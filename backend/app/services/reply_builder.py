# --------------------------------------------------
# INVENTORY REPLY
# --------------------------------------------------
def build_inventory_reply(inventory_list):
    if not inventory_list:
        return "No blood banks available nearby."

    lines = ["Blood Bank Available Near You:\n"]

    for idx, item in enumerate(inventory_list, start=1):
        distance_info = ""
        if item.get('distance_km', 0) > 0:
            distance_info = f"Distance: {item['distance_km']:.1f} km | {item['duration_min']:.0f} mins\n"
        
        lines.append(
            f"{idx}. {item['bank_name']}\n"
            f"   Address: {item.get('bank_address', 'N/A')}\n"
            f"   Phone: {item.get('bank_phone', 'N/A')}\n"
            f"   Blood Group: {item['blood_group']}\n"
            f"   Units Available: {item['units']}\n"
            f"   {distance_info}"
        )

    return "\n".join(lines)


# --------------------------------------------------
# DONOR LIST REPLY (TO REQUESTER)
# --------------------------------------------------
def build_donor_reply(donors):
    if not donors:
        return None

    lines = ["Nearby Blood Donors:\n"]

    for idx, donor in enumerate(donors, start=1):
        distance_info = ""
        if donor.get('distance_km') is not None and donor.get('duration_min') is not None:
            distance_info = f" {donor['distance_km']} km | {donor['duration_min']} mins\n"
        
        lines.append(
            f"{idx}️⃣ {donor['name']}\n"
            f"{donor.get('location', 'Nearby')}\n"
            f"{donor['phone']}\n"
            f"{distance_info}"
        )

    lines.append(
        "\n⚠️ Please contact donors directly. "
        "Donate responsibly and verify eligibility."
    )

    return "\n".join(lines)


# --------------------------------------------------
# DONOR ALERT MESSAGE (TO DONORS – future use)
# --------------------------------------------------
def build_donor_alert_message(request_details):
    return (
        "🩸 URGENT BLOOD REQUEST\n\n"
        f"Blood Group: {request_details['blood_group']}\n"
        f"Location: {request_details['location']}\n\n"
        "If you are available to donate, please respond immediately.\n"
        "Thank you for saving a life ❤️"
    )
