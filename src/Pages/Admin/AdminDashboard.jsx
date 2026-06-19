import React, { useEffect, useState } from "react";
import API from "../../api/axios";

const Stat = ({ icon, label, value, color }) => (
  <div className="rounded-2xl p-4 border border-white/10 flex items-center gap-3"
    style={{ background: "rgba(255,255,255,0.04)" }}>
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      <i className={`fas ${icon} text-white text-sm`}></i>
    </div>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xl font-extrabold text-white">{value}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [deposits, setDeposits] = useState([]);
  const [users,    setUsers]    = useState([]);

  useEffect(() => {
    API.get("/wallet/admin/deposits").then(r => setDeposits(r.data)).catch(() => {});
    API.get("/auth/users").then(r => setUsers(r.data)).catch(() => {});
  }, []);

  const pending   = deposits.filter(d => d.status === "pending").length;
  const totalKES  = deposits.filter(d => d.status === "completed").reduce((s, d) => s + d.amount, 0);

  return (
    <div className="space-y-5" style={{ fontFamily: "Poppins,sans-serif" }}>
      <h2 className="text-lg font-extrabold text-white">Overview</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat icon="fa-users"       label="Users"            value={users.length}              color="bg-blue-600" />
        <Stat icon="fa-wallet"      label="Total Deposits"   value={deposits.length}           color="bg-purple-600" />
        <Stat icon="fa-clock"       label="Pending"          value={pending}                   color="bg-yellow-600" />
        <Stat icon="fa-coins"       label="KES Approved"     value={totalKES.toLocaleString()} color="bg-green-600" />
      </div>

      <div>
        <h3 className="text-sm font-bold text-white mb-3">Recent Deposit Requests</h3>
        {deposits.length === 0 ? (
          <div className="rounded-2xl p-6 text-center border border-white/10 text-gray-500 text-sm"
            style={{ background: "rgba(255,255,255,0.03)" }}>
            No deposits yet
          </div>
        ) : (
          deposits.slice(0,5).map((d) => (
            <div key={d._id} className="flex items-center justify-between rounded-2xl p-4 border border-white/10 mb-2"
              style={{ background: "rgba(255,255,255,0.04)" }}>
              <div>
                <p className="text-white text-sm font-semibold">{d.user?.fullName}</p>
                <p className="text-gray-500 text-xs">{d.meta?.mpesaPhone} · {new Date(d.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="font-extrabold" style={{ color: "#22d3ee" }}>KES {Number(d.amount).toLocaleString()}</p>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${
                  d.status === "completed" ? "text-green-400 bg-green-500/10 border-green-500/20"
                  : d.status === "failed"  ? "text-red-400 bg-red-500/10 border-red-500/20"
                  : "text-yellow-400 bg-yellow-500/10 border-yellow-500/20"}`}>
                  {d.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
