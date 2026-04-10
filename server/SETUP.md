# Server Setup Guide

The backend API connects to the existing SQL Server database on DESKTOP-JALOKH3.
The database (VisitorsManagementSystem) and all tables are already set up with real employee and location data.

## Step 1: Install Node.js (if not already installed)

1. Download Node.js from https://nodejs.org (use the LTS version)
2. Run the installer, accept all defaults
3. Open Command Prompt and type `node --version` to confirm it installed

## Step 2: Install server dependencies

1. Open Command Prompt
2. Navigate to the server folder:
   ```
   cd C:\path\to\visitor-app\server
   ```
3. Run:
   ```
   npm install
   ```
   This installs everything including the Windows Authentication driver for SQL Server.

## Step 3: Start the server

1. In the same Command Prompt, run:
   ```
   npm start
   ```
2. You should see:
   ```
   Server running on http://localhost:5000
   Connected to SQL Server
   ```

## Step 4: Test the API

Open a browser and go to:
- http://localhost:5000/api/health — should show `{"status":"ok"}`
- http://localhost:5000/api/employees — should show the employees from the database
- http://localhost:5000/api/locations — should show the locations from the database

## Step 5: Update the frontend .env

In the project root `.env` file, update the API URL to point to the Windows machine IP:
```
REACT_APP_API_URL=http://<WINDOWS_MACHINE_IP>:5000/api
REACT_APP_BASE_URL=http://<WINDOWS_MACHINE_IP>:3000
```

To find the IP, open Command Prompt on the Windows machine and run `ipconfig`, look for the IPv4 Address.

## Troubleshooting

- If you get a connection error, make sure SQL Server is running (check SQL Server Configuration Manager)
- Make sure TCP/IP is enabled in SQL Server Configuration Manager > SQL Server Network Configuration > Protocols
- If the server can't connect, try restarting SQL Server after enabling TCP/IP
- Make sure Windows Firewall allows port 5000 (or temporarily disable it for testing)
