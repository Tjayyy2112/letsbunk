# Let'sBunk

A premium, dynamic Full-Stack Attendance and Timetable Management solution. Track smart, bunk smarter.

## 🚀 Project Architecture

```text
letsbunk/
├── frontend/       ← React (Vite) UI client
└── backend/        ← Node.js (Express) & PostgreSQL API service
```

## 🛠 Setup Instructions

### 1. Prerequisites
* Node.js v18+
* PostgreSQL 14+

### 2. Backend Implementation
Navigate to the backend directory and complete setup:
```bash
cd backend
npm install
cp .env.example .env
# Fill .env with your local DB details
npm run migrate
npm run dev
```

### 3. Frontend Implementation
Open a separate terminal and launch the frontend:
```bash
cd frontend
npm install
npm run dev
```

## ✨ Features
- **Atomic Log Synchronization**: Real-time server persistence of status states.
- **Intelligent Timetabling**: Dynamic navigation and conditional hard/soft class removals.
- **Smart Metrics**: Inlined, spring-pop visual pill badges showing instantly calculated rates.
- **Dual Mode Architecture**: Full responsive floating modal orchestration clearing low-elevation devices.
