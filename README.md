# Team Task Manager

Team Task Manager is a full-stack PERN application for managing team projects and assigned tasks with role-based access control. Admin users can create projects, assign tasks to team members, and monitor progress. Member users can view their assigned tasks and update task status.

## Features

- User authentication with signup and login
- JWT-based protected API routes
- Role-based access control for `ADMIN` and `MEMBER`
- Admin dashboard for project creation, task assignment, team overview, and task pipeline tracking
- Member dashboard for assigned tasks, task filters, status updates, due dates, and overdue indicators
- PostgreSQL database with Prisma ORM relationships
- Polished React + Tailwind CSS dashboard UI

## Tech Stack

**Backend**

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- JSON Web Tokens
- bcryptjs

**Frontend**

- React
- Vite
- Tailwind CSS
- Axios
- React Router
- lucide-react icons
- Inter font via `@fontsource/inter`

## Folder Structure

```text
.
|-- backend
|   |-- prisma
|   |   `-- schema.prisma
|   |-- auth.js
|   |-- db.js
|   |-- index.js
|   |-- middleware.js
|   |-- projects.js
|   |-- tasks.js
|   |-- users.js
|   `-- package.json
|-- frontend
|   |-- src
|   |   |-- api
|   |   |-- components
|   |   |-- constants
|   |   |-- context
|   |   |-- hooks
|   |   |-- pages
|   |   `-- styles
|   `-- package.json
`-- README.md
```

## Database Schema

The app uses three main models:

- `User`: stores account details and role
- `Project`: stores project details
- `Task`: belongs to a project and may be assigned to a user

Task statuses:

- `TODO`
- `IN_PROGRESS`
- `DONE`

User roles:

- `ADMIN`
- `MEMBER`

## Environment Variables

Create `backend/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
JWT_SECRET="replace-with-a-strong-secret"
PORT=5000
```

Create `frontend/.env`:

```env
VITE_API_URL="http://localhost:5000/api"
```

For deployment, set `VITE_API_URL` to the deployed backend API URL, for example:

```env
VITE_API_URL="https://your-backend.up.railway.app/api"
```

## Local Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd <project-folder>
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure backend environment

Create `backend/.env` and add your PostgreSQL connection string and JWT secret.

Example Neon connection string:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/neondb?sslmode=require"
JWT_SECRET="dev_secret_change_later"
PORT=5000
```

### 4. Run Prisma migration

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Start backend

```bash
npm run dev
```

Backend runs on:

```text
http://localhost:5000
```

### 6. Install frontend dependencies

Open a new terminal:

```bash
cd frontend
npm install
```

### 7. Configure frontend environment

Create `frontend/.env`:

```env
VITE_API_URL="http://localhost:5000/api"
```

### 8. Start frontend

```bash
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

## API Endpoints

### Auth

```http
POST /api/auth/register
POST /api/auth/login
```

### Users

```http
GET /api/users
```

Admin only. Returns user `id`, `name`, and `email`.

### Projects

```http
GET /api/projects
POST /api/projects
```

Creating projects requires admin access.

### Tasks

```http
GET /api/tasks
POST /api/tasks
PATCH /api/tasks/:id/status
```

Admins can view and create all tasks. Members only see their assigned tasks and can update their task status.

## Manual Testing Flow

1. Open the frontend at `http://localhost:5173`.
2. Register one admin user.
3. Register one member user.
4. Log in as the admin.
5. Create a project.
6. Create a task and assign it to the member.
7. Log out.
8. Log in as the member.
9. Confirm the assigned task appears.
10. Change the status from `TODO` to `IN_PROGRESS` or `DONE`.

## Railway Deployment Notes

This project can be deployed with separate Railway services for backend and frontend.

### Backend service

Set the backend root directory to:

```text
backend
```

Add these environment variables in Railway:

```env
DATABASE_URL="your-production-postgresql-url"
JWT_SECRET="your-production-jwt-secret"
```

Do not set `PORT` manually unless you specifically configure a custom port. Railway provides `PORT` automatically, and the backend already reads `process.env.PORT`.

Build command:

```bash
npm run build
```

Pre-deploy command:

```bash
npm run db:deploy
```

Start command:

```bash
npm start
```

### Frontend service

Set the frontend root directory to:

```text
frontend
```

Add this environment variable:

```env
VITE_API_URL="https://your-backend-service-url/api"
```

Build command:

```bash
npm run build
```

Start command:

```bash
npm start
```

## Demo Credentials

Create demo users through the register page:

```text
Admin: admin@test.com
Member: member@test.com
Password: choose any test password
```

## Submission Checklist

- Live application URL
- GitHub repository URL
- README file
- 2-5 minute demo video
