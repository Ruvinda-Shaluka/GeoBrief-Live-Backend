# GeoBrief-Live Backend API 🖥️

This is the backend REST API server for the GeoBrief-Live platform. It is built using **Node.js**, **Express**, **TypeScript (ES Modules)**, and **Mongoose/MongoDB**. It handles user registration, JWT session verification, Google OAuth, incident geolocation tracking, and private group collaboration.

---

## 🛠️ Tech Stack & Prerequisites

* Node.js (v18+ recommended)
* MongoDB (Local instance or MongoDB Atlas Connection URI)
* TypeScript, Express, Mongoose, JWT, bcryptjs, tsx

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
   ```

---

## 🗄️ Database Seeding

Seed the database with default users, groups, and 37 incidents across all categories (`road`, `power`, `food`, `safety`, `other`):
```bash
npx tsx src/seed.ts
```

---

## 🚀 Running the API Server

### Development Mode (auto-restart on changes)
```bash
npm run dev
```
*The server will boot up and run on `http://localhost:5000`*

### Production Build compilation check
```bash
npm run build
```

---

## 🔑 Test Credentials

All seeded test users share the password: `1234567890`

* **Alice Smith** (`alice@example.com`)
* **Bob Johnson** (`bob@example.com`)
* **Charlie Brown** (`charlie@example.com`)

---

## 📖 Additional Specifications
For complete technical database schemas, API routes specifications, and project architectural designs, refer to the **[doc/implementation_and_specification.md](doc/implementation_and_specification.md)** file.
