
import imaplib
import email
from email.header import decode_header
import os
from dotenv import load_dotenv
import re

load_dotenv()

IMAP_SERVER = "imap.gmail.com"
IMAP_PORT = 993

GMAIL_EMAIL = os.getenv("GMAIL_EMAIL")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD")


# --------------------------------------------------
# EXTRACT CLEAN SENDER EMAIL
# --------------------------------------------------
def extract_sender_email(from_header: str) -> str:
    """
    Converts:
    'Manoj <manoj@gmail.com>' -> 'manoj@gmail.com'
    """
    if "<" in from_header and ">" in from_header:
        return from_header.split("<")[1].split(">")[0].strip()
    return from_header.strip()


# --------------------------------------------------
# FILTER FUNCTION
# --------------------------------------------------
def is_blood_request_email(subject: str, body: str, sender: str) -> bool:
    sender = sender.lower()
    text = f"{subject} {body}".lower()

    # Ignore system / Google emails
    if "google.com" in sender or "no-reply" in sender:
        return False

    # Check for blood group pattern (works in any language)
    blood_group_pattern = r"(a\+|a-|b\+|b-|ab\+|ab-|o\+|o-)"
    
    # If blood group is found, consider it a blood request
    if re.search(blood_group_pattern, text):
        return True
    
    # Also check for English keywords as fallback
    keywords = ["blood", "need", "urgent", "require", "required", "donation"]
    if any(k in text for k in keywords):
        return True

    return False


# --------------------------------------------------
# MAIN EMAIL FETCHER
# --------------------------------------------------
def fetch_unread_emails():
    if not GMAIL_EMAIL or not GMAIL_APP_PASSWORD:
        raise RuntimeError("Gmail credentials not set in .env")

    mail = imaplib.IMAP4_SSL(IMAP_SERVER, IMAP_PORT)
    mail.login(GMAIL_EMAIL, GMAIL_APP_PASSWORD)
    mail.select("inbox")

    # Fetch UNREAD emails only
    status, messages = mail.search(None, "UNSEEN")
    email_ids = messages[0].split()

    valid_emails = []

    for eid in email_ids:
        status, msg_data = mail.fetch(eid, "(RFC822)")
        raw_email = msg_data[0][1]
        msg = email.message_from_bytes(raw_email)

        # SUBJECT
        subject, encoding = decode_header(msg.get("Subject", ""))[0]
        if isinstance(subject, bytes):
            subject = subject.decode(encoding or "utf-8", errors="ignore")

        # FROM
        from_header = msg.get("From", "")
        sender_email = extract_sender_email(from_header)

        # BODY
        body = ""
        if msg.is_multipart():
            for part in msg.walk():
                if (
                    part.get_content_type() == "text/plain"
                    and not part.get("Content-Disposition")
                ):
                    body = part.get_payload(decode=True).decode(errors="ignore")
                    break
        else:
            body = msg.get_payload(decode=True).decode(errors="ignore")

        # MESSAGE ID (fallback to IMAP id if not present)
        message_id = msg.get("Message-ID", "")
        if isinstance(message_id, str):
            message_id = message_id.strip()

        # normalize message id: remove surrounding <> and lowercase
        if message_id:
            message_id = message_id.strip().lower().strip("<>")

        if not message_id:
            try:
                message_id = eid.decode() if isinstance(eid, bytes) else str(eid)
            except Exception:
                message_id = ""

        # FILTER
        if is_blood_request_email(subject, body, sender_email):
            valid_emails.append({
                "sender": sender_email,
                "subject": subject.strip(),
                "body": body.strip(),
                "message_id": message_id
            })
            # Mark blood request emails as read
            mail.store(eid, "+FLAGS", "\\Seen")

    mail.logout()
    return valid_emails
