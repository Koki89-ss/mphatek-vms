import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

function authHeaders() {
    try{
        const saved = localStorage.getItem("vms_user");
        const user = saved ? JSON.parse(saved): null;
        return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
    } catch {
      return {};

    }
}

function StatCard({ label, value, color }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-grey">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function formatTime(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
}

function getDuration(checkIn, checkOut) {
  if (!checkIn || !checkOut) return "-";
  const diff = new Date(checkOut) - new Date(checkIn);
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  return `${hours}h ${mins}m`;
}

export default function AdminDashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ todayTotal: 0, checkedIn: 0, completed: 0, overstayed: 0 });
  const [meetings, setMeetings] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [visitors, setVisitors] = useState({});
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDate, setFilterDate] = useState("");

  async function loadStats() {
    try {
      const res = await fetch(`${API_URL}/dashboard/stats`, {
        headers : authHeaders(), });
      if (res.ok) setStats(await res.json());
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  }

  const loadMeetings = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.append("status", filterStatus);
      if (filterDate) params.append("date", filterDate);

      const res = await fetch(`${API_URL}/meetings?${params}`, {
        headers : authHeaders(),
      });
      if (res.ok) setMeetings(await res.json());
    } catch (err) {
      console.error("Failed to load meetings:", err);
    }
  }, [filterStatus, filterDate]);

  async function loadVisitors(meetingId) {
    if (visitors[meetingId]) return;
    try {
      const res = await fetch(`${API_URL}/meetings/${meetingId}/visitors`, {
        headers : authHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setVisitors((prev) => ({ ...prev, [meetingId]: data }));
      }
    } catch (err) {
      console.error("Failed to load visitors:", err);
    }
  }

  async function handleCheckout(meetingId) {
    try {
      const res = await fetch(`${API_URL}/meetings/${meetingId}/checkout`, {
        method: "PUT",
        headers :  authHeaders(), });

      if (res.ok) {
        loadStats();
        loadMeetings();
      }
    } catch (err) {
      console.error("Checkout failed:", err);
    }
  }



  async function handleApprove(meetingId) {
    try {
        const res = await fetch(`${API_URL}/meetings/${meetingId}/approve`, {
            method: "PUT",
            headers : authHeaders(),
        });
        if (res.ok) {
            loadStats();
            loadMeetings();
        }
    } catch (err) {
        console.error("Approval failed:", err);
    }
    }

  function toggleExpand(meetingId) {
    if (expandedId === meetingId) {
      setExpandedId(null);
    } else {
      setExpandedId(meetingId);
      loadVisitors(meetingId);
    }
  }

  function exportToCSV() {
    if (meetings.length === 0) return;

    const headers = ["Meeting ID", "Category", "Purpose", "Host", "Department", "Location", "Check In", "Check Out", "Duration", "Status"];
    const rows = meetings.map((m) => [
      m.meetingId,
      m.visitorcategory,
      m.purpose,
      m.hostname,
      m.department,
      m.locationname,
      m.checkintime ? new Date(m.checkintime).toLocaleString() : "",
      m.checkouttime ? new Date(m.checkouttime).toLocaleString() : "",
      getDuration(m.checkintime, m.checkouttime),
      m.status,
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `visitors_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    loadStats();
    loadMeetings();
  }, [loadMeetings]);

  return (
    <div className="min-h-screen bg-brand-light px-4 py-6">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-6 flex items-center gap-4 rounded-xl bg-brand-dark px-6 py-4">
          <img src="/mphatek-logo.png" alt="Mphatek" className="h-10" />
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-white">Welcome, {user?.fullname?.split(" ")[0]}</h1>
            <p className="text-xs text-gray-400">{user?.department} — Admin Dashboard</p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="rounded-lg border border-gray-600 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-800"
          >
            Back to QR
          </button>
          <button
            onClick={onLogout}
            className="rounded-lg border border-red-400 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-900/30"
          >
            Logout
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Today's Visitors" value={stats.todayTotal} color="text-brand-dark" />
          <StatCard label="Checked In" value={stats.checkedIn} color="text-brand-blue" />
          <StatCard label="Completed" value={stats.completed} color="text-green-600" />
          <StatCard label="Overstayed" value={stats.overstayed} color="text-red-600" />
        </div>

        {/* Filters + Export */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-blue"
          >
            <option value="">All Statuses</option>
            <option value = "Pending">Pending</option>  
            <option value="CheckedIn">Checked In</option>
            <option value="Completed">Completed</option>
          </select>

          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-blue"
          />

          {filterDate && (
            <button
              onClick={() => setFilterDate("")}
              className="rounded-lg border border-gray-300 px-3 py-2 text-xs text-brand-grey hover:bg-gray-50"
            >
              Clear Date
            </button>
          )}

          <div className="flex-1" />

          <button
            onClick={exportToCSV}
            className="rounded-lg bg-brand-dark px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800"
          >
            Export CSV
          </button>
        </div>

        {/* Meetings Table */}
        <div className="rounded-xl bg-white shadow-sm">
          {meetings.length === 0 ? (
            <div className="p-8 text-center text-sm text-brand-grey">
              No meetings found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-brand-grey">
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Host</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Check In</th>
                    <th className="px-4 py-3">Check Out</th>
                    <th className="px-4 py-3">Duration</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {meetings.map((m) => (
                    <React.Fragment key={m.meetingid}>
                      <tr
                        className="cursor-pointer border-b border-gray-100 hover:bg-gray-50"
                        onClick={() => toggleExpand(m.meetingid)}
                      >
                        <td className="px-4 py-3 font-medium">{m.meetingid}</td>
                        <td className="px-4 py-3">{m.visitorcategory}</td>
                        <td className="px-4 py-3">
                          <div>{m.hostname}</div>
                          <div className="text-xs text-brand-grey">{m.department}</div>
                        </td>
                        <td className="px-4 py-3">{m.locationname}</td>
                        <td className="px-4 py-3">
                          <div>{formatTime(m.checkintime)}</div>
                          <div className="text-xs text-brand-grey">{formatDate(m.checkintime)}</div>
                        </td>
                        <td className="px-4 py-3">{formatTime(m.checkouttime)}</td>
                        <td className="px-4 py-3">{getDuration(m.checkintime, m.checkouttime)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                              m.status === "Pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : m.status === "CheckedIn"
                                ? "bg-blue-100 text-blue-700"
                                : m.status === "Completed"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {m.status}
                          </span>
                        </td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          {m.status === "Pending" && (
                            <button
                              onClick={() => handleApprove(m.meetingid)}
                              className="rounded-lg bg-green-50 px-3 py-1 text-xs font-medium text-green-600 hover:bg-green-100"
                            >
                                Approve
                                </button>
                            )}

                            {m.status === "CheckedIn" && (
                                <button
                                    onClick={() => handleCheckout(m.meetingid)}
                                    className= "rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
                                >
                              Check Out
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* Expanded visitor details */}
                      {expandedId === m.meetingid && (
                        <tr>
                          <td colSpan={9} className="bg-gray-50 px-4 py-4">
                            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-grey">
                              Visitors for Meeting #{m.meetingid} — {m.purpose}
                            </div>
                            {!visitors[m.meetingid] ? (
                              <p className="text-xs text-brand-grey">Loading visitors...</p>
                            ) : visitors[m.meetingid].length === 0 ? (
                              <p className="text-xs text-brand-grey">No visitors found.</p>
                            ) : (
                              <div className="grid gap-3 md:grid-cols-2">
                                {visitors[m.meetingid].map((v) => (
                                  <div key={v.visitorid} className="rounded-lg border border-gray-200 bg-white p-3 text-xs">
                                    <div className="mb-1 font-semibold text-brand-dark">{v.fullname}</div>
                                    <div className="text-brand-grey">{v.email}</div>
                                    <div className="text-brand-grey">{v.contactnum}</div>
                                    <div className="text-brand-grey">{v.organizationname}</div>
                                    {v.vehiclenum && <div className="text-brand-grey">Vehicle: {v.vehiclenum}</div>}
                                    {v.idprooftype && <div className="text-brand-grey">ID: {v.idprooftype} — {v.idproofnumber}</div>}
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Mphatek Visitor Management System
        </p>
      </div>
    </div>
  );
}
