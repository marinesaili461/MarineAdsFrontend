import React, { createContext, useState, useContext, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { redeemCode, getMyCodes } from "../api/index";

export const RewardCodeContext = createContext();

export const RewardCodeProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [codes, setCodes] = useState([]);

  useEffect(() => {
    if (token) getMyCodes().then(setCodes).catch(console.error);
  }, [token]);

  const handleRedeem = async (code) => {
    const res = await redeemCode(code);
    setCodes((prev) => [...prev, res.redeemedCode]);
    return res;
  };

  return (
    <RewardCodeContext.Provider value={{ codes, redeemCode: handleRedeem }}>
      {children}
    </RewardCodeContext.Provider>
  );
};
