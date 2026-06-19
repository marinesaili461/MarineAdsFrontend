import React, { useState } from "react";

const SLOTS = [
  { id: 1, name: "Header Banner",  size: "728×90",  cpm: 120, placement: "Top of page",   status: "active" },
  { id: 2, name: "Sidebar Box",    size: "300×250",  cpm: 80,  placement: "Right sidebar",  status: "active" },
  { id: 3, name: "In-Content",     size: "468×60",   cpm: 95,  placement: "Between posts",  status: "inactive" },
  { id: 4, name: "Footer Banner",  size: "728×90",   cpm: 60,  placement: "Bottom of page", status: "inactive" },
];

const Publisher = () => {
  const [slots, setSlots]     = useState(SLOTS);
  const [copied, setCopied]   = useState(null);
  const [tab, setTab]         = useState("slots");
  const [siteUrl, setSiteUrl] = useState("");
  const [connected, setConnected] = useState(false);

  const toggleSlot = (id) => setSlots(slots.map(s => s.id === id ? { ...s, status: s.status === "active" ? "inactive" : "active" } : s));

  const copyCode = (id) => {
    navigator.clipboard.writeText(`<script src="https://cdn.marineads.co/serve.js?slot=${id}" async></script>`);
    setCopied(id); setTimeout(() => setCopied(null), 2000);
  };

  const activeSlots = slots.filter(s => s.status === "active");
  const estMonthly  = activeSlots.reduce((s, sl) => s + sl.cpm * 50, 0); // 50k imps mock

  return (
    <div className="py-1 space-y-5" style={{ fontFamily: "Poppins,sans-serif" }}>

      <div>
        <h2 className="text-xl font-extrabold text-white">Publisher Panel</h2>
        <p className="text-gray-500 text-xs mt-0.5">Display ads on your site and earn per impression</p>
      </div>

      {/* EARN SUMMARY */}
      <div className="rounded-3xl p-5 border border-purple-500/20"
        style={{ background: "linear-gradient(135deg,rgba(139,92,246,0.1),rgba(59,130,246,0.1))" }}>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-2xl font-extrabold text-white">{activeSlots.length}</p>
            <p className="text-xs text-gray-500">Active Slots</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold" style={{ color: "#22d3ee" }}>
              KES {estMonthly.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">Est. Monthly</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-purple-400">KES 0</p>
            <p className="text-xs text-gray-500">Earned</p>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-1 rounded-2xl p-1 border border-white/10"
        style={{ background: "rgba(255,255,255,0.04)" }}>
        {["slots","setup","how"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition"
            style={{
              background: tab === t ? "linear-gradient(135deg,#8b5cf6,#3b82f6)" : "transparent",
              color: tab === t ? "#fff" : "#6b7280",
            }}>
            {t === "how" ? "How to Earn" : t === "setup" ? "Setup Site" : "Ad Slots"}
          </button>
        ))}
      </div>

      {/* AD SLOTS */}
      {tab === "slots" && (
        <div className="space-y-3">
          {slots.map((s) => (
            <div key={s.id} className="rounded-2xl border border-white/10 overflow-hidden"
              style={{ background: "rgba(255,255,255,0.04)" }}>
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="text-white font-bold text-sm">{s.name}</p>
                  <p className="text-gray-500 text-xs">{s.size} · {s.placement}</p>
                  <p className="text-xs font-bold mt-1" style={{ color: "#22d3ee" }}>
                    KES {s.cpm}/1K impressions
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${s.status === "active" ? "text-green-400 bg-green-500/10 border-green-500/20" : "text-gray-500 bg-gray-500/10 border-gray-500/20"}`}>
                    {s.status}
                  </span>
                  <button onClick={() => toggleSlot(s.id)}
                    className="text-xs font-semibold text-gray-400 hover:text-white transition">
                    {s.status === "active" ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
              {s.status === "active" && (
                <div className="border-t border-white/10 px-4 py-2 flex items-center justify-between">
                  <code className="text-[10px] text-gray-600 truncate max-w-48">
                    &lt;script src="cdn.marineads.co/serve.js?slot={s.id}"&gt;
                  </code>
                  <button onClick={() => copyCode(s.id)}
                    className="text-xs font-semibold ml-3 shrink-0 transition"
                    style={{ color: copied === s.id ? "#22c55e" : "#22d3ee" }}>
                    {copied === s.id ? <><i className="fas fa-check mr-1"></i>Copied!</> : <><i className="fas fa-copy mr-1"></i>Copy</>}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* SETUP SITE */}
      {tab === "setup" && (
        <div className="space-y-4">
          <div className="rounded-2xl p-4 border border-white/10"
            style={{ background: "rgba(255,255,255,0.04)" }}>
            <p className="text-xs font-semibold text-gray-400 mb-3">Register Your Website / Platform</p>
            <input placeholder="https://yoursite.com" value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition border border-white/10 focus:border-purple-500 placeholder-gray-600"
              style={{ background: "rgba(255,255,255,0.05)" }}
            />
            <button onClick={() => siteUrl && setConnected(true)}
              className="w-full mt-3 py-3 rounded-xl text-sm font-bold text-white transition hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#8b5cf6,#3b82f6)" }}>
              {connected ? <><i className="fas fa-check mr-2"></i>Site Connected!</> : "Connect Site"}
            </button>
          </div>
          <div className="rounded-2xl p-4 border border-white/10 space-y-3"
            style={{ background: "rgba(255,255,255,0.04)" }}>
            <p className="text-xs font-semibold text-gray-400">Publisher Requirements</p>
            {[["Min monthly visits","1,000+"],["Content policy","No adult / harmful content"],["Payout threshold","KES 500"],["Payment method","M-Pesa weekly"]].map(([l,v]) => (
              <div key={l} className="flex justify-between text-xs">
                <span className="text-gray-500">{l}</span>
                <span className="text-white font-semibold">{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HOW TO EARN */}
      {tab === "how" && (
        <div className="space-y-3">
          {[
            { step:"01", icon:"fa-store",        title:"Register as Publisher",  desc:"Connect your site or platform above." },
            { step:"02", icon:"fa-code",          title:"Paste Ad Code",          desc:"Copy your slot's script tag and paste it into your site's HTML." },
            { step:"03", icon:"fa-eye",           title:"Ads Go Live",            desc:"MarineAds automatically fills your slots with relevant ads." },
            { step:"04", icon:"fa-coins",         title:"Earn Per Impression",    desc:"You earn KES for every 1,000 impressions (CPM). Clicks earn extra." },
            { step:"05", icon:"fa-money-bill-wave",title:"Weekly M-Pesa Payout", desc:"Earnings are paid every Monday directly to your M-Pesa." },
          ].map(({ step, icon, title, desc }) => (
            <div key={step} className="flex gap-4 rounded-2xl p-4 border border-white/10"
              style={{ background: "rgba(255,255,255,0.04)" }}>
              <div className="shrink-0">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-purple-500/20"
                  style={{ background: "rgba(139,92,246,0.1)" }}>
                  <i className={`fas ${icon} text-purple-400 text-sm`}></i>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-purple-400">{step}</p>
                <p className="text-white font-bold text-sm">{title}</p>
                <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Publisher;
