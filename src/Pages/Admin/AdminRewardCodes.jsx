import React, { useEffect, useState } from "react";
import { adminGetRewardCodes, adminCreateRewardCode, adminDeactivateCode } from "../../api/index";

const AdminRewardCodes = () => {
  const [codes, setCodes]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]       = useState({ text: "", success: true });
  const [form, setForm]     = useState({ code: "", amount: "", maxUses: "", expiresAt: "" });

  const flash = (t, s = true) => { setMsg({ text: t, success: s }); setTimeout(() => setMsg({ text: "", success: true }), 3000); };

  const fetchCodes = () => {
    adminGetRewardCodes()
      .then(setCodes)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCodes(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.amount) return flash("❌ Amount is required.", false);
    setSaving(true);
    try {
      await adminCreateRewardCode({
        code: form.code.trim().toUpperCase() || undefined,
        amount: Number(form.amount),
        maxUses: form.maxUses ? Number(form.maxUses) : undefined,
        expiresAt: form.expiresAt || undefined,
      });
      setForm({ code: "", amount: "", maxUses: "", expiresAt: "" });
      flash("✅ Reward code created!");
      fetchCodes();
    } catch (e) { flash("❌ " + (e.response?.data?.message || "Failed."), false); }
    setSaving(false);
  };

  const handleDeactivate = async (id) => {
    try { await adminDeactivateCode(id); flash("Code deactivated ✅"); fetchCodes(); }
    catch (e) { flash("❌ Failed.", false); }
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <h2 className="text-lg font-extrabold text-gray-800">Reward Codes</h2>

      {msg.text && (
        <div className={`p-3 rounded-xl text-sm font-semibold text-center ${msg.success ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
          {msg.text}
        </div>
      )}

      {/* Create */}
      <div className="bg-white rounded-xl shadow p-5">
        <h3 className="font-bold text-gray-700 mb-4">Create Reward Code</h3>
        <form onSubmit={handleCreate} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500">Code (optional)</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                placeholder="Auto-generated if empty"
                maxLength={20}
                className="w-full border-2 border-gray-200 focus:border-orange-400 rounded-xl px-3 py-2 text-sm mt-1 outline-none tracking-widest font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">Amount ($)</label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                placeholder="e.g. 0.50"
                step="0.001"
                required
                className="w-full border-2 border-gray-200 focus:border-orange-400 rounded-xl px-3 py-2 text-sm mt-1 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">Max Uses (optional)</label>
              <input
                type="number"
                value={form.maxUses}
                onChange={(e) => setForm((p) => ({ ...p, maxUses: e.target.value }))}
                placeholder="Unlimited if empty"
                className="w-full border-2 border-gray-200 focus:border-orange-400 rounded-xl px-3 py-2 text-sm mt-1 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">Expires At (optional)</label>
              <input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) => setForm((p) => ({ ...p, expiresAt: e.target.value }))}
                className="w-full border-2 border-gray-200 focus:border-orange-400 rounded-xl px-3 py-2 text-sm mt-1 outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-sm transition disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Code"}
          </button>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <p className="text-center text-orange-500 animate-pulse font-bold text-sm py-8">Loading...</p>
        ) : codes.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">No reward codes yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-orange-400 text-white">
                <tr>
                  {["Code", "Amount", "Uses", "Expires", "Status", "Action"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {codes.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-bold text-gray-800 tracking-widest text-xs">{c.code}</td>
                    <td className="px-4 py-3 text-green-600 font-bold">${Number(c.amount).toFixed(3)}</td>
                    <td className="px-4 py-3 text-gray-600">{c.usedBy?.length || 0} / {c.maxUses ?? "∞"}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "Never"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${c.isActive ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                        {c.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {c.isActive && (
                        <button
                          onClick={() => handleDeactivate(c._id)}
                          className="text-xs font-bold px-3 py-1.5 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition"
                        >
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRewardCodes;
