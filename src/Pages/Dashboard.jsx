import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
      <i className={`fas ${icon} text-white text-sm`}></i>
    </div>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-extrabold text-white">{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const deposits = JSON.parse(localStorage.getItem("mp_deposits") || "[]")
    .filter((d) => d.userId === user?.id);
  const totalDeposited = deposits.reduce((s, d) => s + Number(d.amount), 0);

  return (
    <div className="space-y-5 py-2" style={{ fontFamily: "Poppins, sans-serif" }}>
      {/* WELCOME */}
      <div className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/20 rounded-3xl p-5">
        <p className="text-xs text-cyan-400 font-semibold mb-1">Good day 👋</p>
        <h2 className="text-xl font-extrabold text-white">{user?.name}</h2>
        <p className="text-gray-400 text-xs mt-1">{user?.phone} · {user?.email}</p>
        <div className="mt-4 bg-white/5 rounded-2xl p-4">
          <p className="text-xs text-gray-400">Wallet Balance</p>
          <p className="text-3xl font-extrabold text-cyan-400 mt-1">KES {totalDeposited.toLocaleString()}</p>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon="fa-rectangle-ad"  label="Active Ads"    value="3"   color="bg-blue-500" />
        <StatCard icon="fa-eye"           label="Total Views"   value="1.2K" color="bg-purple-500" />
        <StatCard icon="fa-mouse-pointer" label="Clicks"        value="84"  color="bg-green-500" />
        <StatCard icon="fa-store"         label="Panel Clients" value="2"   color="bg-orange-500" />
      </div>

      {/* QUICK ACTIONS */}
      <div>
        <p className="text-xs text-gray-400 font-semibold mb-3 uppercase tracking-wider">Quick Actions</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { to: "/ads",     icon: "fa-rectangle-ad", label: "Browse Ads",    color: "from-blue-600 to-blue-700" },
            { to: "/deposit", icon: "fa-wallet",        label: "Deposit",       color: "from-green-600 to-green-700" },
            { to: "/panel",   icon: "fa-store",         label: "My Panel",      color: "from-purple-600 to-purple-700" },
            { to: "/ads",     icon: "fa-plus",          label: "Post Ad",       color: "from-cyan-600 to-cyan-700" },
          ].map(({ to, icon, label, color }) => (
            <Link key={label} to={to}
              className={`bg-gradient-to-br ${color} rounded-2xl p-4 flex flex-col items-center gap-2 text-white font-semibold text-xs text-center hover:opacity-90 transition`}>
              <i className={`fas ${icon} text-xl`}></i>
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* RECENT DEPOSITS */}
      <div>
        <p className="text-xs text-gray-400 font-semibold mb-3 uppercase tracking-wider">Recent Deposits</p>
        {deposits.length === 0
          ? <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center text-gray-500 text-sm">No deposits yet. <Link to="/deposit" className="text-cyan-400">Make one →</Link></div>
          : deposits.slice(-3).reverse().map((d, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between mb-2">
              <div>
                <p className="text-white text-sm font-semibold">KES {Number(d.amount).toLocaleString()}</p>
                <p className="text-gray-500 text-xs">{d.mpesaPhone} · {new Date(d.date).toLocaleDateString()}</p>
              </div>
              <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-1 rounded-lg font-semibold">Pending</span>
            </div>
          ))
        }
      </div>
    </div>
  );
};

export default Dashboard;
