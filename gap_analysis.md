# Gap Analysis: Spec vs Implementation

## Section 2.1 — Scope of Work

| # | Requirement | Status | Notes |
|---|---|---|---|
| 1 | QR-based visitor registration | Done | QR on `/`, links to Vercel form |
| 2 | Multiple visitor categories | Done | Client, Vendor, Interview, Delivery, Internal Guest |
| 3 | Multiple visitors per meeting | Done | Number of Visitors field + Add/Remove |
| 4 | Capture complete visitor details | Done | All fields from spec including ID proof |
| 5 | Select employee to meet | Done | Dropdown from database |
| 6 | Capture meeting location | Done | Dropdown from database |
| 7 | Automated notification to host | Done | Email via Nodemailer, logged to Notifications table |
| 8 | Check-in and check-out records | Done | Auto check-in on submit, manual check-out from dashboard |
| 9 | Admin dashboard | Done | Stats, table, filters, expand for visitor details |
| 10 | Reporting and export | Partial | CSV export done. PDF export missing. Department-wise report missing. |
| 11 | Visitor history | Done | All meetings listed, filterable by date |
| 12 | Role-based access control | Partial | Login gates the dashboard. No distinct Admin/Reception/Employee roles. |

## Section 4 — Functional Requirements

| ID | Requirement | Status | Notes |
|---|---|---|---|
| FR-01 | QR code at reception | Done | |
| FR-02 | QR redirects to form | Done | |
| FR-03 | Mandatory fields | Done | All fields present with validation |
| FR-04 | Multiple visitors handling | Done | Dynamic add/remove, linked to same Meeting ID |
| FR-05 | OTP verification (optional) | Not done | Marked optional in spec |
| FR-06 | Arrival notification (email) | Done | Email with visitor names, purpose, location, time |
| FR-06 | SMS notification (optional) | Not done | Marked optional in spec |
| FR-06 | Dashboard alert | Not done | No real-time alert on dashboard |
| FR-07 | Employee accept/reject/reschedule | Not done | Employee cannot respond to visitor arrival |
| FR-08 | Auto check-in timestamp | Done | |
| FR-09 | Manual check-out + duration | Done | Check-out button + duration calculated |
| FR-10 | Location configuration by admin | Not done | No admin UI to add/edit locations |
| FR-11 | Dashboard: today's visitors | Done | |
| FR-11 | Dashboard: checked-in visitors | Done | |
| FR-11 | Dashboard: overstayed visitors | Done | |
| FR-11 | Dashboard: upcoming meetings | Not done | No "upcoming/scheduled" meetings concept |
| FR-12 | Filter by date range | Partial | Single date filter. No date range (from-to). |
| FR-12 | Filter by visitor category | Not done | Missing filter |
| FR-12 | Filter by employee | Not done | Missing filter |
| FR-12 | Filter by location | Not done | Missing filter |
| FR-13 | Export to Excel | Done | CSV (opens in Excel) |
| FR-13 | Export to PDF | Not done | Missing |
| FR-13 | Visitor history report | Done | All meetings listed |
| FR-13 | Department-wise report | Not done | Missing |
| FR-14 | Role-based access (Admin/Reception/Employee) | Partial | Login exists. No role differentiation. |

## Section 5 — Non-Functional Requirements

| Requirement | Status | Notes |
|---|---|---|
| Page response < 3 seconds | Done | Pages load instantly, data fetches in background |
| HTTPS | Done | Vercel deployment is HTTPS |
| Role-based auth | Partial | Login exists, no roles |
| Audit logs | Done | Meeting creation, checkout, login all logged |
| Password encryption | Not done | Shared plaintext password in code |

## Section 8 — Audit Logging

| Event | Status |
|---|---|
| Visitor submission | Done |
| Notification sent | Done |
| Check-in | Done |
| Check-out | Done |
| Record updates | Not done |
| Login activity | Done |

## Section 12 — Acceptance Criteria

| Criteria | Status |
|---|---|
| Visitor can register via QR | Done |
| Employee receives notification | Done |
| Multiple visitors supported | Done |
| Check-in/out recorded | Done |
| Admin reports available | Partial |
| Role-based access working | Partial |

## Summary of Gaps

**Core functionality gaps:**
- Dashboard filters missing: visitor category, employee, location
- Employee accept/reject visitor (FR-07)
- Admin UI to manage locations (FR-10)
- Date range filter (from-to) instead of single date

**Optional / can be deferred:**
- PDF export
- Department-wise visitor report
- Dashboard real-time alert for new visitors
- Role differentiation (Admin vs Reception vs Employee views)
- Upcoming/scheduled meetings
- OTP verification (marked optional in spec)
- SMS notifications (marked optional in spec)
- Password hashing
