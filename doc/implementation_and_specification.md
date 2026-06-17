# GeoBrief-Live Backend: Implementation & Specification

This repository contains the REST API server code for the GeoBrief-Live platform.

---

## 🛠️ API Architecture
* **Node.js + Express.js:** Set up in ES Modules format (`type: "module"`) using clean routing controllers.
* **TypeScript:** Strictly typed schemas, middleware payloads, and request interfaces.
* **Mongoose & MongoDB:** Database ODM featuring relational schemas and geospatial index definitions.

---

## 🗄️ Database Schemas & Models

### User Schema (`User.ts`)
* Stores user credentials, roles (`user` or `admin`), and OAuth identifiers.
* Password hashes are automatically computed prior to save using a pre-save hook:
```typescript
userSchema.pre("save", async function () {
  if (!this.isModified("passwordHash") || !this.passwordHash) return;
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});
```

### Group Schema (`Group.ts`)
* Models private group collaboration watches.
* Implements a pre-save hook to automatically synchronize the group administrator into the `members` array:
```typescript
groupSchema.pre('save', async function () {
  if (this.admin) {
    if (!this.members) this.members = [];
    const adminStr = this.admin.toString();
    const hasAdmin = this.members.some((m) => m && m.toString() === adminStr);
    if (!hasAdmin) this.members.push(this.admin);
  }
});
```

### Incident Schema (`Incident.ts`)
* Models geo-tagged incidents with visibility controls.
* Features a `2dsphere` index on `location` for coordinates tracking.

---

## 🔌 Registered API Routes

### Authentication (`/api/auth`)
* `POST /register` - Registers username, email, and password.
* `POST /login` - Local user credential verification, returns JWT.
* `POST /google` - Handles Google Token verification and login/register.

### Groups (`/api/groups`)
* `POST /` - Creates a new group (Auth required).
* `GET /` - Retrieves user groups list.
* `POST /:id/members` - Adds member by email (Admin required).
* `PUT /:id/admin` - Transfers group ownership (Admin required).

### Incidents (`/api/incidents`)
* `GET /public` - Fetches public feed incidents sorted by upvotes count.
* `POST /` - Creates new incident (Auth required).
* `GET /` - Fetches visible incidents list (Private logs + group shared).
* `PUT /:id/upvote` - Toggles upvote interaction (Auth required).

### Users (`/api/users`)
* `PUT /profile` - Edits user profile credentials.
* `DELETE /profile` - Permenantly deletes account.
