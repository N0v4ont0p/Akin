"use client";

import React from "react";
import { motion } from "framer-motion";

type Tab = "browse" | "matches" | "profile";

interface NavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  matchCount: number;
}

export default function Navigation({ activeTab, onTabChange, matchCount }: NavigationProps) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "0 20px 28px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        className="glass"
        style={{
          borderRadius: "24px",
          padding: "6px",
          display: "flex",
          gap: "4px",
          width: "100%",
          maxWidth: "340px",
        }}
      >
        <NavButton
          label="Browse"
          icon={
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          }
          isActive={activeTab === "browse"}
          onClick={() => onTabChange("browse")}
          badge={null}
        />
        <NavButton
          label="Matches"
          icon={
            <svg width="19" height="19" viewBox="0 0 24 24" fill={activeTab === "matches" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          }
          isActive={activeTab === "matches"}
          onClick={() => onTabChange("matches")}
          badge={matchCount > 0 ? matchCount : null}
        />
        <NavButton
          label="Profile"
          icon={
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          }
          isActive={activeTab === "profile"}
          onClick={() => onTabChange("profile")}
          badge={null}
        />
      </div>
    </div>
  );
}

interface NavButtonProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  badge: number | null;
}

function NavButton({ label, icon, isActive, onClick, badge }: NavButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.93 }}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
        padding: "10px 8px",
        borderRadius: "18px",
        border: "none",
        background: "transparent",
        color: isActive ? "var(--orchid)" : "rgba(255,255,255,0.32)",
        cursor: "pointer",
        position: "relative",
        transition: "color 0.2s ease",
        fontFamily: "inherit",
      }}
    >
      {isActive && (
        <motion.div
          layoutId="nav-indicator"
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "18px",
            background: "rgba(155,109,255,0.12)",
            border: "1px solid rgba(155,109,255,0.22)",
          }}
          transition={{ type: "spring", stiffness: 420, damping: 38 }}
        />
      )}

      <div style={{ position: "relative", zIndex: 1 }}>
        {icon}
        {badge !== null && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="pulse-dot"
            style={{
              position: "absolute",
              top: "-5px",
              right: "-6px",
              width: "17px",
              height: "17px",
              borderRadius: "50%",
              background: "var(--mint)",
              color: "#07070f",
              fontSize: "10px",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {badge > 9 ? "9+" : badge}
          </motion.div>
        )}
      </div>

      <span
        style={{
          fontSize: "10px",
          fontWeight: isActive ? "700" : "400",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          position: "relative",
          zIndex: 1,
        }}
      >
        {label}
      </span>
    </motion.button>
  );
}
