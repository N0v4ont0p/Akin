"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface PrivacyModeContextType {
  privacyMode: boolean;
  toggle: () => void;
}

const PrivacyModeContext = createContext<PrivacyModeContextType>({
  privacyMode: false,
  toggle: () => {},
});

export function PrivacyModeProvider({ children }: { children: ReactNode }) {
  const [privacyMode, setPrivacyMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("akin_privacy");
    if (stored === "1") setPrivacyMode(true);
  }, []);

  const toggle = () => {
    setPrivacyMode((p) => {
      localStorage.setItem("akin_privacy", p ? "0" : "1");
      return !p;
    });
  };

  return (
    <PrivacyModeContext.Provider value={{ privacyMode, toggle }}>
      <div data-privacy={privacyMode.toString()} style={{ minHeight: "100vh" }}>
        {children}
      </div>
    </PrivacyModeContext.Provider>
  );
}

export function usePrivacyMode() {
  return useContext(PrivacyModeContext);
}
