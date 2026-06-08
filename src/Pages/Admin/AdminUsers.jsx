import React, { useEffect, useState, useCallback } from "react";
import API from "../../api/axios";

// ── Helpers ────────────────────────────────────────────────────
const fmt = (n) => Number(n || 0).toFixed(2);

const rolePill = (role) => {
  const map = {
    superadmin: "bg-purple-100 text-purple-700",
    admin:      "bg-blue-100 text-blue-700",
    moderator:  "bg-yellow-100 text-yellow-700",
    user:       "bg-gray-100 text-gray-600",
  };
  return map[role] || map.user;
};

const txColor = (type) => {
  const green = ["signup_bonus", "referral_bonus", "task_reward", "reward_code", "deposit"];
  const red   = ["withdrawal", "fee", "penalty"];
  if (green.some((t) => type?.toLowerCase().includes(t))) return "text-green-600";
  if (red.some((t) => type?.toLowerCase().includes(t)))   return "text-red-500";
  return "text-gray-700";
};

const txSign = (type) => {
  const neg = ["withdrawal", "fee", "penalty"];
  return neg.some((t) => type?.toLowerCase().includes(t)) ? "-" : "+";
};

// country name → ISO2 code (basic map for flags)
const COUNTRY_ISO = {
  Nigeria: "ng", Kenya: "ke", Ghana: "gh", "South Africa": "za",
  Tanzania: "tz", Uganda: "ug", Ethiopia: "et", Egypt: "eg",
  "United States": "us", "United Kingdom": "gb", Canada: "ca",
  India: "in", Pakistan: "pk", Bangladesh: "bd", Philippines: "ph",
  Indonesia: "id", Brazil: "br", Germany: "de", France: "fr",
  Unknown: null,
};

const Flag = ({ country, size = "w-5 h-3.5" }) => {
  const code = COUNTRY_ISO[country] || country?.toLowerCase().slice(0, 2);
  if (!code) return <span className="text-gray-400 text-xs">—</span>;
  return (
    <img
      src={`https://flagcdn.com/24x18/${code}.png`}
      alt={country}
      className={`${size} object-cover rounded-sm inline-block`}
      onError={(e) => { e.target.style.display = "none"; }}
    />
  );
};

// ── Confirm Modal ───────────────────────────────────────────────
const Confirm = ({ title, message, onConfirm, onCancel, loading, danger }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] px-4">
    <div className={`bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border-t-4 ${danger ? "border-red-500" : "border-orange-400"}`}>
      <h3 className={`text-lg font-bold mb-2 ${danger ? "text-red-600" : "text-gray-800"}`}>{title}</h3>
      <p className="text-sm text-gray-600 mb-5">{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onCancel} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-semibold">Cancel</button>
        <button onClick={onConfirm} disabled={loading}
          className={`px-5 py-2 text-white rounded-xl text-sm font-semibold disabled:opacity-60 ${danger ? "bg-red-600 hover:bg-red-700" : "bg-orange-500 hover:bg-orange-600"}`}>
          {loading ? "Please wait..." : "Confirm"}
        </button>
      </div>
    </div>
  </div>
);

// ── User Detail Modal ───────────────────────────────────────────
const UserDetailModal = ({ userId, badgeTiers, onClose, onRefreshList }) => {
  const [user, setUser]           = useState(null);
  const [transactions, setTx]     = useState([]);
  const [txPage, setTxPage]       = useState(1);
  const [txPages, setTxPages]     = useState(1);
  const [txTotal, setTxTotal]     = useState(0);
  const [txLoading, setTxLoading] = useState(false);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState("info"); // info | transactions
  const [confirm, setConfirm]     = useState(null);
  const [acting, setActing]       = useState(false);
  const [balanceEdit, setBalanceEdit] = useState("");
  const [editingBalance, setEditingBalance] = useState(false);
  const [selectedBadge, setSelectedBadge]   = useState("");
  const [showBadgePicker, setShowBadgePicker] = useState(false);
  const [newRole, setNewRole]     = useState("");

  const fetchUser = useCallback(async () => {
    try {
      const res = await API.get(`/admin/users/${userId}`);
      const u = res.data.user || res.data;
      setUser(u);
      setBalanceEdit(fmt(u.balance));
      setNewRole(u.role);
    } catch { } finally { setLoading(false); }
  }, [userId]);

  const fetchTx = useCallback(async (page = 1) => {
    setTxLoading(true);
    try {
      const res = await API.get(`/admin/users/${userId}/transactions?page=${page}&limit=10`);
      const data = Array.isArray(res.data) ? res.data : res.data.transactions || [];
      setTx(data);
      setTxTotal(res.data.total || data.length);
      setTxPages(res.data.pages || 1);
      setTxPage(res.data.page || page);
    } catch { } finally { setTxLoading(false); }
  }, [userId]);

  useEffect(() => { fetchUser(); }, [fetchUser]);
  useEffect(() => { if (tab === "transactions") fetchTx(1); }, [tab, fetchTx]);

  const action = (title, message, fn, danger = false) => {
    setConfirm({ title, message, danger, onConfirm: async () => {
      setActing(true);
      try { await fn(); fetchUser(); onRefreshList(); }
      finally { setActing(false); setConfirm(null); }
    }});
  };

  const handleBlock = () => action(
    user.isBlocked ? "Unblock User" : "Block User",
    user.isBlocked
      ? `Unblock ${user.fullName}? They will regain access.`
      : `Block ${user.fullName}? They won't be able to log in.`,
    () => API.post("/admin/block-user", { userId, action: user.isBlocked ? "unblock" : "block" }),
    !user.isBlocked
  );

  const handleDelete = () => action(
    "Delete User",
    `Permanently delete ${user.email}? This cannot be undone.`,
    async () => { await API.delete(`/admin/users/${userId}`); onClose(); onRefreshList(); },
    true
  );

  const handleRoleChange = () => action(
    "Change Role",
    `Change ${user.fullName}'s role to "${newRole}"?`,
    () => API.patch(`/admin/users/${userId}/role`, { role: newRole })
  );

  const handleBalanceSave = () => action(
    "Update Balance",
    `Set balance to $${fmt(balanceEdit)} for ${user.fullName}?`,
    () => API.put(`/admin/users/${userId}/balance`, { balance: Number(balanceEdit) })
  );

  const handleAssignBadge = () => action(
    "Assign Badge",
    `Assign "${selectedBadge}" badge to ${user.fullName}?`,
    async () => {
      const tier = badgeTiers.find((t) => t.name === selectedBadge);
      await API.post("/admin/assign-badge", {
        userId,
        badge: tier?.badgeImage || "",
        referralLevel: badgeTiers.indexOf(tier) + 1,
      });
      setShowBadgePicker(false);
    }
  );

  if (loading) return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-10 text-center">
        <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Loading user...</p>
      </div>
    </div>
  );

  if (!user) return null;

  const mismatch = user.countryMismatch;

  return (
    <>
      {confirm && <Confirm {...confirm} loading={acting} onCancel={() => setConfirm(null)} />}

      <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4">
        <div className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">

          {/* Modal Header */}
          <div className="bg-orange-400 px-5 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-extrabold text-lg">
                {user.fullName?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-white font-extrabold text-sm leading-tight">{user.fullName}</p>
                <p className="text-orange-100 text-xs">{user.email}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white text-xl font-bold">✕</button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100 shrink-0 bg-white px-4">
            {["info", "transactions"].map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-3 text-sm font-semibold capitalize transition border-b-2 -mb-px ${tab === t ? "border-orange-400 text-orange-500" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
                {t === "info" ? "User Info" : "Transactions"}
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1 p-5 space-y-5">

            {tab === "info" && (
              <>
                {/* Mismatch Warning */}
                {mismatch && (
                  <div className="bg-amber-50 border border-amber-300 rounded-xl px-4 py-3 flex items-start gap-3">
                    <span className="text-amber-500 text-lg mt-0.5">⚠️</span>
                    <div>
                      <p className="text-sm font-bold text-amber-700">Country Mismatch Detected</p>
                      <p className="text-xs text-amber-600 mt-0.5">
                        IP country (<strong>{user.country}</strong>) doesn't match phone country (<strong>{user.phoneCountry || "—"}</strong>). This user may be using a VPN or proxy.
                      </p>
                    </div>
                  </div>
                )}

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* IP Country */}
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase mb-1">Country (IP)</p>
                    <div className="flex items-center gap-2">
                      <Flag country={user.country} />
                      <span className="text-sm font-semibold text-gray-700">{user.country || "—"}</span>
                    </div>
                  </div>

                  {/* Phone Country */}
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase mb-1">Country (Phone)</p>
                    <div className="flex items-center gap-2">
                      <Flag country={user.phoneCountry} />
                      <span className={`text-sm font-semibold ${mismatch ? "text-amber-600" : "text-gray-700"}`}>
                        {user.phoneCountry || "—"}
                      </span>
                      {mismatch && <span className="text-[10px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full font-bold">Mismatch</span>}
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase mb-1">Phone</p>
                    <p className="text-sm font-semibold text-gray-700">{user.phone || "—"}</p>
                  </div>

                  {/* Gender */}
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase mb-1">Gender</p>
                    <p className="text-sm font-semibold text-gray-700 capitalize">
                      {user.gender === "prefer_not_to_say" ? "Prefer not to say" : user.gender || "—"}
                    </p>
                  </div>

                  {/* Balance */}
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase mb-1">Balance</p>
                    <p className="text-lg font-extrabold text-green-600">${fmt(user.balance)}</p>
                  </div>

                  {/* Referrals */}
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase mb-1">Referrals</p>
                    <p className="text-lg font-extrabold text-blue-600">{user.referrals || 0}</p>
                  </div>

                  {/* Role */}
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase mb-1">Role</p>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${rolePill(user.role)}`}>{user.role}</span>
                  </div>

                  {/* Status */}
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase mb-1">Status</p>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${user.isBlocked ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                      {user.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </div>

                  {/* Joined */}
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase mb-1">Joined</p>
                    <p className="text-sm font-semibold text-gray-700">{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>

                  {/* Referral Code */}
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase mb-1">Referral Code</p>
                    <p className="text-sm font-mono font-bold text-orange-500">{user.referralCode || "—"}</p>
                  </div>
                </div>

                {/* Balance Editor */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Adjust Balance</p>
                  <div className="flex gap-2">
                    <input
                      type="number" value={balanceEdit}
                      onChange={(e) => setBalanceEdit(e.target.value)}
                      readOnly={!editingBalance}
                      className={`flex-1 border-2 rounded-xl px-3 py-2 text-sm outline-none transition ${editingBalance ? "border-orange-400 bg-white" : "border-gray-200 bg-gray-100 text-gray-500 cursor-default"}`}
                    />
                    {!editingBalance
                      ? <button onClick={() => setEditingBalance(true)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-xl text-sm font-semibold">Edit</button>
                      : <button onClick={() => { setEditingBalance(false); handleBalanceSave(); }} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold">Save</button>
                    }
                  </div>
                </div>

                {/* Role Changer */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Change Role</p>
                  <div className="flex gap-2">
                    <select value={newRole} onChange={(e) => setNewRole(e.target.value)}
                      className="flex-1 border-2 border-gray-200 focus:border-orange-400 rounded-xl px-3 py-2 text-sm outline-none bg-white">
                      {["user", "moderator", "admin", "superadmin"].map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    <button onClick={handleRoleChange} disabled={newRole === user.role}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold disabled:opacity-40">
                      Apply
                    </button>
                  </div>
                </div>

                {/* Badge Picker */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-gray-500 uppercase">Badge</p>
                    <button onClick={() => setShowBadgePicker(!showBadgePicker)}
                      className="text-xs text-orange-500 font-semibold hover:underline">
                      {showBadgePicker ? "Cancel" : "Change Badge"}
                    </button>
                  </div>
                  {user.badge
                    ? <p className="text-sm font-semibold text-gray-700">Current: <span className="text-orange-500">{user.badge}</span></p>
                    : <p className="text-sm text-gray-400">No badge assigned</p>
                  }
                  {showBadgePicker && badgeTiers.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {badgeTiers.map((tier) => (
                        <label key={tier.name} className={`flex items-center gap-3 p-2.5 rounded-xl border-2 cursor-pointer transition ${selectedBadge === tier.name ? "border-orange-400 bg-orange-50" : "border-gray-100 bg-white"}`}>
                          <input type="radio" name="badge" value={tier.name} checked={selectedBadge === tier.name}
                            onChange={() => setSelectedBadge(tier.name)} className="accent-orange-500" />
                          <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: tier.color || "#ccc" }} />
                          <div>
                            <p className="text-sm font-semibold text-gray-700">{tier.name}</p>
                            <p className="text-[10px] text-gray-400">{tier.minReferrals}+ referrals</p>
                          </div>
                        </label>
                      ))}
                      <button onClick={handleAssignBadge} disabled={!selectedBadge}
                        className="w-full mt-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-xl text-sm transition disabled:opacity-40">
                        Assign Badge
                      </button>
                    </div>
                  )}
                </div>

                {/* Danger Actions */}
                <div className="flex gap-3 pt-1">
                  <button onClick={handleBlock}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition ${user.isBlocked ? "bg-green-500 hover:bg-green-600" : "bg-gray-500 hover:bg-gray-600"}`}>
                    {user.isBlocked ? "Unblock User" : "Block User"}
                  </button>
                  <button onClick={handleDelete}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition">
                    Delete User
                  </button>
                </div>
              </>
            )}

            {tab === "transactions" && (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-gray-400 uppercase">Transaction History</p>
                  <span className="text-xs text-gray-400">{txTotal} total</span>
                </div>

                {txLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="w-7 h-7 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 text-sm">No transactions yet.</div>
                ) : (
                  <>
                    <div className="space-y-2">
                      {transactions.map((t, i) => (
                        <div key={i} className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-700 capitalize">
                              {t.type?.replace(/_/g, " ")}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              {new Date(t.createdAt || t.date).toLocaleString()}
                            </p>
                            {t.note && <p className="text-[10px] text-gray-400 mt-0.5 italic">{t.note}</p>}
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-extrabold ${txColor(t.type)}`}>
                              {txSign(t.type)}${fmt(Math.abs(t.amount))}
                            </p>
                            <p className={`text-[10px] mt-0.5 font-semibold ${t.status === "completed" ? "text-green-500" : "text-yellow-500"}`}>
                              {t.status}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {txPages > 1 && (
                      <div className="flex justify-between items-center pt-2">
                        <button disabled={txPage === 1} onClick={() => fetchTx(txPage - 1)}
                          className="px-4 py-2 bg-gray-100 rounded-xl text-sm font-semibold disabled:opacity-40">← Prev</button>
                        <span className="text-sm text-gray-500">Page {txPage} / {txPages}</span>
                        <button disabled={txPage === txPages} onClick={() => fetchTx(txPage + 1)}
                          className="px-4 py-2 bg-gray-100 rounded-xl text-sm font-semibold disabled:opacity-40">Next →</button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// ── Main AdminUsers Page ────────────────────────────────────────
const AdminUsers = () => {
  const [users, setUsers]         = useState([]);
  const [total, setTotal]         = useState(0);
  const [search, setSearch]       = useState("");
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(true);
  const [badgeTiers, setBadgeTiers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filterMismatch, setFilterMismatch] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/users", {
        params: { search, page, limit: 15, ...(filterMismatch ? { countryMismatch: true } : {}) },
      });
      setUsers(res.data.users || []);
      setTotal(res.data.total || 0);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [search, page, filterMismatch]);

  useEffect(() => {
    API.get("/admin/settings")
      .then((res) => setBadgeTiers(res.data.badgeTiers || []))
      .catch(console.error);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  return (
    <div className="space-y-4">
      {selectedUser && (
        <UserDetailModal
          userId={selectedUser}
          badgeTiers={badgeTiers}
          onClose={() => setSelectedUser(null)}
          onRefreshList={fetchUsers}
        />
      )}

      <h2 className="text-lg font-extrabold text-gray-800">User Management</h2>

      {/* Search + Filters */}
      <div className="bg-white rounded-xl shadow p-3 flex flex-wrap gap-2 items-center">
        <input
          type="text" value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name or email..."
          className="flex-1 min-w-[180px] border-2 border-gray-200 focus:border-orange-400 rounded-xl px-3 py-2 text-sm outline-none"
        />
        <button
          onClick={() => { setFilterMismatch(!filterMismatch); setPage(1); }}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition border-2 ${filterMismatch ? "border-amber-400 bg-amber-50 text-amber-600" : "border-gray-200 text-gray-500 hover:border-amber-300"}`}>
          ⚠️ Mismatch {filterMismatch ? "ON" : "OFF"}
        </button>
        <div className="text-xs text-gray-400 font-semibold px-2">{total} users</div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <p className="text-center text-orange-500 font-bold animate-pulse py-10">Loading...</p>
        ) : users.length === 0 ? (
          <p className="text-center text-gray-400 py-10 text-sm">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-orange-400 text-white">
                <tr>
                  {["User", "Country", "Phone Country", "Gender", "Role", "Status", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u._id} className={`hover:bg-gray-50 transition ${u.countryMismatch ? "bg-amber-50/40" : ""}`}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-800 text-xs">{u.fullName}</p>
                      <p className="text-[10px] text-gray-400">{u.email}</p>
                      <p className="text-[10px] text-orange-400 font-mono">{u.referralCode}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Flag country={u.country} />
                        <span className="text-xs text-gray-600">{u.country || "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Flag country={u.phoneCountry} />
                        <span className={`text-xs ${u.countryMismatch ? "text-amber-600 font-semibold" : "text-gray-600"}`}>
                          {u.phoneCountry || "—"}
                        </span>
                        {u.countryMismatch && <span className="text-[9px] bg-amber-100 text-amber-600 px-1 py-0.5 rounded-full font-bold">!</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 capitalize">
                      {u.gender === "prefer_not_to_say" ? "—" : u.gender || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${rolePill(u.role)}`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${u.isBlocked ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                        {u.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelectedUser(u._id)}
                        className="text-xs font-bold px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white transition">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2">
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
          className="px-4 py-2 rounded-xl bg-white shadow text-sm font-semibold disabled:opacity-40">← Prev</button>
        <span className="px-4 py-2 text-sm font-semibold text-gray-600">Page {page}</span>
        <button onClick={() => setPage((p) => p + 1)} disabled={users.length < 15}
          className="px-4 py-2 rounded-xl bg-white shadow text-sm font-semibold disabled:opacity-40">Next →</button>
      </div>
    </div>
  );
};

export default AdminUsers;
