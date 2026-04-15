# Admin Dashboard Login

## Login Flow

# CLICK: CNTRL + SHIFT + P

1. Go to `/admin`
2. Enter your employee email and the shared password
3. On success, the dashboard greets you by first name and shows your department
4. Click **Logout** to return to the login page

All logins are recorded in the `AuditLogs` table.

## Credentials

| Field    | Value                                          |
|----------|------------------------------------------------|
| Email    | Any employee email (e.g. `koketso@mphatek.com`) |
| Password | `Mph@t3kV1s1t0r2026`                           |

## Changing the Password

Edit `SHARED_PASSWORD` in `server/routes/auth.js`:

```js
const SHARED_PASSWORD = "Mph@t3kV1s1t0r2026";
```
