# Mphatek Visitor Management System

> A full-stack visitor management platform built for Mphatek Systems. Visitors register via QR code at reception, hosts are notified instantly by email, and every visit is tracked and logged from arrival to departure.

![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20SQL%20Server-brightgreen?style=flat-square)
![Status](https://img.shields.io/badge/Status-Production-success?style=flat-square)

---

# Overview

The Mphatek Visitor Management System (VMS) replaces manual paper-based visitor sign-in with a structured, digital workflow. From the moment a visitor scans the QR code at reception to the moment they check out, every action is recorded with a timestamp and visible to the right people in real time.

---

# Features

### Visitor Side
- QR code-based registration at reception — no app download required
- Simple registration form: name, contact, host, and purpose of visit
- Support for multiple visitors per meeting
- Optional ID proof capture
- Instant confirmation on submission

### Host Side
- Instant email notification when a visitor registers
- Dedicated host portal to view pending visits
- One-click Approve or Decline workflow
- Check-out management after the meeting ends

### Reception / Admin Side
- Real-time dashboard — visitor status updates without page refresh
- Status tracking: Pending → Approved → Checked In → Checked Out
- Stats overview: pending, approved, checked in, and checked out counts
- Advanced filters and CSV export
- Employee and location dropdowns populated from the database

### System Wide
- Complete audit log with timestamps for every action
- Email notifications via SMTP (Nodemailer)
- REST API architecture — modular and built to scale
- Secure environment variable configuration

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Tailwind CSS |
| Backend | Node.js, Express |
| Database | Microsoft SQL Server |
| Email | Nodemailer (SMTP) |
| API | REST |

---

##  Project Structure

```
visitor-app/
├── public/                        # Static files, logo
├── src/
│   ├── App.js                     # Routing
│   ├── QRPage.js                  # QR code display (reception screen)
│   ├── VmsFrontendStarter.js      # Visitor registration form
│   └── AdminDashboard.js          # Admin / reception dashboard
├── server/
│   ├── index.js                   # Express server entry point
│   ├── db.js                      # SQL Server connection
│   ├── notify.js                  # Email notification service
│   └── routes/
│       ├── employees.js           # GET /api/employees
│       ├── locations.js           # GET /api/locations
│       ├── meetings.js            # POST /api/meetings, GET /api/meetings, POST /api/meetings/:id/checkout
│       └── dashboard.js           # GET /api/dashboard/stats
├── database/                      # SQL setup scripts
├── .env                           # Environment variables (not committed)
├── .gitignore
└── README.md
```

---

## 🔄 How It Works

```
1. Visitor scans QR code at reception and completes registration form
        ↓
2. Host receives an instant email notification
        ↓
3. Host logs into the portal and sees the pending visit
        ↓
4. Host clicks Approve (or Decline)
        ↓
5. Reception dashboard updates in real time — status flips to Checked In
        ↓
6. After the meeting, host clicks Check Out
        ↓
7. All actions are logged with timestamps in the audit log
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- Microsoft SQL Server (local or remote)
- npm or yarn

### 1. Clone the repository

```bash
git clone https://github.com/your-username/mphatek-vms.git
cd mphatek-vms
```

### 2. Set up environment variables

Create a `.env` file in the project root:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_BASE_URL=http://localhost:3000
```

Set these before starting the backend server (Windows):

```cmd
set SMTP_HOST=smtp.gmail.com
set SMTP_PORT=587
set SMTP_USER=your-email@gmail.com
set SMTP_PASS=your-app-password
```

### 3. Set up the database

Run the SQL scripts in the `database/` folder against your SQL Server instance to create the `VisitorsManagementSystem` database and required tables.

### 4. Install and run the frontend

```bash
npm install
npm start
```

Runs on [http://localhost:3000](http://localhost:3000)

### 5. Install and run the backend

```bash
cd server
npm install
npm start
```

Runs on [http://localhost:5000](http://localhost:5000)

> See `server/SETUP.md` for detailed backend configuration instructions.

---

##  API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/employees` | Fetch all employees for host dropdown |
| GET | `/api/locations` | Fetch all locations |
| POST | `/api/meetings` | Register a new visitor / meeting |
| GET | `/api/meetings` | Get all meetings with current status |
| POST | `/api/meetings/:id/checkout` | Check out a visitor |
| GET | `/api/dashboard/stats` | Get dashboard statistics |

---

##  Pages

| Route | Description |
|---|---|
| `/` | QR code display page — shown on reception screen |
| `/visitor-registration` | Visitor registration form |
| `/admin` | Admin and reception dashboard |

---

##  Author

**Boipelo Mohloboli**
Junior Data Analyst & Developer — Mphatek Systems
[linkedin.com/in/boipelo-mohloboli](https://linkedin.com/in/boipelo-mohloboli)

---

##  License

This project is proprietary software developed for internal use at Mphatek Systems.
