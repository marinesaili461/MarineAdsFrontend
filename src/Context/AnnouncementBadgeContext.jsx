import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import API from "../api/axios";
import { AuthContext } from "./AuthContext";

export const AnnouncementBadgeContext = createContext();

export const AnnouncementBadgeProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [unread, setUnread] = useState(0);

  const fetchUnread = useCallback(async () => {
    if (!token) return;
    try {
      const res = await API.get("/announcements/unread-count");
      setUnread(res.data.count || 0);
    } catch {}
  }, [token]);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 8000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  const formatBadge = (n) => (n > 99 ? "99+" : n);

  return (
    <AnnouncementBadgeContext.Provider value={{ unread, formatBadge, refresh: fetchUnread }}>
      {children}
    </AnnouncementBadgeContext.Provider>
  );
};
