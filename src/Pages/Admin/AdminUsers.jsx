import React, { useEffect, useState } from "react";
import API from "../../api/axios";

const AdminUsers = () => {
  const [users,   setUsers]   = useState([]);
  const [search,  setSearch]  = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/auth/users").then(r => setUsers(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4" style={{ fontFamily: "Poppins,sans-serif" }}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-white">Users</h2>
        <span className="text-xs text-gray-500">{users.length} registered</span>
      </div>

      <div className="relative">
        <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm"></i>
        <input placeholder="Search name, phone or email…" value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white outline-none transition border border-white/10 focus:border-cyan-500 placeholder-gray-600"
          style={{ background: "rgba(255,255,255,0.05)" }}
        />
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500 text-sm animate-pulse">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl p-8 text-center border border-white/10 text-gray-500 text-sm"
          style={{ background: "rgba(255,255,255,0.03)" }}>
          {users.length === 0 ? "No users yet" : "No match found"}
        </div>
      ) : (
        filtered.map((u) => (
          <div key={u._id} className="rounded-2xl p-4 border border-white/10"
            style={{ background: "rgba(255,255,255,0.04)" }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-white shrink-0"
                style={{ background: "linear-gradient(135deg,#06b6d4,#3b82f6)" }}>
                {u.fullName?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm truncate">{u.fullName}</p>
                <p className="text-gray-500 text-xs"><i className="fas fa-phone mr-1"></i>{u.phone}</p>
                <p className="text-gray-500 text-xs"><i className="fas fa-envelope mr-1"></i>{u.email}</p>
              </div>
              <div className="text-right shrink-0">
                <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${
                  u.role === "admin" || u.role === "superadmin"
                    ? "text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
                    : "text-gray-400 bg-gray-500/10 border-gray-500/20"}`}>
                  {u.role}
                </span>
                <p className="text-gray-600 text-xs mt-1">{new Date(u.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminUsers;
