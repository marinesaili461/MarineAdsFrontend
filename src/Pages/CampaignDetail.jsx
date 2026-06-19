import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

const MOCK = (budget, duration) => {
  const days = Number(duration) || 7;
  const daily = Math.round(Number(budget) / days);
  return Array.from({ length: days }, (_, i) => ({
    day: `Day ${i + 1}`,
    impressions: Math.floor(Math.random() * 800 + 200),
    clicks: Math.floor(Math.random() * 40 + 5),
    spend: Math.floor(Math.random() * daily * 0.4 + daily * 0.6),
  }));
};

const Bar = ({ value, max, color }) => (
  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
    <div className="h-2 rounded-full transition-all" style={{ width: `${Math.round((value / max) * 100)}%`, background: color }}></div>
  </div>
);

const CampaignDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const campaigns = JSON.parse(localStorage.getItem(`campaigns_${user?._id}`) || "[]");
  const c = campaigns.find(x => x.id === id);

  const [tab, setTab] = useState("overview");

  if (!c) return (
    <div className="py-10 text-center" style={{ fontFamily: "Poppins,sans-serif" }}>
      <p className="text-gray-500">Campaign not found.</p>
      <button onClick={() => navigate("/campaigns")} className="text-cyan-400 text-sm mt-2">← Back</button>
    </div>
  );

  const data = MOCK(c.budget, c.duration);
  const totalImpressions = data.reduce((s, d) => s + d.impressions, 0);
  const totalClicks      = data.reduce((s, d) => s + d.clicks, 0);
  const totalSpend       = data.reduce((s, d) => s + d.spend, 0);
  const ctr              = ((totalClicks / totalImpressions) * 100).toFixed(2);
  const cpc              = (totalSpend / totalClicks).toFixed(1);
  const maxImpressions   = Math.max(...data.map(d => d.impressions));

  const TABS = ["overview","daily","targeting","creative"];

  return (
    <div className="py-1 space-y-5" style={{ fontFamily: "Poppins,sans-serif" }}>

      {/* HEADER */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/campaigns")} className="text-gray-500 hover:text-white transition">
          <i className="fas fa-arrow-left"></i>
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-extrabold text-white truncate">{c.title}</h2>
          <p className="text-gray-500 text-xs">{c.format} · {c.objective}</p>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-lg border shrink-0 ${c.status === "active" ? "text-green-400 bg-green-500/10 border-green-500/20" : "text-yellow-400 bg-yellow-500/10 border-yellow-500/20"}`}>
          {c.status}
        </span>
      </div>

      {/* TABS */}
      <div className="flex gap-1 rounded-2xl p-1 border border-white/10"
        style={{ background: "rgba(255,255,255,0.04)" }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition"
            style={{
              background: tab === t ? "linear-gradient(135deg,#06b6d4,#3b82f6)" : "transparent",
              color: tab === t ? "#fff" : "#6b7280",
            }}>
            {t}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Impressions", value: totalImpressions.toLocaleString(), icon: "fa-eye",           color: "#3b82f6" },
              { label: "Clicks",      value: totalClicks.toLocaleString(),      icon: "fa-mouse-pointer", color: "#8b5cf6" },
              { label: "CTR",         value: `${ctr}%`,                         icon: "fa-percent",       color: "#22c55e" },
              { label: "Avg CPC",     value: `KES ${cpc}`,                      icon: "fa-coins",         color: "#f59e0b" },
              { label: "Total Spend", value: `KES ${totalSpend.toLocaleString()}`,icon: "fa-wallet",      color: "#06b6d4" },
              { label: "Budget Left", value: `KES ${Math.max(0, Number(c.budget) - totalSpend).toLocaleString()}`, icon: "fa-piggy-bank", color: "#10b981" },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="rounded-2xl p-4 border border-white/10"
                style={{ background: "rgba(255,255,255,0.04)" }}>
                <i className={`fas ${icon} text-sm mb-2 block`} style={{ color }}></i>
                <p className="text-xl font-extrabold text-white">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* BUDGET PROGRESS */}
          <div className="rounded-2xl p-4 border border-white/10"
            style={{ background: "rgba(255,255,255,0.04)" }}>
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Budget used</span>
              <span className="text-white font-semibold">{Math.min(100, Math.round((totalSpend / Number(c.budget)) * 100))}%</span>
            </div>
            <div className="h-3 rounded-full bg-white/10 overflow-hidden">
              <div className="h-3 rounded-full transition-all"
                style={{ width: `${Math.min(100, Math.round((totalSpend / Number(c.budget)) * 100))}%`, background: "linear-gradient(90deg,#06b6d4,#3b82f6)" }}>
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-1.5">
              <span>KES 0</span><span>KES {Number(c.budget).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* DAILY BREAKDOWN */}
      {tab === "daily" && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">Impressions per day (mock data)</p>
          {data.map((d) => (
            <div key={d.day} className="rounded-2xl p-4 border border-white/10"
              style={{ background: "rgba(255,255,255,0.04)" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-400">{d.day}</span>
                <div className="flex gap-3 text-xs">
                  <span className="text-blue-400 font-bold">{d.impressions} imp</span>
                  <span className="text-purple-400 font-bold">{d.clicks} clicks</span>
                </div>
              </div>
              <Bar value={d.impressions} max={maxImpressions} color="linear-gradient(90deg,#06b6d4,#3b82f6)" />
            </div>
          ))}
        </div>
      )}

      {/* TARGETING */}
      {tab === "targeting" && (
        <div className="space-y-4">
          <div className="rounded-2xl p-4 border border-white/10"
            style={{ background: "rgba(255,255,255,0.04)" }}>
            <p className="text-xs font-semibold text-gray-400 mb-3">Target Segments</p>
            <div className="flex flex-wrap gap-2">
              {(c.targets || []).map(t => (
                <span key={t} className="px-3 py-1 rounded-full text-xs font-semibold text-cyan-400 border border-cyan-500/30"
                  style={{ background: "rgba(6,182,212,0.08)" }}>{t}</span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl p-4 border border-white/10 space-y-3"
            style={{ background: "rgba(255,255,255,0.04)" }}>
            <p className="text-xs font-semibold text-gray-400">Audience Reach Estimate</p>
            {[["Potential Reach","45K – 120K users"],["Avg Frequency","2.4× per user"],["Top Location","Nairobi (38%)"]].map(([l,v]) => (
              <div key={l} className="flex justify-between text-sm">
                <span className="text-gray-500">{l}</span>
                <span className="text-white font-semibold">{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATIVE */}
      {tab === "creative" && (
        <div className="space-y-4">
          <div className="rounded-2xl p-4 border border-cyan-500/20"
            style={{ background: "rgba(6,182,212,0.05)" }}>
            <p className="text-xs font-semibold text-cyan-400 mb-3">Ad Preview</p>
            <div className="rounded-xl p-3 border border-white/10"
              style={{ background: "rgba(255,255,255,0.04)" }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#06b6d4,#3b82f6)" }}>
                  <i className="fas fa-rectangle-ad text-white text-xs"></i>
                </div>
                <div>
                  <p className="text-white text-xs font-bold">{c.title}</p>
                  <p className="text-gray-600 text-[10px]">Sponsored · {c.format}</p>
                </div>
              </div>
              <p className="text-gray-400 text-xs">{c.adText}</p>
              {c.link && <p className="text-cyan-400 text-[10px] mt-2 truncate">{c.link}</p>}
            </div>
          </div>
          <div className="rounded-2xl p-4 border border-white/10 space-y-2"
            style={{ background: "rgba(255,255,255,0.04)" }}>
            {[["Format",c.format],["Objective",c.objective],["Duration",`${c.duration} days`],["Created",new Date(c.createdAt).toLocaleDateString()]].map(([l,v]) => (
              <div key={l} className="flex justify-between text-sm">
                <span className="text-gray-500">{l}</span>
                <span className="text-white font-semibold">{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignDetail;
