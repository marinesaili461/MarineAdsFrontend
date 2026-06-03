// src/Pages/Wallet.jsx
import React, { useState, useContext } from "react";
import { WalletContext } from "../Context/WalletContext";
import TopBar from "../Components/TopBar";
import BottomNav from "../Components/BottomNav";

const Wallet = () => {
  const { wallet, withdraw, loading } = useContext(WalletContext);
  const [amount, setAmount] = useState("");
  const [msg, setMsg] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleWithdraw = async () => {
    const val = Number(amount);
    if (!val || val <= 0) return setMsg("Enter a valid amount.");
    if (val > wallet.balance) return setMsg("Insufficient balance.");
    setProcessing(true);
    try {
      const res = await withdraw(val);
      setMsg(`✅ ${res.message || "Withdrawal submitted!"}`);
      setAmount("");
    } catch (err) {
      setMsg(`❌ ${err.response?.data?.message || "Withdrawal failed."}`);
    }
    setProcessing(false);
    setTimeout(() => setMsg(""), 4000);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-orange-500 font-bold animate-pulse">Loading wallet...</p>
    </div>
  );

  return (
    <div className="bg-gray-100 min-h-screen pb-24">
      <TopBar />

      {/* Balance Cards */}
      <div className="grid grid-cols-2 gap-3 m-3">
        {[
          { label: "Total Balance", value: wallet?.balance, icon: "fa-wallet", color: "bg-orange-500" },
          { label: "Earned Today", value: wallet?.earnedToday, icon: "fa-coins", color: "bg-green-500" },
          { label: "Total Deposited", value: wallet?.totalDeposited, icon: "fa-arrow-down", color: "bg-blue-500" },
          { label: "Total Withdrawn", value: wallet?.totalWithdrawn, icon: "fa-arrow-up", color: "bg-purple-500" },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
            <div className={`${color} rounded-full w-10 h-10 flex items-center justify-center`}>
              <i className={`fas ${icon} text-white`}></i>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">{label}</p>
              <p className="text-green-600 font-bold">${Number(value || 0).toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Withdraw */}
      <div className="bg-white shadow rounded-xl m-3 p-4">
        <h3 className="font-semibold text-gray-700 mb-3">💸 Withdraw Funds</h3>
        <div className="flex gap-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="flex-1 border-2 border-gray-200 focus:border-orange-400 rounded-xl px-4 py-2 text-sm outline-none"
          />
          <button
            onClick={handleWithdraw}
            disabled={processing}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2 rounded-xl text-sm transition"
          >
            {processing ? "..." : "Withdraw"}
          </button>
        </div>
        {msg && <p className="text-sm mt-2 font-semibold text-center">{msg}</p>}
      </div>

      {/* Transaction History */}
      <div className="bg-white shadow rounded-xl m-3 p-4">
        <h3 className="font-semibold text-gray-700 mb-3">📋 Withdrawal History</h3>
        {wallet?.withdrawalHistory?.length > 0 ? (
          <div className="space-y-2">
            {wallet.withdrawalHistory.map((w, i) => (
              <div key={i} className="flex justify-between items-center border-b pb-2 last:border-0">
                <div>
                  <p className="text-sm font-semibold text-gray-700">${Number(w.amount || 0).toFixed(2)}</p>
                  <p className="text-xs text-gray-400">{w.date ? new Date(w.date).toLocaleDateString() : "N/A"}</p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  w.status === "approved" ? "bg-green-100 text-green-600"
                  : w.status === "rejected" ? "bg-red-100 text-red-600"
                  : "bg-yellow-100 text-yellow-600"
                }`}>
                  {w.status || "Pending"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">No withdrawals yet.</p>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Wallet;
