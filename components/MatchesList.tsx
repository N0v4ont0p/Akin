"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MatchData, formatRelativeTime } from "@/lib/firestore";
import GradientAvatar from "./GradientAvatar";

interface MatchesListProps {
  matches: MatchData[];
  myUserId: string;
  loading?: boolean;
}

export default function MatchesList({ matches, myUserId, loading }: MatchesListProps) {
  if (loading) {
    return (
      <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton glass" style={{ height: "80px", borderRadius: "16px" }} />
        ))}
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ padding: "40px 20px", textAlign: "center" }}
      >
        <div
          className="glass"
          style={{
            borderRadius: "24px",
            padding: "48px 32px",
            maxWidth: "320px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "rgba(155,109,255,0.12)",
              border: "1px solid rgba(155,109,255,0.25)",
              margin: "0 auto 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--orchid)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>No matches yet</h3>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", lineHeight: 1.65 }}>
            Keep browsing your classmates — matches appear when both of you like each other.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
      <AnimatePresence>
        {matches.map((match, index) => {
          const isUser1 = match.user1Id === myUserId;
          const myGradient = isUser1 ? match.user1Gradient : match.user2Gradient;
          const theirGradient = isUser1 ? match.user2Gradient : match.user1Gradient;
          const myName = isUser1 ? match.user1Name : match.user2Name;
          const theirName = isUser1 ? match.user2Name : match.user1Name;

          return (
            <motion.div
              key={match.matchId}
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ delay: index * 0.06, type: "spring", stiffness: 280, damping: 28 }}
            >
              <div
                className="glass mint-glow"
                style={{
                  borderRadius: "18px",
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  borderLeft: "3px solid rgba(0,229,160,0.45)",
                }}
              >
                {/* Overlapping avatars */}
                <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                  <GradientAvatar
                    gradient={myGradient ?? 0}
                    name={myName}
                    size={48}
                    border="2px solid rgba(0,229,160,0.35)"
                    style={{ zIndex: 2 }}
                  />
                  <GradientAvatar
                    gradient={theirGradient ?? 0}
                    name={theirName}
                    size={48}
                    border="2px solid rgba(0,229,160,0.35)"
                    style={{ marginLeft: "-14px", zIndex: 1 }}
                  />
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "15px", fontWeight: "600", marginBottom: "3px", color: "#f0f0f5" }}>
                    You & {theirName}
                  </p>
                  <p style={{ fontSize: "12px", color: "rgba(0,229,160,0.65)", fontWeight: "500" }}>
                    Connected {formatRelativeTime(match.createdAt)}
                  </p>
                </div>

                {/* Animated heart */}
                <motion.div
                  animate={{ scale: [1, 1.18, 1] }}
                  transition={{ repeat: Infinity, duration: 2, delay: index * 0.3 }}
                  style={{ flexShrink: 0 }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--mint)" stroke="none">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
