"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timestamp } from "firebase/firestore";

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: string; // "match" | "recognition" | "bond"
  matchCreatedAt: Timestamp | null;
}

interface TimelineNode {
  hour: number;
  label: string;
  icon: string;
  color: string;
  reveals: string;
  hint: string;
  tierKey: string;
}

const TIMELINE: TimelineNode[] = [
  {
    hour: 0,
    label: "The Echo",
    icon: "🌑",
    color: "#89f7fe",
    reveals: "Connection confirmed",
    hint: "Comfort food clue",
    tierKey: "echo",
  },
  {
    hour: 24,
    label: "Recognition",
    icon: "🌒",
    color: "#00e5a0",
    reveals: "Major & vibe revealed",
    hint: "You know their vibe",
    tierKey: "recognition",
  },
  {
    hour: 48,
    label: "Identification",
    icon: "🌓",
    color: "#fee140",
    reveals: "Their name is revealed",
    hint: "Liquid shimmer unlock",
    tierKey: "identification",
  },
  {
    hour: 72,
    label: "Akin Bond",
    icon: "✦",
    color: "#9b6dff",
    reveals: "Deep fact + full photo",
    hint: "Full connection",
    tierKey: "bond",
  },
];

// Map tier names to numeric indices for comparison
const TIER_ORDER: Record<string, number> = {
  echo: 0,
  recognition: 1,
  identification: 2,
  bond: 3,
};

function getElapsedHours(matchCreatedAt: Timestamp | null): number {
  if (!matchCreatedAt) return 0;
  const ms = Date.now() - matchCreatedAt.toMillis();
  return Math.max(0, ms / (1000 * 60 * 60));
}

export default function SyncModal({
  isOpen,
  onClose,
  currentTier,
  matchCreatedAt,
}: SyncModalProps) {
  const elapsedHours = getElapsedHours(matchCreatedAt);
  const currentTierIndex = TIER_ORDER[currentTier] ?? 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="sync-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px 16px",
            backdropFilter: "blur(32px) saturate(1.5)",
            WebkitBackdropFilter: "blur(32px) saturate(1.5)",
            background: "rgba(7,7,15,0.85)",
          }}
        >
          {/* Modal card */}
          <motion.div
            key="sync-modal-card"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 380,
              width: "90%",
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(40px)",
              WebkitBackdropFilter: "blur(40px)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 24,
              padding: "24px 20px 28px",
              position: "relative",
              boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(155,109,255,0.08)",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24,
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: "#f0f0f5",
                    letterSpacing: "-0.01em",
                    marginBottom: 2,
                  }}
                >
                  Reveal Timeline
                </p>
                <p style={{ fontSize: 12, color: "rgba(240,240,245,0.35)" }}>
                  {matchCreatedAt
                    ? `${Math.floor(elapsedHours)}h into your connection`
                    : "4-stage Akin reveal"}
                </p>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "rgba(240,240,245,0.5)",
                  fontSize: 14,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                ✕
              </button>
            </div>

            {/* Timeline nodes */}
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {TIMELINE.map((node, idx) => {
                const isPast = elapsedHours >= node.hour;
                const isCurrent =
                  currentTierIndex === TIER_ORDER[node.tierKey] ||
                  (node.tierKey === currentTier);
                const isLast = idx === TIMELINE.length - 1;

                return (
                  <motion.div
                    key={node.tierKey}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08, type: "spring", stiffness: 320, damping: 28 }}
                    style={{ display: "flex", gap: 16, position: "relative" }}
                  >
                    {/* Left column: dot + vertical line */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        flexShrink: 0,
                        width: 20,
                        paddingTop: 2,
                      }}
                    >
                      {/* Dot */}
                      <motion.div
                        animate={
                          isCurrent
                            ? {
                                boxShadow: [
                                  `0 0 0 0 ${node.color}00`,
                                  `0 0 0 5px ${node.color}33`,
                                  `0 0 0 0 ${node.color}00`,
                                ],
                              }
                            : {}
                        }
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          background: isPast ? node.color : "transparent",
                          border: isPast
                            ? `2px solid ${node.color}`
                            : "2px solid rgba(255,255,255,0.15)",
                          flexShrink: 0,
                          boxShadow: isPast ? `0 0 10px ${node.color}55` : "none",
                          transition: "background 0.4s ease, border-color 0.4s ease",
                        }}
                      />
                      {/* Connector line */}
                      {!isLast && (
                        <div
                          style={{
                            flex: 1,
                            width: 2,
                            minHeight: 36,
                            background: isPast
                              ? `linear-gradient(to bottom, ${node.color}66, ${TIMELINE[idx + 1].color}33)`
                              : "rgba(255,255,255,0.07)",
                            marginTop: 4,
                            marginBottom: 4,
                            borderRadius: 999,
                            transition: "background 0.4s ease",
                          }}
                        />
                      )}
                    </div>

                    {/* Right column: content */}
                    <div
                      style={{
                        flex: 1,
                        paddingBottom: isLast ? 0 : 20,
                        paddingTop: 0,
                      }}
                    >
                      <motion.div
                        animate={
                          isCurrent
                            ? {
                                boxShadow: [
                                  "0 0 0 1px rgba(155,109,255,0.12)",
                                  "0 0 20px rgba(155,109,255,0.18)",
                                  "0 0 0 1px rgba(155,109,255,0.12)",
                                ],
                              }
                            : {}
                        }
                        transition={{ duration: 2.5, repeat: Infinity }}
                        style={{
                          borderRadius: 14,
                          padding: "10px 14px",
                          background: isCurrent
                            ? `rgba(155,109,255,0.08)`
                            : isPast
                            ? "rgba(255,255,255,0.03)"
                            : "transparent",
                          border: isCurrent
                            ? "1px solid rgba(155,109,255,0.22)"
                            : isPast
                            ? "1px solid rgba(255,255,255,0.06)"
                            : "1px solid transparent",
                          transition: "background 0.4s ease, border-color 0.4s ease",
                        }}
                      >
                        {/* Stage header */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 5,
                          }}
                        >
                          <span
                            style={{
                              fontSize: node.icon === "✦" ? 13 : 15,
                              lineHeight: 1,
                              filter: isPast
                                ? `drop-shadow(0 0 6px ${node.color}88)`
                                : "none",
                            }}
                          >
                            {node.icon}
                          </span>
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 800,
                              color: isPast ? node.color : "rgba(240,240,245,0.3)",
                              letterSpacing: "0.02em",
                              transition: "color 0.4s ease",
                            }}
                          >
                            {node.label}
                          </span>
                          <span
                            style={{
                              marginLeft: "auto",
                              fontSize: 10,
                              fontWeight: 600,
                              color: "rgba(240,240,245,0.25)",
                              letterSpacing: "0.04em",
                            }}
                          >
                            {node.hour === 0 ? "Now" : `+${node.hour}h`}
                          </span>
                        </div>

                        {/* Reveals row */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 8,
                          }}
                        >
                          <p
                            style={{
                              fontSize: 12,
                              color: isPast
                                ? "rgba(240,240,245,0.6)"
                                : "rgba(240,240,245,0.22)",
                              lineHeight: 1.4,
                              transition: "color 0.4s ease",
                            }}
                          >
                            {node.reveals}
                          </p>
                          <span
                            style={{
                              fontSize: 10,
                              color: isPast ? node.color : "rgba(240,240,245,0.18)",
                              fontStyle: "italic",
                              whiteSpace: "nowrap",
                              flexShrink: 0,
                              transition: "color 0.4s ease",
                            }}
                          >
                            {node.hint}
                          </span>
                        </div>

                        {/* Current stage badge */}
                        {isCurrent && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{
                              marginTop: 7,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              background: "rgba(155,109,255,0.12)",
                              border: "1px solid rgba(155,109,255,0.25)",
                              borderRadius: 999,
                              padding: "2px 8px",
                            }}
                          >
                            <motion.div
                              animate={{ opacity: [1, 0.3, 1] }}
                              transition={{ duration: 1.2, repeat: Infinity }}
                              style={{
                                width: 5,
                                height: 5,
                                borderRadius: "50%",
                                background: "#9b6dff",
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                color: "rgba(155,109,255,0.85)",
                                letterSpacing: "0.04em",
                                textTransform: "uppercase",
                              }}
                            >
                              You are here
                            </span>
                          </motion.div>
                        )}
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Footer note */}
            <p
              style={{
                marginTop: 20,
                fontSize: 11,
                color: "rgba(240,240,245,0.2)",
                textAlign: "center",
                lineHeight: 1.5,
              }}
            >
              Reveals are time-gated. Both picks must be mutual to unlock stages.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
