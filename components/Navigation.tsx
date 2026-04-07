"use client";

import React from "react";
import { motion } from "framer-motion";
import GradientAvatar from "./GradientAvatar";

export type NavTab = "browse" | "timeline" | "matches";

interface NavigationProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  matchCount: number;
  akinPickCount: number;
  onProfileTap: () => void;
  myGradient?: number;
  myName?: string;
  myAccentColor?: "orchid" | "mint" | "gold";
}

const accentRingMap: Record<string, string> = {
  orchid: "linear-gradient(135deg, rgba(155,109,255,0.8), rgba(0,229,160,0.5))",
  mint: "linear-gradient(135deg, rgba(0,229,160,0.8), rgba(137,247,254,0.5))",
  gold: "linear-gradient(135deg, rgba(254,225,64,0.8), rgba(255,180,60,0.5))",
};

export default function Navigation({
  activeTab,
  onTabChange,
  matchCount,
  akinPickCount,
  onProfileTap,
  myGradient = 0,
  myName = "?",
  myAccentColor = "orchid",
}: NavigationProps) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "0 16px max(28px, env(safe-area-inset-bottom))",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          borderRadius: "24px",
          padding: "6px",
          display: "flex",
          gap: "3px",
          width: "100%",
          maxWidth: "400px",
          background: "rgba(10,10,20,0.96)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 -4px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset",
        }}
      >
        {/* Browse */}
        <NavButton
          label="Browse"
          isActive={activeTab === "browse"}
          onClick={() => onTabChange("browse")}
          badge={null}
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </NavButton>

        {/* Timeline */}
        <NavButton
          label="Timeline"
          isActive={activeTab === "timeline"}
          onClick={() => onTabChange("timeline")}
          badge={akinPickCount > 0 ? akinPickCount : null}
          badgeColor="rgba(137,247,254,0.9)"
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
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
            width="19"
            height="19"
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

        {/* Profile — avatar button */}
        <motion.button
          onClick={onProfileTap}
          whileTap={{ scale: 0.9 }}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
            padding: "10px 6px",
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
              background: accentRingMap[myAccentColor] ?? accentRingMap.orchid,
            }}
          >
            <GradientAvatar
              gradient={myGradient}
              name={myName}
              size={24}
              border="1.5px solid rgba(10,10,20,0.8)"
            />
          </motion.div>
          <span
            style={{
              fontSize: "9px",
              fontWeight: "600",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.35)",
            }}
          >
            You
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
  badgeColor?: string;
}

function NavButton({ label, children, isActive, onClick, badge, badgeColor = "var(--mint)" }: NavButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.93 }}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "4px",
        padding: "10px 6px",
        borderRadius: "18px",
        border: "none",
        background: "transparent",
        color: isActive ? "var(--orchid)" : "rgba(255,255,255,0.38)",
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
            background: "rgba(155,109,255,0.13)",
            border: "1px solid rgba(155,109,255,0.22)",
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
            style={{
              position: "absolute",
              top: "-5px",
              right: "-7px",
              minWidth: "16px",
              height: "16px",
              borderRadius: "999px",
              background: badgeColor,
              color: "#07070f",
              fontSize: "9px",
              fontWeight: "800",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 3px",
            }}
          >
            {badge > 9 ? "9+" : badge}
          </motion.div>
        )}
      </div>

      <span
        style={{
          fontSize: "9px",
          fontWeight: isActive ? "800" : "500",
          letterSpacing: "0.05em",
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
