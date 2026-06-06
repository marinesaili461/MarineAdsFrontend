import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";

const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-orange-500 text-xl font-bold animate-pulse">Loading...</div>
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  if (!["admin", "superadmin"].includes(user.role)) return <Navigate to="/home" />;
  return children;
};

export default AdminRoute;
