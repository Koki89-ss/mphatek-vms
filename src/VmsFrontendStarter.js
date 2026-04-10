import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const categories = ["Client", "Vendor", "Interview", "Delivery", "Internal Guest"];

const emptyVisitor = {
  fullName: "",
  contactNum: "",
  email: "",
  organizationName: "",
  vehicleNum: "",
};

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  const digits = phone.replace(/[\s\-()]/g, "");
  return /^\d{7,15}$/.test(digits);
}

function InputField({ label, name, value, onChange, type = "text", required = false, placeholder = "" }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-brand-dark">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options, required = false, placeholder = "Select" }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-brand-dark">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function VisitorCard({ index, visitor, onChange, onRemove, canRemove, errors }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-brand-dark">Visitor {index + 1}</h3>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
          >
            Remove
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <InputField label="Full Name" name="fullName" value={visitor.fullName} onChange={(e) => onChange(index, e)} required placeholder="Enter full name" />
          {errors[`fullName_${index}`] && <p className="mt-1 text-xs text-red-600">{errors[`fullName_${index}`]}</p>}
        </div>
        <div>
          <InputField label="Contact Number" name="contactNum" value={visitor.contactNum} onChange={(e) => onChange(index, e)} required placeholder="e.g. 0821234567" />
          {errors[`contactNum_${index}`] && <p className="mt-1 text-xs text-red-600">{errors[`contactNum_${index}`]}</p>}
        </div>
        <div>
          <InputField label="Email" name="email" type="email" value={visitor.email} onChange={(e) => onChange(index, e)} required placeholder="Enter email address" />
          {errors[`email_${index}`] && <p className="mt-1 text-xs text-red-600">{errors[`email_${index}`]}</p>}
        </div>
        <div>
          <InputField label="Organization" name="organizationName" value={visitor.organizationName} onChange={(e) => onChange(index, e)} required placeholder="Enter organization" />
          {errors[`organizationName_${index}`] && <p className="mt-1 text-xs text-red-600">{errors[`organizationName_${index}`]}</p>}
        </div>
        <div className="md:col-span-2">
          <InputField label="Vehicle Number" name="vehicleNum" value={visitor.vehicleNum} onChange={(e) => onChange(index, e)} placeholder="Optional" />
        </div>
      </div>
    </div>
  );
}

function SuccessScreen({ meetingId, checkInTime, onNewRegistration }) {
  const timeString = checkInTime
    ? checkInTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";
  const dateString = checkInTime
    ? checkInTime.toLocaleDateString([], { day: "numeric", month: "long", year: "numeric" })
    : "";

  return (
    <div className="mx-auto max-w-md text-center">
      <div className="rounded-xl bg-white p-8 shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="mb-2 text-xl font-semibold text-brand-dark">Registration Successful</h2>
        <p className="mb-4 text-sm text-brand-grey">Your visit has been registered.</p>

        <div className="mb-6 rounded-lg bg-brand-light p-4 text-sm">
          <div className="mb-2 flex justify-between">
            <span className="text-brand-grey">Meeting ID</span>
            <span className="font-semibold text-brand-dark">{meetingId}</span>
          </div>
          <div className="mb-2 flex justify-between">
            <span className="text-brand-grey">Checked In</span>
            <span className="font-semibold text-brand-dark">{timeString}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-brand-grey">Date</span>
            <span className="font-semibold text-brand-dark">{dateString}</span>
          </div>
        </div>

        <p className="mb-6 text-xs text-brand-grey">
          The host has been notified and will be with you shortly.
        </p>
        <button
          onClick={onNewRegistration}
          className="w-full rounded-lg bg-brand-dark px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
        >
          Register Another Visitor
        </button>
      </div>
    </div>
  );
}

export default function VmsFrontendStarter() {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [locations, setLocations] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [form, setForm] = useState({
    visitorCategory: "",
    purpose: "",
    hostEmployeeId: "",
    locationId: "",
    visitors: [{ ...emptyVisitor }],
  });

  const [errors, setErrors] = useState({});
  const [submitState, setSubmitState] = useState({ loading: false, success: false, error: "" });
  const [meetingId, setMeetingId] = useState(null);
  const [checkInTime, setCheckInTime] = useState(null);

  // fetch employees and locations from the API on load
  useEffect(() => {
    async function loadData() {
      try {
        const [empRes, locRes] = await Promise.all([
          fetch(`${API_URL}/employees`),
          fetch(`${API_URL}/locations`),
        ]);
        if (empRes.ok) setEmployees(await empRes.json());
        if (locRes.ok) setLocations(await locRes.json());
      } catch (err) {
        console.error("Could not load data from server:", err);
      } finally {
        setDataLoading(false);
      }
    }
    loadData();
  }, []);

  const hostOptions = useMemo(
    () => employees.map((e) => ({ value: String(e.EmployeeID), label: `${e.FullName} - ${e.Department}` })),
    [employees]
  );

  const locationOptions = useMemo(
    () => locations.map((l) => ({ value: String(l.LocationID), label: l.LocationName })),
    [locations]
  );

  const categoryOptions = useMemo(
    () => categories.map((c) => ({ value: c, label: c })),
    []
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleVisitorChange = (index, e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const visitors = [...prev.visitors];
      visitors[index] = { ...visitors[index], [name]: value };
      return { ...prev, visitors };
    });
  };

  const addVisitor = () => {
    setForm((prev) => ({
      ...prev,
      visitors: [...prev.visitors, { ...emptyVisitor }],
    }));
  };

  const removeVisitor = (index) => {
    if (form.visitors.length <= 1) return;
    setForm((prev) => ({
      ...prev,
      visitors: prev.visitors.filter((_, i) => i !== index),
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.visitorCategory) newErrors.visitorCategory = "Required";
    if (!form.purpose.trim()) newErrors.purpose = "Required";
    if (!form.hostEmployeeId) newErrors.hostEmployeeId = "Required";
    if (!form.locationId) newErrors.locationId = "Required";

    form.visitors.forEach((v, i) => {
      if (!v.fullName.trim()) newErrors[`fullName_${i}`] = "Full name is required";

      if (!v.contactNum.trim()) {
        newErrors[`contactNum_${i}`] = "Contact number is required";
      } else if (!isValidPhone(v.contactNum)) {
        newErrors[`contactNum_${i}`] = "Enter a valid phone number";
      }

      if (!v.email.trim()) {
        newErrors[`email_${i}`] = "Email is required";
      } else if (!isValidEmail(v.email)) {
        newErrors[`email_${i}`] = "Enter a valid email address";
      }

      if (!v.organizationName.trim()) newErrors[`organizationName_${i}`] = "Organization is required";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setForm({
      visitorCategory: "",
      purpose: "",
      hostEmployeeId: "",
      locationId: "",
      visitors: [{ ...emptyVisitor }],
    });
    setErrors({});
    setSubmitState({ loading: false, success: false, error: "" });
    setMeetingId(null);
    setCheckInTime(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitState({ loading: false, success: false, error: "" });

    if (!validate()) {
      setSubmitState({ loading: false, success: false, error: "Please fix the errors above." });
      return;
    }

    const now = new Date();
    const payload = {
      visitorCategory: form.visitorCategory,
      purpose: form.purpose,
      hostEmployeeId: Number(form.hostEmployeeId),
      locationId: Number(form.locationId),
      checkInTime: now.toISOString(),
      visitors: form.visitors.map((v) => ({
        fullName: v.fullName,
        contactNum: v.contactNum,
        email: v.email,
        organizationName: v.organizationName,
        vehicleNum: v.vehicleNum || null,
      })),
    };

    try {
      setSubmitState({ loading: true, success: false, error: "" });

      const response = await fetch(`${API_URL}/meetings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to submit registration.");

      const result = await response.json();

      setMeetingId(result.meetingId);
      setCheckInTime(now);
      setSubmitState({ loading: false, success: true, error: "" });
    } catch (err) {
      setSubmitState({
        loading: false,
        success: false,
        error: err.message || "Something went wrong. Please try again.",
      });
    }
  };

  if (submitState.success && meetingId) {
    return (
      <div className="min-h-screen bg-brand-light px-4 py-6">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex items-center gap-4 rounded-xl bg-brand-dark px-6 py-4">
            <img src="/mphatek-logo.png" alt="Mphatek" className="h-10" />
            <div>
              <h1 className="text-lg font-semibold text-white">Visitor Registration</h1>
              <p className="text-xs text-gray-400">Your visit has been registered.</p>
            </div>
          </div>
          <SuccessScreen meetingId={meetingId} checkInTime={checkInTime} onNewRegistration={resetForm} />
          <p className="mt-6 text-center text-xs text-gray-400">Mphatek Visitor Management System</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-light px-4 py-6">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-6 flex items-center gap-4 rounded-xl bg-brand-dark px-6 py-4">
          <img src="/mphatek-logo.png" alt="Mphatek" className="h-10" />
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-white">Visitor Registration</h1>
            <p className="text-xs text-gray-400">Fill in the form below to register your visit.</p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="rounded-lg border border-gray-600 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-800"
          >
            Back
          </button>
        </div>

        {dataLoading ? (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-brand-grey">Loading form data...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Meeting Details */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-brand-grey">
                Meeting Details
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <SelectField label="Visitor Category" name="visitorCategory" value={form.visitorCategory} onChange={handleChange} options={categoryOptions} required placeholder="Select category" />
                  {errors.visitorCategory && <p className="mt-1 text-xs text-red-600">{errors.visitorCategory}</p>}
                </div>
                <div>
                  <InputField label="Purpose of Visit" name="purpose" value={form.purpose} onChange={handleChange} required placeholder="Enter purpose" />
                  {errors.purpose && <p className="mt-1 text-xs text-red-600">{errors.purpose}</p>}
                </div>
                <div>
                  <SelectField label="Person to Meet" name="hostEmployeeId" value={form.hostEmployeeId} onChange={handleChange} options={hostOptions} required placeholder="Select employee" />
                  {errors.hostEmployeeId && <p className="mt-1 text-xs text-red-600">{errors.hostEmployeeId}</p>}
                </div>
                <div>
                  <SelectField label="Meeting Location" name="locationId" value={form.locationId} onChange={handleChange} options={locationOptions} required placeholder="Select location" />
                  {errors.locationId && <p className="mt-1 text-xs text-red-600">{errors.locationId}</p>}
                </div>
              </div>
            </div>

            {/* Visitors */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-grey">
                  Visitors ({form.visitors.length})
                </h2>
                <button
                  type="button"
                  onClick={addVisitor}
                  className="rounded-lg bg-brand-blue px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
                >
                  + Add Visitor
                </button>
              </div>

              <div className="space-y-4">
                {form.visitors.map((visitor, index) => (
                  <VisitorCard
                    key={index}
                    index={index}
                    visitor={visitor}
                    onChange={handleVisitorChange}
                    onRemove={removeVisitor}
                    canRemove={form.visitors.length > 1}
                    errors={errors}
                  />
                ))}
              </div>
            </div>

            {/* Error Message */}
            {submitState.error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {submitState.error}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-brand-grey hover:bg-gray-50"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={submitState.loading}
                className="rounded-lg bg-brand-dark px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitState.loading ? "Submitting..." : "Register"}
              </button>
            </div>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-gray-400">
          Mphatek Visitor Management System
        </p>
      </div>
    </div>
  );
}
