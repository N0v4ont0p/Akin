"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MatchData } from "@/lib/firestore";
import MatchTierCard from "./MatchTierCard";

interface MatchesListProps {
  matches: MatchData[];
  myUserId: string;
  akinPickCount?: number;
  loading?: boolean;
  onOpenSyncModal?: (match: MatchData) => void;
}

export default function MatchesList({ matches, myUserId, akinPickCount = 0, loading, onOpenSyncModal }: MatchesListProps) {
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
    // ── State A: Has active picks — waiting for mutual ─────────────────────
    if (akinPickCount > 0) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          style={{ padding: "32px 24px" }}
        >
          <div
            style={{
              borderRadius: "32px",
              padding: "44px 28px 36px",
              maxWidth: "360px",
              margin: "0 auto",
              textAlign: "center",
              background: "rgba(0,229,160,0.04)",
              border: "1px solid rgba(0,229,160,0.15)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0,229,160,0.10) 0%, transparent 70%)", pointerEvents: "none" }} />

            {/* Sonar ping animation */}
            <div style={{ position: "relative", marginBottom: 28, height: 60, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 2.8, 1], opacity: [0.35, 0, 0.35] }}
                  transition={{ duration: 3, delay: i * 0.9, repeat: Infinity, ease: "easeOut" }}
                  style={{
                    position: "absolute",
                    width: 40, height: 40,
                    borderRadius: "50%",
                    border: "1.5px solid rgba(0,229,160,0.4)",
                    pointerEvents: "none",
                  }}
                />
              ))}
              <motion.div
                animate={{ scale: [0.95, 1.05, 0.95] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                style={{ fontSize: 28, position: "relative", zIndex: 1, filter: "drop-shadow(0 0 12px rgba(0,229,160,0.7))" }}
              >
                📡
              </motion.div>
            </div>

            <h3 style={{ fontSize: "20px", fontWeight: "900", marginBottom: "10px", letterSpacing: "-0.02em", color: "#f0f0f5", position: "relative" }}>
              Signal sent. Waiting for echo.
            </h3>
            <p style={{ color: "rgba(255,255,255,0.42)", fontSize: "14px", lineHeight: 1.75, maxWidth: 240, margin: "0 auto 20px", position: "relative" }}>
              Your pick is out there. The moment they pick you back, your connection ignites here.
            </p>

            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2.8, repeat: Infinity }}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(0,229,160,0.08)", border: "1px solid rgba(0,229,160,0.2)", borderRadius: 999, padding: "6px 14px", position: "relative" }}
            >
              <motion.div
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                style={{ width: 6, height: 6, borderRadius: "50%", background: "#00e5a0" }}
              />
              <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(0,229,160,0.85)" }}>
                {akinPickCount} pick{akinPickCount > 1 ? "s" : ""} active · listening for a match
              </span>
            </motion.div>
          </div>
        </motion.div>
      );
    }

    // ── State B: No picks at all — prompt to pick ──────────────────────────
    return (
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        style={{ padding: "32px 24px" }}
      >
        <div
          style={{
            borderRadius: "32px",
            padding: "44px 28px 36px",
            maxWidth: "360px",
            margin: "0 auto",
            textAlign: "center",
            background: "rgba(155,109,255,0.05)",
            border: "1px solid rgba(155,109,255,0.18)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(155,109,255,0.14) 0%, transparent 70%)", pointerEvents: "none" }} />

          {/* Pulsing signal */}
          <div style={{ position: "relative", marginBottom: 24 }}>
            <motion.div animate={{ scale: [1, 2.2, 1], opacity: [0.25, 0, 0.25] }} transition={{ duration: 2.6, repeat: Infinity, ease: "easeOut" }}
              style={{ position: "absolute", inset: -20, borderRadius: "50%", background: "rgba(155,109,255,0.18)", pointerEvents: "none" }} />
            <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }} transition={{ duration: 2.6, delay: 0.5, repeat: Infinity, ease: "easeOut" }}
              style={{ position: "absolute", inset: -10, borderRadius: "50%", border: "1.5px solid rgba(155,109,255,0.3)", pointerEvents: "none" }} />
            <motion.div
              animate={{ scale: [1, 1.12, 1], filter: ["drop-shadow(0 0 10px rgba(155,109,255,0.4))", "drop-shadow(0 0 32px rgba(155,109,255,0.9))", "drop-shadow(0 0 10px rgba(155,109,255,0.4))"] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              style={{ fontSize: 52, background: "linear-gradient(135deg, #9b6dff, #00e5a0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", display: "block", position: "relative" }}
            >✦</motion.div>
          </div>

          <h3 style={{ fontSize: "21px", fontWeight: "900", marginBottom: "10px", letterSpacing: "-0.02em", color: "#f0f0f5", position: "relative" }}>
            Someone may have already picked you
          </h3>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "14px", lineHeight: 1.75, maxWidth: 260, margin: "0 auto 20px", position: "relative" }}>
            You won&apos;t know until you pick someone back. The only way to find out is to choose.
          </p>

          <motion.div animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 3, repeat: Infinity }}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(155,109,255,0.10)", border: "1px solid rgba(155,109,255,0.22)", borderRadius: 999, padding: "6px 14px", position: "relative" }}
          >
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#9b6dff" }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(155,109,255,0.85)" }}>Browse → pick your Akin</span>
          </motion.div>
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
