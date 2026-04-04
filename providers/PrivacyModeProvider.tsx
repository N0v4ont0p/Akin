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

  // Sync background colour on <html> so the full page changes, not just a div
  useEffect(() => {
    const root = document.documentElement;
    if (privacyMode) {
      root.style.background = "#f5f5f0";
      document.body.style.background = "#f5f5f0";
      root.style.colorScheme = "light";
    } else {
      root.style.background = "#07070f";
      document.body.style.background = "#07070f";
      root.style.colorScheme = "dark";
    }
  }, [privacyMode]);

  const toggle = () => {
    setPrivacyMode((p) => {
      localStorage.setItem("akin_privacy", p ? "0" : "1");
      return !p;
    });
  };

  return (
    <PrivacyModeContext.Provider value={{ privacyMode, toggle }}>
      <div
        data-privacy={privacyMode.toString()}
        style={{
          minHeight: "100vh",
          background: privacyMode ? "#f5f5f0" : "transparent",
          transition: "background 0.4s ease",
        }}
      >
        {children}
      </div>
    </PrivacyModeContext.Provider>
  );
}

export function usePrivacyMode() {
  return useContext(PrivacyModeContext);
}
