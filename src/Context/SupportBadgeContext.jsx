import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import API from "../api/axios";
import { AuthContext } from "./AuthContext";

export const SupportBadgeContext = createContext();

export const SupportBadgeProvider = ({ children }) => {
  const { token, user } = useContext(AuthContext);
  const [userUnread, setUserUnread] = useState(0);
  const [adminUnread, setAdminUnread] = useState(0);

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  const fetchUserUnread = useCallback(async () => {
    if (!token || isAdmin) return;
    try {
      const res = await API.get("/support/unread-count");
      setUserUnread(res.data.count || 0);
    } catch {}
  }, [token, isAdmin]);

  const fetchAdminUnread = useCallback(async () => {
    if (!token || !isAdmin) return;
    try {
      const res = await API.get("/support/admin/tickets/unread-count");
      setAdminUnread(res.data.count || 0);
    } catch {}
  }, [token, isAdmin]);

  useEffect(() => {
    fetchUserUnread();
    fetchAdminUnread();
    const interval = setInterval(() => {
      fetchUserUnread();
      fetchAdminUnread();
    }, 8000);
    return () => clearInterval(interval);
  }, [fetchUserUnread, fetchAdminUnread]);

  const formatBadge = (n) => (n > 99 ? "99+" : n);

  return (
    <SupportBadgeContext.Provider value={{ userUnread, adminUnread, formatBadge, refreshUser: fetchUserUnread, refreshAdmin: fetchAdminUnread }}>
      {children}
    </SupportBadgeContext.Provider>
  );
};
