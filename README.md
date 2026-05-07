# CollabTrack

Production-ready full-stack collaboration and task management app with React, Express, MongoDB, JWT authentication, and role-based access control.

## Features

- Secure signup and login with bcrypt password hashing and JWT sessions
- Admin and Member roles
- Admins can create projects, manage project members, and create or assign tasks
- Members can view assigned tasks and update their own task status
- Project-scoped task views and dashboard metrics
- Search and status filtering
- Responsive React UI with loading and error states
- Railway-ready backend deployment configuration

## Tech Stack

- Frontend: React, Vite, Axios, Tailwind CSS, lucide-react
- Backend: Node.js, Express.js, MongoDB, Mongoose
- Authentication: JWT and bcrypt
- Security: Helmet, CORS, express-rate-limit, express-validator, MongoDB sanitization

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create server environment file:

```bash
cp server/.env.example server/.env
```

3. Update `server/.env`:

```bash
MONGODB_URI=mongodb://127.0.0.1:27017/collabtrack
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_URL=http://localhost:5173
PORT=5000
```

4. Create client environment file:

```bash
cp client/.env.example client/.env
```

5. Run the app:

```bash
npm run dev
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:5000`

## API Documentation

All protected endpoints require:

```http
Authorization: Bearer <jwt-token>
```

### Auth

#### POST `/api/auth/signup`

Body:

```json
{
  "name": "Avery Admin",
  "email": "avery@example.com",
  "password": "password123",
  "role": "Admin"
}
```

Roles can be `Admin` or `Member`. If omitted, role defaults to `Member`.

#### POST `/api/auth/login`

Body:

```json
{
  "email": "avery@example.com",
  "password": "password123"
}
```

### Users

#### GET `/api/users/me`

Returns the authenticated user profile.

#### GET `/api/users`

Admin only. Returns users that can be added to projects or assigned tasks.

### Projects

#### POST `/api/projects`

Admin only.

Body:

```json
{
  "name": "Website Refresh",
  "description": "Redesign and ship the public marketing website."
}
```

#### GET `/api/projects`

Returns projects where the user is the creator or a member.

#### POST `/api/projects/:id/add-member`

Admin only. The project creator can add a member.

Body:

```json
{
  "userId": "mongo-user-id"
}
```

#### DELETE `/api/projects/:id/members/:userId`

Admin only. The project creator can remove a member.

### Tasks

#### POST `/api/tasks`

Admin only. Assignee must be a member of the selected project.

Body:

```json
{
  "title": "Write homepage copy",
  "description": "Draft hero and feature section copy.",
  "assignedTo": "mongo-user-id",
  "projectId": "mongo-project-id",
  "deadline": "2026-06-01"
}
```

#### GET `/api/tasks`

Query params:

- `projectId`
- `status`
- `search`

Admins can view tasks for projects they created or belong to. Members see assigned tasks only.

#### PUT `/api/tasks/:id`

Members can update status for tasks assigned to them. Admins can update any task in their accessible projects.

Body:

```json
{
  "status": "In Progress"
}
```

Allowed statuses: `Pending`, `In Progress`, `Completed`.

#### GET `/api/tasks/dashboard/summary`

Returns:

```json
{
  "totalTasks": 8,
  "completedTasks": 3,
  "pendingTasks": 4,
  "overdueTasks": 1
}
```

## Railway Deployment

1. Push this repository to GitHub.
2. Create a Railway project.
3. Add a MongoDB service.
4. Add a service from the GitHub repository.
5. Set the service root directory to `server`.
6. Add environment variables:

```bash
MONGODB_URI=<Railway MongoDB connection string>
JWT_SECRET=<long random production secret>
CLIENT_URL=<deployed frontend URL>
NODE_ENV=production
```

7. Deploy the backend. Railway will use `server/railway.json`.
8. Deploy the frontend to Railway, Vercel, Netlify, or serve it from any static host. Set:

```bash
VITE_API_URL=<Railway backend URL>/api
```

## Live Link

Deployment requires your Railway and GitHub account access. Once deployed, replace these:

- Backend: `https://your-railway-backend.up.railway.app`
- Frontend: `https://your-frontend-url`
