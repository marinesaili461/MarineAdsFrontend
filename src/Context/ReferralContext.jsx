import React, { createContext, useState, useContext } from "react";
import API from "../api/axios";
import { AuthContext } from "./AuthContext";

export const ReferralContext = createContext();

export const ReferralProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await API.get("/referrals/me");
      setStats(res.data);
    } catch (err) {
      console.error("Referral fetch failed:", err.message);
    }
    setLoading(false);
  };

  return (
    <ReferralContext.Provider value={{ stats, loading, fetchStats }}>
      {children}
    </ReferralContext.Provider>
  );
};
