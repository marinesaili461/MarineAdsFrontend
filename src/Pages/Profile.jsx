import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import API from "../api/axios";

const Profile = () => {
  const { user, setUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tab, setTab]           = useState("info");
  const [pwForm, setPwForm]     = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwMsg, setPwMsg]       = useState({ text: "", ok: false });
  const [pwLoading, setPwLoading] = useState(false);
  const [showPw, setShowPw]     = useState({ c: false, n: false, cp: false });

  const handleLogout = () => { logout(); navigate("/login"); };

  const changePassword = async () => {
    if (pwForm.newPassword !== pwForm.confirmPassword) return setPwMsg({ text: "Passwords don't match.", ok: false });
    if (pwForm.newPassword.length < 6) return setPwMsg({ text: "Min 6 characters.", ok: false });
    setPwLoading(true); setPwMsg({ text: "", ok: false });
    try {
      await API.put("/auth/change-password", { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwMsg({ text: "Password updated!", ok: true });
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (e) {
      setPwMsg({ text: e.response?.data?.message || "Failed.", ok: false });
    }
    setPwLoading(false);
  };

  const PwField = ({ label, k, pk }) => (
    <div>
      <label className="text-xs font-semibold text-gray-400">{label}</label>
      <div className="relative mt-1">
        <input type={showPw[pk] ? "text" : "password"} placeholder="••••••••"
          value={pwForm[k]} onChange={(e) => setPwForm({ ...pwForm, [k]: e.target.value })}
          className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition border border-white/10 focus:border-cyan-500 pr-12 placeholder-gray-600"
          style={{ background: "rgba(255,255,255,0.05)" }}
        />
        <button type="button" onClick={() => setShowPw({ ...showPw, [pk]: !showPw[pk] })}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
          <i className={`fas ${showPw[pk] ? "fa-eye-slash" : "fa-eye"}`}></i>
        </button>
      </div>
    </div>
  );

  return (
    <div className="py-1 space-y-5" style={{ fontFamily: "Poppins,sans-serif" }}>

      {/* AVATAR AREA */}
      <div className="flex flex-col items-center py-4">
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-extrabold text-white mb-3"
          style={{ background: "linear-gradient(135deg,#06b6d4,#3b82f6)" }}>
          {user?.fullName?.[0]?.toUpperCase() || "U"}
        </div>
        <h2 className="text-lg font-extrabold text-white">{user?.fullName}</h2>
        <p className="text-gray-500 text-xs">{user?.phone}</p>
        <span className="mt-2 text-xs font-bold px-3 py-1 rounded-full border border-cyan-500/30 text-cyan-400"
          style={{ background: "rgba(6,182,212,0.08)" }}>
          {user?.role || "user"}
        </span>
      </div>

      {/* TABS */}
      <div className="flex gap-1 rounded-2xl p-1 border border-white/10"
        style={{ background: "rgba(255,255,255,0.04)" }}>
        {["info","security"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition"
            style={{
              background: tab === t ? "linear-gradient(135deg,#06b6d4,#3b82f6)" : "transparent",
              color: tab === t ? "#fff" : "#6b7280",
            }}>
            {t === "info" ? "Account Info" : "Security"}
          </button>
        ))}
      </div>

      {/* ACCOUNT INFO */}
      {tab === "info" && (
        <div className="space-y-3">
          <div className="rounded-2xl p-4 border border-white/10 space-y-4"
            style={{ background: "rgba(255,255,255,0.04)" }}>
            {[
              { label: "Full Name", value: user?.fullName, icon: "fa-user" },
              { label: "Phone",     value: user?.phone,    icon: "fa-phone" },
              { label: "Email",     value: user?.email,    icon: "fa-envelope" },
              { label: "User ID",   value: user?.uniqueId?.slice(0,16)+"…", icon: "fa-fingerprint" },
            ].map(({ label, value, icon }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-white/10"
                  style={{ background: "rgba(255,255,255,0.05)" }}>
                  <i className={`fas ${icon} text-gray-400 text-xs`}></i>
                </div>
                <div>
                  <p className="text-[10px] text-gray-600">{label}</p>
                  <p className="text-white text-sm font-semibold">{value || "—"}</p>
                </div>
              </div>
            ))}
          </div>

          <button onClick={handleLogout}
            className="w-full py-3 rounded-xl text-sm font-bold text-red-400 border border-red-500/30 transition hover:bg-red-500/10"
            style={{ background: "rgba(239,68,68,0.05)" }}>
            <i className="fas fa-sign-out-alt mr-2"></i>Logout
          </button>
        </div>
      )}

      {/* SECURITY */}
      {tab === "security" && (
        <div className="space-y-4">
          {pwMsg.text && (
            <div className={`rounded-xl p-3 text-sm border ${pwMsg.ok ? "text-green-400 bg-green-500/10 border-green-500/30" : "text-red-400 bg-red-500/10 border-red-500/30"}`}>
              {pwMsg.text}
            </div>
          )}
          <PwField label="Current Password"  k="currentPassword"  pk="c" />
          <PwField label="New Password"      k="newPassword"      pk="n" />
          <PwField label="Confirm Password"  k="confirmPassword"  pk="cp" />
          <button onClick={changePassword} disabled={pwLoading}
            className="w-full py-3 rounded-xl text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#06b6d4,#3b82f6)" }}>
            {pwLoading ? "Updating…" : "Update Password"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;
