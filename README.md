# InterviewFlow

A full-stack real-time interview cubicle queue management system built with the PERN stack. Replaces typical messy whiteboards and chaotic manual coordination during college placement drives with a sleek coordinator dashboard, live student queue tracking pages, and instant real-time synchronization.
<table>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/f812cb9e-39ae-45d0-954d-b61f7c063e9f" alt="Image 1" width="100%"/></td>
    <td><img src="https://github.com/user-attachments/assets/5d97e2a4-2a83-41df-8d54-92a6a6f57a20" alt="Image 2" width="100%"/></td>
  </tr>
</table>

## Demo

- **Live app:** [InterviewFlow on Vercel](https://interview-flow-five.vercel.app)
- **Backend API:** [InterviewFlow API on Render](https://interviewflow-1-anoe.onrender.com)

**Note:** Your credentials are completely secure. Passwords are hashed using the `bcryptjs` library before being stored in the database, and are never visible to the developer.

---

## Features

### Academic Placement Coordinator (APC) Portal
*   **Secure Access:** Select coordinator name from the registered dropdown list and authenticate securely using JWT (JSON Web Tokens).
*   **Encrypted Passwords:** Passwords hashed with bcrypt (12 salt rounds) before storage.
*   **Automatic Password Reset:** A simple "Forgot password" flow that resets the coordinator's password to `admin123`.

### Session & Drive Setup
*   **Session Initialization:** Coordinators can create multiple independent interview drive sessions.
*   **Bulk Student Import:** Import student database (names, roll numbers, and phone numbers) in seconds via Excel (`.xlsx` or `.xls`) sheet upload.
*   **Flexible Cubicle Configuration:** Set up customized interview booths (cubicles) with custom labels (e.g., "Google Tech 1", "HR Round 2") or default numerical ordering.

### Real-Time Queue Operations
*   **Cubicle Queue Assignment:** Single-click assignment of waiting students to specific cubicle queues.
*   **WebSocket Synchronization:** Driven by Socket.io. When a student completes an interview and is marked done, the queue advances, and the next student is automatically moved to `in_progress`.
*   **Drag-Free Queue Reordering:** Coordinators can reorder student queues on the fly to adjust priorities.

### Live Student View
*   **Zero-Login Roll Verification:** Students check in by simply entering their Roll Number on the session's join page.
*   **Interactive Live Queue:** Real-time personal dashboard indicating queue placement (number of students ahead), cubicle assignment, and interview state.
*   **Automatic Refresh:** Socket-driven updates notify the student instantly when they are called to enter the cubicle.

---

## Tech Stack

### Frontend
*   **React (Vite):** Core framework
*   **Vanilla CSS:** Sleek dark-mode theme styling
*   **React Router v6:** SPA routing
*   **Socket.io-client:** Real-time communication channel
*   **Axios:** Request interceptors for attaching JWT auth headers
*   **Framer Motion:** Micro-animations and transitions

### Backend
*   **Node.js + Express:** API routing and middleware
*   **PostgreSQL + pg:** Relational database and connection pool
*   **Socket.io:** Server websocket handling and room-based events
*   **JWT Authentication:** Stateless user session management
*   **Bcryptjs:** Secure credential encryption
*   **Multer:** Memory storage handling for file uploads
*   **xlsx:** Server-side parsing of uploaded student spreadsheets

### Deployment
*   **Frontend:** Vercel (rewrites for SPA routing and API proxying)
*   **Backend:** Render
*   **Database:** PostgreSQL

---

## Project Structure

```text
InterviewFlow/
│
├── backend/
│   ├── config/         # Database pool client (db.js), schema.sql, and seed.sql
│   ├── controllers/    # Authentication, session setup, and queue logic
│   ├── middleware/     # JWT authentication, Multer file upload, and custom error handler
│   ├── models/         # Database queries (ApcUser, Session, Student, Cubicle, QueueEntry)
│   ├── routes/         # Express API route configurations
│   └── server.js       # Entry point; sets up Express, Socket.io, and DB connection
│
├── frontend/
│   ├── src/
│   │   ├── components/ # ProtectedRoute, Toast components
│   │   ├── context/    # AuthContext, ToastContext
│   │   ├── hooks/      # Real-time state listener hooks
│   │   ├── pages/      # Landing, Login, Dashboard, SessionSetup, LiveDashboard, StudentJoin, StudentView
│   │   ├── styles/     # Custom dark-theme styling (global.css)
│   │   ├── utils/      # api.js (Axios setup), socket.js (Socket.io connector)
│   │   ├── App.jsx     # Route mappings
│   │   └── main.jsx    # React rendering hook
│   ├── vercel.json     # SPA rewrites and relative proxy routing for local CORS bypass
│   └── package.json
│
└── README.md
```

---

## API Endpoints

### Auth (Public unless noted)
*   `GET  /api/auth/apc-list` - Fetch list of coordinators for login
*   `POST /api/auth/login` - Coordinator login
*   `GET  /api/auth/me` *(Protected)* - Check current coordinator authentication status
*   `POST /api/auth/reset-password` - Reset coordinator password to `admin123`
*   `POST /api/auth/change-password` *(Protected)* - Update coordinator password

### Sessions (All Protected)
*   `POST /api/session/create` - Initialize a new placement drive session
*   `GET  /api/session/my-sessions` - Retrieve sessions managed by the coordinator
*   `GET  /api/session/:sessionId` - Fetch setup progress details for a specific session
*   `POST /api/session/:sessionId/upload-students` - Excel document upload endpoint for batch student list registration
*   `POST /api/session/:sessionId/create-cubicles` - Mass create interview booths
*   `GET  /api/session/:sessionId/dashboard` - Retrieve session dashboard state (student arrays and cubicle states)
*   `GET  /api/session/:sessionId/students` - Retrieve list of students in a session
*   `POST /api/session/:sessionId/close` - Terminate active placement session

### Students & Queues
*   `POST /api/student/session/:sessionId/verify` *(Public)* - Verify student roll number to access queue page
*   `POST /api/student/:studentId/assign-cubicle` *(Protected)* - Assign a student to a cubicle queue
*   `POST /api/student/:studentId/mark-done` *(Protected)* - Complete student's interview and call next in line
*   `POST /api/cubicle/:cubicleId/reorder` *(Protected)* - Rearrange candidate positions in queue

---

## Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/rishabjain19/InterviewFlow.git
cd InterviewFlow
```

### 2. Setup the backend
```bash
cd backend
npm install
```

Create a `.env` file in `/backend` using `.env.example` as a template:
```env
DATABASE_URL=postgresql://your_db_username:your_db_password@localhost:5432/interviewflow
JWT_SECRET=your_jwt_secret_phrase
JWT_EXPIRES_IN=8h
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Execute SQL files in your PostgreSQL instance to setup the schema and initial data:
```bash
psql -d interviewflow -f config/schema.sql
psql -d interviewflow -f config/seed.sql
```

Start the backend server in development mode:
```bash
npm run dev
```

### 3. Setup the frontend
```bash
cd ../frontend
npm install
```

Create a `.env` file in `/frontend`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend application:
```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173`.

---

## Deployment

### Backend (Render)
1.  Create a new Web Service on Render.
2.  Connect your GitHub repository.
3.  Set the Root Directory to `backend`.
4.  Configure the environment variables: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT`, `NODE_ENV`, `FRONTEND_URL`.
5.  Set the Build Command to: `npm install`
6.  Set the Start Command to: `npm start`

### Frontend (Vercel)
1.  Import the repository into Vercel.
2.  Set the Root Directory to `frontend`.
3.  Configure the environment variables:
    *   Set `VITE_API_URL` (optional: when not using relative API paths).
4.  Vercel will auto-detect Vite build commands (`npm run build` and output directory `dist`).
5.  Deploy!

---

## Key Learnings
*   **Stateless Authentication:** Building stateless coordinator authorization with JWT from scratch using custom authentication middlewares.
*   **Database Schema & indexing:** Modeling deferred constraints, one-to-one/many-to-many relationship structures, and query optimizations using indexes.
*   **Excel Parsing:** Utilizing `xlsx` for memory parsing of raw uploaded files directly to relational database bulk insertions.
*   **Real-time Event Broadcasting:** Creating Socket.io event listeners and rooms matching session IDs for dynamic broadcast of queue events.
*   **Reverse Proxy Configuration:** Using `vercel.json` rewrite routing rules to bypass browser-level CORS policies on API requests.

---

## Future Improvements
*   **Automated SMS/WhatsApp Alerts:** Integrate WhatsApp Business API to automatically message the next student in line when they should head to their cubicle.
*   **Custom Re-ordering Interface:** Full drag-and-drop support for reordering candidate queue arrays directly from the coordinator's live dashboard view.
*   **Drive Statistics & Analytics:** Add visualizations for average interview duration, cubicle wait times, and throughput counters.

---

## Author/Developer
**Rishabh Jain**
*   GitHub: [@rishabjain19](https://github.com/rishabjain19)
