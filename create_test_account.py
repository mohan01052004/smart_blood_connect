from backend.app.db import SessionLocal
from backend.app.models import BloodBank
from backend.app.security import hash_password

def create_test_account():
    db = SessionLocal()
    try:
        # Check if test account already exists
        existing = db.query(BloodBank).filter(BloodBank.email == "test@bloodbank.com").first()
        if existing:
            print("Test account already exists!")
            print(f"Email: test@bloodbank.com")
            print(f"Password: password123")
            return
        
        # Create test blood bank
        hashed_password = hash_password("password123")
        blood_bank = BloodBank(
            name="Test Blood Bank",
            email="test@bloodbank.com",
            password=hashed_password,
            phone="+1234567890",
            address="123 Test Street, Test City",
            latitude=40.7128,
            longitude=-74.0060,
            is_active=True
        )
        
        db.add(blood_bank)
        db.commit()
        db.refresh(blood_bank)
        
        print("Test account created successfully!")
        print(f"Email: test@bloodbank.com")
        print(f"Password: password123")
        print(f"Blood Bank ID: {blood_bank.id}")
        
    except Exception as e:
        print(f"Error creating test account: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_test_account()