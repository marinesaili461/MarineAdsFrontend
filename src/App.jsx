import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./Context/AuthContext";
import ProtectedRoute from "./Components/ProtectedRoute";
import AdminRoute     from "./Components/AdminRoute";

import Landing       from "./Pages/Landing";
import Login         from "./Pages/Login";
import Register      from "./Pages/Register";

import UserLayout    from "./Pages/UserLayout";
import Home          from "./Pages/Home";
import Deposit       from "./Pages/Deposit";
import CreateAd      from "./Pages/CreateAd";
import MyCampaigns   from "./Pages/MyCampaigns";
import CampaignDetail from "./Pages/CampaignDetail";
import Publisher     from "./Pages/Publisher";
import Profile       from "./Pages/Profile";

import AdminLayout      from "./Pages/Admin/AdminLayout";
import AdminDashboard   from "./Pages/Admin/AdminDashboard";
import AdminDeposits    from "./Pages/Admin/AdminDeposits";
import AdminUsers       from "./Pages/Admin/AdminUsers";

const App = () => (
  <AuthProvider>
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/"         element={<Landing />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User (protected, nested inside shared layout) */}
        <Route element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
          <Route path="/home"            element={<Home />} />
          <Route path="/deposit"         element={<Deposit />} />
          <Route path="/create-ad"       element={<CreateAd />} />
          <Route path="/campaigns"       element={<MyCampaigns />} />
          <Route path="/campaigns/:id"   element={<CampaignDetail />} />
          <Route path="/publisher"       element={<Publisher />} />
          <Route path="/profile"         element={<Profile />} />
        </Route>

        {/* Admin (protected + role-gated, nested inside admin layout) */}
        <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route path="/admin"           element={<AdminDashboard />} />
          <Route path="/admin/deposits"  element={<AdminDeposits />} />
          <Route path="/admin/users"     element={<AdminUsers />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  </AuthProvider>
);

export default App;
