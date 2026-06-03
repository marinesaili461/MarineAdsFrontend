// src/Pages/VerifyEmail.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosApi from "../api/axiosApi";
import logo from "../Assets/logo.png";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const email = localStorage.getItem("pendingEmail");
  const [resending, setResending] = useState(false);
  const [msg, setMsg] = useState("");

  const handleResend = async () => {
    setResending(true);
    try {
      await axiosApi.post("/auth/resend-verification", { email });
      setMsg("✅ Verification email resent! Check your inbox.");
    } catch {
      setMsg("❌ Failed to resend. Try again.");
    }
    setResending(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-lg p-8 flex flex-col items-center text-center">
        <img src={logo} alt="MarineCash" className="w-16 h-16 rounded-full mb-4" />
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <i className="fas fa-envelope-open-text text-green-500 text-3xl"></i>
        </div>
        <h1 className="text-xl font-extrabold text-gray-800 mb-2">Check your email</h1>
        <p className="text-gray-500 text-sm mb-1">
          We sent a verification link to:
        </p>
        <p className="text-orange-500 font-bold text-sm mb-5">{email || "your email"}</p>
        <p className="text-gray-400 text-xs mb-6">
          Click the link in the email to activate your account. Check your spam folder if you don't see it.
        </p>

        {msg && (
          <p className="text-sm font-semibold text-green-600 mb-4">{msg}</p>
        )}

        <button
          onClick={handleResend} disabled={resending}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-sm transition mb-3"
        >
          {resending ? "Resending..." : "Resend Email"}
        </button>

        <button
          onClick={() => navigate("/login")}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold py-3 rounded-xl text-sm transition"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default VerifyEmail;
