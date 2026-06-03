// src/Components/BottomNav.jsx
import React from "react";
import { NavLink } from "react-router-dom";

const BottomNav = () => {
  const base = "flex flex-col items-center justify-center flex-1 py-2 text-white transition-all";
  const active = "bg-green-500 rounded-xl mx-1";

  return (
    <nav className="fixed bottom-0 w-full h-[70px] bg-orange-400 flex z-50 shadow-lg">
      <NavLink to="/home" className={({ isActive }) => `${base} ${isActive ? active : ""}`}>
        <i className="fas fa-home text-2xl"></i>
        <span className="text-xs font-semibold mt-0.5">Home</span>
      </NavLink>
      <NavLink to="/earn" className={({ isActive }) => `${base} ${isActive ? active : ""}`}>
        <i className="fas fa-coins text-2xl"></i>
        <span className="text-xs font-semibold mt-0.5">Earn</span>
      </NavLink>
      <NavLink to="/wallet" className={({ isActive }) => `${base} ${isActive ? active : ""}`}>
        <i className="fas fa-wallet text-2xl"></i>
        <span className="text-xs font-semibold mt-0.5">Wallet</span>
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => `${base} ${isActive ? active : ""}`}>
        <i className="fas fa-user text-2xl"></i>
        <span className="text-xs font-semibold mt-0.5">Profile</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;
