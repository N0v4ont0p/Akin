"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MatchData } from "@/lib/firestore";
import MatchTierCard from "./MatchTierCard";

interface MatchesListProps {
  matches: MatchData[];
  myUserId: string;
  loading?: boolean;
  onOpenSyncModal?: (match: MatchData) => void;
}

export default function MatchesList({ matches, myUserId, loading, onOpenSyncModal }: MatchesListProps) {
  if (loading) {
    return (
      <div style={{ padding: "0 18px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {[1, 2].map((i) => (
          <div key={i} className="skeleton glass" style={{ height: "240px", borderRadius: "28px" }} />
        ))}
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        style={{ padding: "40px 24px" }}
      >
        <div
          style={{
            borderRadius: "32px",
            padding: "56px 32px",
            maxWidth: "360px",
            margin: "0 auto",
            textAlign: "center",
            background: "rgba(155,109,255,0.05)",
            border: "1px solid rgba(155,109,255,0.14)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(155,109,255,0.10) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <motion.div
            animate={{
              scale: [1, 1.18, 1],
              filter: [
                "drop-shadow(0 0 8px rgba(155,109,255,0.3))",
                "drop-shadow(0 0 28px rgba(155,109,255,0.8))",
                "drop-shadow(0 0 8px rgba(155,109,255,0.3))",
              ],
            }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            style={{
              fontSize: 56,
              background: "linear-gradient(135deg, #9b6dff, #00e5a0)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: 24,
              display: "block",
              position: "relative",
            }}
          >
            ✦
          </motion.div>
          <h3
            style={{
              fontSize: "22px",
              fontWeight: "900",
              marginBottom: "12px",
              letterSpacing: "-0.02em",
              color: "#f0f0f5",
              position: "relative",
            }}
          >
            No matches yet
          </h3>
          <p
            style={{
              color: "rgba(255,255,255,0.38)",
              fontSize: "14px",
              lineHeight: 1.75,
              maxWidth: 240,
              margin: "0 auto",
              position: "relative",
            }}
          >
            Browse your classmates and pick your Akin. When it's mutual, your Sync Streak begins here.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div style={{ padding: "0 18px 24px", display: "flex", flexDirection: "column", gap: "20px" }}>
      <AnimatePresence initial={false}>
        {matches.map((match) => (
          <MatchTierCard
            key={match.matchId}
            match={match}
            myUserId={myUserId}
            onOpenSyncModal={onOpenSyncModal ? () => onOpenSyncModal(match) : undefined}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
