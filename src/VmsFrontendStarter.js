import React, { useMemo, useState} from "react";
 
const categories = ["Client", "Vendor", "Interview", "Delivery", "Internal Guest"];

const hosts = [

  { id: 101, name: "John Peterson", department: "Finance" },

  { id: 102, name: "Sarah Khan", department: "IT" },

  { id: 103, name: "David Mokoena", department: "Operations" },

];

const locations = [

  { id: 1, name: "Board Room" },

  { id: 2, name: "Conference Room A" },

  { id: 3, name: "Conference Room B" },

  { id: 4, name: "Meeting Room 1" },

];
 
const emptyVisitor = {

  fullName: "",

  contactNum: "",

  email: "",

  organizationName: "",

  vehicleNum: "",

};
 
function InputField({ label, name, value, onChange, type = "text", required = false, placeholder = "" }) {

  return (
<div className="space-y-1">
<label className="block text-sm font-medium text-slate-700">

        {label} {required && <span className="text-red-500">*</span>}
</label>
<input

        type={type}

        name={name}

        value={value}

        onChange={onChange}

        placeholder={placeholder}

        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"

      />
</div>

  );

}
 
function SelectField({ label, name, value, onChange, options, required = false, placeholder = "Select" }) {

  return (
<div className="space-y-1">
<label className="block text-sm font-medium text-slate-700">

        {label} {required && <span className="text-red-500">*</span>}
</label>
<select

        name={name}

        value={value}

        onChange={onChange}

        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
>
<option value="">{placeholder}</option>

        {options.map((option) => (
<option key={option.value} value={option.value}>

            {option.label}
</option>

        ))}
</select>
</div>

  );

}
 
function VisitorCard({ index, visitor, onChange, onRemove, canRemove }) {

  return (
<div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
<div className="mb-4 flex items-center justify-between">
<h3>Visitor {index + 1}</h3>

        {canRemove && (
<button

            type="button"

            onClick={() => onRemove(index)}

            className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
>

            Remove
</button>

        )}
</div>
 
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
<InputField

          label="Full Name"

          name="fullName"

          value={visitor.fullName}

          onChange={(e) => onChange(index, e)}

          required

          placeholder="Enter full name"

        />
<InputField

          label="Contact Number"

          name="contactNum"

          value={visitor.contactNum}

          onChange={(e) => onChange(index, e)}

          required

          placeholder="Enter contact number"

        />
<InputField

          label="Email ID"

          name="email"

          type="email"

          value={visitor.email}

          onChange={(e) => onChange(index, e)}

          required

          placeholder="Enter email address"

        />
<InputField

          label="Organization Name"

          name="organizationName"

          value={visitor.organizationName}

          onChange={(e) => onChange(index, e)}

          required

          placeholder="Enter organization"

        />
<div className="md:col-span-2">
<InputField

            label="Vehicle Number"

            name="vehicleNum"

            value={visitor.vehicleNum}

            onChange={(e) => onChange(index, e)}

            placeholder="Optional"

          />
</div>
</div>
</div>

  );

}
 
export default function VmsFrontendStarter() {

  const [form, setForm] = useState({

    visitorCategory: "",

    purpose: "",

    hostEmployeeId: "",

    locationId: "",
    
    checkInTime: "",

    checkOutTime: "",

    numberOfVisitors: 1,

    visitors: [{ ...emptyVisitor }],

  });
 
  const [errors, setErrors] = useState({});

  const [submitState, setSubmitState] = useState({ loading: false, success: "", error: "" });
 
  const hostOptions = useMemo(

    () => hosts.map((host) => ({ value: String(host.id), label: `${host.name} - ${host.department}` })),

    []

  );
 
  const locationOptions = useMemo(

    () => locations.map((location) => ({ value: String(location.id), label: location.name })),

    []

  );
 
  const categoryOptions = useMemo(

    () => categories.map((category) => ({ value: category, label: category })),

    []

  ); 

 
 
  const handleTopLevelChange = (e) => {

    const { name, value } = e.target;
 
    if (name === "numberOfVisitors") {

      const count = Math.max(1, Number(value) || 1);

      setForm((prev) => {

        const currentVisitors = [...prev.visitors];
        while (currentVisitors.length < count) currentVisitors.push({ ...emptyVisitor });
        currentVisitors.length = count;
        return {

          ...prev,

          numberOfVisitors: count,

          visitors: currentVisitors,

        };

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
      
      visitors: [...prev.visitors, { ...emptyVisitor }],

    }));

  };
 
  const removeVisitor = (index) => {

    setForm((prev) => ({
      ...prev,

     visitors : prev.visitors.filter((_, i) => i !== index),
    }));

  };
 
  const validate = () => {

    const newErrors = {};
 
    if (!form.visitorCategory) newErrors.visitorCategory = "Visitor category is required";

    if (!form.purpose.trim()) newErrors.purpose = "Purpose is required";

    if (!form.hostEmployeeId) newErrors.hostEmployeeId = "Host employee is required";

    if (!form.locationId) newErrors.locationId = "Meeting location is required";
 
    form.visitors.forEach((visitor, index) => {

      if (!visitor.fullName.trim()) newErrors[`fullName_${index}`] = "Full name is required";

      if (!visitor.contactNum.trim()) newErrors[`contactNumber_${index}`] = "Contact number is required";

      if (!visitor.email.trim()) newErrors[`email_${index}`] = "Email is required";

      if (!visitor.organizationName.trim()) newErrors[`organizationName_${index}`] = "Organization is required";

    });
 
    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;

  };
 
  const buildPayload = () => ({

    visitorCategory: form.visitorCategory,

    purpose: form.purpose,

    hostEmployeeId: Number(form.hostEmployeeId),

    locationId: Number(form.locationId),

    checkInTime: form.checkInTime ||  null,

    checkOutTime: form.checkOutTime || null,


     visitors: form.visitors.map((visitor) => ({

      fullName: visitor.fullName,

      contactNum: visitor.contactNum,

      email: visitor.email,

      organizationName: visitor.organizationName,

      vehicleNum: visitor.vehicleNum || null,

    })),

  });
 
  const handleSubmit = async (e) => {

    e.preventDefault();

    setSubmitState({ loading: false, success: "", error: "" });
 
    if (!validate()) {

      setSubmitState({ loading: false, success: "", error: "Please fill all required fields." });

      return;

    }
 
    const payload = buildPayload();
 
    try {

      setSubmitState({ loading: true, success: "", error: "" });
 
      const response = await fetch("http://192.168.1.142:5000/api/visitors", {

        method: "POST",

        headers: {

          "Content-Type": "application/json",

        },

        body: JSON.stringify(payload),

      });
 
      if (!response.ok) {

        throw new Error("Failed to submit visitor registration.");

      }
 
      const result = await response.json();
 
      setSubmitState({

        loading: false,

        success: `Registration completed successfully. Meeting ID: ${result.meetingId}`,

        error: "",

      });
 
      setForm({

        visitorCategory: "",

        purpose: "",

        hostEmployeeId: "",

        locationId: "",
        
        checkInTime: "",

        checkOutTime: "",

        numberOfVisitors: 1,

        visitors: [{ ...emptyVisitor }],

      });

      setErrors({});

    } catch (error) {

      setSubmitState({

        loading: false,

        success: "",

        error: error.message || "Something went wrong.",

      });

    }

  };
 
  return (
<div className="min-h-screen bg-slate-100 px-4 py-10">
<div className="mx-auto max-w-5xl">
<div className="mb-8 rounded-3xl bg-white p-8 shadow-lg">
<div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
<div>
<p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Visitor Management System</p>
<h1 className="mt-2 text-3xl font-bold text-slate-900">Visitor Registration</h1>
<p className="mt-2 text-sm text-slate-600">

                Scan QR and fill the form to register your visit. Multiple visitors can be added under one meeting.
</p>
</div>
<div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-5 text-center">
<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">QR Placeholder</p>
<div className="mt-2 h-24 w-24 rounded-xl border border-slate-300 bg-white" />
</div>
</div>
 
          <form onSubmit={handleSubmit} className="space-y-8">
<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
<div>
<SelectField

                  label="Visitor Category"

                  name="visitorCategory"

                  value={form.visitorCategory}

                  onChange={handleTopLevelChange}

                  options={categoryOptions}

                  required

                  placeholder="Select category"

                />

                {errors.visitorCategory && <p className="mt-1 text-xs text-red-600">{errors.visitorCategory}</p>}
</div>
 
              <div>
<InputField

                  label="Purpose of Visit"

                  name="purpose"

                  value={form.purpose}

                  onChange={handleTopLevelChange}

                  required

                  placeholder="Enter purpose"

                />

                {errors.purpose && <p className="mt-1 text-xs text-red-600">{errors.purpose}</p>}
</div>
 
              <div>
<SelectField

                  label="Person to Meet"

                  name="hostEmployeeId"

                  value={form.hostEmployeeId}

                  onChange={handleTopLevelChange}

                  options={hostOptions}

                  required

                  placeholder="Select employee"

                />

                {errors.hostEmployeeId && <p className="mt-1 text-xs text-red-600">{errors.hostEmployeeId}</p>}
</div>
 
              <div>
<SelectField

                  label="Meeting Location"

                  name="locationId"

                  value={form.locationId}

                  onChange={handleTopLevelChange}

                  options={locationOptions}

                  required

                  placeholder="Select location"

                />

                {errors.locationId && <p className="mt-1 text-xs text-red-600">{errors.locationId}</p>}
</div>
</div>
 
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
<div>
<h2 className="text-lg font-semibold text-slate-800">Visitors</h2>
<p className="text-sm text-slate-600">Add one or more visitors for the same meeting ID.</p>
</div>
<div className="flex items-center gap-3">
<div className="w-40">
<InputField

                      label="Number of Visitors"

                      name="numberOfVisitors"

                      type="number"

                      value={form.numberOfVisitors}

                      onChange={handleTopLevelChange}

                    />
</div>
<button

                    type="button"

                    onClick={addVisitor}

                    className="mt-6 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
>

                    + Add Visitor
</button>
</div>
</div>
</div>
 
            <div className="space-y-4">

              {form.visitors.map((visitor, index) => (
<div key={index}>
<VisitorCard

                    index={index}

                    visitor={visitor}

                    onChange={handleVisitorChange}

                    onRemove={removeVisitor}

                    canRemove={form.visitors.length > 1}

                  />
<div className="mt-2 grid grid-cols-1 gap-1 md:grid-cols-2">

                    {errors[`fullName_${index}`] && <p className="text-xs text-red-600">Visitor {index + 1}: {errors[`fullName_${index}`]}</p>}

                    {errors[`contactNum_${index}`] && <p className="text-xs text-red-600">Visitor {index + 1}: {errors[`contactNum_${index}`]}</p>}

                    {errors[`email_${index}`] && <p className="text-xs text-red-600">Visitor {index + 1}: {errors[`email_${index}`]}</p>}

                    {errors[`organizationName_${index}`] && <p className="text-xs text-red-600">Visitor {index + 1}: {errors[`organizationName_${index}`]}</p>}
</div>
</div>

              ))}
</div>
 
            {(submitState.success || submitState.error) && (
<div

                className={`rounded-2xl px-4 py-3 text-sm font-medium ${

                  submitState.success

                    ? "border border-emerald-200 bg-emerald-50 text-emerald-700"

                    : "border border-red-200 bg-red-50 text-red-700"

                }`}
>

                {submitState.success || submitState.error}
</div>

            )}
 
            <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 md:flex-row md:justify-end">
<button

                type="button"

                onClick={() => {

                  setForm({

                    visitorCategory: "",

                    purpose: "",

                    hostEmployeeId: "",

                    locationId: "",

                    checkInTime: "",

                    checkOutTime: "",

                    numberOfVisitors: 1,

                    visitors: [{ ...emptyVisitor }],

                  });

                  setErrors({});

                  setSubmitState({ loading: false, success: "", error: "" });

                }}

                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
>

                Reset
</button>
<button

                type="submit"

                disabled={submitState.loading}

                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
>

                {submitState.loading ? "Submitting..." : "Register Visitor"}
</button>
</div>
</form>
</div>
</div>
</div>

  );

}

 
 