import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

const STATUS_STYLE = {
  active:  "text-green-400 bg-green-500/10 border-green-500/20",
  paused:  "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  ended:   "text-gray-500 bg-gray-500/10 border-gray-500/20",
};

const MyCampaigns = () => {
  const { user } = useAuth();
  const key = `campaigns_${user?._id}`;
  const [campaigns, setCampaigns] = useState(() => JSON.parse(localStorage.getItem(key) || "[]"));
  const [filter, setFilter] = useState("all");

  const toggleStatus = (id) => {
    const updated = campaigns.map(c => c.id === id
      ? { ...c, status: c.status === "active" ? "paused" : "active" }
      : c);
    localStorage.setItem(key, JSON.stringify(updated));
    setCampaigns(updated);
  };

  const remove = (id) => {
    const updated = campaigns.filter(c => c.id !== id);
    localStorage.setItem(key, JSON.stringify(updated));
    setCampaigns(updated);
  };

  const filtered = filter === "all" ? campaigns : campaigns.filter(c => c.status === filter);

  return (
    <div className="py-1 space-y-5" style={{ fontFamily: "Poppins,sans-serif" }}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white">My Campaigns</h2>
          <p className="text-gray-500 text-xs mt-0.5">{campaigns.length} total</p>
        </div>
        <Link to="/create-ad"
          className="text-sm font-bold text-white px-4 py-2 rounded-xl transition hover:opacity-90"
          style={{ background: "linear-gradient(135deg,#06b6d4,#3b82f6)" }}>
          <i className="fas fa-plus mr-1"></i> New
        </Link>
      </div>

      {/* FILTERS */}
      <div className="flex gap-2">
        {["all","active","paused","ended"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition border"
            style={{
              background: filter === f ? "linear-gradient(135deg,#06b6d4,#3b82f6)" : "rgba(255,255,255,0.05)",
              borderColor: filter === f ? "transparent" : "rgba(255,255,255,0.1)",
              color: filter === f ? "#fff" : "#6b7280",
            }}>
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl p-8 text-center border border-white/10"
          style={{ background: "rgba(255,255,255,0.03)" }}>
          <i className="fas fa-rectangle-ad text-gray-700 text-3xl mb-3 block"></i>
          <p className="text-gray-500 text-sm mb-4">No {filter !== "all" ? filter : ""} campaigns.</p>
          <Link to="/create-ad" className="text-sm font-bold" style={{ color: "#22d3ee" }}>
            Create one →
          </Link>
        </div>
      ) : (
        [...filtered].reverse().map((c) => (
          <div key={c.id} className="rounded-2xl border border-white/10 overflow-hidden"
            style={{ background: "rgba(255,255,255,0.04)" }}>
            {/* HEADER */}
            <div className="flex items-start justify-between p-4">
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm truncate">{c.title}</p>
                <p className="text-gray-500 text-xs mt-0.5">{c.format} · {c.objective}</p>
                <p className="text-gray-600 text-xs">{new Date(c.createdAt).toLocaleDateString()} · {c.duration} days</p>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg border ml-3 shrink-0 ${STATUS_STYLE[c.status] || STATUS_STYLE.ended}`}>
                {c.status}
              </span>
            </div>

            {/* MINI STATS */}
            <div className="grid grid-cols-3 border-t border-white/10">
              {[["Impressions", c.impressions || 0], ["Clicks", c.clicks || 0], ["Budget", `KES ${Number(c.budget).toLocaleString()}`]].map(([l, v]) => (
                <div key={l} className="py-3 text-center border-r border-white/10 last:border-r-0">
                  <p className="text-xs font-extrabold text-white">{v}</p>
                  <p className="text-[10px] text-gray-600 mt-0.5">{l}</p>
                </div>
              ))}
            </div>

            {/* ACTIONS */}
            <div className="flex border-t border-white/10">
              <Link to={`/campaigns/${c.id}`}
                className="flex-1 py-2.5 text-xs font-semibold text-center text-cyan-400 hover:bg-cyan-500/5 transition border-r border-white/10">
                <i className="fas fa-chart-line mr-1"></i> Analytics
              </Link>
              <button onClick={() => toggleStatus(c.id)}
                className="flex-1 py-2.5 text-xs font-semibold text-yellow-400 hover:bg-yellow-500/5 transition border-r border-white/10">
                <i className={`fas ${c.status === "active" ? "fa-pause" : "fa-play"} mr-1`}></i>
                {c.status === "active" ? "Pause" : "Resume"}
              </button>
              <button onClick={() => remove(c.id)}
                className="flex-1 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/5 transition">
                <i className="fas fa-trash mr-1"></i> Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MyCampaigns;
