# GeoBrief-Live Backend API 🖥️

This is the backend REST API server for the GeoBrief-Live platform. It is built using **Node.js**, **Express**, **TypeScript (ES Modules)**, and **Mongoose/MongoDB**. It handles user registration, JWT session verification, Google OAuth, incident geolocation tracking, private group collaboration, and AI integrations.

---

## 🛠️ Tech Stack & Prerequisites

* Node.js (v18+ recommended)
* MongoDB (Local instance or MongoDB Atlas Connection URI)
* TypeScript, Express, Mongoose, JWT, bcryptjs, tsx
* Groq SDK (AI Integration)

---

## ⚙️ Installation & Setup

1. Navigate to the repository root directory:
   ```bash
   cd GeoBrief-Live-Backend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root of the repository and populate it with your environment keys:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GROQ_API_TOKEN=your_groq_api_key_here
   ```

---

## 🔒 Rate Limiting & Safety
* Includes built-in IP-based rate limiting to prevent endpoint abuse.
* Threshold is configured at **50 requests per minute** per client IP, responding with `429 Too Many Requests` on breach.
* Handles DB connection timeouts gracefully (aborts after 5 seconds instead of infinite command buffering in serverless runs).

---

## 🤖 Groq AI Endpoints
* **`POST /api/ai/brief`** - Accepts an array of incident text strings and returns a 2-3 sentence professional news broadcast briefing.
* **`POST /api/ai/safety-tip`** - Accepts an incident's category and title, and returns a tailored, actionable safety tip starting with a warning emoji.

---

## 🗄️ Database Seeding

Seed the database with default users, groups, and 37 incidents across all categories (`road`, `power`, `food`, `safety`, `other`):
```bash
npx tsx src/seed.ts
```

---

## 🚀 Running & Deploying the API Server

### Development Mode (auto-restart on changes)
```bash
npm run dev
```
*The server will boot up and run locally on `http://localhost:5000`*

### Serverless Vercel Deployments
The application is structured for instant Vercel Serverless Function deployment:
* **Serverless Entrypoint:** Located at `/api/index.ts`.
* **Routing Configuration:** Configured in `vercel.json` to map incoming requests to the serverless function.
* **Build Task:** Uses `npx tsc` in `package.json` to prevent execution permission errors inside Vercel.

---

## 🔑 Test Credentials

All seeded test users share the password: `1234567890`

* **Alice Smith** (`alice@example.com`)
* **Bob Johnson** (`bob@example.com`)
* **Charlie Brown** (`charlie@example.com`)

---

## 📖 Additional Specifications
For complete technical database schemas, API routes specifications, and project architectural designs, refer to the **[doc/implementation_and_specification.md](doc/implementation_and_specification.md)** file.
