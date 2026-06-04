import React, { createContext, useState, useContext, useEffect } from "react";
import API from "../api/axios";
import { AuthContext } from "./AuthContext";

export const RewardCodeContext = createContext();

export const RewardCodeProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [codes, setCodes] = useState([]);

  useEffect(() => {
    if (!token) return;
    API.get("/rewards/my-codes")
      .then((res) => setCodes(res.data))
      .catch(console.error);
  }, [token]);

  const handleRedeem = async (code) => {
    const res = await API.post("/rewards/redeem", { code });
    setCodes((prev) => [...prev, res.data.redeemedCode]);
    return res.data;
  };

  return (
    <RewardCodeContext.Provider value={{ codes, redeemCode: handleRedeem }}>
      {children}
    </RewardCodeContext.Provider>
  );
};
