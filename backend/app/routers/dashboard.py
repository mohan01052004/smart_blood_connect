from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.db import get_db
from app.models import ProcessedEmail, BloodBank, Inventory
from app.security import get_current_blood_bank

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/my-stats")
def get_my_stats(
    blood_bank: BloodBank = Depends(get_current_blood_bank),
    db: Session = Depends(get_db)
):
    """Get stats specific to the currently logged-in blood bank."""
    try:
        inventory_items = db.query(Inventory).filter(
            Inventory.blood_bank_id == blood_bank.id
        ).all()

        total_units = sum(item.quantity for item in inventory_items)
        available_groups = [item for item in inventory_items if item.quantity > 0]

        inventory_by_group = [
            {"blood_group": item.blood_group.value, "quantity": item.quantity}
            for item in inventory_items
        ]

        return {
            "blood_bank": {
                "id": blood_bank.id,
                "name": blood_bank.name,
                "email": blood_bank.email,
                "phone": blood_bank.phone,
                "address": blood_bank.address,
                "is_active": blood_bank.is_active,
                "created_at": blood_bank.created_at.isoformat() if blood_bank.created_at else None,
            },
            "inventory_stats": {
                "total_units": total_units,
                "blood_groups_count": len(inventory_items),
                "available_groups": len(available_groups),
                "inventory_by_group": inventory_by_group,
            }
        }
    except Exception as e:
        return {
            "blood_bank": {},
            "inventory_stats": {
                "total_units": 0,
                "blood_groups_count": 0,
                "available_groups": 0,
                "inventory_by_group": [],
            }
        }

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get all dashboard statistics from processed_emails table"""
    
    try:
        # Get current date boundaries
        today = datetime.now().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)
        
        # Total requests processed
        total_requests = db.query(ProcessedEmail).count()
        print(f"Debug: Total requests found: {total_requests}")
        
        # Today's requests
        today_requests = db.query(ProcessedEmail).filter(
            func.date(ProcessedEmail.processed_at) == today
        ).count()
        
        # Weekly requests
        weekly_requests = db.query(ProcessedEmail).filter(
            func.date(ProcessedEmail.processed_at) >= week_ago
        ).count()
        
        # Monthly requests
        monthly_requests = db.query(ProcessedEmail).filter(
            func.date(ProcessedEmail.processed_at) >= month_ago
        ).count()
        
        # Unique requesters
        unique_requesters = db.query(func.count(func.distinct(ProcessedEmail.sender))).scalar()
        
        # Top requesters
        top_requesters = db.query(
            ProcessedEmail.sender,
            func.count(ProcessedEmail.sender).label('request_count')
        ).group_by(ProcessedEmail.sender).order_by(
            func.count(ProcessedEmail.sender).desc()
        ).limit(5).all()
        
        # Recent emails
        recent_emails = db.query(ProcessedEmail).order_by(
            ProcessedEmail.processed_at.desc()
        ).limit(5).all()
        print(f"Debug: Recent emails count: {len(recent_emails)}")
        
        # Calculate average daily requests
        if total_requests > 0:
            # Get the date of first email
            first_email = db.query(ProcessedEmail).order_by(ProcessedEmail.processed_at.asc()).first()
            if first_email:
                days_active = (datetime.now() - first_email.processed_at).days + 1
                avg_daily = total_requests / days_active if days_active > 0 else total_requests
            else:
                avg_daily = 0
        else:
            avg_daily = 0
        
        result = {
            "service_stats": {
                "total_requests_processed": total_requests,
                "today_processed": today_requests,
                "weekly_processed": weekly_requests,
                "monthly_processed": monthly_requests,
                "unique_requesters": unique_requesters,
                "avg_daily_requests": round(avg_daily, 1)
            },
            "top_requesters": [
                {
                    "sender": req.sender,
                    "request_count": req.request_count
                }
                for req in top_requesters
            ],
            "recent_emails": [
                {
                    "sender": email.sender,
                    "subject": email.subject,
                    "processed_at": email.processed_at.isoformat()
                }
                for email in recent_emails
            ]
        }
        print(f"Debug: Returning result: {result}")
        return result
    except Exception as e:
        print(f"Dashboard error: {e}")
        return {
            "service_stats": {
                "total_requests_processed": 0,
                "today_processed": 0,
                "weekly_processed": 0,
                "monthly_processed": 0,
                "unique_requesters": 0,
                "avg_daily_requests": 0
            },
            "top_requesters": [],
            "recent_emails": []
        }