// src/Components/TopBar.jsx
import React, { useContext } from "react";
import { WalletContext } from "../Context/WalletContext";
import logo from "../Assets/logo.png";

const TopBar = () => {
  const { wallet } = useContext(WalletContext);

  return (
    <nav className="w-full bg-orange-400 flex justify-between items-center px-2 py-1 sticky top-0 z-50 shadow-md">
      <img src={logo} alt="MarineCash" className="w-[55px] h-[55px] rounded-full" />
      <div className="flex gap-2">
        <div className="bg-white rounded-xl px-3 py-1 text-center shadow">
          <p className="text-xs font-semibold text-gray-600">Earned Today</p>
          <p className="text-green-500 font-bold text-sm">
            ${Number(wallet?.earnedToday || 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-xl px-3 py-1 text-center shadow">
          <p className="text-xs font-semibold text-gray-600">Total Balance</p>
          <p className="text-green-500 font-bold text-sm">
            ${Number(wallet?.balance || 0).toFixed(2)}
          </p>
        </div>
      </div>
    </nav>
  );
};

export default TopBar;
