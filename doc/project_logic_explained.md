# GeoBrief-Live — Complete Project Logic Explained

> Every feature, every function, every React hook — explained step by step.

---

## Table of Contents

1. [How the Backend Starts & Processes a Request](#1-how-the-backend-starts--processes-a-request)
2. [Database Connection Logic](#2-database-connection-logic)
3. [Middleware Pipeline — Step by Step](#3-middleware-pipeline--step-by-step)
4. [CRUD Logic — Incident Management (Full Example)](#4-crud-logic--incident-management-full-example)
5. [Authentication Logic (Register, Login, Google OAuth)](#5-authentication-logic-register-login-google-oauth)
6. [JWT Token Generation & Verification](#6-jwt-token-generation--verification)
7. [Upvote Toggle Logic (Atomic MongoDB Operations)](#7-upvote-toggle-logic-atomic-mongodb-operations)
8. [Group Collaboration Logic](#8-group-collaboration-logic)
9. [Admin Ownership Transfer Logic](#9-admin-ownership-transfer-logic)
10. [Remove Member & Leave Group Logic](#10-remove-member--leave-group-logic)
11. [User Profile Update & Delete Logic](#11-user-profile-update--delete-logic)
12. [AI Briefing Generation Logic (Groq LLM)](#12-ai-briefing-generation-logic-groq-llm)
13. [AI Safety Tip Generation Logic](#13-ai-safety-tip-generation-logic)
14. [Rate Limiting Logic](#14-rate-limiting-logic)
15. [Mongoose Hooks (Pre-save & Pre-validate)](#15-mongoose-hooks-pre-save--pre-validate)
16. [Frontend Service Layer Pattern](#16-frontend-service-layer-pattern)
17. [Redux State Management Logic](#17-redux-state-management-logic)
18. [React Hooks — Complete Guide with Project Examples](#18-react-hooks--complete-guide-with-project-examples)
19. [Routing & Protected Routes Logic](#19-routing--protected-routes-logic)
20. [Optimistic UI Updates (Upvoting Pattern)](#20-optimistic-ui-updates-upvoting-pattern)
21. [Client-Side Pagination Logic](#21-client-side-pagination-logic)
22. [Map Integration Logic (MapLibre GL JS)](#22-map-integration-logic-maplibre-gl-js)
23. [Debounced Search Logic](#23-debounced-search-logic)
24. [Theme Toggle (Dark/Light Mode) Logic](#24-theme-toggle-darklight-mode-logic)
25. [Auto-Logout Interceptor Logic](#25-auto-logout-interceptor-logic)
26. [Coordinate Sync Logic (Form ↔ Map)](#26-coordinate-sync-logic-form--map)

---

## 1. How the Backend Starts & Processes a Request

### Local Development Flow

```
npm run dev  →  tsx watch src/server.ts  →  server.ts imports app.ts  →  app.listen(5000)
```

`server.ts` is the entry point for local development:

```typescript
// server.ts — ONLY runs locally, never on Vercel
import app from './app.js';
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running locally on http://localhost:${PORT}`);
});
```

**Logic**: It imports the configured Express app and starts an HTTP listener. This file is **never executed** on Vercel.

### Vercel Serverless Flow

```
Vercel receives HTTP request  →  api/index.ts  →  exports the Express app  →  Vercel passes request to it
```

```typescript
// api/index.ts — Vercel entrypoint
import app from '../src/app.js';
export default app;
```

**Logic**: Vercel calls this file as a serverless function. It doesn't call `app.listen()` — Vercel handles the HTTP layer itself. It just needs the Express `app` object to route requests internally.

### Why the Split?

| Problem | Solution |
|---|---|
| `app.listen()` inside a serverless function causes it to hang and timeout | Keep `app.listen()` in a separate `server.ts` that only runs locally |
| Vercel needs a single exported handler | `api/index.ts` exports the app without any listener |

---

## 2. Database Connection Logic

```typescript
// src/config/db.ts
import mongoose from 'mongoose';

const connectDB = async () => {
    // Step 1: Check if a connection already exists
    if (mongoose.connection.readyState >= 1) {
        return;  // Connection already open — reuse it, don't create a new one
    }

    // Step 2: Validate the URI exists
    const uri = process.env.MONGO_URI;
    if (!uri) {
        throw new Error("MONGO_URI is not defined in the environment variables");
    }

    // Step 3: Connect with a fast-fail timeout
    const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,  // If MongoDB Atlas blocks us, fail in 5 seconds
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
};
```

### Line-by-line logic:

1. **`readyState >= 1`** — Mongoose tracks connection status. `0 = disconnected`, `1 = connected`, `2 = connecting`, `3 = disconnecting`. If it's `>=1`, we already have a connection or one is being established, so we skip.

2. **Why reuse connections?** — In serverless (Vercel), each function invocation could create a new connection. MongoDB Atlas has a connection limit (usually 500). If every request opens a new connection and never closes it, you'd exhaust the limit and crash.

3. **`serverSelectionTimeoutMS: 5000`** — Without this, if MongoDB Atlas's IP whitelist blocks Vercel's IP, Mongoose queues the query indefinitely. Vercel has a 10-second function timeout, so the function silently dies. With 5s timeout, we get a clear error message instead of a hang.

---

## 3. Middleware Pipeline — Step by Step

Every request flows through this chain in order:

```typescript
// app.ts — Middleware registration order matters!
app.use(cors({...}));          // 1️⃣  CORS
app.use(express.json());       // 2️⃣  JSON Parser
app.use(dbMiddleware);         // 3️⃣  Database Connection Check
app.use(rateLimiter(50, 60000)); // 4️⃣  Rate Limiting
app.use('/api/auth', authRoutes); // 5️⃣  Route Matching
```

### 1️⃣ CORS Middleware

```typescript
app.use(cors({
  origin: ['https://geobrief-live.vercel.app', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**What it does**: Browsers block requests from one domain to another by default (Same-Origin Policy). This middleware adds response headers telling the browser "yes, I allow requests from these origins". Without it, the frontend would get `CORS policy blocked` errors.

- `origin`: Only these two URLs are allowed to call our API
- `credentials: true`: Allows cookies and Authorization headers to be sent
- `methods`: Allowed HTTP methods
- `allowedHeaders`: Allowed request headers

### 2️⃣ JSON Parser

```typescript
app.use(express.json());
```

**What it does**: Reads the raw HTTP request body, parses the JSON string, and makes it available as `req.body`. Without this, `req.body` would be `undefined`.

### 3️⃣ Database Connection Middleware

```typescript
export const dbMiddleware = async (req, res, next) => {
  // Skip DB check for health endpoint (fast response)
  if (req.path === '/status' || req.path === '/api/status') {
    next();
    return;
  }

  try {
    await connectDB();  // Ensure DB is connected
    next();             // Pass to next middleware
  } catch (err) {
    // If connection fails, respond immediately — don't let the request reach controllers
    res.status(500).json({
      message: "Database connection failed. Please ensure MONGO_URI is set correctly..."
    });
  }
};
```

**Logic**: Before any route handler runs, this middleware checks if the database is reachable. If it isn't (e.g., IP not whitelisted on Atlas), it returns a 500 error immediately instead of letting the route handler crash with a cryptic Mongoose error.

**Why skip `/status`?** — The status endpoint is a health check. It should respond fast even if the database is down, so monitoring tools can distinguish between "server is running but DB is down" vs "server itself is down".

### 4️⃣ Rate Limiter (explained in [Section 14](#14-rate-limiting-logic))

### 5️⃣ Route Matching

After all global middleware passes, Express matches the URL pattern to the registered route and calls the appropriate controller.

---

## 4. CRUD Logic — Incident Management (Full Example)

> This section explains one complete CRUD cycle in detail. Other CRUDs (Users, Groups) follow the same pattern.

### CREATE — `POST /api/incidents`

**Route Registration:**
```typescript
// incidentRoutes.ts
router.route('/').post(protect, createIncident);
//                     ↑ auth middleware runs first, then the controller
```

**Controller Logic (step by step):**

```typescript
export const createIncident = async (req: AuthRequest, res: Response) => {
  try {
    // Step 1: Verify the user is authenticated
    // The 'protect' middleware already checked the JWT and attached req.user
    // But we do a defensive check in case something went wrong
    if (!req.user || !req.user._id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    // Step 2: Destructure the fields sent by the frontend
    const { title, description, type, visibility, sharedWithGroups, coordinates } = req.body;

    // Step 3: Validate required fields
    if (!title || !description || !type) {
      res.status(400).json({ message: 'Title, description, and type are required' });
      return;
    }

    // Step 4: Business rule — if sharing with a group, at least one group must be specified
    if (visibility === 'group' && (!sharedWithGroups || !Array.isArray(sharedWithGroups) || sharedWithGroups.length === 0)) {
      res.status(400).json({ message: 'At least one group must be specified...' });
      return;
    }

    // Step 5: Validate coordinates — must be array of exactly 2 numbers
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2 ||
        typeof coordinates[0] !== 'number' || typeof coordinates[1] !== 'number') {
      res.status(400).json({ message: 'Valid numeric coordinates [longitude, latitude] are required' });
      return;
    }

    // Step 6: Create the document in MongoDB
    // Mongoose will run the pre-validate hook here (checks group rules)
    const incident = await Incident.create({
      title: title.trim(),          // .trim() removes leading/trailing whitespace
      description: description.trim(),
      type: type.trim(),
      visibility,
      sharedWithGroups: visibility === 'group' ? sharedWithGroups : [],  // Clear groups if not 'group' visibility
      location: {
        type: 'Point',              // GeoJSON format required for 2dsphere index
        coordinates,                // [longitude, latitude]
      },
      reportedBy: req.user._id,     // The logged-in user's MongoDB ObjectId
    });

    // Step 7: Respond with the created document
    res.status(201).json(incident);

  } catch (error: any) {
    // Step 8: Catch any unexpected errors (DB failures, validation errors, etc.)
    res.status(500).json({ message: error.message || 'Server error creating incident' });
  }
};
```

### READ — `GET /api/incidents/public`

```typescript
export const getPublicIncidents = async (req: Request, res: Response) => {
  try {
    // Step 1: Query MongoDB for all public incidents
    const incidents = await Incident.find({ visibility: 'public' })
      .populate('reportedBy', 'name');  // Replace the ObjectId with the user's name

    // Step 2: Sort in memory — first by upvote count (descending), then by date
    incidents.sort((a, b) => {
      const aUpvotes = a.upvotes ? a.upvotes.length : 0;
      const bUpvotes = b.upvotes ? b.upvotes.length : 0;
      if (bUpvotes !== aUpvotes) return bUpvotes - aUpvotes;  // More upvotes first
      // If same upvotes, newer incidents first
      const aTime = (a as any).createdAt ? new Date((a as any).createdAt).getTime() : 0;
      const bTime = (b as any).createdAt ? new Date((b as any).createdAt).getTime() : 0;
      return bTime - aTime;
    });

    res.status(200).json(incidents);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching public incidents' });
  }
};
```

**Key concept — `.populate('reportedBy', 'name')`**: Instead of returning `reportedBy: "6a325e44..."` (raw ObjectId), Mongoose replaces it with `reportedBy: { _id: "6a325e44...", name: "Alice Smith" }`. This is called **population** — it's like a SQL JOIN.

### READ (Authenticated) — `GET /api/incidents`

```typescript
export const getIncidents = async (req: AuthRequest, res: Response) => {
  const userId = req.user._id;

  // Step 1: Find all groups this user belongs to
  const userGroups = await Group.find({ members: userId }).select('_id');
  const userGroupIds = userGroups.map(group => group._id);

  // Step 2: Query with $or — show incidents the user has access to
  const incidents = await Incident.find({
    $or: [
      { visibility: 'public' },                                    // All public
      { visibility: 'private', reportedBy: userId },               // Only their own private
      { visibility: 'group', sharedWithGroups: { $in: userGroupIds } } // Groups they're in
    ]
  }).populate('reportedBy', 'name');
};
```

**Key concept — `$or` query**: MongoDB's `$or` operator returns documents matching ANY of the conditions. A user sees:
- All public incidents (everyone can see these)
- Private incidents ONLY if they reported them
- Group incidents ONLY if the incident's `sharedWithGroups` contains a group the user belongs to (`$in` checks if any value in the array matches)

---

## 5. Authentication Logic (Register, Login, Google OAuth)

### Register Flow

```typescript
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  // 1. Validate inputs
  if (!name || name.trim() === '') → 400 'Name is required'
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) → 400 'A valid email is required'
  if (!password || password.length < 6) → 400 'Password must be at least 6 characters'

  // 2. Check if email already taken
  const userExists = await User.findOne({ email });
  if (userExists) → 400 'User already exists'

  // 3. Create user — password hashing happens AUTOMATICALLY via Mongoose pre-save hook
  const user = await User.create({
    name: name.trim(),
    email: email.trim(),
    passwordHash: password,    // Stored as plain text here, but the pre-save hook hashes it
    authProvider: 'local'
  });

  // 4. Generate JWT and respond
  res.status(201).json({
    _id: user.id,
    name: user.name,
    email: user.email,
    token: generateToken(user.id),  // JWT valid for 30 days
  });
};
```

**Important**: The password is assigned to `passwordHash` as plain text. But before `User.create()` saves to the database, the Mongoose **pre-save hook** intercepts it and hashes it:

```typescript
userSchema.pre('save', async function () {
  if (!this.isModified('passwordHash') || !this.passwordHash) return;
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});
```

So the database never stores the raw password.

### Login Flow

```typescript
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // 1. Find user by email
  const user = await User.findOne({ email: email.trim() });

  // 2. Compare submitted password with stored hash
  if (user && user.passwordHash && (await user.comparePassword(password))) {
    // Password matches → return JWT
    res.json({ _id: user.id, token: generateToken(user.id), ... });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};
```

**`comparePassword` method** (defined on the User model):
```typescript
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};
```
`bcrypt.compare()` takes the submitted plain-text password, hashes it with the same salt that was used originally, and checks if the result matches the stored hash. It never decrypts the hash.

### Google OAuth Flow

```typescript
export const googleLogin = async (req, res) => {
  const { token } = req.body;   // Google ID token from frontend

  // 1. Verify the token with Google's servers
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();  // { email, name, sub, picture }

  // 2. Check if user exists
  let user = await User.findOne({ email: payload.email });

  // 3. If exists but registered with password → reject
  if (user && user.authProvider !== 'google') {
    res.status(400).json({ message: 'Email already registered. Use password.' });
    return;
  }

  // 4. If new user → create account automatically
  if (!user) {
    user = await User.create({
      name: payload.name,
      email: payload.email,
      authProvider: 'google',
      googleId: payload.sub,
      picture: payload.picture,
    });
  }

  // 5. Issue OUR OWN JWT (not Google's token)
  res.json({ _id: user._id, token: generateToken(user._id.toString()), ... });
};
```

**Why issue our own JWT?** — Google's token has its own expiry and format. By issuing our own JWT, we control the expiry (30 days), the payload, and the verification logic across all routes.

---

## 6. JWT Token Generation & Verification

### Generation

```typescript
const generateToken = (id: string) => {
  return jwt.sign(
    { id },                              // Payload — the user's MongoDB _id
    process.env.JWT_SECRET as string,     // Secret key — only the server knows this
    { expiresIn: '30d' }                 // Token expires in 30 days
  );
};
```

**What does the token look like?**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMzI1ZTQ0IiwiaWF0IjoxNjg...
```

It has 3 parts separated by dots:
1. **Header** — algorithm used (HS256)
2. **Payload** — `{ id: "6a325e44...", iat: 1687..., exp: 1690... }`
3. **Signature** — HMAC-SHA256 of header+payload using JWT_SECRET

### Verification (Auth Middleware)

```typescript
export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  // Step 1: Check JWT_SECRET exists on the server
  if (!process.env.JWT_SECRET) {
    res.status(500).json({ message: 'Internal server configuration error' });
    return;
  }

  // Step 2: Extract token from "Authorization: Bearer <token>" header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    const token = req.headers.authorization.split(' ')[1];

    // Step 3: Verify token signature and expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string };
    // If token is expired or tampered with, jwt.verify() throws an error → caught below

    // Step 4: Fetch the user from DB (exclude password hash for security)
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      res.status(401).json({ message: 'Not authorized, user not found' });
      return;
    }

    // Step 5: Attach user to request object for downstream controllers
    req.user = user;
    next();  // Continue to the route handler
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};
```

**The flow**: `Request with token → protect middleware → verify JWT → find user in DB → attach to req.user → next() → controller uses req.user._id`

---

## 7. Upvote Toggle Logic (Atomic MongoDB Operations)

```typescript
export const toggleUpvote = async (req: AuthRequest, res: Response) => {
  const incidentId = req.params.id;
  const userId = req.user._id;

  const incident = await Incident.findById(incidentId);

  // Authorization check: can't upvote private incidents you don't own
  if (incident.visibility === 'private' && incident.reportedBy.toString() !== userId.toString()) {
    res.status(403).json({ message: 'Not authorized' });
    return;
  }

  // Check if user already upvoted
  const hasUpvoted = incident.upvotes.some((id) => id.toString() === userId.toString());

  if (hasUpvoted) {
    // REMOVE upvote using $pull (atomic operation)
    updatedIncident = await Incident.findByIdAndUpdate(
      incidentId,
      { $pull: { upvotes: userId } },      // Removes userId from the array
      { new: true }                         // Return the updated document
    ).populate('reportedBy', 'name');
  } else {
    // ADD upvote using $addToSet (atomic, prevents duplicates)
    updatedIncident = await Incident.findByIdAndUpdate(
      incidentId,
      { $addToSet: { upvotes: userId } },  // Only adds if not already present
      { new: true }
    ).populate('reportedBy', 'name');
  }

  res.status(200).json(updatedIncident);
};
```

### Why `$pull` and `$addToSet` instead of `array.push()` and `array.filter()`?

**Race condition**: If two users upvote at the same time:
- With `array.push()`: Both read the array, both push, one overwrites the other → lost upvote
- With `$addToSet`: MongoDB handles it atomically at the database level → no data loss

`$addToSet` also prevents duplicates — even if the same request fires twice, the user ID is only added once.

---

## 8. Group Collaboration Logic

### Create Group

```typescript
export const createGroup = async (req, res) => {
  const group = await Group.create({
    name: name.trim(),
    description: description?.trim(),
    admin: req.user._id,        // Creator becomes the admin
    // members is NOT set here — the pre-save hook adds the admin automatically
  });
};
```

The **pre-save hook** on the Group model ensures the admin is always a member:

```typescript
groupSchema.pre('save', async function () {
  if (this.admin) {
    if (!this.members) this.members = [];
    const adminStr = this.admin.toString();
    const hasAdmin = this.members.some(m => m?.toString() === adminStr);
    if (!hasAdmin) this.members.push(this.admin);
  }
});
```

### Add Member to Group

```typescript
export const addMemberToGroup = async (req, res) => {
  const { email } = req.body;
  const group = await Group.findById(req.params.id);

  // Only admin can add members
  if (group.admin.toString() !== req.user._id.toString()) → 403

  // Find user by email
  const userToAdd = await User.findOne({ email: trimmedEmail });
  if (!userToAdd) → 404 'No user found with that email'

  // Check if already a member
  if (group.members.some(m => m.toString() === userToAdd._id.toString())) → 400 'Already a member'

  // Add and save
  group.members.push(userToAdd._id);
  await group.save();
};
```

---

## 9. Admin Ownership Transfer Logic

```typescript
export const makeGroupAdmin = async (req, res) => {
  const { newAdminId } = req.body;
  const group = await Group.findById(req.params.id);

  // Only current admin can transfer
  if (group.admin.toString() !== req.user._id.toString()) → 403

  // New admin must already be a member
  const isMember = group.members.some(m => m.toString() === newAdminId);
  if (!isMember) → 400 'New admin must be a member'

  // Transfer ownership
  group.admin = new mongoose.Types.ObjectId(newAdminId);
  await group.save();
  // The pre-save hook ensures the new admin stays in the members array
};
```

---

## 10. Remove Member & Leave Group Logic

### Remove Member (Admin action)

```typescript
// Admin cannot remove themselves — must transfer ownership first
if (memberId === group.admin.toString()) → 400 'Transfer ownership first'

// Filter the member out of the array
group.members = group.members.filter(mId => mId.toString() !== memberId);
await group.save();
```

### Leave Group (Member action)

```typescript
// Admin cannot leave — must transfer ownership first
if (group.admin.toString() === userId.toString()) → 400 'Transfer ownership first'

// Remove yourself from members
group.members = group.members.filter(mId => mId.toString() !== userId.toString());
await group.save();
```

---

## 11. User Profile Update & Delete Logic

### Update Profile

```typescript
export const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  // Update name (if provided)
  if (req.body.name !== undefined) {
    user.name = req.body.name.trim();
  }

  // Update password (only for local auth users)
  if (req.body.newPassword && user.authProvider === 'local') {
    // Require current password for security
    if (!req.body.currentPassword) → 400 'Current password required'

    // Verify current password
    const isMatch = await user.comparePassword(req.body.currentPassword);
    if (!isMatch) → 400 'Incorrect current password'

    // Set new password — pre-save hook will hash it automatically
    user.passwordHash = req.body.newPassword;
  }

  const updatedUser = await user.save();  // pre-save hook hashes the password here
};
```

### Delete Profile

```typescript
const deletedUser = await User.findByIdAndDelete(req.user._id);
// That's it — MongoDB removes the document permanently
```

---

## 12. AI Briefing Generation Logic (Groq LLM)

```typescript
export const generateBrief = async (req, res) => {
  const { incidents } = req.body;  // Array of incident description strings from frontend

  // Step 1: Check for API key (supports both naming conventions)
  const apiKey = process.env.GROQ_API_TOKEN || process.env.GROQ_API_KEY;
  if (!apiKey) → 500 'Groq API token is missing...'

  // Step 2: Validate input
  if (!incidents || !Array.isArray(incidents)) → 400
  if (incidents.length === 0) → 200 with default "safe" message

  // Step 3: Initialize Groq client (lazy — created per-request to use fresh env vars)
  const groq = new Groq({ apiKey });

  // Step 4: Send chat completion request
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "Act as a civic news broadcaster. Summarize the following local incidents..."
      },
      {
        role: "user",
        content: incidents.join("\n")   // All incident descriptions as a single text block
      }
    ],
    model: "llama-3.3-70b-versatile",  // Fast open-source LLM
  });

  // Step 5: Extract and return the generated text
  const summary = completion.choices[0]?.message?.content || "Could not generate summary.";
  res.status(200).json({ summary });
};
```

**Security**: The API key is on the backend only. The frontend never sees it. The flow is:

```
Frontend → POST /api/ai/brief (with JWT) → Backend (has GROQ_API_TOKEN) → Groq API → Response back
```

---

## 13. AI Safety Tip Generation Logic

Same pattern as briefing, but with a different prompt:

```typescript
const completion = await groq.chat.completions.create({
  messages: [
    {
      role: "system",
      content: "You are a local public safety expert. Provide a single, actionable, urgent 1-sentence safety tip..."
    },
    {
      role: "user",
      content: `Category: ${category}\nTitle: ${title}`
    }
  ],
  model: "llama-3.3-70b-versatile",
});

const tip = completion.choices[0]?.message?.content;
res.status(200).json({ tip });
```

---

## 14. Rate Limiting Logic

```typescript
const ipRequestCounts = new Map<string, { count: number; resetTime: number }>();

export const rateLimiter = (limit: number, windowMs: number) => {
  return (req, res, next) => {
    // Step 1: Get client IP (x-forwarded-for for proxied requests like Vercel)
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    let record = ipRequestCounts.get(ip);

    // Step 2: If no record or window expired → reset counter
    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs };
      ipRequestCounts.set(ip, record);
      next();  // Allow the request
      return;
    }

    // Step 3: If limit exceeded → block
    if (record.count >= limit) {
      res.status(429).json({ message: 'Too many requests...' });
      return;  // DON'T call next() — request is rejected
    }

    // Step 4: Under limit → increment and allow
    record.count++;
    next();
  };
};
```

**How it works**: An in-memory `Map` stores `{ IP → { count, resetTime } }`. Every request increments the counter. When the window expires (60 seconds), the counter resets. If the counter hits 50 before the window expires, requests are blocked with 429.

---

## 15. Mongoose Hooks (Pre-save & Pre-validate)

### User Pre-save — Password Hashing

```typescript
userSchema.pre('save', async function () {
  // Only hash if the passwordHash field was actually modified
  // This prevents re-hashing an already-hashed password when updating other fields
  if (!this.isModified('passwordHash') || !this.passwordHash) return;

  const salt = await bcrypt.genSalt(10);  // Random salt with 10 rounds
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});
```

### Group Pre-save — Admin in Members

```typescript
groupSchema.pre('save', async function () {
  // Guarantee admin is always in the members array
  if (this.admin) {
    if (!this.members) this.members = [];
    const hasAdmin = this.members.some(m => m?.toString() === this.admin.toString());
    if (!hasAdmin) this.members.push(this.admin);
  }
});
```

### Incident Pre-validate — Group Visibility Rules

```typescript
incidentSchema.pre('validate', function (next) {
  // If visibility is 'group', at least one group must be specified
  if (this.visibility === 'group' && (!this.sharedWithGroups || this.sharedWithGroups.length === 0)) {
    this.invalidate('sharedWithGroups', 'At least one group must be specified...');
  }

  // If visibility is NOT 'group', clear any stale group references
  if (this.visibility !== 'group') {
    this.sharedWithGroups = [];
  }
});
```

---

## 16. Frontend Service Layer Pattern

Every API call goes through a **service** file. This separates network logic from UI logic.

```typescript
// services/incidentService.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL + '/incidents/';

// Reusable auth header builder
const getAuthHeaders = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// Each function = one API call
const getPublicIncidents = async () => {
  const response = await axios.get(API_URL + 'public');
  return response.data;    // Axios wraps the response; .data extracts the JSON body
};

const createIncident = async (incidentData: {...}, token: string) => {
  const response = await axios.post(API_URL, incidentData, getAuthHeaders(token));
  return response.data;
};

const toggleUpvote = async (incidentId: string, token: string) => {
  const response = await axios.put(API_URL + `${incidentId}/upvote`, {}, getAuthHeaders(token));
  return response.data;
};
```

**Why this pattern?**
- Components don't know about URLs, headers, or axios
- If the API changes, only the service file needs updating
- Easy to mock for testing

---

## 17. Redux State Management Logic

### Auth Slice — Login/Logout State

```typescript
// store/slices/authSlice.ts
const initialState = {
  // On app load, check if user data exists in localStorage
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),  // !! converts string to boolean
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Called after successful login/register
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      // Persist to localStorage so auth survives page refresh
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('token', action.payload.token);
    },

    // Called when user updates their profile
    updateUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },

    // Called on logout or 401 interceptor
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
  },
});
```

### How Components Use Redux

```typescript
// Reading state (in any component):
const { token, isAuthenticated, user } = useAppSelector((state) => state.auth);

// Dispatching actions:
const dispatch = useAppDispatch();
dispatch(setCredentials({ user: data, token: data.token }));
dispatch(logout());
```

---

## 18. React Hooks — Complete Guide with Project Examples

> **What are React Hooks?**
> 
> **In Simple Words**: Hooks are special helper tools that React gives you to add features to your components. Without hooks, a component is just a static picture. With hooks, it can remember things, react to changes, talk to the server, and more. Think of them as **superpowers** you plug into your component.

---

### `useState` — Remember Things

> **In Simple Words**: Imagine a whiteboard in a classroom. You can write a value on it (like a student's score), and whenever someone erases and writes a new value, everybody in the room instantly sees the update. `useState` is that whiteboard for your component.
>
> - You give it a **starting value** (like writing "0" on the whiteboard when class starts).
> - It gives you back **two things**: the current value on the board, and an eraser-and-marker tool (the setter function) to change it.
> - Every time you change the value, React automatically refreshes the screen to show the new value.
>
> **Why do we need this?** Without `useState`, a component has no memory. If a user types in a text box, the component wouldn't remember what was typed. `useState` gives the component its own personal notebook to remember things between screen updates.

**Syntax**: `const [value, setValue] = useState(initialValue);`

- `value` = what's currently on the whiteboard
- `setValue` = the function to erase and write a new value
- `initialValue` = what's written when the whiteboard is first set up

**Project examples**:

```typescript
// Login.tsx — Form input state
const [email, setEmail] = useState('');           // Whiteboard starts empty
const [password, setPassword] = useState('');
const [error, setError] = useState('');
const [isLogin, setIsLogin] = useState(true);     // true = show login form, false = show register form
const [showPassword, setShowPassword] = useState(false); // false = password is hidden (dots), true = visible
```
> ☝️ **In Simple Words**: Each of these is like a separate sticky note on the Login page. One sticky note remembers what the user typed in the email box, another remembers the password, another tracks if there's an error to show, and another tracks whether we're showing the Login form or the Sign Up form.

```typescript
// Home.tsx — Data fetching state
const [incidents, setIncidents] = useState<Incident[]>([]);  // Start with an empty list
const [loading, setLoading] = useState(true);                // Start showing a spinner
const [error, setError] = useState<string | null>(null);     // No error at first
const [selectedCategory, setSelectedCategory] = useState("all");  // Show all categories by default
const [searchTerm, setSearchTerm] = useState("");            // Search box starts empty
const [currentPage, setCurrentPage] = useState(1);           // Start on page 1
```
> ☝️ **In Simple Words**: The Home page has 6 sticky notes. One holds the list of incidents from the server. One says "yes I'm still loading" or "done loading". One holds the current error message (if any). One tracks which category filter pill the user clicked. One holds what they typed in the search bar. And one tracks which page number they're on (page 1, 2, 3...).

```typescript
// Dashboard.tsx — Map interaction state
const [selectedCoordinates, setSelectedCoordinates] = useState<[number, number] | null>(null);
const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
const [activeTab, setActiveTab] = useState<"map" | "panel">("map");
```
> ☝️ **In Simple Words**: The Map Dashboard has 3 sticky notes. One remembers WHERE the user clicked on the map (the coordinates). One remembers WHICH incident marker they clicked on. One tracks whether the mobile user is viewing the "Map" tab or the "Details" tab.

```typescript
// Navbar.tsx — Theme state with localStorage initializer
const [isDark, setIsDark] = useState(() => {
  const saved = localStorage.getItem("theme");
  return saved ? saved === "dark" : true;
});
```
> ☝️ **In Simple Words**: This sticky note remembers whether the app is in Dark Mode or Light Mode. When the page first loads, it checks the browser's storage to see if the user previously chose a theme. If they did, it uses that. If not, it defaults to dark mode. The `() => { ... }` function only runs once — like reading a saved preference from a filing cabinet when you first open the app.

```typescript
// MapContainer.tsx — Search state
const [searchQuery, setSearchQuery] = useState("");
const [searchResults, setSearchResults] = useState<any[]>([]);
const [searchLoading, setSearchLoading] = useState(false);
```
> ☝️ **In Simple Words**: Three sticky notes for the map's search bar. One holds what the user typed in the search box. One holds the list of location suggestions that came back from the internet. One tracks whether we're still waiting for suggestions to arrive.

---

### `useEffect` — Do Something When Something Changes

> **In Simple Words**: Imagine you have an assistant sitting next to you. You tell this assistant: *"Hey, whenever the weather changes, close or open the window."* That's `useEffect`. You tell React: *"Whenever this specific thing changes, do this specific action."*
>
> You can also tell the assistant: *"When you're done for the day (the component leaves the screen), make sure to close all the windows."* That's the **cleanup function**.
>
> - **Empty list of things to watch `[]`** → The assistant only does the action ONCE, when they first arrive (like setting up the room on day one).
> - **A list with specific things `[weather, temperature]`** → The assistant watches those things and acts whenever ANY of them change.
> - **Cleanup (the `return` function)** → Instructions for what to do when leaving, like "turn off the lights when you leave the room."
>
> **Why do we need this?** Components need to do things beyond just showing text and buttons — they need to fetch data from servers, start timers, set up maps, listen for events, and clean up after themselves. `useEffect` is how you tell React to do those "side" tasks.

**Syntax**: `useEffect(() => { /* do something */ return () => { /* clean up */ }; }, [things to watch]);`

**Project examples**:

**Example 1: Fetch data when the page first loads**
```typescript
// Home.tsx
useEffect(() => {
  fetchPublicIncidents();   // Go get the incident list from the server
}, []);                      // [] = do this only ONCE when the page first appears
```
> ☝️ **In Simple Words**: When the Public Feed page first opens, the assistant runs to the server, grabs the list of incidents, and brings them back. The empty `[]` means "only do this once when the page loads, don't keep doing it."

**Example 2: Reset to page 1 when filters change**
```typescript
// Home.tsx
useEffect(() => {
  setCurrentPage(1);
}, [selectedCategory, searchTerm]);
```
> ☝️ **In Simple Words**: The assistant is watching two things — the category filter and the search box. Whenever the user picks a different category OR types something in the search box, the assistant flips back to page 1 of the results. You wouldn't want to stay on page 3 of "Road" incidents when you just switched to "Power" incidents — that might be an empty page.

**Example 3: Handle a redirect from another page**
```typescript
// Dashboard.tsx
useEffect(() => {
  if (location.state && location.state.centerCoordinates) {
    const coords = location.state.centerCoordinates;
    setSelectedCoordinates(coords);
    setActiveTab("map");
  }
}, [location.state, incidents]);
```
> ☝️ **In Simple Words**: When a user clicks "View on Map" from the Public Feed, they get sent to the Dashboard page with a secret note attached (the coordinates). The assistant checks: "Did someone send us a note with coordinates?" If yes, it places a pin at those coordinates and switches to the map view. It watches for changes in the navigation data and the incident list.

**Example 4: Keep the form in sync with the map**
```typescript
// IncidentForm.tsx — When the map pin moves, update the text boxes
useEffect(() => {
  if (parseFloat(lng) !== coordinates[0] || parseFloat(lat) !== coordinates[1]) {
    setLng(coordinates[0].toString());
    setLat(coordinates[1].toString());
  }
}, [coordinates]);
```
> ☝️ **In Simple Words**: The assistant watches the map pin coordinates. If someone clicks a different spot on the map, the pin moves, and the assistant updates the latitude/longitude text boxes in the form to match the new pin position. This keeps the form and the map in sync.

**Example 5: When the user types coordinates, move the map pin**
```typescript
// IncidentForm.tsx
useEffect(() => {
  const parsedLng = parseFloat(lng);
  const parsedLat = parseFloat(lat);
  if (!isNaN(parsedLng) && !isNaN(parsedLat)) {
    if (parsedLng >= -180 && parsedLng <= 180 && parsedLat >= -90 && parsedLat <= 90) {
      onCoordinatesChange?.([parsedLng, parsedLat]);
    }
  }
}, [lng, lat, onCoordinatesChange]);
```
> ☝️ **In Simple Words**: This is the reverse of Example 4. The assistant watches the text boxes. If the user manually types a latitude and longitude, the assistant tells the map: "Move the pin to these new coordinates." It also checks that the numbers make sense (latitude must be between -90 and 90, longitude between -180 and 180) before moving anything.

**Example 6: Apply the dark/light theme**
```typescript
// Navbar.tsx
useEffect(() => {
  if (isDark) {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }
}, [isDark]);
```
> ☝️ **In Simple Words**: The assistant watches the theme switch. When the user toggles to dark mode, the assistant flips the entire website's appearance to dark colors and saves the choice in the browser so it remembers next time. When toggled to light mode, it reverses everything.

**Example 7: Run a clock that ticks every second (with cleanup)**
```typescript
// LiveClock.tsx
useEffect(() => {
  const timerId = setInterval(() => {
    setTime(new Date());
  }, 1000);

  return () => clearInterval(timerId);  // ← CLEANUP
}, []);
```
> ☝️ **In Simple Words**: When the clock component appears on screen, the assistant starts a timer that ticks every 1 second and updates the displayed time. The **cleanup** part (`return () => clearInterval(timerId)`) is like telling the assistant: *"When this clock is removed from the screen (for example, the user navigates away), STOP the timer. Don't leave it running in the background wasting resources."* Without cleanup, invisible timers would pile up and slow down the app.

**Example 8: Create the map (with cleanup)**
```typescript
// MapContainer.tsx
useEffect(() => {
  const map = new maplibregl.Map({
    container: mapContainerRef.current,
    style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
    center: [79.8612, 6.9271],
    zoom: 12,
  });
  map.addControl(new maplibregl.NavigationControl(), "top-right");
  map.on("click", (e) => onMapClick(e.lngLat.lng, e.lngLat.lat));
  mapRef.current = map;

  return () => map.remove();  // ← CLEANUP: destroy the map when leaving the page
}, []);
```
> ☝️ **In Simple Words**: When the Dashboard page loads, the assistant builds the interactive map, sets it to show Colombo, Sri Lanka, adds zoom buttons, and starts listening for clicks. The `[]` means this only happens once. The cleanup (`map.remove()`) destroys the map when the user leaves the Dashboard — otherwise, you'd have invisible maps stacking up in memory.

**Example 9: Update map pins when incident data changes**
```typescript
// MapContainer.tsx
useEffect(() => {
  markersRef.current.forEach((m) => m.remove());  // Remove all old pins
  markersRef.current = [];

  incidents.forEach((incident) => {
    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([lng, lat])
      .addTo(map);
    markersRef.current.push(marker);
  });
}, [incidents]);
```
> ☝️ **In Simple Words**: The assistant watches the list of incidents. Whenever a new incident is added (or the list changes for any reason), the assistant removes ALL the old pins from the map and places fresh pins for every incident in the new list. This ensures the map always shows the latest data.

**Example 10: Debounced location search**
```typescript
// MapContainer.tsx
useEffect(() => {
  if (!searchQuery.trim()) { setSearchResults([]); return; }

  const delayDebounceFn = setTimeout(async () => {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?...`);
    const data = await res.json();
    setSearchResults(data);
  }, 500);

  return () => clearTimeout(delayDebounceFn);  // ← CLEANUP: cancel the previous timer
}, [searchQuery]);
```
> ☝️ **In Simple Words**: Imagine you're ordering food by phone. Instead of calling the restaurant after every single letter you type ("c"... "co"... "col"... "colo"...), you wait until you've finished typing the full word "colombo" and THEN call. That's debouncing.
>
> The assistant watches the search box. Every time the user types a letter, the assistant starts a 500ms (half-second) countdown. If the user types another letter before the countdown finishes, the assistant cancels the old countdown and starts a new one. Only when the user STOPS typing for half a second does the assistant actually search the internet for locations. This prevents sending dozens of unnecessary requests.

---

### `useRef` — A Private Notebook That Doesn't Refresh the Screen

> **In Simple Words**: Imagine you have a private notebook that only YOU can see. You can scribble notes in it, cross things out, and write new things — but nobody else in the room notices or reacts to your scribbles. The room doesn't get repainted every time you write something.
>
> Compare this to `useState`, which is like a **public announcement board** — every time you change something on it, everyone in the room (the screen) reacts and updates.
>
> `useRef` is perfect for:
> - **Pointing at things on the screen** (like saying "I'm talking about THIS specific text box")
> - **Remembering behind-the-scenes objects** (like a map instance) that the user doesn't directly see
> - **Tracking things silently** without causing the screen to flicker or refresh
>
> **Why do we need this?** Some things need to persist between renders but shouldn't trigger a screen refresh. If you stored a map object in `useState`, the screen would re-render every time the map moved — causing infinite loops. `useRef` lets you hold onto it quietly.

**Syntax**: `const ref = useRef(initialValue);` — Read/write via `ref.current`.

**Project examples**:

```typescript
// MapContainer.tsx
const mapContainerRef = useRef<HTMLDivElement>(null);             // "I'm pointing at THIS div on the page"
const mapRef = useRef<maplibregl.Map | null>(null);              // "I'm remembering the map object"
const markersRef = useRef<maplibregl.Marker[]>([]);              // "I'm keeping a list of all map pins"
const clickMarkerRef = useRef<maplibregl.Marker | null>(null);   // "I'm remembering the temporary pin"
const activePopupRef = useRef<maplibregl.Popup | null>(null);    // "I'm remembering the open popup"
```
> ☝️ **In Simple Words**: The map component has 5 private notebook entries. One points to the actual HTML element where the map is drawn. One holds the map object itself (so other parts of the code can talk to it). One keeps a list of all the incident pins. One remembers the temporary red pin the user placed. And one remembers the currently open popup bubble. None of these cause the screen to refresh when they change.

```typescript
// Usage — Attaching a ref to an HTML element:
<div ref={mapContainerRef} className="w-full h-full" />
// ↑ This is like putting a name tag on this div saying "you are mapContainerRef"

// Later, accessing that element:
const map = new maplibregl.Map({ container: mapContainerRef.current });
// ↑ "Create a map inside the div I tagged earlier"

// Storing a value without re-rendering:
mapRef.current = map;            // Write to notebook — NO screen refresh
markersRef.current.push(marker); // Add to list — NO screen refresh
```

**`useState` vs `useRef` — When to use which?**

| Situation | Use `useState` | Use `useRef` |
|---|---|---|
| User types in a text box | ✅ Screen needs to show what they typed | |
| Loading spinner on/off | ✅ Screen needs to show/hide the spinner | |
| Storing the map object | | ✅ Map doesn't need to redraw the whole page |
| Keeping a list of map markers | | ✅ Adding/removing markers is handled by the map library |
| Pointing at a specific HTML element | | ✅ The element itself doesn't change |

---

### `useNavigate` — Tell the App to Go to a Different Page

> **In Simple Words**: Imagine you're standing in a hotel lobby, and you tell the receptionist: *"Take me to Room 205."* The receptionist walks you there. `useNavigate` is that receptionist — you give it a page name, and it takes the user there.
>
> This is different from a `<Link>` button which the user clicks themselves. `useNavigate` lets your CODE decide to move the user to a different page — for example, after they successfully log in, your code says "ok, now go to the dashboard."
>
> You can also pass **secret notes** (data) along with the navigation, like: *"Go to the Dashboard page, and here's a note with the map coordinates to focus on."*
>
> **Why do we need this?** Sometimes navigation should happen automatically (after login, after an error, after a timeout) — not just when the user clicks a link.

```typescript
// Login.tsx — After successful login, go to dashboard automatically
const navigate = useNavigate();
navigate('/dashboard');
```
> ☝️ **In Simple Words**: "Login was successful! Now take the user to the Dashboard page."

```typescript
// Home.tsx — If user tries to upvote but isn't logged in, send them to login
if (!token) {
  navigate("/login");
  return;
}
```
> ☝️ **In Simple Words**: "You're trying to upvote, but you're not logged in. Let me take you to the login page first."

```typescript
// IncidentCard.tsx — Go to map and pass coordinates as a secret note
navigate('/dashboard', {
  state: {
    centerCoordinates: incident.location.coordinates,
    selectedIncidentId: incident._id,
  }
});
```
> ☝️ **In Simple Words**: "Take the user to the Dashboard page, and slip a note under the door with the coordinates `[79.86, 6.93]` so the map knows where to zoom in."

---

### `useLocation` — Check What Page You're On (and Read Any Secret Notes)

> **In Simple Words**: Imagine you're in a shopping mall and you look at the "You Are Here" sign on the map. `useLocation` is that sign — it tells your component which page the user is currently viewing.
>
> It also lets you read any **secret notes** that were passed when someone navigated to this page (the `state` from `useNavigate`).
>
> **Why do we need this?** The Navbar needs to highlight the correct tab (are we on "Public Feed" or "Dashboard"?). The Dashboard needs to read the coordinates that were passed from the "View on Map" button.

```typescript
// Dashboard.tsx — Read the secret note with coordinates
const location = useLocation();
useEffect(() => {
  if (location.state?.centerCoordinates) {
    setSelectedCoordinates(location.state.centerCoordinates);
  }
}, [location.state]);
```
> ☝️ **In Simple Words**: "Check if someone slipped a note under the door with coordinates. If yes, put a pin on the map at those coordinates."

```typescript
// Navbar.tsx — Highlight the active navigation tab
const location = useLocation();
const isActive = (path: string) => location.pathname === path;
```
> ☝️ **In Simple Words**: "Look at the 'You Are Here' sign. If we're on `/dashboard`, highlight the 'Map Dashboard' link in the navigation bar."

---

### `useAppSelector` & `useAppDispatch` — Talk to the Global Memory (Redux Store)

> **In Simple Words**: Imagine a **shared office bulletin board** that everyone in the building can see. Any department (component) can walk up and read what's posted on it (`useAppSelector`). Any department can also pin a new notice or remove an old one (`useAppDispatch`).
>
> In our app, the bulletin board (Redux store) has two sections:
> - **Auth section**: Who is logged in? What's their token? Are they authenticated?
> - **Incidents section**: What incidents have been loaded?
>
> `useAppSelector` = **reading** from the bulletin board
> `useAppDispatch` = **posting/removing** notices on the bulletin board
>
> **Why do we need this?** Some data needs to be shared across MANY components. The Navbar needs to know if the user is logged in (to show profile vs Sign In). The Home page needs the token to make API calls. The Dashboard needs user info. Instead of passing this data through 10 levels of parent→child props, we put it on a central bulletin board that anyone can access.

```typescript
// READING from the bulletin board:
const { token, isAuthenticated, user } = useAppSelector((state) => state.auth);
```
> ☝️ **In Simple Words**: "Walk up to the bulletin board. Look at the Auth section. Read the token, whether the user is logged in, and who they are."

```typescript
// POSTING to the bulletin board:
const dispatch = useAppDispatch();

// After login — post user info and token
dispatch(setCredentials({ user: data, token: data.token }));
```
> ☝️ **In Simple Words**: "Pin a notice on the bulletin board saying: 'Alice Smith just logged in. Here's her access pass (token).'" Every component in the building that's watching the bulletin board will instantly see this update.

```typescript
// Removing notices — logging out
dispatch(logout());
```
> ☝️ **In Simple Words**: "Take down all the login notices from the bulletin board. Nobody is logged in anymore." The Navbar will instantly switch from showing a profile picture to showing a "Sign In" button.

---

## 19. Routing & Protected Routes Logic

```typescript
// AppRoutes.tsx
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" />;
  // If logged in → render the page
  // If not → redirect to login
};

<Routes>
  <Route path="/" element={<Home />} />           {/* Public — anyone can view */}
  <Route path="/login" element={<Login />} />      {/* Public */}

  {/* Protected — redirects to /login if not authenticated */}
  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
  <Route path="/private" element={<ProtectedRoute><PrivateIncidents /></ProtectedRoute>} />
  <Route path="/groups" element={<ProtectedRoute><GroupManager /></ProtectedRoute>} />

  <Route path="*" element={<Navigate to="/" />} />  {/* Catch-all → redirect to home */}
</Routes>
```

---

## 20. Optimistic UI Updates (Upvoting Pattern)

```typescript
// Home.tsx — handleUpvote
const handleUpvote = async (incidentId: string) => {
  // Step 1: OPTIMISTIC UPDATE — immediately update the UI before the API responds
  setIncidents((prev) =>
    prev.map((inc) => {
      if (inc._id === incidentId) {
        return {
          ...inc,
          upvotes: inc.upvotes.includes("user_temp")
            ? inc.upvotes.filter(id => id !== "user_temp")
            : [...inc.upvotes, "user_temp"]
        };
      }
      return inc;
    })
  );

  // Step 2: Call API in the background
  const updatedIncident = await incidentService.toggleUpvote(incidentId, token);

  // Step 3: Replace optimistic data with real data from server
  setIncidents((prev) =>
    prev.map((inc) => (inc._id === incidentId ? updatedIncident : inc))
  );
};
```

**Why?** Without optimistic updates, the user clicks the upvote button and sees nothing happen for 200-500ms (network latency). With optimistic updates, the UI reacts instantly, then silently corrects itself with the server response.

---

## 21. Client-Side Pagination Logic

```typescript
// Home.tsx
const ITEMS_PER_PAGE = 12;
const [currentPage, setCurrentPage] = useState(1);

// Step 1: Filter by category and search
const filteredIncidents = incidents.filter((incident) => {
  const matchesCategory = selectedCategory === "all" || incident.type === selectedCategory;
  const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase());
  return matchesCategory && matchesSearch;
});

// Step 2: Calculate total pages
const totalPages = Math.ceil(filteredIncidents.length / ITEMS_PER_PAGE);
// e.g., 37 incidents / 12 per page = ceil(3.08) = 4 pages

// Step 3: Slice the array for current page
const paginatedIncidents = filteredIncidents.slice(
  (currentPage - 1) * ITEMS_PER_PAGE,  // Start index: page 1 → 0, page 2 → 12
  currentPage * ITEMS_PER_PAGE           // End index: page 1 → 12, page 2 → 24
);

// Step 4: Reset to page 1 when filters change
useEffect(() => {
  setCurrentPage(1);
}, [selectedCategory, searchTerm]);
```

---

## 22. Map Integration Logic (MapLibre GL JS)

### Map Initialization

```typescript
useEffect(() => {
  const map = new maplibregl.Map({
    container: mapContainerRef.current,     // DOM element to render into
    style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",  // Free tiles
    center: [79.8612, 6.9271],              // Default center: Colombo, Sri Lanka
    zoom: 12,
  });

  // Add zoom/rotation controls in top-right
  map.addControl(new maplibregl.NavigationControl(), "top-right");

  // Listen for clicks anywhere on the map
  map.on("click", (e) => {
    onMapClick(e.lngLat.lng, e.lngLat.lat);  // Pass coordinates to parent (Dashboard)
  });

  mapRef.current = map;  // Store for later use by other useEffects

  return () => map.remove();  // Cleanup on unmount
}, []);
```

### Smart Camera Control (Avoid Jumps During Typing)

```typescript
useEffect(() => {
  if (selectedCoordinates) {
    // Place the pin marker
    const marker = new maplibregl.Marker({ element: el })
      .setLngLat(selectedCoordinates)
      .addTo(map);

    // Check if the user is currently typing in coordinate inputs
    const activeEl = document.activeElement;
    const isTypingCoords = activeEl && (activeEl.id === "lat" || activeEl.id === "lng");

    if (!isTypingCoords) {
      // Only animate camera if NOT typing — prevents jarring jumps
      map.easeTo({ center: selectedCoordinates, zoom: Math.max(map.getZoom(), 13) });
    }
  }
}, [selectedCoordinates]);
```

---

## 23. Debounced Search Logic

```typescript
// MapContainer.tsx — Location search with autocomplete
useEffect(() => {
  if (!searchQuery.trim()) {
    setSearchResults([]);
    return;
  }

  // Set a 500ms timer. If the user types again within 500ms, the old timer is cancelled.
  const delayDebounceFn = setTimeout(async () => {
    setSearchLoading(true);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(searchQuery)}`
    );
    const data = await res.json();
    setSearchResults(data);
    setSearchLoading(false);
  }, 500);

  // CLEANUP: cancel the timeout if searchQuery changes before 500ms
  return () => clearTimeout(delayDebounceFn);
}, [searchQuery]);
```

**Why debounce?** If the user types "colombo", without debouncing, the API would be called for "c", "co", "col", "colo", "colom", "colomb", "colombo" — 7 API calls. With 500ms debounce, only 1 call fires (after the user stops typing).

---

## 24. Theme Toggle (Dark/Light Mode) Logic

```typescript
// Navbar.tsx
// Step 1: Initialize from localStorage (or default to dark)
const [isDark, setIsDark] = useState(() => {
  const saved = localStorage.getItem("theme");
  return saved ? saved === "dark" : true;
});

// Step 2: When isDark changes, add/remove CSS class on <html>
useEffect(() => {
  if (isDark) {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }
}, [isDark]);

// Step 3: Toggle function
const toggleTheme = () => setIsDark(!isDark);
```

**How CSS reacts**: In `index.css`, CSS variables change based on the `.dark` class:

```css
:root { --color-bg: #e1e5f2; --color-text: #022b3a; }   /* Light mode */
.dark  { --color-bg: #022b3a; --color-text: #ffffff; }   /* Dark mode */
```

All components use these variables via Tailwind's theme config, so they automatically switch colors.

---

## 25. Auto-Logout Interceptor Logic

```typescript
// main.tsx — Global Axios response interceptor
axios.interceptors.response.use(
  (response) => response,  // If response is OK, pass through unchanged

  (error) => {
    // If ANY request gets a 401 Unauthorized response...
    if (error.response && error.response.status === 401) {
      // ...but NOT login/register requests (those should show "wrong password" errors)
      const isAuthRequest = error.config.url && error.config.url.includes("/auth/");
      if (!isAuthRequest) {
        // Force logout: clear Redux state and localStorage
        store.dispatch(logout());
        // Redirect to login page
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
```

**When does this trigger?**
- JWT expires (after 30 days)
- User record deleted from database
- Token is tampered with
- Any 401 response from any API call

---

## 26. Coordinate Sync Logic (Form ↔ Map)

This is the bidirectional sync between the IncidentForm text inputs and the MapContainer marker:

### Direction 1: Map Click → Form Inputs

```
User clicks map → Dashboard.handleMapClick(lng, lat) → setSelectedCoordinates([lng, lat])
→ IncidentForm receives new coordinates prop → useEffect detects change → updates lng/lat state
```

```typescript
// IncidentForm.tsx
useEffect(() => {
  // If the prop coordinates differ from current input values, update the inputs
  if (parseFloat(lng) !== coordinates[0] || parseFloat(lat) !== coordinates[1]) {
    setLng(coordinates[0].toString());
    setLat(coordinates[1].toString());
  }
}, [coordinates]);  // Runs when coordinates prop changes (map click or GPS button)
```

### Direction 2: Form Input → Map Marker

```
User types in lat/lng inputs → setLng/setLat → useEffect detects change
→ calls onCoordinatesChange([parsedLng, parsedLat]) → Dashboard.setSelectedCoordinates
→ MapContainer useEffect updates marker position (but does NOT move camera)
```

```typescript
// IncidentForm.tsx
useEffect(() => {
  const parsedLng = parseFloat(lng);
  const parsedLat = parseFloat(lat);
  if (!isNaN(parsedLng) && !isNaN(parsedLat)) {
    if (parsedLng >= -180 && parsedLng <= 180 && parsedLat >= -90 && parsedLat <= 90) {
      onCoordinatesChange?.([parsedLng, parsedLat]);  // Tell parent to move the marker
    }
  }
}, [lng, lat]);
```

**The camera-jump prevention** happens in MapContainer:

```typescript
// MapContainer.tsx
const activeEl = document.activeElement;
const isTypingCoords = activeEl && (activeEl.id === "lat" || activeEl.id === "lng");
if (!isTypingCoords) {
  map.easeTo({ center: selectedCoordinates });  // Only animate if NOT typing
}
```

---

*This document provides a complete, line-by-line explanation of every logic flow in the GeoBrief-Live project — from backend middleware to frontend React hooks.*
