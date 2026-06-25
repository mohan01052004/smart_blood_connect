BLOOD_MAP = {
    "O+": "O_POS",
    "O-": "O_NEG",
    "A+": "A_POS",
    "A-": "A_NEG",
    "B+": "B_POS",
    "B-": "B_NEG",
    "AB+": "AB_POS",
    "AB-": "AB_NEG",
}

def normalize_blood_group(value: str) -> str:
    value = value.strip().upper()
    if value not in BLOOD_MAP:
        raise ValueError(f"Unsupported blood group: {value}")
    return BLOOD_MAP[value]


def normalize_urgency(value: str) -> str:
    value = value.lower()
    if value not in {"low", "medium", "high"}:
        return "medium"
    return value
