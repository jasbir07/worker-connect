# Copilot Instructions: Worker-Connect Platform

## Project Overview
Worker-Connect is a full-stack job marketplace platform with real-time chat. It has a **Node.js/Express backend** with MongoDB and **React frontend** communicating via REST APIs and WebSockets for live messaging.

### Key Distinction: Role-Based Architecture
The system has two user roles that shape the entire application flow:
- **Worker**: Applies for jobs, receives reviews, participates in chat
- **Client**: Posts jobs, manages applicants, reviews workers, initiates chat

This role distinction cascades through controllers, routes, and UI logic. Always check `req.user.role` when implementing features.

---

## Backend Architecture (Node.js/Express)

### Start Command
```bash
npm run dev        # Development mode with nodemon
npm start          # Production
```

### Authentication Pattern
1. **JWT-based**: Token stored in request header as `Bearer <token>`
2. **Auth Middleware** ([authMiddleware.js](backend/src/middlewares/authMiddleware.js)):
   - Extracts token from `Authorization` header
   - Verifies with `JWT_SECRET` env var
   - Attaches `req.user` (contains `_id` and `role`) to protected routes
3. **Socket.io Auth**: Token passed in handshake auth, verified before socket connection ([server.js](backend/server.js#L26-L36))

### File Structure Pattern
```
routes/authRoutes.js  → authController.js     (handles request logic)
                      → User.js (model)        (data layer)
```

**Always follow**: Route → Controller → Model, no business logic in routes.

### Models & Database
- MongoDB connection via `mongoose` ([db.js](backend/src/config/db.js))
- Models in [models/](backend/src/models/): User, Job, Application, ChatRoom, Message, Review, WorkerProfile, Notification
- All models use Mongoose schemas with timestamps

**Critical pattern**: When updating related records (e.g., creating an Application), ensure consistency—don't forget to update the Job's `applications` array.

### API Routes Structure
```
/api/auth      → User login/register (public)
/api/worker    → Worker profile management (protected)
/api/jobs      → Job CRUD & filtering (protected)
/api/reviews   → Review creation/retrieval (protected)
/api/chat      → Chat rooms & history (protected)
```

**Protected routes** require valid JWT. Use `protect` middleware imported from authMiddleware.

### Socket.io Integration
- Server-side: [server.js](backend/server.js) - Sets up Socket.io with JWT auth
- Available to controllers via `req.app.get("io")` for emitting real-time events
- Used for: Chat messages, notifications, job application updates
- **CORS config** hardcoded to `http://localhost:3000` - update before production

---

## Frontend Architecture (React)

### Start Command
```bash
npm start              # Development on http://localhost:3000
npm run build          # Production build
npm test               # Run test suite (uses React Testing Library)
```

### Authentication Flow
1. **AuthContext** ([context/AuthContext.js](frontend/src/context/AuthContext.js)):
   - Stores `user` object (loaded from localStorage on mount)
   - Provides `login()` and `logout()` methods
   - localStorage keys: `token` (JWT) and `user` (JSON)
2. **ProtectedRoute** ([components/ProtectedRoute.jsx](frontend/src/components/ProtectedRoute.jsx)):
   - Wraps routes requiring authentication
   - Checks `user` context; redirects to login if missing

### API Client Setup
[axios.js](frontend/src/api/axios.js):
- Axios instance pointing to `http://localhost:5000/api`
- **Request interceptor** auto-attaches JWT token from localStorage
- All API calls go through this instance, not raw axios

**Usage**: `import API from "./api/axios"; API.get("/jobs")`

### Page Organization
Each page component handles its own data fetching and state:
- [Dashboard.jsx](frontend/src/pages/Dashboard.jsx): User overview
- [jobs.jsx](frontend/src/pages/jobs.jsx): Browse all jobs (workers)
- [PostJob.jsx](frontend/src/pages/PostJob.jsx): Create job (clients)
- [MyJobs.jsx](frontend/src/pages/MyJobs.jsx): Manage own jobs
- [MyApplication.jsx](frontend/src/pages/MyApplication.jsx): View applications
- [JobApplicants.jsx](frontend/src/pages/JobApplicants.jsx): Client views applicants for a job
- [Chat.jsx](frontend/src/pages/Chat.jsx): Real-time chat with Socket.io

### Styling
- CSS modules per page: `pages/Dashboard.jsx` → `styles/Dashboard.css`
- Global styles: [styles/global.css](frontend/src/styles/global.css)
- Tailwind CSS configured but not heavily used—check existing patterns

---

## Critical Workflows & Conventions

### Adding a New Feature (e.g., New API Endpoint)
1. **Create Model** (if needed) in [backend/src/models/](backend/src/models/)
2. **Create Controller** in [backend/src/controllers/](backend/src/controllers/) - export named functions
3. **Create/Update Route** in [backend/src/routes/](backend/src/routes/) - attach `protect` middleware
4. **Frontend Page** in [frontend/src/pages/](frontend/src/pages/) using AuthContext + axios
5. **Add Route to App.jsx** with `<ProtectedRoute>` if needed

### Common Patterns

**Backend Controller Pattern**:
```javascript
exports.getResource = async (req, res) => {
  try {
    // req.user available from authMiddleware
    const data = await Model.find({ userId: req.user._id });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

**Frontend Data Fetching Pattern**:
```javascript
useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await API.get("/endpoint");
      setData(res.data);
    } catch (error) {
      console.error(error);
    }
  };
  fetchData();
}, []);
```

### Environment Variables
**Backend (.env file, not in repo)**:
```
MONGO_URI=mongodb://...
JWT_SECRET=your-secret-key
```

**Frontend**: Hardcoded baseURL in [axios.js](frontend/src/api/axios.js) - not env-based currently.

### Role-Based Access Control
- No dedicated RBAC middleware yet—implement in controller logic
- Example: In jobController, check `req.user.role === "client"` before allowing job posting
- WorkerProfile is separate model; only create/update if `role === "worker"`

---

## Testing & Debugging

### Backend
- No test suite currently configured
- Debug with `console.log` and check server terminal output
- MongoDB connection errors appear on startup

### Frontend
- React Testing Library configured
- Run tests: `npm test` in frontend/
- Common debug: Check localStorage in DevTools → Application tab for token/user

### Common Issues
1. **CORS errors**: Both frontend baseURL and Socket.io CORS are hardcoded to localhost:3000/5000
2. **Token not attached**: Verify axios interceptor runs; check localStorage has `token` key
3. **Socket.io connection fails**: Ensure token sent in handshake; backend must receive it in `socket.handshake.auth.token`

---

## Key Files by Use Case

| Use Case | Key Files |
|----------|-----------|
| Adding authentication feature | authController.js, authMiddleware.js, authRoutes.js |
| Adding user profile | workerController.js, WorkerProfile.js, workerRoutes.js |
| Adding job feature | jobController.js, Job.js, jobRoutes.js |
| Real-time messaging | server.js Socket.io setup, Chat.jsx, chatController.js, chatRoutes.js |
| Frontend routing | App.js, ProtectedRoute.jsx, AuthContext.js |
| API communication | api/axios.js, pages/*.jsx |

---

## Notes for AI Agents

- **Always preserve role distinction** when adding features
- **Verify both sides**: Check backend route exists before calling from frontend
- **Use existing patterns**: Mirror controller/page structure for consistency
- **Token management**: Frontend stores in localStorage; backend expects Bearer header
- **Real-time features**: Use Socket.io emitters available via `req.app.get("io")`
- **No validation framework**: Add manual validation in controllers or consider library for production
