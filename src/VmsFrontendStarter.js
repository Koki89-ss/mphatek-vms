import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {supabase} from "./supabase";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const categories = ["Client", "Vendor", "Interview", "Delivery", "Internal Guest"];

const idProofTypes = ["National ID", "Passport", "Driver's License"];

const emptyVisitor = {
  fullName: "",
  contactNum: "",
  email: "",
  organizationName: "",
  vehicleNum: "",
  idProofType: "",
  idProofNumber: "",
};

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  const digits = phone.replace(/[\s\-()]/g, "");
  return /^\d{7,15}$/.test(digits);
}

function PhotoCapture({ onPhotoTaken, photo }) {
  // Implementation for photo capture
     const videoRef = React.useRef(null);
     const [stream, setStream] = useState(null);
     const [capturing, setCapturing] = useState(false)


async function startCamera() {
  setCapturing(true);
}   

  useEffect(() => {
    if (!ca[pturing]) return;

    let activeSream = null;

    async function initCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "user"}
        });

        activeSream = mediaStream;
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Could not access camera:", err);
        alert("Unable to access camera. Please allow camera permissions and try again.");
        setCapturing(false);
      
      }
  }

    initCamera();

    return () => {
      if (activeSream) {
        activeSream.getTracks().forEach((track) => track.stop());
      }

    };

  }, [capturing]);

function takePhoto() {

  if (!videoRef.current) return;

  const canvas = document.createElement("canvas");
  canvas.width = videoRef.current.videoWidth;
  canvas.height = videoRef.current.videoHeight;

  canvas.getContext("2d")
  ctx.drawImage(videoRef.current, 0, 0);

  const dataUrl = canvas.toDataURL("image/jpeg");
  onPhotoTaken(dataUrl);

  stream.getTracks().forEach((track) => track.stop());
  setStream(null);
  setCapturing(false);

}


function retake() {
  onPhotoTaken(null);
  setCapturing(false);
}


return (
  <div className = "rounded-xl bg-white p-6 shadow-sm">
    <h2 className = "mb-4 text-sm font-semibold uppercase tracking-wide text-brand-grey">
      Visitor Photo <span className = "text-gray-400 font-normal normal-case">(optional)</span>
      </h2>

      {!capturing && !photo &&  (
        <div className = "text-center py-6">
          <p className = "text-sm text-brand-grey mb-4">Take photo for identification purposes.</p>
          <button
             type = "button"
             onClick = {startCamera}
             className = "rounded-lg bg-brand-blue px-2.5 text-sm font-semibold text-white hover:bg-blue-500"
             >
              OpenCamera
              </button>
              </div> 
      )}

      {capturing && (
        <div className = "text-center">
          <video ref = {videoRef} autoPlay playsInline muted className = "rounded-lg w-full max-w-xs mx-auto mb-4"/>
          <button
              type = "button"
              onClick = {takePhoto}
              className = "rounded-lg bg-brand-dark px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
              >
                Take Photo
                </button>
                </div>
      )}

      {photo && (
        <div className = "text-center">
          <img src = {photo} alt = "Visitor" className = "rounded-lg w-full max-w-xs mx-auto mb-4"/>
          <button
              type = "button"
              onClick = {retake}
              className = "rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-brand-gray hover:bg-gray-50"
            >
              Retake Photo
            </button>
            </div>
      )}
      </div>
);
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
        <div>
          <SelectField label="ID Proof Type" name="idProofType" value={visitor.idProofType} onChange={(e) => onChange(index, e)} options={idProofTypes.map((t) => ({ value: t, label: t }))} placeholder="Optional" />
        </div>
        <div>
          <InputField label="ID Proof Number" name="idProofNumber" value={visitor.idProofNumber} onChange={(e) => onChange(index, e)} placeholder="Optional" />
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
  const [photo, setPhoto] = useState(null);

  const [form, setForm] = useState({
    visitorCategory: "",
    purpose: "",
    hostEmployeeId: "",
    locationId: "",
    numberOfVisitors: 1,
    visitors: [{ ...emptyVisitor }],
  });

  const [errors, setErrors] = useState({});
  const [submitState, setSubmitState] = useState({ loading: false, success: false, error: "" });
  const [meetingId, setMeetingId] = useState(null);
  const [checkInTime, setCheckInTime] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    async function loadData() {
      try {
        const [empRes, locRes] = await Promise.all([
          fetch(`${API_URL}/employees`, { signal: controller.signal }),
          fetch(`${API_URL}/locations`, { signal: controller.signal }),
        ]);
        if (empRes.ok) setEmployees(await empRes.json());
        if (locRes.ok) setLocations(await locRes.json());
      } catch (err) {
        if (err.name !== "AbortError") console.error("Could not load data from server:", err);
      }
      clearTimeout(timeout);
    }
    loadData();

    return () => { controller.abort(); clearTimeout(timeout); };
  }, []);

  const hostOptions = useMemo(
    () => employees.map((e) => ({ value: String(e.employeeid), label: `${e.fullname} - ${e.department}` })),
    [employees]
  );

  const locationOptions = useMemo(
    () => locations.map((l) => ({ value: String(l.locationid), label: l.locationname })),
    [locations]
  );

  const categoryOptions = useMemo(
    () => categories.map((c) => ({ value: c, label: c })),
    []
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "numberOfVisitors") {
      const count = Math.max(1, Math.min(20, Number(value) || 1));
      setForm((prev) => {
        const visitors = [...prev.visitors];
        while (visitors.length < count) visitors.push({ ...emptyVisitor });
        visitors.length = count;
        return { ...prev, numberOfVisitors: count, visitors };
      });
      return;
    }

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
      numberOfVisitors: prev.numberOfVisitors + 1,
      visitors: [...prev.visitors, { ...emptyVisitor }],
    }));
  };

  const removeVisitor = (index) => {
    if (form.visitors.length <= 1) return;
    setForm((prev) => ({
      ...prev,
      numberOfVisitors: prev.numberOfVisitors - 1,
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
      numberOfVisitors: 1,
      visitors: [{ ...emptyVisitor }],
    });
    setErrors({});
    setSubmitState({ loading: false, success: false, error: "" });
    setMeetingId(null);
    setCheckInTime(null);
    setPhoto(null);
  };

  const uploadPhoto = async meetingId => {
    if(!photo) return null;
    try{
      const base64 = photo.split(",")[1];
      const byteArray = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      const fileName = `visitor_${meetingId}_${Date.now()}.jpg`;
      const {error} = await supabase.storage
        .from("visitor-photos")
        .upload(fileName, byteArray, {contentType: "image/jpeg"});
      if(error) throw error;
      const {data} = supabase.storage.from("visitor-photos").getPublicUrl(fileName);
      return data.publicUrl;
      } catch(err) {
        console.error("Photo upload failed:", err);
        return null;

    }
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
        idProofType: v.idProofType || null,
        idProofNumber: v.idProofNumber || null,
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

      if (photo) {
        await uploadPhoto(result.meetingId);
      }

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

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-brand-dark">Check-in Time</label>
                  <input type="text" value={new Date().toLocaleString()} readOnly className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-brand-grey" />
                  <p className="mt-1 text-xs text-brand-grey">Recorded on submission</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark">Check-out Time</label>
                  <input type="text" value="To be recorded by reception" readOnly className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-brand-grey" />
                  <p className="mt-1 text-xs text-brand-grey">Managed from admin dashboard</p>
                </div>
              </div>
            </div>

            {/* Visitors */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-grey">
                  Visitors ({form.visitors.length})
                </h2>
                <div className="flex items-center gap-3">
                  <div className="w-24">
                    <InputField label="Count" name="numberOfVisitors" type="number" value={form.numberOfVisitors} onChange={handleChange} />
                  </div>
                  <button
                    type="button"
                    onClick={addVisitor}
                    className="mt-6 rounded-lg bg-brand-blue px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
                  >
                    + Add
                  </button>
                </div>
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

              {/* Photo Capture */}
              <PhotoCapture onPhotoTaken={setPhoto} photo={photo} />

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

        <p className="mt-6 text-center text-xs text-gray-400">
          Mphatek Visitor Management System
        </p>
      </div>
    </div>
  );
}
