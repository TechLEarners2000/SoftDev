# Secure Idea Management System

## Overview
A full-stack web application built with React.js and Flask that enables customers to submit ideas and problems securely. The system implements a three-tier workflow: Customer → Owner → Developer, with role-based authentication and encrypted data storage.

**Current State:** Fully functional MVP with all core features implemented and running.

## Recent Changes
*Date: November 5, 2025*
- Initial project setup with React.js frontend and Flask backend
- Implemented secure JWT-based authentication system
- Created PostgreSQL database with Users, Ideas, and Updates tables
- Built role-specific dashboards for Customer, Owner, and Developer
- Configured workflows for both frontend (port 5000) and backend (port 5001)
- Added real-time status tracking and bidirectional feedback system

## Tech Stack

### Frontend (React.js)
- **Framework:** React 18 with Vite
- **Routing:** React Router DOM
- **HTTP Client:** Axios
- **Styling:** Inline CSS with professional blue-gray theme
- **Port:** 5000 (exposed to public)

### Backend (Flask)
- **Framework:** Flask
- **Authentication:** Flask-JWT-Extended
- **Database:** PostgreSQL with Flask-SQLAlchemy ORM
- **Security:** Werkzeug password hashing, CORS enabled
- **Port:** 5001 (internal)

## Project Architecture

### User Roles
1. **Customer** - Submits ideas and problems, views submission status
2. **Owner** - Reviews submissions, assigns to developers, manages workflow
3. **Developer** - Works on assigned tasks, provides progress updates

### Data Flow
```
Customer → React Frontend → Flask API → Owner Dashboard → Developer Workspace
         ↓                                                           ↓
    Idea Submission                                         Progress Updates
         ↓                                                           ↓
    PostgreSQL Database ←─────────────────────────────────────────────┘
```

### Database Schema
- **users:** id, name, email, phone, password (hashed), role, created_at
- **ideas:** id, title, description, status, user_id, assigned_to, created_at, updated_at
- **updates:** id, idea_id, user_id, message, created_at

### API Endpoints
- `POST /api/register` - User registration
- `POST /api/login` - User authentication
- `GET /api/ideas` - List ideas (filtered by role)
- `POST /api/ideas` - Submit new idea (customers only)
- `GET /api/ideas/<id>` - Get idea details with updates
- `PUT /api/ideas/<id>` - Update idea status/assignment (owner/developer)
- `POST /api/ideas/<id>/updates` - Add progress update
- `GET /api/developers` - List all developers (owner only)
- `GET /api/stats` - Get idea statistics by status

## Features Implemented

### Authentication & Security
- JWT-based authentication with 24-hour token expiration
- Password hashing using Werkzeug
- Role-based access control (Customer, Owner, Developer)
- Secure session management with localStorage
- Protected routes on frontend
- CORS enabled for cross-origin requests

### Customer Features
- Submit ideas with title and description
- View all submitted ideas with status tracking
- Real-time status updates (pending, in_progress, completed)
- View detailed progress updates from developers/owners
- Statistics dashboard showing idea counts by status

### Owner Features
- View all submitted ideas from all customers
- Access to customer contact information (name, email, phone)
- Assign ideas to specific developers
- Update idea status
- Post updates visible to customers and developers
- Complete workflow management dashboard
- Statistics showing system-wide metrics

### Developer Features
- View assigned tasks only
- Update task status (pending → in_progress → completed)
- Submit progress updates visible to owners and customers
- Task statistics and progress tracking
- Empty state when no tasks assigned

### UI/UX Design
- Professional blue-gray gradient theme
- Responsive card-based layouts
- Status badges with color coding:
  - Pending: Orange
  - In Progress: Blue
  - Completed: Green
- Modal popups for detailed views
- Clean, modern interface with smooth interactions

## Running the Application

### Prerequisites
- Node.js 20.x
- Python 3.11
- PostgreSQL database (automatically configured in Replit)

### Starting the Application
Both workflows are configured and auto-start:
1. **Backend:** Flask API runs on port 5001
2. **Frontend:** React app runs on port 5000 (visible to users)

### Demo Credentials
- **Owner Account:**
  - Email: owner@example.com
  - Password: owner123

New users can register as Customer or Developer through the registration page.

## File Structure
```
.
├── backend/
│   └── app.py                  # Flask API with all routes and models
├── frontend/
│   ├── src/
│   │   ├── api.js             # Axios API client
│   │   ├── AuthContext.jsx    # Authentication context provider
│   │   ├── Login.jsx          # Login page
│   │   ├── Register.jsx       # Registration page
│   │   ├── CustomerDashboard.jsx
│   │   ├── OwnerDashboard.jsx
│   │   ├── DeveloperDashboard.jsx
│   │   ├── App.jsx            # Main app with routing
│   │   └── index.css          # Global styles
│   ├── vite.config.js         # Vite config with host settings
│   └── package.json           # Frontend dependencies
├── .gitignore                 # Git ignore file
└── replit.md                  # This file
```

## Environment Variables
The following environment variables are configured in Replit:
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - JWT secret key
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` - Database credentials

## Security Features
- Passwords hashed with Werkzeug (never stored in plain text)
- JWT tokens for stateless authentication
- Role-based authorization on all endpoints
- User data accessible only to authorized personnel (Owner role)
- Secure database connections via environment variables

## Known Issues / Future Enhancements
None currently. System is running smoothly.

## Development Notes
- Frontend must run on port 5000 for proper Replit proxy support
- Backend runs on port 5001 (internal only)
- Vite configured with host: '0.0.0.0' for Replit environment
- SQLAlchemy relationships use explicit foreign_keys to avoid ambiguity
- LSP warnings about SQLAlchemy constructors are cosmetic only
