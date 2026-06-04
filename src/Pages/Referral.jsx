import React, { useContext, useEffect } from "react";
import { ReferralContext } from "../Context/ReferralContext";
import { AuthContext } from "../Context/AuthContext";
import TopBar from "../Components/TopBar";
import BottomNav from "../Components/BottomNav";

const Referral = () => {
  const { user } = useContext(AuthContext);
  const { stats, loading, fetchStats } = useContext(ReferralContext);

  useEffect(() => { fetchStats(); }, []);

  const referralLink = `${window.location.origin}/register?ref=${user?.referralCode || ""}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    alert("Referral link copied!");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: "Join MarineCash", text: "Earn money doing simple tasks!", url: referralLink });
    } else handleCopy();
  };

  return (
    <div className="bg-gray-100 min-h-screen pb-24">
      <TopBar />

      <div className="bg-orange-400 px-4 pb-6 pt-3 text-white">
        <h1 className="text-xl font-extrabold">Referral Program</h1>
        <p className="text-sm text-white/80 mt-1">Invite friends and earn commission on every task they complete</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mx-3 -mt-4">
        {[
          { label: "Referrals",    value: stats?.totalMembers || 0,                                    icon: "fa-users",       color: "bg-purple-500" },
          { label: "Earned",       value: `$${Number(stats?.totalEarned || 0).toFixed(2)}`,            icon: "fa-dollar-sign", color: "bg-green-500" },
          { label: "Level",        value: stats?.level || 0,                                           icon: "fa-star",        color: "bg-orange-500" },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="bg-white rounded-xl shadow p-3 flex flex-col items-center text-center">
            <div className={`${color} rounded-full w-9 h-9 flex items-center justify-center mb-2`}>
              <i className={`fas ${icon} text-white text-sm`}></i>
            </div>
            <p className="font-extrabold text-gray-800 text-base">{value}</p>
            <p className="text-[10px] text-gray-400 font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Referral Link */}
      <div className="bg-white shadow rounded-xl mx-3 mt-4 p-4">
        <p className="font-semibold text-gray-700 mb-2">🔗 Your Referral Link</p>
        <div className="flex gap-2">
          <input
            readOnly value={referralLink}
            className="flex-1 border-2 border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-500 outline-none bg-gray-50"
          />
          <button
            onClick={handleCopy}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-2 rounded-xl text-xs transition"
          >
            <i className="fas fa-copy"></i>
          </button>
        </div>
        <button
          onClick={handleShare}
          className="w-full mt-3 bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2"
        >
          <i className="fas fa-share-alt"></i> Share Link
        </button>
      </div>

      {/* How it works — values from backend */}
      <div className="bg-white shadow rounded-xl mx-3 mt-4 p-4">
        <p className="font-semibold text-gray-700 mb-3">💡 How It Works</p>
        {[
          "Share your referral link with friends",
          "Friend registers using your link",
          `They complete ${stats?.tasksToActivate ?? "a few"} tasks to activate`,
          `You earn ${stats?.commissionPct ?? "—"}% of their task earnings`,
        ].map((text, i) => (
          <div key={i} className="flex items-center gap-3 mb-3 last:mb-0">
            <div className="bg-orange-500 text-white rounded-full w-7 h-7 flex items-center justify-center font-bold text-xs shrink-0">
              {i + 1}
            </div>
            <p className="text-sm text-gray-600">{text}</p>
          </div>
        ))}
      </div>

      {/* Badge Tiers — from backend */}
      <div className="bg-white shadow rounded-xl mx-3 mt-4 p-4">
        <p className="font-semibold text-gray-700 mb-3">🏆 Badge Tiers</p>
        {loading ? (
          <p className="text-sm text-center text-gray-400 animate-pulse">Loading...</p>
        ) : stats?.tiers?.length > 0 ? (
          <div className="space-y-2">
            {stats.tiers.map((tier) => {
              const reached = (stats?.totalMembers || 0) >= tier.minReferrals;
              return (
                <div key={tier.name} className={`flex items-center justify-between p-3 rounded-xl border-2 ${reached ? "border-green-400 bg-green-50" : "border-gray-100 bg-gray-50"}`}>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full shrink-0" style={{ backgroundColor: tier.color || "#ccc" }}></div>
                    <p className="text-sm font-semibold text-gray-700">{tier.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-400">{tier.minReferrals}+ referrals</p>
                    {reached && <i className="fas fa-check-circle text-green-500 text-sm"></i>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center">No badge tiers configured yet.</p>
        )}
      </div>

      {/* Referral List */}
      <div className="bg-white shadow rounded-xl mx-3 mt-4 p-4">
        <p className="font-semibold text-gray-700 mb-3">👥 Your Referrals</p>
        {loading ? (
          <p className="text-sm text-center text-gray-400 animate-pulse">Loading...</p>
        ) : stats?.referrals?.length > 0 ? (
          <div className="space-y-2">
            {stats.referrals.map((r, i) => (
              <div key={i} className="flex items-center justify-between border-b border-gray-50 pb-2 last:border-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                    <i className="fas fa-user text-orange-400 text-xs"></i>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{r.referee?.fullName || "User"}</p>
                    <p className="text-xs text-gray-400">{r.tasksCompletedByReferee} tasks completed</p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${r.status === "active" ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"}`}>
                  {r.status === "active" ? "Active" : "Pending"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-center text-gray-400 py-4">No referrals yet. Start sharing!</p>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Referral;
