from backend.app.db import SessionLocal
from backend.app.models import ProcessedEmail, BloodBank
from datetime import datetime, timedelta
import random

def add_sample_data():
    db = SessionLocal()
    try:
        # Get the first blood bank
        blood_bank = db.query(BloodBank).first()
        if not blood_bank:
            print("No blood bank found. Please create a blood bank first.")
            return
        
        # Sample email data
        sample_emails = [
            {"sender": "john.doe@email.com", "subject": "Urgent: Need O+ Blood"},
            {"sender": "mary.smith@email.com", "subject": "Blood Request for Surgery"},
            {"sender": "patient.care@hospital.com", "subject": "Emergency Blood Requirement"},
            {"sender": "sarah.jones@email.com", "subject": "A+ Blood Needed"},
            {"sender": "emergency@clinic.com", "subject": "Critical Blood Request"},
            {"sender": "john.doe@email.com", "subject": "Follow-up Blood Request"},
            {"sender": "doctor.brown@hospital.com", "subject": "B- Blood Required"},
            {"sender": "nurse.wilson@clinic.com", "subject": "Blood Donation Request"},
        ]
        
        # Add emails with different timestamps
        for i, email_data in enumerate(sample_emails):
            # Create emails over the past 30 days
            days_ago = random.randint(0, 30)
            hours_ago = random.randint(0, 23)
            processed_time = datetime.now() - timedelta(days=days_ago, hours=hours_ago)
            
            processed_email = ProcessedEmail(
                message_id=f"msg_{i}_{int(processed_time.timestamp())}",
                sender=email_data["sender"],
                subject=email_data["subject"],
                processed_at=processed_time
            )
            db.add(processed_email)
        
        db.commit()
        print(f"Added {len(sample_emails)} sample processed emails for blood bank: {blood_bank.name}")
        
    except Exception as e:
        print(f"Error adding sample data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_sample_data()