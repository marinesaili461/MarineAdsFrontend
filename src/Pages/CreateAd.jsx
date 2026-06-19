import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

const FORMATS   = ["Banner Ad","Video Ad","Mobile Push","SMS Campaign","Email Blast","Native Ad","Search Ad","Social Ad"];
const OBJECTIVES = ["Brand Awareness","Website Traffic","Lead Generation","App Installs","Sales / Conversions","Engagement"];
const TARGETS   = ["All Kenya","Nairobi","Mombasa","Kisumu","Nakuru","18–24 yrs","25–34 yrs","35–45 yrs","Business Owners","Students"];

const Step = ({ n, label, active, done }) => (
  <div className="flex items-center gap-2">
    <div className={`w-7 h-7 rounded-full text-xs font-extrabold flex items-center justify-center transition ${done ? "bg-green-500 text-white" : active ? "text-white" : "text-gray-600 border border-white/10"}`}
      style={active ? { background: "linear-gradient(135deg,#06b6d4,#3b82f6)" } : {}}>
      {done ? <i className="fas fa-check text-[10px]"></i> : n}
    </div>
    <span className={`text-xs font-semibold ${active ? "text-white" : done ? "text-green-400" : "text-gray-600"}`}>{label}</span>
  </div>
);

const CreateAd = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: "", format: "", objective: "", targets: [],
    budget: "", duration: "7", adText: "", link: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const toggle = (key, val) => {
    const arr = form[key];
    setForm({ ...form, [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] });
  };

  const save = () => {
    const campaigns = JSON.parse(localStorage.getItem(`campaigns_${user?._id}`) || "[]");
    const newC = { ...form, id: Date.now().toString(), status: "active", createdAt: new Date().toISOString(),
      impressions: 0, clicks: 0, spend: 0 };
    localStorage.setItem(`campaigns_${user?._id}`, JSON.stringify([...campaigns, newC]));
    setSubmitted(true);
    setTimeout(() => navigate("/campaigns"), 2000);
  };

  if (submitted) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center" style={{ fontFamily: "Poppins,sans-serif" }}>
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
        style={{ background: "linear-gradient(135deg,#06b6d4,#3b82f6)" }}>
        <i className="fas fa-rocket text-white text-3xl"></i>
      </div>
      <h2 className="text-xl font-extrabold text-white mb-2">Campaign Launched! 🎉</h2>
      <p className="text-gray-400 text-sm">Redirecting to your campaigns…</p>
    </div>
  );

  return (
    <div className="py-1 space-y-5" style={{ fontFamily: "Poppins,sans-serif" }}>
      <div>
        <h2 className="text-xl font-extrabold text-white">Create Ad Campaign</h2>
        <p className="text-gray-500 text-xs mt-0.5">Fill in the steps below</p>
      </div>

      {/* PROGRESS */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        <Step n="1" label="Details"   active={step===1} done={step>1} />
        <div className="flex-1 h-px bg-white/10"></div>
        <Step n="2" label="Targeting" active={step===2} done={step>2} />
        <div className="flex-1 h-px bg-white/10"></div>
        <Step n="3" label="Creative"  active={step===3} done={step>3} />
      </div>

      {/* STEP 1 — DETAILS */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-400">Campaign Title</label>
            <input placeholder="e.g. Summer Sale Promotion"
              value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full mt-1 px-4 py-3 rounded-xl text-sm text-white outline-none transition border border-white/10 focus:border-cyan-500 placeholder-gray-600"
              style={{ background: "rgba(255,255,255,0.05)" }}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 mb-2 block">Ad Format</label>
            <div className="grid grid-cols-2 gap-2">
              {FORMATS.map((f) => (
                <button key={f} onClick={() => setForm({ ...form, format: f })}
                  className="px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition border"
                  style={{
                    background: form.format === f ? "linear-gradient(135deg,rgba(6,182,212,0.2),rgba(59,130,246,0.2))" : "rgba(255,255,255,0.04)",
                    borderColor: form.format === f ? "#06b6d4" : "rgba(255,255,255,0.1)",
                    color: form.format === f ? "#22d3ee" : "#9ca3af",
                  }}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 mb-2 block">Campaign Objective</label>
            <div className="grid grid-cols-2 gap-2">
              {OBJECTIVES.map((o) => (
                <button key={o} onClick={() => setForm({ ...form, objective: o })}
                  className="px-3 py-2.5 rounded-xl text-xs font-semibold transition border"
                  style={{
                    background: form.objective === o ? "linear-gradient(135deg,rgba(139,92,246,0.2),rgba(59,130,246,0.2))" : "rgba(255,255,255,0.04)",
                    borderColor: form.objective === o ? "#8b5cf6" : "rgba(255,255,255,0.1)",
                    color: form.objective === o ? "#c4b5fd" : "#9ca3af",
                  }}>
                  {o}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-400">Budget (KES)</label>
              <input type="number" placeholder="e.g. 1000"
                value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })}
                className="w-full mt-1 px-4 py-3 rounded-xl text-sm text-white outline-none transition border border-white/10 focus:border-cyan-500 placeholder-gray-600"
                style={{ background: "rgba(255,255,255,0.05)" }}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400">Duration (days)</label>
              <select value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })}
                className="w-full mt-1 px-4 py-3 rounded-xl text-sm text-white outline-none transition border border-white/10 focus:border-cyan-500"
                style={{ background: "#0d2144" }}>
                {[3,7,14,21,30].map(d => <option key={d} value={d}>{d} days</option>)}
              </select>
            </div>
          </div>

          <button onClick={() => setStep(2)} disabled={!form.title || !form.format || !form.objective || !form.budget}
            className="w-full py-3 rounded-xl text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-30"
            style={{ background: "linear-gradient(135deg,#06b6d4,#3b82f6)" }}>
            Next: Targeting →
          </button>
        </div>
      )}

      {/* STEP 2 — TARGETING */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-400 mb-2 block">Target Audience <span className="text-gray-600">(pick multiple)</span></label>
            <div className="flex flex-wrap gap-2">
              {TARGETS.map((t) => (
                <button key={t} onClick={() => toggle("targets", t)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold transition border"
                  style={{
                    background: form.targets.includes(t) ? "linear-gradient(135deg,#06b6d4,#3b82f6)" : "rgba(255,255,255,0.05)",
                    borderColor: form.targets.includes(t) ? "transparent" : "rgba(255,255,255,0.1)",
                    color: form.targets.includes(t) ? "#fff" : "#9ca3af",
                  }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* BUDGET SUMMARY */}
          <div className="rounded-2xl p-4 border border-white/10 space-y-2"
            style={{ background: "rgba(255,255,255,0.04)" }}>
            <p className="text-xs font-semibold text-gray-400 mb-2">Campaign Summary</p>
            {[["Format",form.format],["Objective",form.objective],["Budget",`KES ${Number(form.budget).toLocaleString()}`],["Duration",`${form.duration} days`],["Daily Budget",`KES ${(Number(form.budget)/Number(form.duration)).toFixed(0)}`]].map(([l,v]) => (
              <div key={l} className="flex justify-between text-sm">
                <span className="text-gray-500">{l}</span>
                <span className="text-white font-semibold">{v}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl text-sm font-bold text-gray-400 border border-white/10 hover:border-white/20 transition">
              ← Back
            </button>
            <button onClick={() => setStep(3)} disabled={form.targets.length === 0}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-30"
              style={{ background: "linear-gradient(135deg,#06b6d4,#3b82f6)" }}>
              Next: Creative →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 — CREATIVE */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-400">Ad Copy / Description</label>
            <textarea placeholder="Write your ad message here…" rows={4}
              value={form.adText} onChange={(e) => setForm({ ...form, adText: e.target.value })}
              className="w-full mt-1 px-4 py-3 rounded-xl text-sm text-white outline-none transition border border-white/10 focus:border-cyan-500 placeholder-gray-600 resize-none"
              style={{ background: "rgba(255,255,255,0.05)" }}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400">Destination URL (optional)</label>
            <input placeholder="https://yourwebsite.com"
              value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })}
              className="w-full mt-1 px-4 py-3 rounded-xl text-sm text-white outline-none transition border border-white/10 focus:border-cyan-500 placeholder-gray-600"
              style={{ background: "rgba(255,255,255,0.05)" }}
            />
          </div>

          {/* AD PREVIEW */}
          <div className="rounded-2xl p-4 border border-cyan-500/20"
            style={{ background: "rgba(6,182,212,0.05)" }}>
            <p className="text-xs font-semibold text-cyan-400 mb-3">Ad Preview</p>
            <div className="rounded-xl p-3 border border-white/10"
              style={{ background: "rgba(255,255,255,0.04)" }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#06b6d4,#3b82f6)" }}>
                  <i className="fas fa-rectangle-ad text-white text-xs"></i>
                </div>
                <div>
                  <p className="text-white text-xs font-bold">{form.title || "Your Campaign Title"}</p>
                  <p className="text-gray-600 text-[10px]">Sponsored · {form.format || "Ad Format"}</p>
                </div>
              </div>
              <p className="text-gray-400 text-xs">{form.adText || "Your ad copy will appear here…"}</p>
              {form.link && <p className="text-cyan-400 text-[10px] mt-2 truncate">{form.link}</p>}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl text-sm font-bold text-gray-400 border border-white/10 hover:border-white/20 transition">
              ← Back
            </button>
            <button onClick={save} disabled={!form.adText}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-30"
              style={{ background: "linear-gradient(135deg,#06b6d4,#3b82f6)" }}>
              <i className="fas fa-rocket mr-2"></i>Launch
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateAd;
