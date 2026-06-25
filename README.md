# BloodDot - AI-Powered Blood Bank Management System

An intelligent blood bank management system that automatically processes blood request emails, matches with available inventory/donors, and sends automated replies in multiple languages.

## Features

- 🤖 **AI-Powered Email Processing** - Automatically reads and processes blood request emails using Gemini AI
- 🌍 **Multi-Language Support** - Detects email language and responds in Hindi, Kannada, English, etc.
- 📍 **Geospatial Matching** - Calculates road distance and travel time using Google Maps API
- 🩸 **Smart Blood Matching** - Matches requests with available inventory and donors
- ⚡ **Real-Time Processing** - Processes emails every 3 seconds
- 📧 **Automated Responses** - Sends detailed replies with blood availability and location info

## Tech Stack

**Backend:**
- FastAPI (Python)
- PostgreSQL
- SQLAlchemy ORM
- Gemini 2.5 Flash (NLP)
- Google Maps API (Geocoding & Distance Matrix)
- APScheduler (Background tasks)
- IMAP/SMTP (Email processing)

**Frontend:**
- React + Vite
- Tailwind CSS

## Setup Instructions

### Prerequisites
- Python 3.8+
- PostgreSQL
- Node.js 16+
- Gmail account with App Password
- Gemini API key
- Google Maps API key

### Backend Setup

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/blooddot.git
cd blooddot/bloodbankai/backend
```

2. Create virtual environment:
```bash
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create PostgreSQL database:
```sql
CREATE DATABASE blooddot_db;
```

5. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your credentials
```

6. Run the server:
```bash
uvicorn app.main:app --reload
```

Backend will start on `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd ../frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run development server:
```bash
npm run dev
```

Frontend will start on `http://localhost:5173`

## API Endpoints

- `POST /auth/register` - Register blood bank
- `POST /auth/login` - Login
- `GET /email/process` - Process emails (auto-triggered by scheduler)
- `POST /inventory` - Add blood inventory
- `POST /donors` - Add donor
- `GET /dashboard/stats` - Get dashboard statistics

## How It Works

1. **Email Ingestion** - Fetches unread emails from Gmail every 3 seconds
2. **Language Detection** - Detects email language using Gemini AI
3. **Entity Extraction** - Extracts blood groups, location, urgency using Gemini
4. **Geospatial Resolution** - Converts location to coordinates via Google Maps
5. **Database Matching** - Queries inventory and donors for matching blood groups
6. **Distance Calculation** - Calculates road distance and travel time
7. **Response Generation** - Builds reply with availability details
8. **Translation** - Translates reply to detected language
9. **Notification** - Sends automated email reply
10. **Logging** - Marks email as processed in database

## Environment Variables

```env
DATABASE_URL=postgresql+psycopg://postgres:password@localhost:5432/blooddot_db
GMAIL_EMAIL=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password
GEMINI_API_KEY=your_gemini_key
GOOGLE_MAPS_API_KEY=your_maps_key
SECRET_KEY=your_jwt_secret
EMAIL_POLL_INTERVAL_SECONDS=3
```

## Contributing

Pull requests are welcome! For major changes, please open an issue first.

## License

MIT

## Contact

For questions or support, please open an issue on GitHub.
