from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db import engine, Base
from app.routers import donors, inventory, health, auth, dashboard
from app.routers import email
from app.tasks.email_scheduler import start_email_scheduler, shutdown_scheduler
import os
import logging
from sqlalchemy import text

app = FastAPI(title="BloodDot Backend")

@app.get("/")
def read_root():
    return {"message": "BloodDot Backend API is running", "status": "ok"}

@app.get("/test-data")
def test_data():
    from app.db import get_db
    from app.models import ProcessedEmail
    
    db = next(get_db())
    try:
        total_emails = db.query(ProcessedEmail).count()
        recent_emails = db.query(ProcessedEmail).limit(5).all()
        
        return {
            "total_count": total_emails,
            "recent_emails": [
                {
                    "sender": email.sender,
                    "subject": email.subject,
                    "processed_at": email.processed_at.isoformat() if email.processed_at else None
                }
                for email in recent_emails
            ]
        }
    finally:
        db.close()

# CORS configuration (must be added before routes)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:5174",  # Vite dev server alternate port
        "http://localhost:3000",  # React dev server
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    # Ensure tables exist (create missing tables)
    Base.metadata.create_all(bind=engine)

    # Ensure inventory has latitude/longitude columns (Postgres supports IF NOT EXISTS)
    try:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE inventory ADD COLUMN IF NOT EXISTS latitude double precision"))
            conn.execute(text("ALTER TABLE inventory ADD COLUMN IF NOT EXISTS longitude double precision"))
            conn.execute(text("ALTER TABLE donors ADD COLUMN IF NOT EXISTS added_by_bank_id integer REFERENCES blood_bank(id)"))
            conn.execute(text("ALTER TABLE donors ADD COLUMN IF NOT EXISTS last_donated_at timestamp"))
            conn.commit()
    except Exception as e:
        logging.getLogger(__name__).warning("Could not ensure columns exist: %s", e)
    # Optionally start email scheduler (interval configurable via env var EMAIL_POLL_INTERVAL_SECONDS)
    scheduler_enabled = os.getenv("EMAIL_SCHEDULER_ENABLED", "true").lower()
    if scheduler_enabled in ("1", "true", "yes"):
        try:
            interval = int(os.getenv("EMAIL_POLL_INTERVAL_SECONDS", "20"))
        except Exception:
            interval = 20
        app.state._email_scheduler = start_email_scheduler(interval_seconds=interval)
    else:
        logging.getLogger(__name__).info("Email scheduler disabled via EMAIL_SCHEDULER_ENABLED=%s", scheduler_enabled)


@app.on_event("shutdown")
def shutdown_event():
    sched = getattr(app.state, "_email_scheduler", None)
    if sched:
        shutdown_scheduler(sched)

app.include_router(auth.router)
app.include_router(donors.router)
app.include_router(inventory.router)
app.include_router(health.router)
app.include_router(dashboard.router)
app.include_router(email.router)
