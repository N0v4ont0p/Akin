"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VibeCheck } from "@/lib/firestore";

interface VibeCheckSheetProps {
  vibeCheck: VibeCheck | null;
  myUserId: string;
  onVote: (optionIndex: number) => Promise<void>;
  loading?: boolean;
}

function ResultBar({
  emoji,
  label,
  count,
  total,
  isMyVote,
  delay,
}: {
  emoji: string;
  label: string;
  count: number;
  total: number;
  isMyVote: boolean;
  delay: number;
}) {
  const pct = total === 0 ? 0 : Math.round((count / total) * 100);
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, type: "spring", stiffness: 300, damping: 28 }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        borderRadius: 14,
        background: isMyVote ? "rgba(155,109,255,0.10)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${isMyVote ? "rgba(155,109,255,0.3)" : "rgba(255,255,255,0.07)"}`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Bar fill */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ delay: delay + 0.1, duration: 0.7, ease: "easeOut" }}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          background: isMyVote
            ? "rgba(155,109,255,0.18)"
            : "rgba(255,255,255,0.05)",
          borderRadius: 14,
          pointerEvents: "none",
        }}
      />

      <span style={{ fontSize: 22, flexShrink: 0, position: "relative", zIndex: 1 }}>{emoji}</span>
      <span
        style={{
          flex: 1,
          fontSize: 14,
          fontWeight: isMyVote ? 700 : 500,
          color: isMyVote ? "rgba(155,109,255,0.9)" : "rgba(255,255,255,0.65)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {label}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 5, position: "relative", zIndex: 1 }}>
        {isMyVote && (
          <span style={{ fontSize: 11, color: "rgba(155,109,255,0.7)", fontWeight: 700 }}>you ·</span>
        )}
        <span style={{ fontSize: 13, fontWeight: 700, color: isMyVote ? "rgba(155,109,255,0.85)" : "rgba(255,255,255,0.45)" }}>
          {pct}%
        </span>
      </div>
    </motion.div>
  );
}

export default function VibeCheckSheet({ vibeCheck, myUserId, onVote, loading }: VibeCheckSheetProps) {
  const [voting, setVoting] = useState(false);
  const [expanded, setExpanded] = useState(false);

  if (loading || !vibeCheck) {
    return (
      <div
        className="skeleton"
        style={{ height: 72, borderRadius: 20, margin: "0 18px 16px" }}
      />
    );
  }

  const myVote = vibeCheck.responses[myUserId];
  const hasVoted = myVote !== undefined;
  const totalVotes = Object.keys(vibeCheck.responses).length;

  const handleVote = async (optionIndex: number) => {
    if (voting || hasVoted) return;
    setVoting(true);
    try {
      await onVote(optionIndex);
      setExpanded(true);
    } finally {
      setVoting(false);
    }
  };

  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{
        margin: "0 18px 16px",
        borderRadius: 22,
        overflow: "hidden",
        background: "rgba(155,109,255,0.06)",
        border: "1px solid rgba(155,109,255,0.16)",
        boxShadow: "0 4px 28px rgba(155,109,255,0.08)",
      }}
    >
      {/* Header row */}
      <motion.button
        onClick={() => hasVoted && setExpanded((e) => !e)}
        whileTap={hasVoted ? { scale: 0.99 } : {}}
        style={{
          width: "100%",
          padding: "16px 18px",
          background: "transparent",
          border: "none",
          cursor: hasVoted ? "pointer" : "default",
          fontFamily: "inherit",
          display: "flex",
          alignItems: "center",
          gap: 12,
          textAlign: "left",
        }}
      >
        {/* Animated pulse dot */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            boxShadow: ["0 0 0 0 rgba(155,109,255,0.4)", "0 0 0 6px rgba(155,109,255,0)", "0 0 0 0 rgba(155,109,255,0.4)"],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#9b6dff",
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(155,109,255,0.7)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 2 }}>
            Daily Vibe Check
          </p>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#f0f0f5", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {vibeCheck.question}
          </p>
        </div>
        {hasVoted ? (
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.25 }}
            style={{ flexShrink: 0, color: "rgba(155,109,255,0.5)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </motion.div>
        ) : (
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>vote to see results</span>
        )}
      </motion.button>

      {/* Voting options (before vote) */}
      <AnimatePresence>
        {!hasVoted && (
          <motion.div
            key="options"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: "hidden", padding: "0 14px 14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
          >
            {vibeCheck.options.map((opt, i) => (
              <motion.button
                key={i}
                onClick={() => handleVote(i)}
                disabled={voting}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06, type: "spring", stiffness: 340, damping: 24 }}
                whileHover={{ scale: 1.04, background: "rgba(155,109,255,0.14)" }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: "14px 10px",
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  cursor: voting ? "wait" : "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  opacity: voting ? 0.6 : 1,
                  transition: "background 0.15s ease",
                }}
              >
                <span style={{ fontSize: 28 }}>{opt.emoji}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)", lineHeight: 1.2, textAlign: "center" }}>
                  {opt.label}
                </span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results (after vote, expanded) */}
      <AnimatePresence>
        {hasVoted && expanded && (
          <motion.div
            key="results"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.32 }}
            style={{ overflow: "hidden", padding: "0 14px 14px", display: "flex", flexDirection: "column", gap: 6 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, padding: "0 2px" }}>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {totalVotes} {totalVotes === 1 ? "vote" : "votes"} · anonymous
              </p>
              <p style={{ fontSize: 11, color: "rgba(155,109,255,0.6)", fontWeight: 600 }}>live</p>
            </div>
            {vibeCheck.options.map((opt, i) => {
              const count = Object.values(vibeCheck.responses).filter((v) => v === i).length;
              return (
                <ResultBar
                  key={i}
                  emoji={opt.emoji}
                  label={opt.label}
                  count={count}
                  total={totalVotes}
                  isMyVote={myVote === i}
                  delay={i * 0.07}
                />
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Post-vote compact state (collapsed) */}
      <AnimatePresence>
        {hasVoted && !expanded && (
          <motion.div
            key="compact-result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ padding: "0 18px 14px", display: "flex", alignItems: "center", gap: 8 }}
          >
            <span style={{ fontSize: 20 }}>{vibeCheck.options[myVote]?.emoji}</span>
            <span style={{ fontSize: 13, color: "rgba(155,109,255,0.7)", fontWeight: 600 }}>
              You voted "{vibeCheck.options[myVote]?.label}"
            </span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginLeft: "auto" }}>
              {totalVotes} total
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
