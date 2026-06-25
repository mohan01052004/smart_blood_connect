from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.services.email_reader import fetch_unread_emails
from app.services.gemini_parser import parse_blood_request
from app.services.donor_matcher import find_matching_donors, rank_donors_by_distance
from app.services.inventory_matcher import find_matching_inventory, rank_inventory_by_distance
from app.services.reply_builder import build_donor_reply, build_inventory_reply
from app.services.email_sender import send_email
from app.services.location_resolver import resolve_location
from app.services.translator import detect_language, translate_reply
from app.models import ProcessedEmail, BloodBank
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter(prefix="/email", tags=["Email"])


class EmailResponse(BaseModel):
    sender: str
    subject: str
    parsed_data: dict
    matched_donors: List[dict]
    matched_inventory: List[dict]
    reply_message: str
    status: str


@router.get("/process", response_model=List[EmailResponse])
def process_emails(db: Session = Depends(get_db)):
    """
    Fetch unread emails, parse them, match with database, and generate responses.
    Emails are assigned to the first active blood bank (for single blood bank setup).
    """
    # Get the first active blood bank to assign emails to
    blood_bank = db.query(BloodBank).filter(BloodBank.is_active == True).first()
    if not blood_bank:
        return [{
            "sender": "system",
            "subject": "Error",
            "parsed_data": {},
            "matched_donors": [],
            "matched_inventory": [],
            "reply_message": "No active blood bank found. Please register a blood bank first.",
            "status": "error",
        }]
    
    try:
        # Fetch unread emails
        print("Starting email fetch...")
        emails = fetch_unread_emails()
        print(f"Found {len(emails)} unread emails")
        responses = []

        for email_data in emails:
            sender = email_data.get("sender")
            subject = email_data.get("subject")
            body = email_data.get("body")
            message_id = email_data.get("message_id")

            # Check if already processed
            existing = db.query(ProcessedEmail).filter(
                ProcessedEmail.message_id == message_id
            ).first()
            if existing:
                print(f"⏭️ SKIPPING (already processed): {message_id} from {sender}")
                continue

            print(f"📨 PROCESSING NEW EMAIL: {message_id} from {sender}")

            # Detect language of the email
            email_text = f"Subject: {subject}\n\n{body}"
            detected_language = detect_language(email_text)
            print(f"Detected language: {detected_language}")

            # Parse email content using Gemini (include subject for better detection)
            try:
                parsed_data = parse_blood_request(email_text)
            except Exception as e:
                parsed_data = {"is_blood_request": False, "error": str(e), "blood_group": None, "location": None}

            is_blood_request = parsed_data.get("is_blood_request", False)
            if not is_blood_request:
                print(f"🚫 SKIPPING SPAM/NON-REQUEST: Message {message_id} from {sender} is not a blood request.")
                # Mark email as processed globally so we don't fetch/process it again next time
                processed = ProcessedEmail(
                    message_id=message_id,
                    sender=sender,
                    subject=subject
                )
                db.add(processed)
                db.commit()
                continue

            blood_group = parsed_data.get("blood_group")
            location = parsed_data.get("location")
            urgency = parsed_data.get("urgency", "medium")
            
            # Handle multiple blood groups - convert to list if single value
            if blood_group and not isinstance(blood_group, list):
                blood_group = [blood_group]
            
            print(f"Parsed: blood_group={blood_group}, location={location}")
            
            # Filter out invalid locations
            if location and location.lower() in ['subject', 'none', 'null', 'n/a']:
                location = None
                print(f"Filtered out invalid location, now location={location}")

            matched_donors = []
            matched_inventory = []
            reply_message = ""
            location_note = ""

            # Geocode location to get user lat/lon for distance calculation
            user_lat, user_lon = 0, 0
            if location:
                try:
                    user_lat, user_lon = resolve_location(location)
                    print(f"Geocoded location to: {user_lat}, {user_lon}")
                except Exception as e:
                    print(f"⚠️ Failed to geocode location '{location}': {e}")
                    location_note = "\n\nNote: We couldn't calculate distance as the location you provided could not be identified. Please provide a valid city name for accurate distance calculation."
            else:
                print("No valid location provided, skipping geocoding")

            # Match with database for each blood group
            if blood_group:
                for bg in blood_group:
                    print(f"Searching for blood group: {bg}")
                    
                    bg_reply = ""
                    
                    # Find matching donors
                    donors = find_matching_donors(db, bg)
                    print(f"Found {len(donors)} matching donors for {bg}")
                    if donors:
                        ranked_donors = rank_donors_by_distance(donors, user_lat, user_lon)
                        matched_donors.extend(ranked_donors)
                        donor_reply = build_donor_reply(ranked_donors)
                        if donor_reply:
                            bg_reply += donor_reply + "\n\n"

                    # Find matching inventory
                    inventory = find_matching_inventory(db, bg)
                    print(f"Found {len(inventory)} matching inventory items for {bg}")
                    if inventory:
                        matched_inventory_with_dist = rank_inventory_by_distance(inventory, user_lat, user_lon, db)
                        print(f"Ranked inventory: {len(matched_inventory_with_dist)} items for {bg}")
                        matched_inventory.extend([
                            {
                                "blood_group": i["blood_group"],
                                "bank": i["bank_name"],
                                "quantity": i["units"],
                                "distance_km": i["distance_km"],
                                "duration_min": i["duration_min"],
                            }
                            for i in matched_inventory_with_dist
                        ])
                        inventory_reply = build_inventory_reply(matched_inventory_with_dist)
                        if inventory_reply:
                            bg_reply += inventory_reply
                            print(f"Added inventory reply for {bg}")
                    
                    # Add section for this blood group
                    if bg_reply:
                        reply_message += f"\n--- Blood Group {bg} ---\n" + bg_reply + "\n"
                    else:
                        reply_message += f"\n--- Blood Group {bg} ---\n❌ Sorry, {bg} blood is not available at the moment.\n\n"
            else:
                print("No blood group found, skipping matching")
            
            # Add location note if location was invalid
            if location_note:
                reply_message += location_note
                print("Added location note to reply")

            print(f"Reply message length: {len(reply_message)}")
            
            # If no match found
            if not reply_message:
                if not blood_group:
                    reply_message = "❌ Sorry, we couldn't identify the blood group from your request. Please specify a blood group (A+, B-, O+, etc.)."
                else:
                    reply_message = "❌ Sorry, no matching blood donors or inventory found for your request."

            # Translate reply to the detected language
            if detected_language.lower() != "english":
                print(f"Translating reply to {detected_language}...")
                reply_message = translate_reply(reply_message, detected_language)

            # Mark email as processed
            processed = ProcessedEmail(
                message_id=message_id,
                sender=sender,
                subject=subject
            )
            db.add(processed)
            db.commit()
            print(f"✅ RECORDED: {message_id} from {sender} marked as processed for {blood_bank.name}")

            # Send reply email
            try:
                print(f"Attempting to send reply to {sender}...")
                send_email(
                    to_email=sender,
                    subject=f"Re: {subject}",
                    body=reply_message
                )
                status = "success"
                print(f"📧 SENT REPLY to {sender}")
            except Exception as e:
                status = f"reply_failed: {str(e)}"
                print(f"❌ FAILED TO SEND to {sender}: {e}")
                import traceback
                traceback.print_exc()

            responses.append({
                "sender": sender,
                "subject": subject,
                "parsed_data": parsed_data,
                "matched_donors": matched_donors,
                "matched_inventory": matched_inventory,
                "reply_message": reply_message,
                "status": status,
            })

        return responses

    except Exception as e:
        return [{
            "sender": "system",
            "subject": "Error",
            "parsed_data": {},
            "matched_donors": [],
            "matched_inventory": [],
            "reply_message": f"Error processing emails: {str(e)}",
            "status": "error",
        }]


@router.post("/manual-process")
def manual_process_email(
    sender: str,
    blood_group: str,
    location: str,
    db: Session = Depends(get_db)
):
    """
    Manually process an email request (for testing without Gmail).
    """
    matched_donors = []
    matched_inventory = []
    reply_message = ""

    # Geocode location to get user lat/lon for distance calculation
    user_lat, user_lon = 0, 0
    if location:
        try:
            user_lat, user_lon = resolve_location(location)
        except Exception as e:
            print(f"⚠️ Failed to geocode location '{location}': {e}")

    if blood_group:
        # Find matching donors
        donors = find_matching_donors(db, blood_group)
        if donors:
            matched_donors = rank_donors_by_distance(donors, user_lat, user_lon)
            donor_reply = build_donor_reply(matched_donors)
            if donor_reply:
                reply_message += donor_reply + "\n\n"

        # Find matching inventory
        inventory = find_matching_inventory(db, blood_group)
        if inventory:
            matched_inventory_with_dist = rank_inventory_by_distance(inventory, user_lat, user_lon, db)
            matched_inventory = [
                {
                    "blood_group": i["blood_group"],
                    "bank": i["bank_name"],
                    "quantity": i["units"],
                    "distance_km": i["distance_km"],
                    "duration_min": i["duration_min"],
                }
                for i in matched_inventory_with_dist
            ]
            inventory_reply = build_inventory_reply(matched_inventory_with_dist)
            if inventory_reply:
                reply_message += inventory_reply

    if not reply_message:
        reply_message = "❌ Sorry, no matching blood donors or inventory found for your request."

    return {
        "sender": sender,
        "blood_group": blood_group,
        "location": location,
        "matched_donors": matched_donors,
        "matched_inventory": matched_inventory,
        "reply_message": reply_message,
    }
