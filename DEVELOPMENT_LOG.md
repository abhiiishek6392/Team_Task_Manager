# Development Log: Team Task Manager

This document explains how the Team Task Manager application was built from scratch. It is organized phase by phase to show the development process, architectural decisions, and reasoning behind the implementation.

## Project Overview

Team Task Manager is a full-stack PERN application that allows users to create projects, assign tasks, and track progress through role-based access control.

The application has two user roles:

- `ADMIN`: can create projects, view users, create tasks, and assign tasks.
- `MEMBER`: can view assigned tasks and update task status.

The final architecture uses:

- PostgreSQL for persistent relational data
- Prisma ORM for schema modeling and database access
- Node.js and Express for REST APIs
- JWT authentication for protected routes
- React with Vite for the frontend
- Tailwind CSS for UI styling

---

## Phase 1: Backend Scaffolding & Database Design

The backend was created as a separate `/backend` folder inside the monorepo. We started by setting up a basic Node.js and Express server with JSON body parsing and CORS enabled.

Core backend files included:

- `index.js`: Express app entry point
- `package.json`: backend dependencies and scripts
- `db.js`: shared Prisma Client instance
- `prisma/schema.prisma`: database schema

The Prisma schema was designed for PostgreSQL and includes three main models:

- `User`
- `Project`
- `Task`

The schema also defines two enums:

- `Role`: `ADMIN`, `MEMBER`
- `TaskStatus`: `TODO`, `IN_PROGRESS`, `DONE`

Users can be assigned tasks. Projects contain tasks. Each task belongs to one project and may optionally be assigned to one user.

### Architectural Decision

We intentionally kept projects global and did not create complex `Team`, `ProjectMember`, or membership tables.

Instead, the MVP uses strict role-based access:

- Admins manage projects and task assignment.
- Members only see tasks assigned to them.

This was enough to satisfy the assignment requirements while keeping the system clear and finishable within the 1-2 day timeline.

### Why This Approach?

- Express keeps the API simple and easy to understand.
- Prisma gives type-safe relational modeling and clean query syntax.
- PostgreSQL is a strong fit because the data has clear relationships.
- Avoiding extra team tables reduced complexity while still supporting project and team management through user assignment.

---

## Phase 2: Authentication & Security

Authentication was implemented using email and password login.

The auth routes live in:

- `auth.js`

The two main endpoints are:

```http
POST /api/auth/register
POST /api/auth/login
```

During registration, the user's password is hashed with `bcryptjs` before being saved in the database. The raw password is never stored.

During login:

1. The user is found by email.
2. The submitted password is compared with the hashed password.
3. If valid, the server returns a JWT.

The JWT payload includes:

```js
{
  id: user.id,
  role: user.role
}
```

This lets the backend identify both the user and their permission level on future requests.

Security middleware was created in:

- `middleware.js`

It includes:

- `verifyToken`: checks the `Authorization` header, verifies the JWT, and attaches the decoded payload to `req.user`.
- `isAdmin`: checks whether `req.user.role === "ADMIN"` before allowing protected admin actions.

### Why This Approach?

- JWT is lightweight and works well with REST APIs.
- bcryptjs protects stored passwords with secure hashing.
- Middleware keeps route protection reusable and consistent.
- Separating `verifyToken` and `isAdmin` makes role checks easy to compose per route.

---

## Phase 3: Core REST APIs

After authentication was working, the core REST API routes were added.

Main route files:

- `projects.js`
- `tasks.js`
- `users.js`

### Projects API

Projects are available through:

```http
GET /api/projects
POST /api/projects
```

Rules:

- Any authenticated user can fetch projects.
- Only admins can create projects.

This supports the admin workflow of creating a project before assigning tasks to users.

### Users API

Users are available through:

```http
GET /api/users
```

This route is admin-only and returns only safe user fields:

- `id`
- `name`
- `email`

Password hashes are never returned.

### Tasks API

Tasks are available through:

```http
GET /api/tasks
POST /api/tasks
PATCH /api/tasks/:id/status
```

Admins can create tasks with:

- title
- description
- due date
- project ID
- assignee ID

Members can update the status of tasks assigned to them.

The most important route is:

```http
GET /api/tasks
```

It behaves differently based on the logged-in user's role:

- If the user is an `ADMIN`, it returns all tasks.
- If the user is a `MEMBER`, it returns only tasks where `assigneeId` matches `req.user.id`.

This role-aware data filtering is the main access-control rule for task visibility.

### Why This Approach?

- REST routes are straightforward and easy to test.
- Keeping route files separated by domain makes the backend easier to maintain.
- Filtering member tasks on the backend prevents users from accessing data they should not see.
- Admin-only task creation matches the assignment's role-based access requirement.

---

## Phase 4: Frontend Scaffolding & Global State

The frontend was created in the `/frontend` folder using React with Vite.

The source code was organized into a professional folder structure:

```text
src
|-- api
|-- components
|-- constants
|-- context
|-- hooks
|-- pages
|-- styles
```

This structure keeps API logic, reusable UI, global state, and page components separate.

### Axios API Client

The Axios client lives in:

- `src/api/client.js`

It uses a base URL from:

```env
VITE_API_URL
```

with a localhost fallback for development.

An Axios request interceptor automatically reads the JWT token from `localStorage` and attaches it to every request:

```http
Authorization: Bearer <token>
```

This means individual components do not need to manually add the token each time they call the API.

### Global Auth State

Authentication state is managed with React Context API in:

- `src/context/AuthContext.jsx`

The context stores:

- `user`
- `token`
- `isAuthenticated`
- `login`
- `register`
- `logout`

The `useAuth` hook provides easy access to this state across the app.

### Why This Approach?

- Vite gives a fast React development workflow.
- Axios interceptors centralize token handling.
- React Context is enough for this app's global auth state without adding Redux or another state library.
- Separating API files from UI components keeps the frontend clean and scalable.

---

## Phase 5: UI Development & Polish

The UI was built with Tailwind CSS and organized around role-specific dashboards.

### Auth Pages

The frontend includes:

- `Login.jsx`
- `Register.jsx`

The register page allows users to create either an admin or member account for demo purposes. The login page stores the returned JWT and redirects users to the dashboard.

### Admin Dashboard

The admin dashboard focuses on operational management.

Admin users can:

- create projects
- create tasks
- assign tasks to users
- view team members
- view project activity
- view a task pipeline grouped by status

The admin dashboard includes:

- summary cards for users, projects, tasks, and completed tasks
- a project creation form
- a task creation form
- a task pipeline grouped by `TODO`, `IN_PROGRESS`, and `DONE`
- project cards with task counts
- team cards with assigned task counts

### Member Dashboard

The member dashboard focuses on personal task execution.

Member users can:

- view assigned tasks
- filter tasks by status
- see due dates
- see overdue indicators
- update task status

The member dashboard includes:

- summary cards for assigned, in-progress, completed, and overdue tasks
- a completion-rate panel
- status filter buttons
- polished task cards
- status dropdowns for task updates

### UI Polish

The UI was improved with:

- Tailwind CSS utility classes
- shared components such as `Alert`, `StatCard`, `StatusBadge`, and `EmptyState`
- `lucide-react` icons
- Inter font via `@fontsource/inter`
- modern SaaS-style panels, badges, spacing, and dashboard cards

### Why This Approach?

- Tailwind CSS allows fast, consistent UI development.
- A dashboard-style layout fits the assignment better than a marketing-style landing page.
- Shared UI components keep repeated patterns consistent.
- Icons and typography polish make the app feel more professional for evaluation and demo.

---

## Final Result

By the end of development, the application supports the complete assignment flow:

1. Users can register and log in.
2. Admins can create projects.
3. Admins can create and assign tasks.
4. Members can view only their assigned tasks.
5. Members can update task status.
6. Dashboards show task progress and overdue information.
7. REST APIs are protected with JWT and role-based middleware.
8. PostgreSQL stores users, projects, and tasks with proper relationships.

This makes the application functionally complete and ready for local testing, review, and demonstration.
