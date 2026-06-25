from app.services.email_reader import fetch_unread_emails
from app.services.gemini_parser import parse_blood_request
from app.services.request_processor import process_blood_request
from app.services.reply_builder import build_inventory_reply, build_donor_alert_message, build_donor_reply
from app.services.email_sender import send_email, extract_sender_email
from app.db import SessionLocal
from app.models import ProcessedEmail


def run_auto_reply():
    emails = fetch_unread_emails()
    if not emails:
        print("No new emails")
        return

    db = SessionLocal()

    for email in emails:
        try:
            message_id = email.get("message_id")

            # 1️⃣ Skip if already processed
            existing = db.query(ProcessedEmail).filter(
                ProcessedEmail.message_id == message_id
            ).first()

            if existing:
                print("⏭️ Email already processed, skipping")
                continue

            # 2️⃣ Parse email using Gemini
            parsed = parse_blood_request(email["body"])
            if not parsed:
                print("⚠️ Failed to parse email")
                continue

            is_blood_request = parsed.get("is_blood_request", False)
            if not is_blood_request:
                print(f"🚫 SKIPPING SPAM/NON-REQUEST: Message {message_id} from {email['from']} is not a blood request.")
                # Mark email as processed
                processed = ProcessedEmail(
                    message_id=message_id,
                    sender=email["from"],
                    subject=email["subject"]
                )
                db.add(processed)
                db.commit()
                continue

            # 3️⃣ Process request (returns dict)
            result = process_blood_request(parsed, db)
            print(f"🔍 Result type: {result['type']}")
            print(f"🔍 Results count: {len(result.get('results', []))}")

            reply = "❌ Sorry, no blood banks or donors available nearby."
            
            if result["type"] == "inventory":
                try:
                    reply = build_inventory_reply(result["results"])
                    print("📦 Inventory reply built")
                except Exception as e:
                    print(f"❌ Error building inventory reply: {e}")

            elif result["type"] == "donor":
                reply = build_donor_reply(result["results"])
                print("👥 Donor reply built")

            to_email = extract_sender_email(email["from"])
            print(f"📧 Sending to: {to_email}")
            print(f"📝 Reply content: {reply[:100]}...")
            
            if reply and to_email:
                send_email(
                    to_email=to_email,
                    subject="Blood Availability Near You",
                    body=reply
                )
                print("✅ Reply sent")

                # 4️⃣ Mark email as processed
                processed = ProcessedEmail(
                    message_id=message_id,
                    sender=email["from"],
                    subject=email["subject"]
                )
                db.add(processed)
                db.commit()
                print(f"✅ Email {message_id} marked as processed")
            else:
                print("⚠️ No reply or email to send")

        except Exception as e:
            print(f"❌ Exception: {e}")

    db.close()
