import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587

GMAIL_EMAIL = os.getenv("GMAIL_EMAIL")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD")


def extract_sender_email(from_header: str) -> str:
    """
    Extracts actual email from:
    'Name <email@gmail.com>'
    """
    if "<" in from_header and ">" in from_header:
        return from_header.split("<")[1].replace(">", "").strip()
    return from_header.strip()


def send_email(to_email: str, subject: str, body: str):
    if not GMAIL_EMAIL or not GMAIL_APP_PASSWORD:
        raise RuntimeError("Gmail credentials missing")

    # Extract actual email address if in format "Name <email@example.com>"
    to_email = extract_sender_email(to_email)

    msg = MIMEMultipart()
    msg["From"] = GMAIL_EMAIL
    msg["To"] = to_email
    msg["Subject"] = subject

    msg.attach(MIMEText(body, "plain"))

    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()
        server.login(GMAIL_EMAIL, GMAIL_APP_PASSWORD)
        server.send_message(msg)
