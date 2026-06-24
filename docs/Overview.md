# GeoBrief-Live — Comprehensive Viva Preparation Guide

> **Course**: Rapid Application Development (RAD) — Third Semester  
> **Stack**: MERN (MongoDB · Express.js · React.js · Node.js) + TypeScript  
> **Live URLs**:  
> - Frontend: `https://geobrief-live.vercel.app`  
> - Backend API: `https://geo-brief-live-backend.vercel.app`

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Rapid Application Development (RAD) Methodology](#2-rapid-application-development-rad-methodology)
3. [MERN Stack — In-Depth Explanation](#3-mern-stack--in-depth-explanation)
4. [System Architecture](#4-system-architecture)
5. [Backend Deep Dive](#5-backend-deep-dive)
6. [Frontend Deep Dive](#6-frontend-deep-dive)
7. [AI Integration (Groq LLM)](#7-ai-integration-groq-llm)
8. [Authentication & Authorization](#8-authentication--authorization)
9. [Database Design (MongoDB / Mongoose)](#9-database-design-mongodb--mongoose)
10. [Deployment & DevOps](#10-deployment--devops)
11. [Key Technical Challenges & Solutions](#11-key-technical-challenges--solutions)
12. [API Endpoint Reference](#12-api-endpoint-reference)
13. [Frontend Component & Page Map](#13-frontend-component--page-map)
14. [RAD Phases in This Project](#14-rad-phases-in-this-project)
15. [Viva Q&A — Commonly Asked Questions](#15-viva-qa--commonly-asked-questions)

---

## 1. Project Overview

### What is GeoBrief-Live?

GeoBrief-Live is a **real-time, location-based incident reporting and civic awareness platform**. It enables community members to:

- **Report incidents** (road hazards, power outages, safety concerns, food drives, etc.) pinned to geographic coordinates on an interactive map.
- **View a Public Feed** of active community-reported incidents with upvoting, filtering, search, and pagination.
- **Collaborate in Groups** — create private groups, invite members, share incidents exclusively within groups, transfer admin ownership, and remove members.
- **Maintain Private Diaries** — report personal or sensitive observations with custom categories (e.g., "Gardening Diary", "Fitness Log") visible only to the reporter.
- **Generate AI-Powered Briefings** — click a button to get a Groq LLM-generated summary of all current local incidents, delivered as a professional civic news broadcast.
- **Receive AI Safety Tips** — per-incident, AI-generated actionable safety advice for bystanders.

### Key Features Summary

| Feature | Description |
|---|---|
| **Public Feed** | Paginated incident cards (12/page) with category filter pills and search |
| **Interactive Map** | MapLibre GL JS with CartoDB Dark Matter tiles, marker popups, location search with autocomplete |
| **Incident Reporting** | Slide-out form on map click, GPS geolocation, manual coordinates, group sharing |
| **Group Collaboration** | Create groups, add/remove members, transfer admin ownership, share group-only incidents |
| **Private Diary** | Custom categories, personal-only visibility |
| **AI Area Briefing** | Groq LLM summarizes current incidents into a 2-3 sentence civic broadcast |
| **AI Safety Tips** | Per-incident 1-sentence safety advice with warning emoji |
| **Upvoting** | Toggle upvote system on public incidents |
| **Auth** | Local (email/password) + Google OAuth 2.0 |
| **Theme** | Light/Dark mode toggle with high-contrast CSS variables |
| **Rate Limiting** | 50 requests/minute per IP address |
| **Responsive Design** | Mobile bottom nav, retractable hamburger menu, fluid layouts |

---

## 2. Rapid Application Development (RAD) Methodology

### 2.1 What is RAD?

**Rapid Application Development (RAD)** is an adaptive software development methodology that prioritises **rapid prototyping and iterative delivery** over lengthy, sequential planning. It was first formalized by **James Martin** in 1991.

### 2.2 Core Principles of RAD

| Principle | Description |
|---|---|
| **Iterative Development** | Build in short cycles; each iteration produces a working, testable deliverable |
| **Prototyping** | Create functional prototypes early to gather user feedback before final implementation |
| **User Involvement** | Stakeholders actively participate in each iteration to validate and refine requirements |
| **Timeboxing** | Fixed time windows for each iteration force teams to focus on the highest-priority features |
| **Reuse & Automation** | Leverage existing libraries, frameworks, and code generation tools to accelerate delivery |
| **Flexibility** | Requirements can evolve between iterations based on feedback and new insights |

### 2.3 RAD Lifecycle Phases

```
┌──────────────────┐
│ Requirements     │  ← Gather high-level business requirements
│ Planning         │
└────────┬─────────┘
         ▼
┌──────────────────┐
│ User Design      │  ← Prototype UIs, validate with users
│ (Prototyping)    │
└────────┬─────────┘
         ▼
┌──────────────────┐
│ Rapid            │  ← Build working software in short sprints
│ Construction     │    (iterate: build → test → refine)
└────────┬─────────┘
         ▼
┌──────────────────┐
│ Cutover          │  ← Final testing, deployment, handoff
│ (Deployment)     │
└────────┘
```

### 2.4 RAD vs Traditional (Waterfall)

| Aspect | Waterfall | RAD |
|---|---|---|
| **Approach** | Linear, sequential | Iterative, cyclic |
| **Requirements** | Fixed upfront | Evolving through iterations |
| **User Feedback** | End of project | Every iteration |
| **Deliverables** | One final product | Working software each cycle |
| **Risk** | High (late discovery) | Low (early detection) |
| **Flexibility** | Rigid | Highly flexible |
| **Testing** | After development | Continuous throughout |
| **Best For** | Well-defined, stable requirements | Dynamic, evolving requirements |

### 2.5 RAD vs Agile vs Scrum

| Aspect | RAD | Agile | Scrum |
|---|---|---|---|
| **Focus** | Speed through prototyping | Continuous delivery | Sprint-based delivery |
| **Iterations** | Prototype → Refine cycles | User stories per sprint | 2-4 week sprints |
| **Roles** | Developer, User, Analyst | Cross-functional team | PO, SM, Dev Team |
| **Artifacts** | Prototypes, working software | Working software | Sprint Backlog, Product Backlog |
| **Key Difference** | Emphasizes prototyping | Emphasizes principles/values | Emphasizes ceremonies (standup, retrospective) |

### 2.6 Advantages of RAD

1. **Faster Time-to-Market** — Working prototypes in days, not months.
2. **Reduced Development Risk** — Problems surface early in each iteration.
3. **Higher User Satisfaction** — Users validate each prototype; final product matches expectations.
4. **Component Reusability** — Encourages modular, reusable code components.
5. **Lower Cost** — Fewer rewrites since requirements are validated iteratively.

### 2.7 Disadvantages of RAD

1. **Requires Skilled Developers** — Rapid cycles demand experienced, versatile developers.
2. **Needs Active User Participation** — If users can't engage regularly, RAD loses its advantage.
3. **Not Suitable for Large-Scale Projects** — Complex systems with many interdependencies may not decompose well into rapid iterations.
4. **Potential for Scope Creep** — Flexible requirements can lead to uncontrolled feature growth.
5. **Less Formal Documentation** — Speed prioritisation can result in gaps in documentation.

---

## 3. MERN Stack — In-Depth Explanation

### 3.1 What is the MERN Stack?

The **MERN stack** is a full-stack JavaScript/TypeScript technology bundle for building modern web applications. Each letter represents a technology:

| Letter | Technology | Role |
|---|---|---|
| **M** | **MongoDB** | NoSQL document database (data layer) |
| **E** | **Express.js** | Backend web framework (API server) |
| **R** | **React.js** | Frontend UI library (client-side rendering) |
| **N** | **Node.js** | JavaScript runtime environment (server-side execution) |

### 3.2 Why MERN?

1. **Unified Language** — JavaScript/TypeScript from database to browser. No language switching.
2. **JSON Everywhere** — MongoDB stores JSON-like documents (BSON), Express sends JSON APIs, React consumes JSON, Node.js natively handles JSON.
3. **Non-Blocking I/O** — Node.js event-driven architecture handles thousands of concurrent connections efficiently.
4. **Component-Based UI** — React's virtual DOM and component model enable complex, performant UIs.
5. **Massive Ecosystem** — npm provides 2M+ packages for every conceivable need.
6. **Industry Standard** — Used by Netflix, Uber, Facebook, Airbnb, and thousands of startups.

### 3.3 MongoDB — The Database Layer

**MongoDB** is a **document-oriented NoSQL database** that stores data as flexible, JSON-like **BSON documents** (Binary JSON) in **collections** (analogous to tables in SQL).

#### Key Concepts:

| Concept | SQL Equivalent | Description |
|---|---|---|
| **Database** | Database | Container for collections |
| **Collection** | Table | Group of documents |
| **Document** | Row | Single data record (JSON object) |
| **Field** | Column | Key-value pair within a document |
| **_id** | Primary Key | Auto-generated unique ObjectId |
| **Index** | Index | Performance optimization for queries |

#### Why MongoDB for GeoBrief-Live?
- **Geospatial Indexing** — Native `2dsphere` index for location-based queries on incident coordinates.
- **Flexible Schema** — Incidents can have custom categories (like personal diary entries) without schema migrations.
- **Document Relationships** — ObjectId references (`ref: 'User'`) link incidents to users and groups.
- **Cloud-Native** — MongoDB Atlas provides managed cloud hosting with automatic scaling.

#### In This Project:
We use **Mongoose** (v9.6.2) as the ODM (Object Document Mapper) to define schemas with TypeScript interfaces:
```typescript
// Example: Incident Model
const incidentSchema = new Schema<IIncident>({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  type: { type: String, required: true },          // 'road', 'power', 'safety', 'food', 'other', or custom
  visibility: { type: String, enum: ['public', 'private', 'group'], default: 'public' },
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  upvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  sharedWithGroups: [{ type: Schema.Types.ObjectId, ref: 'Group' }]
}, { timestamps: true });

incidentSchema.index({ location: '2dsphere' }); // Geospatial index
```

### 3.4 Express.js — The API Server

**Express.js** (v5.2.1) is a **minimalist, unopinionated web framework** for Node.js that provides:
- **Routing** — Define HTTP method handlers (`GET`, `POST`, `PUT`, `DELETE`) for URL paths.
- **Middleware Pipeline** — Chain functions to process requests sequentially (auth, validation, logging, rate limiting, etc.).
- **Request/Response Helpers** — `req.body`, `req.params`, `req.query`, `res.json()`, `res.status()`.

#### Middleware Pipeline in This Project:
```
Request → CORS → JSON Parser → DB Middleware → Rate Limiter → Route Handler → Response
```

Each middleware is an `(req, res, next)` function. Calling `next()` passes the request to the next middleware. Calling `res.json()` ends the chain.

#### In This Project:
```typescript
// app.ts
const app = express();
app.use(cors({ origin: [...], credentials: true }));  // Step 1: CORS
app.use(express.json());                                // Step 2: Parse JSON body
app.use(dbMiddleware);                                  // Step 3: Verify DB connection
app.use(rateLimiter(50, 60 * 1000));                   // Step 4: Rate limit (50 req/min)
app.use('/api/auth', authRoutes);                       // Step 5: Route matching
app.use('/api/incidents', incidentRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/ai', aiRoutes);
```

### 3.5 React.js — The Frontend UI

**React** (v19.2.6) is a **declarative, component-based JavaScript library** for building user interfaces.

#### Core Concepts:

| Concept | Description |
|---|---|
| **JSX/TSX** | HTML-like syntax inside JavaScript/TypeScript files |
| **Components** | Reusable UI building blocks (functions returning JSX) |
| **Props** | Data passed from parent to child components |
| **State** | Internal component data that triggers re-renders when changed |
| **Hooks** | Functions like `useState`, `useEffect`, `useCallback` for managing state and side effects |
| **Virtual DOM** | In-memory representation of the real DOM; React diffs and patches only what changed |

#### State Management — Redux Toolkit:
This project uses **Redux Toolkit** (`@reduxjs/toolkit` v2.12.0) with **React-Redux** for global state:

```typescript
// store.ts
export const store = configureStore({
  reducer: {
    auth: authReducer,       // User authentication state
    incidents: incidentReducer, // Incident data state
  },
});
```

- **Slices** — `authSlice.ts` manages user login/logout state, token persistence in LocalStorage.
- **Typed Hooks** — `useAppDispatch()` and `useAppSelector()` for type-safe Redux access in components.

#### Routing — React Router DOM:
```typescript
// AppRoutes.tsx
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/login" element={<Login />} />
  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
  <Route path="/private" element={<ProtectedRoute><PrivateIncidents /></ProtectedRoute>} />
  <Route path="/groups" element={<ProtectedRoute><GroupManager /></ProtectedRoute>} />
  <Route path="*" element={<Navigate to="/" />} />
</Routes>
```

The `ProtectedRoute` wrapper checks `isAuthenticated` from Redux; unauthenticated users are redirected to `/login`.

### 3.6 Node.js — The Runtime Environment

**Node.js** is a **JavaScript runtime built on Chrome's V8 engine**. It enables running JavaScript on the server.

#### Key Characteristics:
| Feature | Description |
|---|---|
| **Event-Driven** | Non-blocking I/O model ideal for high-concurrency applications |
| **Single-Threaded** | Uses an event loop instead of multi-threading |
| **npm** | World's largest package ecosystem (2M+ packages) |
| **V8 Engine** | Same engine as Chrome; JIT-compiles JavaScript to machine code |
| **Streams** | Efficient handling of large data transfers |

#### In This Project:
- Runtime: **Node.js** with **TypeScript** (compiled via `tsc` or run via `tsx` in development)
- Package Manager: **npm**
- Module System: **ESM** (`"type": "module"` in `package.json`, `.js` extensions in imports)
- Dev Server: `tsx watch src/server.ts` for hot-reloading

---

## 4. System Architecture

### 4.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │  React 19    │  │  Redux       │  │  MapLibre GL JS       │  │
│  │  + Router    │  │  Toolkit     │  │  (CartoDB Dark Matter) │  │
│  └──────┬───────┘  └──────┬───────┘  └───────────┬───────────┘  │
│         │                 │                       │              │
│         └─────────┬───────┘───────────────────────┘              │
│                   │                                              │
│           ┌───────▼───────┐                                      │
│           │ Axios HTTP    │  ← All API calls + JWT Bearer token  │
│           └───────┬───────┘                                      │
└───────────────────┼──────────────────────────────────────────────┘
                    │ HTTPS
                    ▼
┌───────────────────────────────────────────────────────────────────┐
│                   VERCEL SERVERLESS (Backend)                     │
│                                                                   │
│  ┌─────────┐  ┌──────────┐  ┌────────────┐  ┌────────────────┐  │
│  │  CORS   │→ │  JSON    │→ │ DB Check   │→ │ Rate Limiter   │  │
│  │ Config  │  │  Parser  │  │ Middleware  │  │ (50 req/min)   │  │
│  └─────────┘  └──────────┘  └────────────┘  └───────┬────────┘  │
│                                                       │          │
│  ┌────────────────────────────────────────────────────▼───────┐  │
│  │                    Express.js Router                        │  │
│  │  /api/auth/*  /api/incidents/*  /api/groups/*  /api/ai/*   │  │
│  └────────────────────────────┬───────────────────────────────┘  │
│                               │                                  │
│  ┌────────────────────────────▼───────────────────────────────┐  │
│  │                     Controllers                             │  │
│  │  authController  incidentController  groupController        │  │
│  │  userController  aiController                               │  │
│  └──────────┬──────────────────────────────────┬──────────────┘  │
│             │                                  │                 │
│      ┌──────▼──────┐                   ┌───────▼──────┐         │
│      │  Mongoose   │                   │   Groq SDK   │         │
│      │  ODM        │                   │   (LLM API)  │         │
│      └──────┬──────┘                   └──────────────┘         │
└─────────────┼────────────────────────────────────────────────────┘
              │
              ▼
┌──────────────────────┐
│  MongoDB Atlas       │
│  (Cloud Database)    │
│                      │
│  Collections:        │
│  • users             │
│  • incidents         │
│  • groups            │
└──────────────────────┘
```

### 4.2 Data Flow Example: Creating an Incident

```
1. User clicks on map → Sets coordinates
2. User fills out IncidentForm component (title, desc, category, visibility)
3. Frontend calls incidentService.createIncident(data, token)
4. Axios sends POST /api/incidents with JSON body + JWT Authorization header
5. Vercel routes request to api/index.ts → Express app
6. Middleware chain: CORS → JSON parse → DB connection check → Rate limit
7. authMiddleware verifies JWT token, attaches req.user
8. incidentController.createIncident() validates data, creates Mongoose document
9. Mongoose pre-validate hook runs (checks group visibility rules)
10. Document saved to MongoDB Atlas "incidents" collection
11. Response: 201 Created with incident JSON
12. Frontend receives response, updates UI
```

---

## 5. Backend Deep Dive

### 5.1 Project Structure

```
GeoBrief-Live-Backend/
├── api/
│   └── index.ts          # Vercel serverless entrypoint (exports Express app)
├── src/
│   ├── app.ts            # Express app configuration (middleware + routes)
│   ├── server.ts         # Local development server (app.listen)
│   ├── config/
│   │   └── db.ts         # MongoDB connection with pooling & timeout
│   ├── controllers/
│   │   ├── authController.ts      # Register, Login, Google OAuth
│   │   ├── incidentController.ts  # CRUD for incidents
│   │   ├── groupController.ts     # Group management (CRUD + admin transfer)
│   │   ├── userController.ts      # Profile management
│   │   └── aiController.ts        # Groq AI briefing & safety tips
│   ├── middleware/
│   │   ├── authMiddleware.ts      # JWT verification
│   │   ├── dbMiddleware.ts        # Per-request DB connection check
│   │   └── rateLimitMiddleware.ts # IP-based rate limiting (50/min)
│   ├── models/
│   │   ├── User.ts       # User schema (name, email, password, Google OAuth)
│   │   ├── Incident.ts   # Incident schema (geospatial, categories, visibility)
│   │   └── Group.ts      # Group schema (admin, members, admin-in-members hook)
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── incidentRoutes.ts
│   │   ├── groupRoutes.ts
│   │   ├── userRoutes.ts
│   │   └── aiRoutes.ts
│   └── seed.ts           # Database seeder (37 public + private + group incidents)
├── vercel.json           # Vercel deployment configuration
├── tsconfig.json         # TypeScript configuration
├── package.json          # Dependencies & scripts
└── .env                  # Environment variables (not committed)
```

### 5.2 App vs Server Split

This is a **critical architectural decision** for Vercel serverless deployment:

| File | Purpose | When It Runs |
|---|---|---|
| `src/app.ts` | Configures and exports the Express app (middleware, routes) | Always (both local & serverless) |
| `src/server.ts` | Calls `app.listen(PORT)` | Only locally (`npm run dev`) |
| `api/index.ts` | Imports and re-exports `app` for Vercel | Only on Vercel (serverless) |

**Why?** Vercel serverless functions don't use `app.listen()`. They receive HTTP events and pass them to the exported Express app. If `app.listen()` runs in a serverless function, it causes conflicts and hangs.

```typescript
// api/index.ts (Vercel entrypoint)
import app from '../src/app.js';
export default app;

// src/server.ts (Local development only)
import app from './app.js';
app.listen(5000, () => console.log('Running on port 5000'));
```

### 5.3 Dual Route Mounting

All routes are registered under BOTH `/api/*` and `/*` prefixes:

```typescript
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);
```

**Why?** Vercel's routing can strip or add the `/api` prefix depending on configuration. Dual mounting ensures routes work regardless of whether the request arrives as `/api/incidents/public` or `/incidents/public`.

### 5.4 Database Connection Strategy

```typescript
// src/config/db.ts
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return; // ← Reuse existing connection
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000  // ← Fail fast if Atlas blocks the IP
  });
};
```

**Connection Pooling**: In serverless environments, each function invocation can create a new connection. Checking `readyState` prevents connection exhaustion by reusing the existing pool.

**Fast Failure**: Without `serverSelectionTimeoutMS`, Mongoose queues operations indefinitely. In Vercel's 10-second function timeout, this causes a silent hang followed by a `504 Gateway Timeout`. Setting 5s ensures we fail with a clear error.

### 5.5 DB Middleware

```typescript
// Every request (except /status) goes through this:
export const dbMiddleware = async (req, res, next) => {
  try {
    await connectDB();
    next(); // DB is ready, proceed to route handler
  } catch (err) {
    res.status(500).json({ message: "Database connection failed..." });
  }
};
```

This prevents routes from executing against a disconnected database, which would cause cryptic Mongoose errors.

### 5.6 Rate Limiting Implementation

```typescript
const ipRequestCounts = new Map<string, RateLimitRecord>();

export const rateLimiter = (limit: number, windowMs: number) => {
  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    // Track request count per IP with sliding window reset
    if (record.count >= limit) {
      res.status(429).json({ message: 'Too many requests...' });
      return;
    }
    record.count++;
    next();
  };
};
```

**Configuration**: 50 requests per minute per IP. Uses an in-memory `Map` — this works in serverless because Vercel containers persist between warm invocations (though it resets on cold starts).

### 5.7 Mongoose Hooks (Middleware)

#### Pre-save Hook on Group:
```typescript
groupSchema.pre('save', async function () {
  // Guarantee the admin is always in the members array
  if (this.admin) {
    const adminStr = this.admin.toString();
    const hasAdmin = this.members.some(m => m?.toString() === adminStr);
    if (!hasAdmin) this.members.push(this.admin);
  }
});
```

#### Pre-validate Hook on Incident:
```typescript
incidentSchema.pre('validate', function (next) {
  if (this.visibility === 'group' && (!this.sharedWithGroups || this.sharedWithGroups.length === 0)) {
    this.invalidate('sharedWithGroups', 'At least one group must be specified...');
  }
  if (this.visibility !== 'group') this.sharedWithGroups = [];
});
```

---

## 6. Frontend Deep Dive

### 6.1 Project Structure

```
GeoBrief-Live-Frontend/
├── src/
│   ├── main.tsx              # Entry point (Redux Provider, Google OAuth, Axios interceptor)
│   ├── App.tsx               # BrowserRouter + MainLayout + AppRoutes
│   ├── index.css             # Global CSS variables (Light/Dark theme)
│   ├── App.css               # App-level styles
│   ├── store/
│   │   ├── store.ts          # Redux store configuration
│   │   └── slices/
│   │       ├── authSlice.ts  # Auth state (user, token, isAuthenticated)
│   │       └── incidentSlice.ts # Incident list state
│   ├── services/
│   │   ├── authService.ts    # Login, Register, Google Auth API calls
│   │   ├── incidentService.ts # Incident CRUD API calls
│   │   ├── groupService.ts   # Group management API calls
│   │   ├── userService.ts    # Profile update API calls
│   │   └── aiService.ts      # AI briefing & safety tip API calls
│   ├── routes/
│   │   └── AppRoutes.tsx     # Route definitions + ProtectedRoute wrapper
│   ├── pages/
│   │   ├── Home.tsx          # Public feed page (hero, filters, cards, pagination, AI summarizer)
│   │   ├── Login.tsx         # Login/Register form + Google OAuth button
│   │   ├── Dashboard.tsx     # Map dashboard (MapContainer + IncidentForm)
│   │   ├── GroupManager.tsx  # Group CRUD, member management, action popups
│   │   └── PrivateIncidents.tsx # Personal diary/private incidents
│   └── components/
│       ├── home/
│       │   ├── HeroSection.tsx       # Glassmorphic hero banner
│       │   ├── CategoryFilter.tsx    # Category pill toggles
│       │   └── GeoBriefSummarizer.tsx # AI briefing widget
│       ├── incidents/
│       │   ├── IncidentCard.tsx       # Incident display card with upvote & safety tip
│       │   ├── IncidentForm.tsx       # Map-based incident reporting form
│       │   └── SafetyTipWidget.tsx    # Per-card AI safety advice
│       ├── map/
│       │   └── MapContainer.tsx       # MapLibre GL JS map with markers & search
│       ├── layout/
│       │   ├── Navbar.tsx            # Top navigation (theme toggle, hamburger menu)
│       │   ├── BottomNav.tsx         # Mobile bottom navigation bar
│       │   ├── MainLayout.tsx        # Layout wrapper
│       │   ├── LiveClock.tsx         # Real-time clock display
│       │   └── ConfirmModal.tsx      # Reusable confirmation dialog
│       └── profile/
│           └── ProfileModal.tsx      # User profile editor
```

### 6.2 Key Technologies & Libraries

| Library | Version | Purpose |
|---|---|---|
| **React** | 19.2.6 | UI framework |
| **React Router DOM** | 7.15.1 | Client-side routing |
| **Redux Toolkit** | 2.12.0 | Global state management |
| **Axios** | 1.16.1 | HTTP client for API calls |
| **MapLibre GL JS** | 5.24.0 | Interactive map rendering |
| **@react-oauth/google** | 0.13.5 | Google Sign-In integration |
| **Tailwind CSS** | 4.3.0 | Utility-first CSS framework |
| **Vite** | 8.0.12 | Build tool and dev server |
| **TypeScript** | 6.0.2 | Static typing |

### 6.3 Theme System (Light/Dark Mode)

CSS custom properties define the entire color palette:

```css
/* Light Mode (default) */
:root {
  --color-bg: #e1e5f2;
  --color-card: #ffffff;
  --color-border: #bfdbf7;
  --color-text: #022b3a;
  --color-brandPrimary: #1f7a8c;
}

/* Dark Mode */
.dark {
  --color-bg: #022b3a;
  --color-card: #051a24;
  --color-border: #133948;
  --color-text: #ffffff;
  --color-brandPrimary: #1f7a8c;
}
```

The theme toggle in `Navbar.tsx` adds/removes the `.dark` class on the `<html>` element. All components reference these CSS variables through Tailwind configuration, ensuring consistent theme switching.

### 6.4 Auto-Logout Interceptor

```typescript
// main.tsx
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthRequest = error.config.url?.includes('/auth/');
      if (!isAuthRequest) {
        store.dispatch(logout());       // Clear Redux state
        window.location.href = '/login'; // Redirect to login
      }
    }
    return Promise.reject(error);
  }
);
```

When a JWT expires or a user record is deleted from the database, all API calls return `401`. This interceptor catches them globally, logs the user out, and redirects to login — preventing stale authenticated states.

### 6.5 MapLibre GL JS Integration

The interactive map uses **MapLibre GL JS** (open-source fork of Mapbox GL JS) with **CartoDB Dark Matter** tiles (free, no API key required):

```typescript
const map = new maplibregl.Map({
  container: mapRef.current,
  style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  center: [79.8612, 6.9271], // Colombo, Sri Lanka
  zoom: 12,
});
```

**Features implemented**:
- Click-to-pin markers for incident reporting
- Coloured markers per incident category
- Map popups showing incident details
- Location search with autocomplete (debounced, fly-to camera navigation)
- GPS geolocation button integration
- Manual coordinate input with map sync

---

## 7. AI Integration (Groq LLM)

### 7.1 Architecture

```
Frontend Component → aiService.ts → POST /api/ai/brief → aiController.ts → Groq SDK → LLM Response
```

**Groq** is an AI inference platform that runs large language models at extremely high speed using custom LPU (Language Processing Unit) hardware. We use the **`llama-3.3-70b-versatile`** model.

### 7.2 Area Briefing Generator

**System Prompt**:
> "Act as a civic news broadcaster. Summarize the following local incidents into a concise, professional 2-3 sentence briefing. Do not use conversational filler, just give the briefing."

**Flow**:
1. Frontend collects currently displayed incident descriptions from the public feed
2. Sends array of incident strings to `POST /api/ai/brief`
3. Backend constructs Groq chat completion request
4. Returns AI-generated summary to frontend
5. `GeoBriefSummarizer.tsx` renders the briefing in a premium glassmorphic card

### 7.3 Safety Tip Generator

**System Prompt**:
> "You are a local public safety expert. The user will provide an incident category and title. Provide a single, actionable, and urgent 1-sentence safety tip for bystanders. Do not use conversational filler. Start the sentence with a relevant warning emoji."

**Flow**:
1. User clicks "Get AI Safety Tip" on an incident card
2. Frontend sends `{ title, category }` to `POST /api/ai/safety-tip`
3. Backend queries Groq with the incident context
4. Returns a single urgent safety tip
5. `SafetyTipWidget.tsx` renders it in a warning-colored banner

### 7.4 API Key Security

The Groq API key is **never exposed to the frontend**. All AI requests are proxied through the backend:

```
Browser → Backend (has GROQ_API_TOKEN) → Groq API
```

The key is stored in Vercel Environment Variables as `GROQ_API_TOKEN` and accessed via `process.env.GROQ_API_TOKEN`.

---

## 8. Authentication & Authorization

### 8.1 Authentication Methods

| Method | Flow |
|---|---|
| **Local Auth** | Email + Password → bcrypt hash → JWT issued |
| **Google OAuth** | Google Sign-In button → ID token → Backend verifies with Google Auth Library → JWT issued |

### 8.2 JWT (JSON Web Token) Flow

```
1. User logs in with email/password or Google token
2. Backend verifies credentials
3. Backend signs JWT: jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '30d' })
4. Frontend stores JWT in LocalStorage via Redux authSlice
5. Every API request includes: Authorization: Bearer <token>
6. authMiddleware verifies token on protected routes
7. If valid, req.user = { id: userId } — route handler proceeds
8. If invalid/expired, 401 Unauthorized → Axios interceptor logs out
```

### 8.3 Password Hashing

```typescript
userSchema.pre('save', async function () {
  if (!this.isModified('passwordHash') || !this.passwordHash) return;
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});
```

Passwords are **never stored in plaintext**. bcryptjs generates a random salt and hashes the password with 10 rounds.

### 8.4 Protected Routes (Frontend)

```typescript
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAppSelector(state => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" />;
};
```

Protected pages: `/dashboard`, `/private`, `/groups`. Unauthenticated users are redirected to `/login`.

---

## 9. Database Design (MongoDB / Mongoose)

### 9.1 Collections & Schemas

#### Users Collection
| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Auto-generated primary key |
| `name` | String | User's display name |
| `email` | String | Unique, lowercase email |
| `passwordHash` | String (optional) | bcrypt-hashed password (null for Google users) |
| `role` | Enum: 'user' / 'admin' | User role |
| `authProvider` | Enum: 'local' / 'google' | How the user registered |
| `googleId` | String (optional) | Google OAuth subject ID |
| `picture` | String (optional) | Profile picture URL |
| `createdAt` / `updatedAt` | Date | Auto-managed timestamps |

#### Incidents Collection
| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Auto-generated primary key |
| `title` | String | Incident title |
| `description` | String | Detailed description |
| `type` | String | Category: 'road', 'power', 'safety', 'food', 'other', or custom |
| `status` | Enum: 'active' / 'resolved' / 'archived' | Current status |
| `visibility` | Enum: 'public' / 'private' / 'group' | Who can see it |
| `sharedWithGroups` | ObjectId[] (ref: Group) | Groups this incident is shared with |
| `upvotes` | ObjectId[] (ref: User) | Users who upvoted |
| `location` | GeoJSON Point | `{ type: 'Point', coordinates: [lng, lat] }` |
| `reportedBy` | ObjectId (ref: User) | Reporter's user ID |
| `createdAt` / `updatedAt` | Date | Auto-managed timestamps |

**Geospatial Index**: `incidentSchema.index({ location: '2dsphere' })` enables efficient location-based queries.

#### Groups Collection
| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Auto-generated primary key |
| `name` | String | Group name |
| `description` | String (optional) | Group description |
| `admin` | ObjectId (ref: User) | Group administrator |
| `members` | ObjectId[] (ref: User) | All members (admin auto-included via hook) |
| `createdAt` / `updatedAt` | Date | Auto-managed timestamps |

### 9.2 Relationships Diagram

```
┌──────────┐       ┌───────────────┐       ┌──────────┐
│  Users   │◄──────│   Incidents   │──────►│  Groups  │
│          │ 1:N   │               │ N:M   │          │
│ _id      │       │ reportedBy    │       │ _id      │
│ name     │       │ upvotes[]     │       │ name     │
│ email    │       │ sharedWith[]  │       │ admin    │
│ password │       │ location      │       │ members[]│
└──────────┘       └───────────────┘       └──────────┘
     ▲                                          │
     │              N:M (members)               │
     └──────────────────────────────────────────┘
```

- **User → Incidents**: One-to-Many (user reports many incidents)
- **User → Incidents (upvotes)**: Many-to-Many (many users upvote many incidents)
- **Incidents → Groups**: Many-to-Many (incident shared with multiple groups)
- **User → Groups**: Many-to-Many (user belongs to multiple groups; groups have multiple members)

---

## 10. Deployment & DevOps

### 10.1 Vercel Deployment Architecture

| Component | Platform | Configuration |
|---|---|---|
| **Frontend** | Vercel (Static Hosting) | Auto-deploys from GitHub, Vite build |
| **Backend** | Vercel (Serverless Functions) | `api/index.ts` as the function handler |
| **Database** | MongoDB Atlas (Cloud) | Free tier, IP whitelist `0.0.0.0/0` for Vercel |

### 10.2 vercel.json Configuration

```json
{
  "version": 2,
  "builds": [
    { "src": "api/index.ts", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "api/index.ts" }
  ]
}
```

**Explanation**:
- `builds`: Tells Vercel to compile `api/index.ts` using the `@vercel/node` builder (handles TypeScript automatically).
- `routes`: All incoming requests (`/(.*)`) are routed to the single serverless function. Express handles internal routing.

### 10.3 Environment Variables

| Variable | Where | Purpose |
|---|---|---|
| `MONGO_URI` | Vercel Backend | MongoDB Atlas connection string |
| `JWT_SECRET` | Vercel Backend | JWT signing secret |
| `GOOGLE_CLIENT_ID` | Vercel Backend + Frontend | Google OAuth client ID |
| `GROQ_API_TOKEN` | Vercel Backend | Groq AI API key |
| `VITE_GOOGLE_CLIENT_ID` | Vercel Frontend | Google OAuth (prefixed for Vite exposure) |
| `VITE_API_URL` | Vercel Frontend | Backend API base URL |

### 10.4 Build Scripts

```json
// Backend
"scripts": {
  "dev": "tsx watch src/server.ts",    // Local dev with hot-reload
  "build": "npx tsc"                   // TypeScript compilation for Vercel
}

// Frontend
"scripts": {
  "dev": "vite",                        // Vite dev server with HMR
  "build": "tsc -b && vite build"       // Type-check + production bundle
}
```

### 10.5 Serverless Constraints & Solutions

| Constraint | Problem | Solution |
|---|---|---|
| **10s function timeout** | DB connection hangs if MongoDB Atlas blocks IP | `serverSelectionTimeoutMS: 5000` |
| **No persistent state** | Connections reset on cold starts | `readyState` check for connection reuse |
| **No `app.listen()`** | Causes conflicts in serverless | Split `app.ts` (config) / `server.ts` (listen) |
| **IP address changes** | Atlas rejects requests from unknown IPs | Whitelist `0.0.0.0/0` on Atlas |
| **Cold starts** | First request after idle is slow | DB middleware ensures connection before route execution |

---

## 11. Key Technical Challenges & Solutions

### Challenge 1: Vercel 500 Internal Server Error
**Problem**: Backend worked locally but returned 500 on Vercel.  
**Root Cause**: MongoDB connection hanging beyond Vercel's 10-second timeout because Atlas IP whitelist didn't include Vercel's dynamic IPs.  
**Solution**:
1. Set `serverSelectionTimeoutMS: 5000` to fail fast.
2. Created `dbMiddleware.ts` to check connection before every request.
3. Whitelisted `0.0.0.0/0` on MongoDB Atlas.
4. Split `app.ts` and `server.ts` to avoid `app.listen()` in serverless.

### Challenge 2: Mongoose `next is not a function` Error
**Problem**: Group creation crashed with `TypeError: next is not a function` in Mongoose's pre-save hook.  
**Root Cause**: The hook used callback-style `next()` parameter but was defined as an async function. Mongoose 9.x changed how middleware hooks handle `next`.  
**Solution**: Converted to pure `async function` without `next` parameter. Mongoose automatically handles the promise resolution.

### Challenge 3: Map Camera Jumping During Coordinate Typing
**Problem**: When users typed coordinates manually in the form, the map camera smoothly flew to each intermediate value, causing disorienting jumps.  
**Solution**: Added a flag to distinguish between GPS button clicks (which should animate the camera) and manual text input (which should silently update the marker position without camera movement).

### Challenge 4: CORS Configuration for Vercel
**Problem**: Cross-origin requests from the frontend to backend were blocked.  
**Solution**: Explicit CORS configuration allowing both production (`https://geobrief-live.vercel.app`) and development (`http://localhost:5173`) origins with credentials support.

### Challenge 5: Groq API Key Missing on Vercel
**Problem**: AI features returned 500 because the environment variable was named differently.  
**Solution**: Controller checks both `GROQ_API_TOKEN` and `GROQ_API_KEY`, and returns a descriptive error message guiding the user to add the variable in Vercel's dashboard.

---

## 12. API Endpoint Reference

### Authentication
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register new user (name, email, password) |
| POST | `/api/auth/login` | No | Login with email/password, returns JWT |
| POST | `/api/auth/google` | No | Login/register with Google ID token |

### Incidents
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/incidents/public` | No | Get all public incidents (sorted by upvotes) |
| GET | `/api/incidents/mine` | Yes | Get current user's private incidents |
| POST | `/api/incidents` | Yes | Create new incident |
| PUT | `/api/incidents/:id/upvote` | Yes | Toggle upvote on an incident |

### Groups
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/groups` | Yes | Get user's groups |
| POST | `/api/groups` | Yes | Create a new group |
| POST | `/api/groups/:id/members` | Yes | Add member by email |
| DELETE | `/api/groups/:id/members/:memberId` | Yes | Remove member (admin only) |
| PUT | `/api/groups/:id/admin` | Yes | Transfer admin role |
| POST | `/api/groups/:id/leave` | Yes | Leave a group (non-admin) |

### Users
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| PUT | `/api/users/profile` | Yes | Update user profile |
| DELETE | `/api/users/profile` | Yes | Delete user account |

### AI
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/ai/brief` | Yes | Generate AI area briefing from incidents array |
| POST | `/api/ai/safety-tip` | Yes | Generate AI safety tip for specific incident |

### Status
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/status` | No | Health check |

---

## 13. Frontend Component & Page Map

### Pages

| Page | Route | Auth Required | Purpose |
|---|---|---|---|
| `Home.tsx` | `/` | No | Public feed with hero, filters, pagination, AI summarizer |
| `Login.tsx` | `/login` | No | Login/Register form + Google Sign-In |
| `Dashboard.tsx` | `/dashboard` | Yes | Interactive map + incident reporting form |
| `PrivateIncidents.tsx` | `/private` | Yes | Personal diary entries (custom categories) |
| `GroupManager.tsx` | `/groups` | Yes | Group CRUD, member management, group incidents |

### Components

| Component | Location | Purpose |
|---|---|---|
| `HeroSection` | `components/home/` | Landing page hero banner |
| `CategoryFilter` | `components/home/` | Category pill toggles (Road, Power, Safety, Food, Other) |
| `GeoBriefSummarizer` | `components/home/` | AI-powered area briefing widget |
| `IncidentCard` | `components/incidents/` | Individual incident display card |
| `IncidentForm` | `components/incidents/` | Slide-out incident reporting form |
| `SafetyTipWidget` | `components/incidents/` | Per-incident AI safety advice |
| `MapContainer` | `components/map/` | MapLibre GL JS interactive map |
| `Navbar` | `components/layout/` | Top navigation bar |
| `BottomNav` | `components/layout/` | Mobile bottom navigation |
| `MainLayout` | `components/layout/` | Page layout wrapper |
| `LiveClock` | `components/layout/` | Real-time clock |
| `ConfirmModal` | `components/layout/` | Reusable confirmation dialog |
| `ProfileModal` | `components/profile/` | User profile editing modal |

---

## 14. RAD Phases in This Project

This project was developed using the RAD methodology across **17 iterative phases**. Each phase produced a working, testable increment:

| Phase | Deliverable | RAD Principle Applied |
|---|---|---|
| **1** | Backend API (public feed, upvotes, groups) | Foundation construction |
| **2** | Frontend Public Feed (hero, cards, filters) | Rapid prototyping |
| **3** | MapLibre GL JS Dashboard (map, markers, form) | User design & prototyping |
| **4** | Group Collaboration & Private Diary pages | Iterative feature addition |
| **5** | Build verification & walkthrough documentation | Quality assurance |
| **6** | Map redirection, custom categories, coordinates | User feedback integration |
| **7** | Mobile nav, GPS, theme toggle, search filters | Responsive design iteration |
| **8** | Geolocation sync, popups, retractable nav, contrast polish | UI refinement cycle |
| **9** | Custom confirmation modals, navbar fixes, Mongoose bug fix | Bug fix iteration |
| **10** | Contrast fixes, Sign-In button, automated endpoint testing | Regression testing |
| **11** | Pagination (12/page), 37-incident seeding | Data-driven iteration |
| **12** | Repository documentation (README, implementation guides) | Documentation phase |
| **13** | Remove member, leave group, rate limiting | Security hardening |
| **14** | Map location search with autocomplete | Feature enhancement |
| **15** | Vercel serverless restructuring (app/server split) | Deployment adaptation |
| **16** | Groq AI Area Briefing integration | AI feature prototype |
| **17** | AI Safety Tip Generator per incident | AI feature expansion |

**Key RAD Observations**:
- Each phase produced a **working, deployable increment**
- **User feedback** drove priorities (e.g., contrast fixes, mobile nav improvements)
- **Prototyping first** — build it, test it, refine it
- **No big-bang deployment** — features added incrementally
- **Continuous verification** — builds checked after every phase

---

## 15. Viva Q&A — Commonly Asked Questions

### General Questions

**Q: What is your project about?**  
A: GeoBrief-Live is a real-time, location-based incident reporting platform built with the MERN stack. It allows communities to report, track, and collaborate on local incidents like road hazards, power outages, and safety concerns. It features interactive mapping, group collaboration, private diaries, and AI-powered area briefings and safety tips.

**Q: Why did you choose the MERN stack?**  
A: MERN provides a unified JavaScript/TypeScript development experience across the entire stack. MongoDB's flexible document model is ideal for varied incident types and geospatial queries. Express provides a lightweight, middleware-driven API layer. React enables a component-based, responsive UI. Node.js offers non-blocking I/O for handling concurrent requests efficiently.

**Q: How does your project apply RAD methodology?**  
A: We followed 17 iterative phases, each producing a working increment. We started with backend APIs (Phase 1), rapidly prototyped the frontend (Phase 2-4), integrated user feedback for UI refinements (Phase 7-10), and added AI features in later iterations (Phase 16-17). Each phase was timeboxed and verified independently.

### Technical Questions

**Q: Explain your authentication system.**  
A: We support dual authentication — local (email/password with bcrypt hashing) and Google OAuth 2.0. Both methods issue a JWT (JSON Web Token) valid for 30 days. The token is stored in LocalStorage and sent as a Bearer token in the Authorization header. The backend's `authMiddleware` verifies the token on protected routes. An Axios interceptor on the frontend handles 401 responses by auto-logging out the user.

**Q: How does your database handle geospatial data?**  
A: Each incident stores its location as a GeoJSON Point (`{ type: 'Point', coordinates: [longitude, latitude] }`). We create a `2dsphere` index on the location field, which enables MongoDB to perform efficient geospatial queries like `$near`, `$geoWithin`, and distance calculations. This is how we render incident markers on the map.

**Q: How did you deploy to Vercel?**  
A: We split the Express app into `app.ts` (configuration) and `server.ts` (local listener). The Vercel entrypoint `api/index.ts` imports and re-exports the Express app. Vercel's `@vercel/node` builder handles TypeScript compilation. `vercel.json` routes all requests to this single serverless function. We resolved connection issues by adding MongoDB connection pooling and fast-fail timeouts.

**Q: What is middleware and how do you use it?**  
A: Middleware are functions that execute sequentially in the request pipeline before reaching the route handler. Each middleware receives `(req, res, next)` and either passes control to the next middleware via `next()` or terminates the chain with a response. Our pipeline: CORS → JSON Parser → DB Connection Check → Rate Limiter → Auth Verification → Route Handler.

**Q: How does your AI integration work securely?**  
A: The Groq API key is stored only on the backend as an environment variable (`GROQ_API_TOKEN`). Frontend components send incident data to our backend endpoints (`/api/ai/brief` and `/api/ai/safety-tip`). The backend controllers instantiate the Groq SDK client, send the prompt to the LLM, and return the generated text. The API key never reaches the browser.

**Q: Explain your state management approach.**  
A: We use Redux Toolkit with two slices — `authSlice` for user authentication state and `incidentSlice` for incident data. The store is configured in `store.ts` using `configureStore`. Components access state via typed custom hooks (`useAppSelector`, `useAppDispatch`). For component-local state (form inputs, modals), we use React's `useState` and `useEffect` hooks.

**Q: What is connection pooling and why is it important in serverless?**  
A: Connection pooling maintains a set of pre-established database connections that can be reused across requests. In serverless environments, each function invocation could create a new MongoDB connection, exhausting the database's connection limit. Our `connectDB()` function checks `mongoose.connection.readyState` — if a connection already exists, it reuses it instead of creating a new one.

**Q: What is CORS and why do you need it?**  
A: CORS (Cross-Origin Resource Sharing) is a browser security mechanism that blocks requests from one domain to another unless the server explicitly allows it. Since our frontend (`geobrief-live.vercel.app`) and backend (`geo-brief-live-backend.vercel.app`) are on different domains, we configure Express's CORS middleware to allow requests from our frontend origin with credentials (cookies/auth headers).

**Q: How does your rate limiting work?**  
A: We built a custom in-memory rate limiter using a JavaScript `Map`. Each client IP address is tracked with a request count and a reset timestamp. If a client exceeds 50 requests within 60 seconds, subsequent requests receive a `429 Too Many Requests` response. The counter resets after the window expires. We use `x-forwarded-for` headers to get the real client IP behind Vercel's proxy.

**Q: What is the difference between `app.ts` and `server.ts`?**  
A: `app.ts` creates and configures the Express application (middleware, routes, CORS) and exports it. `server.ts` imports the app and calls `app.listen(PORT)` to start a local HTTP server — this file is only used during local development (`npm run dev`). On Vercel, `api/index.ts` imports the same app but exports it as a serverless function handler — no `listen()` call is needed because Vercel manages the HTTP layer.

**Q: What are Mongoose hooks/middleware?**  
A: Mongoose hooks (also called middleware) are functions that execute at specific points in a document's lifecycle. We use:
- **Pre-save hook on Group**: Ensures the admin is always included in the members array before saving.
- **Pre-validate hook on Incident**: Validates that group-visibility incidents have at least one group specified, and clears the groups array for non-group incidents.
- **Pre-save hook on User**: Automatically hashes the password using bcrypt before saving to the database.

**Q: Explain Vite and why you used it over Create React App.**  
A: Vite is a modern frontend build tool that uses native ES modules for instant dev server startup (no bundling during development). It uses Rollup for optimized production builds. Compared to Create React App (which uses Webpack), Vite offers: 10-100x faster cold starts, instant Hot Module Replacement (HMR), native TypeScript support, and smaller production bundles. CRA is effectively deprecated in the React ecosystem.

**Q: What is TypeScript and why use it?**  
A: TypeScript is a superset of JavaScript that adds static type checking. It catches errors at compile time (e.g., passing a string where a number is expected), provides IntelliSense autocomplete in IDEs, and makes refactoring safer. In this project, we define interfaces for all data models (IUser, IIncident, IGroup), ensuring type safety across the full stack.

---

*This document was generated as a comprehensive viva preparation guide for the GeoBrief-Live project, covering all technical, architectural, and methodological aspects of the MERN stack application developed using Rapid Application Development methodology.*
