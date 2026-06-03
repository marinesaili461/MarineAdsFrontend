// src/Pages/Home.jsx
import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import { WalletContext } from "../Context/WalletContext";
import { RewardCodeContext } from "../Context/RewardCodeContext";
import TopBar from "../Components/TopBar";
import BottomNav from "../Components/BottomNav";

const menuItems = [
  { icon: "fa-coins",          color: "text-green-500",   label: "Earn",          to: "/earn" },
  { icon: "fa-wallet",         color: "text-blue-500",    label: "Wallet",        to: "/wallet" },
  { icon: "fa-users",          color: "text-purple-500",  label: "Referrals",     to: "/referral" },
  { icon: "fa-user",           color: "text-orange-500",  label: "Profile",       to: "/profile" },
  { icon: "fa-whatsapp fab",   color: "text-green-500",   label: "Join Group",    to: "https://chat.whatsapp.com/EUQiHGRx8IqEFWZd9NoUML", external: true },
  { icon: "fa-comments",       color: "text-pink-500",    label: "Chatroom",      to: "/chat" },
  { icon: "fa-circle-question",color: "text-indigo-500",  label: "FAQ",           to: "/faq" },
  { icon: "fa-headset",        color: "text-red-500",     label: "Support",       to: "/support" },
  { icon: "fa-plus-circle",    color: "text-yellow-500",  label: "Post Task",     to: "/post-task" },
  { icon: "fa-bell",           color: "text-teal-500",    label: "Notifications", to: "/notifications" },
  { icon: "fa-crown",          color: "text-amber-500",   label: "Top Earners",   to: "/top-earners" },
];

export default function Home() {
  const { user } = useContext(AuthContext);
  const { wallet } = useContext(WalletContext);
  const { redeemCode } = useContext(RewardCodeContext);
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");
  const [claiming, setClaiming] = useState(false);
  const navigate = useNavigate();

  const handleRedeem = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    try {
      const res = await redeemCode(code.trim().toUpperCase());
      setMsg(`✅ Redeemed! +$${res.amount?.toFixed(3)}`);
      setCode("");
    } catch (err) {
      setMsg(err.response?.data?.message || "❌ Invalid code");
    }
    setTimeout(() => setMsg(""), 4000);
  };

  const handleCheckIn = async () => {
    setClaiming(true);
    try {
      // TODO: wire to backend daily check-in endpoint
      setMsg("✅ Daily reward claimed!");
    } catch {
      setMsg("Already claimed today.");
    }
    setClaiming(false);
    setTimeout(() => setMsg(""), 3000);
  };

  return (
    <div className="bg-gray-100 min-h-screen pb-24">
      <TopBar />

      {/* Daily Check-in */}
      <section className="flex justify-between items-center px-3 py-4 shadow rounded-xl mt-4 mx-2 bg-white">
        <div>
          <p className="font-semibold text-gray-700">Daily Check-in</p>
          <p className="text-xs text-gray-400">Come back every day to claim</p>
        </div>
        <button
          onClick={handleCheckIn}
          disabled={claiming}
          className="bg-green-500 hover:bg-green-600 active:scale-95 transition-all text-white font-bold rounded-xl px-4 py-2 text-sm shadow"
        >
          {claiming ? "Claiming..." : "Claim $0.04"}
        </button>
      </section>

      {/* Menu Grid */}
      <main className="grid grid-cols-3 gap-4 text-center px-4 py-4 m-2">
        {menuItems.map((item) =>
          item.external ? (
            <a
              key={item.label}
              href={item.to}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white shadow rounded-xl p-3 flex flex-col items-center hover:scale-105 transition-all"
            >
              <i className={`fas ${item.icon} ${item.color} text-4xl`}></i>
              <p className="text-xs font-semibold mt-2 text-gray-700">{item.label}</p>
            </a>
          ) : (
            <Link
              key={item.label}
              to={item.to}
              className="bg-white shadow rounded-xl p-3 flex flex-col items-center hover:scale-105 transition-all"
            >
              <i className={`fas ${item.icon} ${item.color} text-4xl`}></i>
              <p className="text-xs font-semibold mt-2 text-gray-700">{item.label}</p>
            </Link>
          )
        )}
      </main>

      {/* Announcements */}
      <section className="bg-white shadow mx-2 my-2 p-4 rounded-xl">
        <h2 className="font-semibold text-gray-700 mb-2">📢 Announcements</h2>
        <ul className="space-y-1 list-disc pl-5 text-sm text-gray-600">
          <li>✅ New tasks available in Earn Section.</li>
          <li>💰 Do simple tasks and get paid.</li>
          <li>🏦 Withdrawals processed every Friday.</li>
          <li>⚠️ Minimum withdrawal is $5.</li>
        </ul>
      </section>

      {/* Reward Code */}
      <section className="bg-white shadow mx-2 mt-2 p-4 rounded-xl">
        <p className="font-semibold text-gray-700 mb-2">🎁 Redeem Code</p>
        <form onSubmit={handleRedeem} className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter Reward Code"
            className="flex-1 border-2 border-blue-400 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
          />
          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl px-4 py-2 text-sm transition-all"
          >
            Redeem
          </button>
        </form>
        {msg && <p className="text-sm mt-2 font-semibold text-green-600">{msg}</p>}
      </section>

      <BottomNav />
    </div>
  );
}
