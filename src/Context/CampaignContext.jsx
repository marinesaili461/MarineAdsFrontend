import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import API from "../api/axios";
import { AuthContext } from "./AuthContext";

export const CampaignContext = createContext();

const STORAGE_KEY = "mc_last_seen_campaign_count";

export const CampaignProvider = ({ children }) => {
  const { token, user } = useContext(AuthContext);
  const [totalActive, setTotalActive] = useState(0);
  const [badge, setBadge] = useState(0);

  const computeBadge = useCallback((total) => {
    const lastSeen = parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
    const unseen = Math.max(0, total - lastSeen);
    setBadge(unseen);
  }, []);

  const fetchCount = useCallback(async () => {
    if (!user || !token) return;
    try {
      const res = await API.get("/campaign", { params: { limit: 1, page: 1 } });
      const total = res.data.total || 0;
      setTotalActive(total);
      computeBadge(total);
    } catch {
      // silent
    }
  }, [user, token, computeBadge]);

  // Poll every 30 seconds
  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  // Call this when user opens /campaigns
  const markSeen = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, String(totalActive));
    setBadge(0);
  }, [totalActive]);

  return (
    <CampaignContext.Provider value={{ badge, totalActive, markSeen, refresh: fetchCount }}>
      {children}
    </CampaignContext.Provider>
  );
};
