import React from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";

function QRPage() {
  const navigate = useNavigate();
  const baseUrl = process.env.REACT_APP_BASE_URL || "http://localhost:3000";
  const registrationUrl = `${baseUrl}/visitor-registration`;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-dark px-4">
      <img
        src="/mphatek-logo.png"
        alt="Mphatek"
        className="mb-8 h-14"
      />

      <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-lg">
        <h2 className="mb-2 text-xl font-semibold text-brand-dark">
          Visitor Registration
        </h2>
        <p className="mb-6 text-sm text-brand-grey">
          Scan the code below to register your visit.
        </p>

        <div className="mx-auto mb-4 inline-block rounded-xl border border-gray-200 bg-white p-4">
          <QRCode value={registrationUrl} size={180} />
        </div>

        <p className="mb-4 break-all text-xs text-brand-grey">
          {registrationUrl}
        </p>

        <button
          onClick={() => navigate("/visitor-registration")}
          className="mt-2 w-full rounded-lg bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
        >
          Open Registration Form
        </button>
      </div>

      <p className="mt-6 text-xs text-gray-400">
        Mphatek Visitor Management System
      </p>
    </div>
  );
}

export default QRPage;
