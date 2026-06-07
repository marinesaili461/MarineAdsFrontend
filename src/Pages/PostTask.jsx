import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import TopBar from "../Components/TopBar";
import BottomNav from "../Components/BottomNav";
import { WalletContext } from "../Context/WalletContext";

const CATEGORIES = [
  { value: "survey",      label: "Surveys",      icon: "fa-clipboard-list" },
  { value: "video",       label: "Watch Video",  icon: "fa-play-circle" },
  { value: "follow",      label: "Social Media", icon: "fa-users" },
  { value: "signup",      label: "Sign Ups",     icon: "fa-user-plus" },
  { value: "offer",       label: "Offers",       icon: "fa-tag" },
  { value: "app_install", label: "Install Apps", icon: "fa-download" },
  { value: "game",        label: "Games",        icon: "fa-gamepad" },
  { value: "other",       label: "Other",        icon: "fa-tasks" },
];

const INIT = {
  title: "", description: "", category: "",
  payPerTask: "", maxEarners: "", perUserLimit: "1",
  instructions: "", targetUrl: "", exampleImageUrls: "", expiresAt: "",
};

export default function PostTask() {
  const navigate = useNavigate();
  const { wallet } = useContext(WalletContext);
  const [form, setForm]     = useState(INIT);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]       = useState({ text: "", success: true });
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    API.get("/admin/settings").then((r) => setSettings(r.data)).catch(() => {});
  }, []);

  const flash = (t, s = true) => {
    setMsg({ text: t, success: s });
    setTimeout(() => setMsg({ text: "", success: true }), 5000);
  };

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // Live cost preview
  const payPerTask  = Number(form.payPerTask) || 0;
  const maxEarners  = Number(form.maxEarners) || 0;
  const feePct      = settings?.campaignFeePct ?? settings?.platformFeePct ?? 0;
  const payoutBudget    = parseFloat((payPerTask * maxEarners).toFixed(4));
  const feeAmount       = parseFloat((payoutBudget * feePct / 100).toFixed(4));
  const escrowRequired  = parseFloat((payoutBudget + feeAmount).toFixed(4));

  const catMin = settings?.categoryMinimums?.[form.category] ?? settings?.minPayGlobal ?? 0;

  const handleSubmit = async () => {
    if (!form.title.trim())       return flash("❌ Title is required.", false);
    if (!form.description.trim()) return flash("❌ Description is required.", false);
    if (!form.category)           return flash("❌ Select a category.", false);
    if (!form.payPerTask || payPerTask <= 0) return flash("❌ Pay per task is required.", false);
    if (!form.maxEarners || maxEarners < 1)  return flash("❌ Max earners is required.", false);
    if (catMin > 0 && payPerTask < catMin)
      return flash(`❌ Minimum pay for this category is $${Number(catMin).toFixed(3)}.`, false);

    setSaving(true);
    try {
      const payload = {
        ...form,
        payPerTask:   Number(form.payPerTask),
        maxEarners:   Number(form.maxEarners),
        perUserLimit: Number(form.perUserLimit) || 1,
        exampleImageUrls: form.exampleImageUrls
          ? form.exampleImageUrls.split(",").map((u) => u.trim()).filter(Boolean)
          : [],
        expiresAt: form.expiresAt || undefined,
      };
      await API.post("/campaign", payload);
      flash("✅ Campaign submitted! Awaiting admin approval.");
      setForm(INIT);
      setTimeout(() => navigate("/task-status"), 2000);
    } catch (e) {
      flash("❌ " + (e.response?.data?.message || "Failed to submit."), false);
    }
    setSaving(false);
  };

  return (
    <div className="bg-gray-100 min-h-screen pb-28">
      <TopBar />

      <div className="mx-3 mt-4 space-y-4">
        <div className="bg-white rounded-2xl shadow p-5">
          <h1 className="text-base font-extrabold text-gray-800 mb-1">📢 Post a Campaign</h1>
          <p className="text-xs text-gray-400">
            Submit your campaign for admin review. Once approved, you fund it and it goes live.
          </p>
        </div>

        {msg.text && (
          <div className={`p-3 rounded-xl text-sm font-semibold text-center ${msg.success ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
            {msg.text}
          </div>
        )}

        {/* Category */}
        <div className="bg-white rounded-2xl shadow p-4">
          <p className="text-sm font-bold text-gray-700 mb-3">Category</p>
          <div className="grid grid-cols-4 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => set("category", cat.value)}
                className={`flex flex-col items-center py-3 px-1 rounded-xl border-2 transition text-center ${
                  form.category === cat.value
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200"
                }`}
              >
                <i className={`fas ${cat.icon} text-xl ${form.category === cat.value ? "text-orange-500" : "text-gray-400"}`}></i>
                <span className={`text-[10px] font-bold mt-1 ${form.category === cat.value ? "text-orange-600" : "text-gray-400"}`}>
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
          {catMin > 0 && form.category && (
            <p className="text-xs text-orange-500 font-semibold mt-2 bg-orange-50 rounded-xl px-3 py-1.5">
              💡 Minimum pay for {form.category}: ${Number(catMin).toFixed(3)}
            </p>
          )}
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-2xl shadow p-4 space-y-3">
          <p className="text-sm font-bold text-gray-700">Campaign Details</p>
          {[
            { key: "title", label: "Title", placeholder: "e.g. Follow us on Instagram", type: "text" },
            { key: "targetUrl", label: "Link / URL (optional)", placeholder: "https://...", type: "url" },
          ].map(({ key, label, placeholder, type }) => (
            <div key={key}>
              <label className="text-xs font-semibold text-gray-500">{label}</label>
              <input
                type={type}
                value={form[key]}
                onChange={(e) => set(key, e.target.value)}
                placeholder={placeholder}
                className="w-full border-2 border-gray-200 focus:border-orange-400 rounded-xl px-3 py-2 text-sm mt-1 outline-none"
              />
            </div>
          ))}
          <div>
            <label className="text-xs font-semibold text-gray-500">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Describe what users need to do..."
              rows={3}
              className="w-full border-2 border-gray-200 focus:border-orange-400 rounded-xl px-3 py-2 text-sm mt-1 outline-none resize-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500">Instructions (optional)</label>
            <textarea
              value={form.instructions}
              onChange={(e) => set("instructions", e.target.value)}
              placeholder="Step by step instructions..."
              rows={3}
              className="w-full border-2 border-gray-200 focus:border-orange-400 rounded-xl px-3 py-2 text-sm mt-1 outline-none resize-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500">Example Image URLs (comma-separated, optional)</label>
            <input
              type="text"
              value={form.exampleImageUrls}
              onChange={(e) => set("exampleImageUrls", e.target.value)}
              placeholder="https://img1.com, https://img2.com"
              className="w-full border-2 border-gray-200 focus:border-orange-400 rounded-xl px-3 py-2 text-sm mt-1 outline-none"
            />
          </div>
        </div>

        {/* Budget */}
        <div className="bg-white rounded-2xl shadow p-4 space-y-3">
          <p className="text-sm font-bold text-gray-700">Budget & Limits</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500">Pay Per Task ($)</label>
              <input
                type="number"
                value={form.payPerTask}
                onChange={(e) => set("payPerTask", e.target.value)}
                placeholder="e.g. 0.05"
                step="0.001" min="0"
                className="w-full border-2 border-gray-200 focus:border-orange-400 rounded-xl px-3 py-2 text-sm mt-1 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">Max Earners</label>
              <input
                type="number"
                value={form.maxEarners}
                onChange={(e) => set("maxEarners", e.target.value)}
                placeholder="e.g. 100"
                min="1"
                className="w-full border-2 border-gray-200 focus:border-orange-400 rounded-xl px-3 py-2 text-sm mt-1 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">Per User Limit</label>
              <input
                type="number"
                value={form.perUserLimit}
                onChange={(e) => set("perUserLimit", e.target.value)}
                placeholder="1"
                min="1"
                className="w-full border-2 border-gray-200 focus:border-orange-400 rounded-xl px-3 py-2 text-sm mt-1 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">Expires At (optional)</label>
              <input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) => set("expiresAt", e.target.value)}
                className="w-full border-2 border-gray-200 focus:border-orange-400 rounded-xl px-3 py-2 text-sm mt-1 outline-none"
              />
            </div>
          </div>

          {/* Cost preview */}
          {payPerTask > 0 && maxEarners > 0 && (
            <div className="bg-orange-50 rounded-xl p-4 space-y-1.5 text-sm">
              <p className="font-bold text-orange-600 mb-2">💰 Cost Breakdown</p>
              {[
                ["Payout Budget", `$${payoutBudget.toFixed(4)}`],
                [`Platform Fee (${feePct}%)`, `$${feeAmount.toFixed(4)}`],
                ["Total Escrow Required", `$${escrowRequired.toFixed(4)}`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-gray-500 text-xs">{k}</span>
                  <span className={`font-bold text-xs ${k.includes("Total") ? "text-orange-600" : "text-gray-700"}`}>{v}</span>
                </div>
              ))}
              <div className="border-t border-orange-200 pt-2 flex justify-between">
                <span className="text-xs text-gray-500">Your Balance</span>
                <span className={`text-xs font-bold ${wallet?.balance >= escrowRequired ? "text-green-600" : "text-red-500"}`}>
                  ${Number(wallet?.balance || 0).toFixed(4)}
                  {wallet?.balance < escrowRequired && " ⚠️ Insufficient"}
                </span>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold py-3.5 rounded-2xl text-sm shadow-lg transition disabled:opacity-50"
        >
          {saving ? "Submitting..." : "Submit for Review"}
        </button>
      </div>

      <BottomNav />
    </div>
  );
      }
