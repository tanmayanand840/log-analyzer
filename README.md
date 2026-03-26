# AI Secure Data Intelligence Platform (SISA)

A full-stack MERN-style application for secure content analysis.

It analyzes logs/text/SQL/chat input, detects sensitive patterns, assigns a risk score, suggests actions, and optionally enriches results with AI insights via OpenRouter.

## Tech Stack

- Frontend: React, React Router, CSS
- Backend: Node.js, Express, Mongoose
- Database: MongoDB (optional but recommended for auth/history persistence)
- AI Integration: OpenRouter chat completions API (optional)

## Project Structure

- `backend/` Express API, auth, analysis engine, MongoDB models
- `frontend/` React app with login/signup and analysis dashboard
- `render.yaml` Render deployment config for backend service

## Features

- JWT-based authentication (`register`, `login`, `me`)
- Multi-input analysis (`text`, `file`, `sql`, `chat`, `log`)
- Rule-based detectors for common sensitive/security patterns
- Risk scoring (`low`, `medium`, `high`, `critical`)
- Optional masking and blocking for high-risk output
- Optional AI-generated summary/insights via OpenRouter
- Saved analysis history per user (when MongoDB is configured)

## Local Setup

### 1) Prerequisites

- Node.js 18+
- npm
- MongoDB URI (Atlas or local) if you want persistence/auth enabled

### 2) Install Dependencies

From repo root:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

### 3) Configure Environment Variables

Create `backend/.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_jwt_secret

# Optional AI integration
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=openai/gpt-4o-mini
OPENROUTER_SITE_URL=http://localhost:3000
OPENROUTER_SITE_NAME=AI Secure Data Intelligence Platform
```

Create `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 4) Run the App

Start backend:

```bash
npm run dev --prefix backend
```

Start frontend:

```bash
npm run dev --prefix frontend
```

- Frontend: http://localhost:3000
- Backend health check: http://localhost:5000/api/health

## API Endpoints

Base URL: `/api`

- `GET /health` - Health check
- `POST /auth/register` - Register user
- `POST /auth/login` - Login user
- `GET /auth/me` - Current user (requires Bearer token)
- `POST /analyze` - Analyze content (requires Bearer token)
- `GET /analyses` - Latest analysis history (requires Bearer token)

### Analyze Request Body

```json
{
  "input_type": "log",
  "content": "...text to analyze...",
  "options": {
    "mask": true,
    "block_high_risk": true,
    "log_analysis": true
  }
}
```

## Deployment

This repo includes `render.yaml` configured to deploy the backend service on Render:

- Service name: `sisa-backend`
- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Health check: `/api/health`

For frontend deployment, build and host `frontend` separately (e.g., Render Static Site, Vercel, Netlify).

## Notes

- If `MONGODB_URI` is missing, backend runs without persistence; auth and history endpoints will not function reliably.
- If `OPENROUTER_API_KEY` is missing, analysis still works using the built-in rule engine.

## License

ISC
