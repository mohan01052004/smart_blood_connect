# 🩸 Blood Dot — Intelligent Blood Availability Network

[![Python Version](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/)
[![Node Version](https://img.shields.io/badge/node-18+-green.svg)](https://nodejs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg?style=flat&logo=FastAPI)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg?style=flat&logo=React)](https://react.dev/)
[![AI-Powered](https://img.shields.io/badge/Gemini--AI-Inside-red.svg)](https://deepmind.google/technologies/gemini/)

Blood Dot is an intelligent, automated blood bank network that connects requests directly to available inventories and donors. Leveraging **Google Gemini AI**, the system parses incoming blood requests, filters out spam/promotional messages, locates the closest matches using **Google Maps Matrix API**, and drafts personalized multi-language replies.

---

## 📖 Project Overview & In-Depth Architecture

In emergency medical situations, finding the right blood group quickly is often a chaotic process. Families or hospitals typically broadcast unstructured requests on social media or send manual emails to various organizations. Blood Dot bridges this gap by acting as an **automated, intelligent dispatch network** that listens to request channels, resolves resource availability, calculates actual travel times, and sends localized response messages within seconds.

### 🧠 How the AI Pipeline Works
1. **Gmail Ingestion & IMAP Monitoring:**
   A background scheduler task continuously polls the connected Gmail inbox for unread messages.
2. **Context-Aware Classification (Spam Shield):**
   The incoming raw email body is passed to the **Gemini 2.5 Flash model**. The model classifies whether the email is a genuine blood/donation request. Non-request emails (promotional spam, newsletter signups, out-of-office automated replies) are flagged as `is_blood_request: false`. The system skips processing and stores the message ID in the database to avoid sending duplicate replies or auto-replying to spammers.
3. **Structured Attribute Extraction:**
   For valid requests, the AI extracts semantic parameters, converting unstructured text into structured JSON data:
   * **Blood Group:** Resolves standard classifications (`O+`, `AB-`, etc.) and handles colloquial mentions.
   * **Location:** Identifies landmarks, city names, or pincodes.
   * **Urgency Level:** Classifies request urgency (`low`, `medium`, `high`) based on words indicating surgery dates, emergencies, or timelines.

### 🗺️ Geolocation & Proximity Routing
1. **Geocoding Address Strings:**
   Unstructured locations (e.g. *"near Marathahalli, Bangalore"*) are resolved into coordinate pairs (Latitude and Longitude) using the **Google Geocoding API**.
2. **Database Queries:**
   The backend queries the PostgreSQL database for blood banks with positive inventory counts of the requested group and registered donors matching the group.
3. **Google Maps Distance Matrix calculation:**
   Rather than simple straight-line coordinates, the system submits coordinate pairs to the **Google Maps Distance Matrix API**. It calculates actual road distances (in km) and travel times (in minutes), ranking the closest blood banks and donors at the top.

### 🌐 Translation & Localization
* The system automatically identifies the sender's language (e.g., Hindi, Kannada, Tamil, or English).
* The resolved list of matching donors and inventory options is formatted into a detailed status report.
* The AI dynamically translates this final report back to the sender's native language, ensuring language barriers do not delay critical emergency coordination.

---

## 📸 Platform Showcase

### 🔐 Portal Login & Management
A secure, responsive portal for blood banks to manage stock and donors.
![Login Screen](screenshots/login.png)

### 📊 Real-Time Analytics Dashboard
Track system efficiency, timeline requests, unique re-questers, and AI parsing speed.
![Dashboard Overview](screenshots/dashboard.png)

### 👥 Donor Directory
Manage volunteer donors and easily query nearest matches for urgent requirements.
![Donor Database](screenshots/donors.png)

### 📦 Stock Inventory Control
Update, log, and view stock units of all blood groups.
![Inventory Screen](screenshots/inventory.png)

---

## 🌟 Key Capabilities

* **🤖 Semantic Email Parsing:** Automatically reads unread emails, using Gemini 2.5 Flash to extract request blood groups, locations, and urgency levels.
* **🛡️ Smart Spam Shield:** A built-in classification filter analyzes email context, skipping marketing emails and newsletters to prevent unwanted auto-replies.
* **🗺️ Geospatial Routing:** Calculates travel distance and times, ranking donor and blood bank inventories based on physical proximity.
* **🌍 Translation Engine:** Automatically identifies the sender's language (Hindi, Kannada, English, etc.) and translates matching alerts back to them.
* **📱 Desktop & Mobile Harmonization:** Custom-built layout using Material-UI (MUI) featuring hamburger drawer navigation, collapsible charts, and scroll-safe tables.

---

## 🔄 Architectural Workflow

```mermaid
graph TD
    A[Unread Email Inbound] --> B[FastAPI IMAP Service]
    B --> C[Gemini AI Classification]
    C -->|Spam / Newsletter| D[Log & Skip Auto-reply]
    C -->|Genuine Blood Request| E[Semantic Parameter Extraction]
    E --> F[Blood Group & Location Resolution]
    F --> G[SQL Database Query]
    G --> H[Google Maps Distance Matrix Routing]
    H --> I[Personalized Reply Construction]
    I --> J[Auto-Translate to Original Language]
    J --> K[SMTP Email Output to Sender]
```

---

## ⚙️ Quickstart Installation

### 1. Prerequisites
* **Python 3.11+** installed
* **Node.js 18+** installed
* **PostgreSQL database** instance

---

### 2. Backend Setup
1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```
2. **Build Virtual Environment:**
   ```bash
   python -m venv venv
   # Activate:
   venv\Scripts\activate  # Windows
   source venv/bin/activate  # macOS/Linux
   ```
3. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
   > [!TIP]
   > For Python 3.14+ runtime environments showing `pkg_resources` warnings, downgrade setuptools: `pip install "setuptools<70"`
4. **Create a `.env` file:**
   ```env
   DATABASE_URL="postgresql+psycopg://username:password@localhost:5432/blooddot_db"
   GMAIL_EMAIL="your-email@gmail.com"
   GMAIL_APP_PASSWORD="your-gmail-app-password"
   GEMINI_API_KEY="your-google-gemini-api-key"
   GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
   SECRET_KEY="your-jwt-auth-secret-key"
   EMAIL_POLL_INTERVAL_SECONDS=20
   ```
5. **Start FastAPI Service:**
   ```bash
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

---

### 3. Frontend Setup
1. **Navigate to frontend folder:**
   ```bash
   cd ../frontend
   ```
2. **Install Node Packages:**
   ```bash
   npm install
   ```
3. **Create a `.env` file:**
   ```env
   VITE_API_URL=http://localhost:8000
   ```
4. **Launch Dev Server:**
   ```bash
   npm run dev
   ```

---

## 🔑 Demo Account Credentials

Use this pre-seeded credentials to explore the interface:
* **Email:** `test@bloodbank.com`
* **Password:** `password123`
