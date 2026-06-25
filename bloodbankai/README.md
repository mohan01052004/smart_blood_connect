# 🩸 Blood Dot — AI-Powered Blood Availability Network

Blood Dot is a modern, responsive, and intelligent blood bank management platform. It automates blood requests by reading and parsing incoming emails using **Google Gemini AI**, cross-referencing available donor directories and inventory databases, and auto-replying with ranked location matches.

---

## 🌟 Key Features

* **🤖 AI-Powered Email Parser:** Automated background worker fetches unread emails, parses requested blood groups/locations, and triggers auto-replies.
* **🛡️ Smart Spam & Non-Request Filtering:** Real-time classification powered by Gemini filters out newsletters, marketing spam, and general conversation, avoiding unwanted automated replies.
* **📍 Location-Based Distance Matching:** Integrates with the Google Maps API to calculate distances, ranking matching donors and blood banks dynamically.
* **📊 Responsive Analytics Dashboard:** Interactive data visualizations (Pie, Bar, and Line charts via Recharts) displaying request volumes, timeline metrics, and unique requesters.
* **📱 Mobile-First Adaptability:** Completely responsive frontend layout featuring a collapsible hamburger navigation Drawer, stacked stats grid, and swipeable tables.

---

## ⚙️ Tech Stack

### Backend
* **Python 3.11+**
* **FastAPI** — High-performance web framework
* **PostgreSQL** — Relational database
* **SQLAlchemy** — ORM for query execution
* **Google Gemini AI (Gemini 2.5 Flash)** — Email classification and semantic information extraction
* **Gmail API & SMTP** — Automated fetching and sending
* **APScheduler** — Background queue processing

### Frontend
* **React 18** (TypeScript)
* **Material-UI (MUI 7)** — Modern components and theme design
* **Vite** — Fast frontend build utility
* **Zustand** — Client-side state store
* **Recharts** — Chart rendering and data visualization

---

## 🚀 Setup Instructions

### Prerequisites
* Python 3.11+
* Node.js 18+
* PostgreSQL Database
* Gemini API Key

---

### 1. Backend Setup

1. **Navigate to the Backend directory:**
   ```bash
   cd backend
   ```

2. **Create and Activate a Virtual Environment:**
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
   > [!NOTE]
   > If you encounter compatibility warnings for `pkg_resources` under Python 3.14, install setuptools version `<70` (`pip install "setuptools<70"`).

4. **Create a `.env` file in the `backend/` directory:**
   ```env
   DATABASE_URL="postgresql+psycopg://username:password@localhost:5432/blooddot_db"
   GMAIL_EMAIL="your-email@gmail.com"
   GMAIL_APP_PASSWORD="your-gmail-app-password"
   GEMINI_API_KEY="your-google-gemini-api-key"
   GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
   SECRET_KEY="your-jwt-auth-secret-key"
   EMAIL_POLL_INTERVAL_SECONDS=20
   ```

5. **Start the FastAPI Server:**
   ```bash
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   The backend API will run on http://localhost:8000.

---

### 2. Frontend Setup

1. **Navigate to the Frontend directory:**
   ```bash
   cd ../frontend
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Create a `.env` file in the `frontend/` directory:**
   ```env
   VITE_API_URL=http://localhost:8000
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   The application will run locally on http://localhost:5173.

---

## 🔐 Default Test Credentials

For quick testing and evaluation, you can use the pre-created test account:
* **Email:** `test@bloodbank.com`
* **Password:** `password123`

---

## 🛠️ API Routing Details

* `POST /auth/signup` — Register a new Blood Bank
* `POST /auth/login` — Sign in and receive a JWT token
* `GET /donors` — Retrieve all active blood donors
* `POST /donors` — Register a new donor with geolocation
* `GET /inventory` — Query available blood stocks
* `POST /inventory` — Add units to inventory
* `GET /dashboard/stats` — Query backend dashboard telemetry
* `GET /email/process` — Manually trigger email inbox processing
