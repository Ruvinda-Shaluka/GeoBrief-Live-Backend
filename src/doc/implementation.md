# GeoBrief-Live: Full System Blueprint & Implementation Spec

## 1. Project Scope & Design System
**GeoBrief-Live** is a real-time, civic-tech spatial dashboard for tracking local incidents (road hazards, power outages, safety alerts) across Public, Private, and Group visibility layers.
* **Frontend Stack:** React 18+ (Vite), TypeScript, Tailwind CSS, Redux Toolkit, React Router DOM, `@react-oauth/google`.
* **Backend Stack:** Node.js, Express.js, TypeScript, MongoDB Atlas, Mongoose, JWT.
* **Design System:** * Dark mode baseline (`bg-darkBg`, `bg-darkCard`).
    * Brand Accent: Purple (`text-brandPrimary`, hex `#a855f7`).
    * UI Style: Glassmorphism (backdrop blurs, semi-transparent borders), rounded corners, and isolated floating elements.

---

## 2. Current Codebase State: What We Built

### 2.1 Backend Architecture
* **`src/models/User.ts`**
    * Schema: `name`, `email`, `passwordHash`, `role` (user/admin), `authProvider` (local/google), `googleId`, and `picture` (String).
    * Logic: `bcrypt` pre-save hook for password hashing, `comparePassword` method.
* **`src/models/Incident.ts`**
    * Schema: Tracks visibility (`public`, `private`, `group`), reportedBy, and an `upvotes` array containing MongoDB ObjectIds to track interactions.
* **`src/controllers/authController.ts`**
    * `registerUser` & `loginUser`: Handles local auth, returning JWT and injecting `authProvider: 'local'`.
    * `googleLogin`: Verifies Google OAuth token, creates accounts seamlessly, updates legacy accounts with profile pictures, and injects `authProvider: 'google'`.
* **`src/controllers/userController.ts`**
    * `updateUserProfile`: Securely updates name and password. Requires `currentPassword` verification before setting `newPassword`.
    * `deleteUserProfile`: Fully deletes the user account with strict null-checking.
* **`src/controllers/incidentController.ts`**
    * `toggleUpvote`: Highly optimized. Replaced vulnerable array pushes with atomic MongoDB operators (`$addToSet` and `$pull`) to completely eliminate race conditions. Enforces visibility authorization (blocks upvoting private incidents not owned by the user).
* **`src/middleware/authMiddleware.ts`**: Contains the `protect` function checking Bearer JWTs.

### 2.2 Frontend Architecture
* **Routing & State (`src/App.tsx` & `src/routes/AppRoutes.tsx`)**
    * Cleanly separated routes. `ProtectedRoute` wrapper established to gate `/dashboard`, `/private`, and `/groups`.
    * Redux `authSlice.ts` manages `user`, `token`, and `isAuthenticated`. Includes `updateUser` to instantly reflect profile changes.
* **Global Layout (`src/components/layout/`)**
    * `MainLayout.tsx`: Wraps the app, includes `pt-24` padding to accommodate the fixed navbar.
    * `Navbar.tsx`: Engineered as a floating "glassy island" (`fixed top-0 p-4`, `backdrop-blur-xl`, `rounded-2xl`). Uses `flex-1` constraints to keep links perfectly centered while pushing the logo left and auth right. 
    * **Google Image Fix:** Injected `referrerPolicy="no-referrer"` into the navbar avatar `<img>` to bypass Google's strict CORS blocking.
    * `LiveClock.tsx`: Isolated component running a `setInterval` to prevent the entire Navbar from re-rendering every second.
* **Authentication & Profiles (`src/pages/Login.tsx` & `src/components/profile/ProfileModal.tsx`)**
    * **Login View:** Unified local login/register form with a seamless state toggle. Integrated `<GoogleLogin>` button.
    * **Security UX:** Built a highly interactive "hold-to-view" SVG eye icon for password fields using `onMouseDown`/`onTouchStart` events.
    * **Profile Modal:** Conditional rendering logic built-in. If `user.authProvider === 'local'`, it displays fields to securely update the password (requiring current password). If Google, it hides these fields to prevent errors. Handles account deletion.

---

## 3. Implementation Plan: What to Build Next

Provide this exact sequence to the AI assistant to continue development seamlessly.

### Phase 1: GeoJSON Backend Refactor
Before touching the map, the backend must be prepared to handle actual coordinates.
1.  **Update `Incident.ts` Model:** Refactor the location field to strictly adhere to GeoJSON standards:
    ```typescript
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true } // [longitude, latitude]
    }
    ```
2.  **Create Controllers:** In `incidentController.ts`, build `createIncident` (accepting the new coordinate payload) and `getPublicIncidents` (fetching incidents where visibility is 'public', sorted by `upvotes.length` descending).

### Phase 2: The Public Feed (Route: `/`)
Build the public landing page to display community incidents.
1.  **`src/pages/Home.tsx`:** The main container.
2.  **`src/components/home/HeroSection.tsx`:** A dark-themed, visually engaging banner explaining the platform's purpose.
3.  **`src/components/home/CategoryFilter.tsx`:** A horizontally scrollable row of pill-shaped buttons (e.g., "All", "Road", "Power", "Safety"). Clicking these should update local state to filter the feed.
4.  **`src/components/incidents/IncidentCard.tsx`:** A reusable card component displaying the incident title, category, time reported, and an interactive "Upvote" button that calls `toggleUpvote`.

### Phase 3: Mapbox Integration (Route: `/dashboard`)
1.  **Dependencies:** Install `mapbox-gl` and `react-map-gl`.
2.  **`src/components/map/MapContainer.tsx`:** Render a dark-themed Mapbox instance spanning the viewport height. 
3.  **Interaction Logic:** Implement an `onClick` event on the map that captures the exact Longitude and Latitude.
4.  **`src/components/incidents/IncidentForm.tsx`:** When the map is clicked, slide in a side-panel or open a modal containing a form (Title, Description, Category, Severity, Visibility). Submit this form using the captured coordinates to `POST /api/incidents`.

### Phase 4: Group Collaboration Logic
1.  **Backend:** Create `src/models/Group.ts` (name, admin, members array). Build endpoints to create groups and invite users by email.
2.  **Frontend (`Route: /groups`):** Build `GroupManager.tsx` to list the user's groups, accept invitations, and view a filtered map of incidents that have `visibility: 'group'` and match the group IDs the user belongs to.