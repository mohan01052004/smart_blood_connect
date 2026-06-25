
# Blood Dot - AI-Powered Blood Availability Network

A comprehensive blood bank management system with automated email processing and AI-powered blood request handling.

## Features

- **Blood Bank Management**: Register and manage blood banks with inventory tracking
- **Donor Management**: Register and find eligible blood donors
- **Automated Email Processing**: AI-powered email parsing for blood requests
- **Real-time Dashboard**: Live statistics and analytics
- **Inventory Management**: Track blood stock levels and availability
- **Location-based Matching**: Find nearest donors and blood banks using Google Maps API

## Tech Stack

### Backend
- **Python 3.11**
- **FastAPI** - Modern web framework
- **PostgreSQL** - Database
- **SQLAlchemy** - ORM
- **Google Gemini AI** - Email parsing
- **Gmail API** - Email processing
- **APScheduler** - Background tasks

### Frontend
- **React 18** with TypeScript
- **Material-UI (MUI)** - UI components
- **Vite** - Build tool
- **Recharts** - Data visualization

## Setup Instructions

### Prerequisites
- Python 3.11
- Node.js 18+
- PostgreSQL
- Gmail account with App Password

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
venv\Scripts\activate  # Windows
# or
source venv/bin/activate  # Linux/Mac
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/blooddot_db"
GMAIL_EMAIL=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
GEMINI_API_KEY=your-gemini-api-key
GOOGLE_MAPS_API_KEY=your-maps-api-key
SECRET_KEY=your-secret-key
```

5. Start the server:
```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
VITE_API_URL=http://localhost:8000
```

4. Start development server:
```bash
npm run dev
```

## API Endpoints

- `POST /auth/signup` - Register blood bank
- `POST /auth/login` - Login
- `GET /inventory/` - Get inventory
- `POST /inventory/` - Add inventory
- `GET /donors/` - Get donors
- `POST /donors/` - Add donor
- `GET /dashboard/stats` - Dashboard statistics
- `GET /email/process` - Process emails

## Environment Variables

### Backend (.env)
- `DATABASE_URL` - PostgreSQL connection string
- `GMAIL_EMAIL` - Gmail account for email processing
- `GMAIL_APP_PASSWORD` - Gmail app password
- `GEMINI_API_KEY` - Google Gemini AI API key
- `GOOGLE_MAPS_API_KEY` - Google Maps API key
- `SECRET_KEY` - JWT secret key

### Frontend (.env)
- `VITE_API_URL` - Backend API URL

## License

MIT License
