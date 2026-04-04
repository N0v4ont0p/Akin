"use client";

import React from "react";
import { motion } from "framer-motion";
import GradientAvatar from "./GradientAvatar";

export type NavTab = "browse" | "matches";

interface NavigationProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  matchCount: number;
  onProfileTap: () => void;
  myGradient?: number;
  myName?: string;
}

export default function Navigation({
  activeTab,
  onTabChange,
  matchCount,
  onProfileTap,
  myGradient = 0,
  myName = "?",
}: NavigationProps) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "0 16px 28px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          borderRadius: "24px",
          padding: "6px",
          display: "flex",
          gap: "4px",
          width: "100%",
          maxWidth: "360px",
          /* Solid enough to always read text */
          background: "rgba(10,10,20,0.94)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 -4px 32px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04) inset",
        }}
      >
        {/* Browse */}
        <NavButton
          label="Browse"
          isActive={activeTab === "browse"}
          onClick={() => onTabChange("browse")}
          badge={null}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </NavButton>

        {/* Matches */}
        <NavButton
          label="Matches"
          isActive={activeTab === "matches"}
          onClick={() => onTabChange("matches")}
          badge={matchCount > 0 ? matchCount : null}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={activeTab === "matches" ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </NavButton>

        {/* Profile — shows actual avatar */}
        <motion.button
          onClick={onProfileTap}
          whileTap={{ scale: 0.9 }}
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
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <motion.div
            whileHover={{ scale: 1.08 }}
            style={{
              borderRadius: "50%",
              padding: "2px",
              background: "linear-gradient(135deg, rgba(155,109,255,0.6), rgba(0,229,160,0.4))",
            }}
          >
            <GradientAvatar
              gradient={myGradient}
              name={myName}
              size={26}
              border="1.5px solid rgba(10,10,20,0.8)"
            />
          </motion.div>
          <span
            style={{
              fontSize: "10px",
              fontWeight: "500",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.38)",
            }}
          >
            Profile
          </span>
        </motion.button>
      </div>
    </div>
  );
}

interface NavButtonProps {
  label: string;
  children: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  badge: number | null;
}

function NavButton({ label, children, isActive, onClick, badge }: NavButtonProps) {
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
        color: isActive ? "var(--orchid)" : "rgba(255,255,255,0.42)",
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
            background: "rgba(155,109,255,0.14)",
            border: "1px solid rgba(155,109,255,0.25)",
          }}
          transition={{ type: "spring", stiffness: 440, damping: 40 }}
        />
      )}

      <div style={{ position: "relative", zIndex: 1 }}>
        {children}
        {badge !== null && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
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
          fontWeight: isActive ? "700" : "500",
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
