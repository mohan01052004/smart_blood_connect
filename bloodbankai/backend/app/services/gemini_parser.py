import os
import json
import re
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

MODEL_NAME = "models/gemini-2.5-flash"
model = genai.GenerativeModel(MODEL_NAME)


def extract_blood_group_regex(text: str) -> str:
    """Fallback regex extraction for blood group."""
    # Match patterns like: A+, A-, A +, A -, AB+, AB-, O+, O-, etc.
    pattern = r'\b(A|B|AB|O)\s*[+-]'
    match = re.search(pattern, text, re.IGNORECASE)
    if match:
        # Remove any spaces and return uppercase
        return match.group(0).replace(' ', '').upper()
    return None


def extract_location_regex(text: str) -> str:
    """Fallback regex extraction for location."""
    # Common patterns: "in <location>", "at <location>", "<location>, <state>"
    patterns = [
        r'(?:in|at|near|IN|AT|NEAR)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)',  # "in Bangalore" or "IN BANGALORE"
        r'([A-Za-z]+(?:\s+[A-Za-z]+)?)\s*,\s*([A-Za-z]+)',  # "Bangalore, Karnataka"
        r'\b([A-Z]{2,}[A-Z]+)\b',  # All caps words like "MARTHALLI", "BENGALURU"
        r'\b([A-Z][a-z]{3,})\b'  # Capitalized words like "Bangalore"
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            # Return the first captured group or full match
            location = match.group(1) if match.lastindex else match.group(0)
            # Skip common words that aren't locations
            if location.upper() not in ['BLOOD', 'NEEDED', 'URGENT', 'REQUIRED']:
                return location
    return None


def parse_blood_request(email_text: str) -> dict:
    prompt = f"""
You are an information extraction and classification system.

Analyze the email text below and determine:
1. Is it a genuine request for blood or blood donation (Yes/No)?
2. If it is a blood request, extract the relevant fields.

Return ONLY a valid JSON object. Do not add explanation.

Fields in JSON:
- is_blood_request (boolean: true if it is a genuine request for blood or blood donation, false if it is spam, newsletter, marketing, out-of-office reply, or unrelated conversation)
- blood_group (example: O+, A-, AB+ or null if not found)
- location (city / area / pincode if present, or null if not found)
- urgency (low / medium / high or null if not found)

Email:
\"\"\"
{email_text}
\"\"\"
"""

    try:
        response = model.generate_content(prompt)
        raw = response.text.strip()

        # Safety cleanup (Gemini sometimes wraps ```json)
        if raw.startswith("```"):
            raw = raw.replace("```json", "").replace("```", "").strip()

        result = json.loads(raw)
        
        # If Gemini didn't find blood group, try regex fallback
        if not result.get("blood_group"):
            blood_group = extract_blood_group_regex(email_text)
            if blood_group:
                result["blood_group"] = blood_group
        
        # If Gemini didn't find location, try regex fallback
        if not result.get("location"):
            location = extract_location_regex(email_text)
            if location:
                result["location"] = location

        # Ensure is_blood_request exists and is accurate
        if "is_blood_request" not in result:
            result["is_blood_request"] = bool(result.get("blood_group"))
        
        return result
    except:
        # If Gemini fails completely, use regex fallback
        blood_group = extract_blood_group_regex(email_text)
        location = extract_location_regex(email_text)
        return {
            "is_blood_request": bool(blood_group),
            "blood_group": blood_group,
            "location": location,
            "urgency": "medium"
        }
