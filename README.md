# EntityPulse

**Entity-level financial sentiment analysis** — understand not just *whether* the news is positive or negative, but *who* it's about and *how* each entity is affected.

EntityPulse combines a fine-tuned FinBERT NER model with an entity-aware sentiment classifier to deliver per-entity sentiment scores on financial text, news headlines, and even images of financial documents.

---

## ✨ Features

- **Entity-Level NER + Sentiment** — Identifies financial entities (companies, organisations) in text and classifies the sentiment directed at each one individually.
- **Multi-Modal Input** — Analyse text typed directly, paste a news headline, or upload an image of a financial article / screenshot for automatic OCR-based extraction.
- **Live Stock & News Data** — Fetches real-time stock quotes, company profiles, and recent news headlines via Finnhub and TwelveData APIs.
- **News Sentiment Trend** — Auto-analyses the top-3 most recent news articles for a company and charts sentiment across "This Week / Last Week / Last Month".
- **Stock Price History** — Interactive price chart for any listed stock symbol (365-day history).
- **User Authentication** — Session-based sign-up / login with bcrypt password hashing and MongoDB session storage.
- **Analysis History** — Every analysis a user runs is saved and viewable in their profile history.
- **Admin Dashboard** — Role-protected admin panel with stats, user management, sentiment distribution charts, input-method breakdowns, and a usage leaderboard.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│          (Vite · React Router · Recharts)                │
│                   localhost:5173                         │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP (REST)
┌────────────────────▼────────────────────────────────────┐
│               Node.js / Express Backend                  │
│    Auth · History · Stock APIs · News · OCR proxy        │
│                   localhost:5000                         │
│                       │              │                   │
│          ┌────────────▼──┐   ┌───────▼──────────────┐   │
│          │    MongoDB    │   │  External APIs        │   │
│          │  (Users &     │   │  Finnhub · TwelveData │   │
│          │   History)    │   └───────────────────────┘   │
│          └───────────────┘                               │
└─────────────┬───────────────────────┬───────────────────┘
              │ HTTP                  │ HTTP
┌─────────────▼──────────┐  ┌────────▼──────────────────┐
│  Python NER + Sentiment│  │  Python OCR Service        │
│  Flask · FinBERT       │  │  Flask · PaddleOCR · OpenCV│
│  localhost:5001        │  │  localhost:5002             │
└────────────────────────┘  └───────────────────────────┘
```

---

## 🗂️ Project Structure

```
EntityPulse/
├── Models/                              # Local fine-tuned model weights
│   ├── finbert_ner_model/               # FinBERT NER (token classification)
│   ├── finbert-entity-sentiment/        # FinBERT entity-level sentiment
│   └── finbert-sentiment-model-enhanced/
├── ocr/
│   └── image-textExtract.py            # PaddleOCR Flask service (port 5002)
├── webApp/
│   ├── backend/
│   │   ├── Server.js                   # Express API server (port 5000)
│   │   ├── ner_and_sentiment_classification_service.py  # FinBERT Flask service (port 5001)
│   │   ├── label_mappings.json         # NER label id→tag map
│   │   └── scripts/
│   │       ├── seedAdmin.js            # Create an admin user
│   │       └── createDummyData.js      # Seed test data
│   └── frontend/
│       └── src/
│           ├── App.jsx                 # Routes
│           ├── LandingPage.jsx         # Public landing page
│           ├── Home.jsx                # Main search/analysis hub
│           ├── Search.jsx              # Company search
│           ├── ResultsPage.jsx         # Analysis results
│           ├── Profile.jsx             # User history
│           ├── Login.jsx / Signup.jsx
│           ├── About.jsx
│           └── admin/                  # Admin-only dashboard pages
├── requirements.txt                    # Python dependencies
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | v18+ |
| Python | 3.9+ |
| MongoDB | Running locally on `27017` |
| pip | Latest |

---

### 1 — Clone & Install Dependencies

```powershell
# Backend (Node.js)
cd webApp\backend
npm install

# Frontend (React/Vite)
cd ..\frontend
npm install

# Python services
cd ..\..
pip install -r requirements.txt
```

---

### 2 — Configure Environment Variables

Create a `.env` file inside `webApp/backend/`:

```env
FINNHUB_API_KEY=your_finnhub_api_key
TWELVE_API_KEY=your_twelvedata_api_key
MONGO_URI=mongodb://127.0.0.1:27017/entity_pulse_users
SESSION_SECRET=any-random-secret-string
CLIENT_ORIGIN=http://localhost:5173
```

> Get free API keys at [finnhub.io](https://finnhub.io) and [twelvedata.com](https://twelvedata.com).

---

### 3 — Run All Services

Open **3 separate terminal windows** and start each service in this order:

#### Terminal 1 — Python NER + Sentiment Service (port 5001)
```powershell
cd webApp\backend
python ner_and_sentiment_classification_service.py
```
> ⏳ Allow 30–60 seconds for the FinBERT models to load before making requests.

#### Terminal 2 — Python OCR Service (port 5002) *(optional — required for image input)*
```powershell
cd ocr
python image-textExtract.py
```

#### Terminal 3 — Node.js Backend (port 5000)
```powershell
cd webApp\backend
npm start
```

#### Terminal 4 — React Frontend (port 5173)
```powershell
cd webApp\frontend
npm run dev
```

Open your browser at **http://localhost:5173** 🎉

---

## 🔌 API Overview

### Node.js Backend (port 5000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/signup` | Register a new user |
| `POST` | `/login` | Login with email + password |
| `POST` | `/logout` | End the current session |
| `GET`  | `/profile` | Get logged-in user's profile |
| `POST` | `/get-text-data-analysis-results` | Run NER + sentiment on text |
| `GET`  | `/get-company-details/:name` | Company profile via Finnhub |
| `GET`  | `/get-current-price-market-cap/:symbol` | Live stock quote |
| `GET`  | `/stock-price-history/:symbol` | 365-day OHLC data |
| `GET`  | `/news-analysis?symbol=&companyName=` | Top-3 news with sentiment |
| `POST` | `/extract-text` | OCR proxy (image → text) |
| `GET`  | `/history` | Get current user's analysis history |
| `POST` | `/history` | Save a new analysis record |
| `GET`  | `/admin/stats` | Admin: platform statistics |
| `GET`  | `/admin/users` | Admin: list all users |
| `POST` | `/admin/promote/:userId` | Admin: promote user to admin |
| `DELETE`| `/admin/users/:id` | Admin: delete a user |

### Python NER/Sentiment Service (port 5001)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/analyze-text-ner-sentiment` | Run NER + entity sentiment |
| `POST` | `/analyze-batch` | Batch analysis (up to 10 items) |

### Python OCR Service (port 5002)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/extract-text` | Extract text from an image (raw bytes) |
| `POST` | `/debug-raw` | Debug: returns raw PaddleOCR output |

---

## 🤖 ML Models

| Model | Task | Location |
|-------|------|----------|
| `finbert_ner_model` | Named Entity Recognition (Token Classification) | `Models/finbert_ner_model/` |
| `finbert-entity-sentiment` | Entity-level Sentiment (Sequence Classification) | `Models/finbert-entity-sentiment/` |

Both models run **locally on CPU** using HuggingFace Transformers. No external ML API calls are made.

### Analysis Pipeline

```
Input Text
    │
    ▼
[NER Model] → Identifies financial entities (ORG, PER, etc.)
    │
    ▼
[Sentiment Model] × each entity → (Positive / Neutral / Negative + confidence)
    │
    ▼
Aggregate scores → Overall sentiment label + per-entity breakdown
```

---

## 🛠️ Admin Setup

To create an admin account, run the seed script:

```powershell
cd webApp\backend
node scripts/seedAdmin.js
```

Then log in with the seeded admin credentials and navigate to `http://localhost:5173/admin`.

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router, Recharts, Framer Motion |
| Backend | Node.js, Express 5, Mongoose, express-session, bcrypt |
| Database | MongoDB |
| NER + Sentiment | Python, Flask, HuggingFace Transformers, FinBERT, PyTorch |
| OCR | Python, Flask, PaddleOCR, OpenCV |
| Stock Data | Finnhub API, TwelveData API |

