# Worker-Connect Platform

A full-stack job marketplace with real-time chat. Workers browse and apply for jobs; clients post jobs and manage applicants.

## Tech Stack

- **Backend**: Node.js, Express, MongoDB, Socket.io, JWT
- **Frontend**: React, React Router, Axios

## Setup

### Backend
```bash
cd backend
npm install
# Create .env file:
# MONGO_URI=mongodb://localhost:27017/worker-connect
# JWT_SECRET=your-secret-key-here
npm run dev  # Runs on port 5000
```

### Frontend
```bash
cd frontend
npm install
npm start    # Runs on port 3000
```

## Project Structure

```
├── backend/
│   ├── server.js
│   └── src/
│       ├── controllers/  (auth, jobs, chat, reviews, worker)
│       ├── models/       (User, Job, Application, etc)
│       ├── routes/       (API endpoints)
│       └── middlewares/  (auth, role-based)
│
└── frontend/
    └── src/
        ├── pages/   (Dashboard, Jobs, Chat, etc)
        ├── context/ (AuthContext)
        └── api/     (axios instance)
```

## Key Features

- **Authentication**: JWT-based with localStorage
- **Role-Based Access**: Worker vs Client roles
- **Jobs**: Browse, search, apply, manage
- **Real-Time Chat**: Socket.io messaging
- **Reviews**: Rate and review workers
- **Protected Routes**: AuthContext + ProtectedRoute component

## API Endpoints

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/jobs` - List jobs
- `POST /api/jobs` - Create job (Client)
- `POST /api/jobs/:id/apply` - Apply for job (Worker)
- `GET /api/reviews/:workerId` - Get worker reviews
- `GET /api/chat/rooms` - Chat rooms

## Development Notes

- **Backend**: Route → Controller → Model pattern
- **Frontend**: Use axios instance from `src/api/axios.js`
- **Real-time**: Socket.io available via `req.app.get("io")`
- **Role Check**: Verify `req.user.role` for role-based logic
