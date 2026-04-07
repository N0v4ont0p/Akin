"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GradientAvatar from "./GradientAvatar";
import {
  MatchData,
  getMatchTierProgress,
  formatRelativeTime,
  getUserProfile,
  UserProfile,
} from "@/lib/firestore";

// ─── Types ────────────────────────────────────────────────────────────────────

type MatchTier = "echo" | "recognition" | "identification" | "bond";

interface MatchTierCardProps {
  match: MatchData;
  myUserId: string;
  onOpenSyncModal?: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function seeded(s: number, max: number) {
  return ((s * 1664525 + 1013904223) & 0x7fffffff) % max;
}

function formatDuration(ms: number): string {
  if (ms <= 0) return "now";
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

// ─── Tier Config ──────────────────────────────────────────────────────────────

const TIER_CONFIG: Record<
  MatchTier,
  {
    label: string;
    icon: string;
    desc: string;
    color: string;
    bg: string;
    border: string;
    timerLabel: string;
    nextLabel: string;
  }
> = {
  echo: {
    label: "The Echo",
    icon: "🌑",
    desc: "Identity sealed. First clue drops at 16h.",
    color: "#89f7fe",
    bg: "rgba(137,247,254,0.07)",
    border: "rgba(137,247,254,0.2)",
    timerLabel: "first clue in",
    nextLabel: "First Clue",
  },
  recognition: {
    label: "First Clue",
    icon: "🌒",
    desc: "First hint unlocked — who fits?",
    color: "#00e5a0",
    bg: "rgba(0,229,160,0.07)",
    border: "rgba(0,229,160,0.22)",
    timerLabel: "second clue in",
    nextLabel: "Second Clue",
  },
  identification: {
    label: "Second Clue",
    icon: "🌓",
    desc: "Second hint revealed. Getting warmer...",
    color: "#fee140",
    bg: "rgba(254,225,64,0.07)",
    border: "rgba(254,225,64,0.2)",
    timerLabel: "reveal in",
    nextLabel: "Full Reveal",
  },
  bond: {
    label: "Akin Bond",
    icon: "✦",
    desc: "Full connection. No one else in this class.",
    color: "#9b6dff",
    bg: "rgba(155,109,255,0.09)",
    border: "rgba(155,109,255,0.28)",
    timerLabel: "",
    nextLabel: "",
  },
};

// ─── Live Progress Hook (4-stage) ─────────────────────────────────────────────

function useLiveProgress(match: MatchData) {
  function compute() {
    // Thresholds: 0-16h = echo, 16-32h = recognition, 32-48h = identification, 48h+ = bond
    const raw = getMatchTierProgress(match.createdAt);
    const ageMs = raw.ageMs;
    const h16 = 57_600_000;
    const h32 = 115_200_000;
    const h48 = 172_800_000;

    if (ageMs >= h48) {
      return { tier: "bond" as MatchTier, progressToNext: 1, msToNext: 0, ageMs };
    }
    if (ageMs >= h32) {
      return {
        tier: "identification" as MatchTier,
        progressToNext: (ageMs - h32) / (h48 - h32),
        msToNext: h48 - ageMs,
        ageMs,
      };
    }
    if (ageMs >= h16) {
      return {
        tier: "recognition" as MatchTier,
        progressToNext: (ageMs - h16) / (h32 - h16),
        msToNext: h32 - ageMs,
        ageMs,
      };
    }
    return {
      tier: "echo" as MatchTier,
      progressToNext: ageMs / h16,
      msToNext: h16 - ageMs,
      ageMs,
    };
  }

  const [data, setData] = useState(compute);
  useEffect(() => {
    const id = setInterval(() => setData(compute()), 30_000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match.createdAt]);
  return data;
}

// ─── Shatter Shards ───────────────────────────────────────────────────────────

const SHARDS = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  x: (seeded(i * 7 + 1, 240) - 120) * 1.8,
  y: (seeded(i * 13 + 3, 240) - 120) * 1.8,
  rotate: seeded(i * 17, 360),
  scale: 0.5 + seeded(i * 11, 10) / 20,
  size: 5 + seeded(i * 5, 7),
  color: i % 3 === 0 ? "#9b6dff" : i % 3 === 1 ? "#00e5a0" : "rgba(137,247,254,0.9)",
  delay: seeded(i * 19, 15) / 100,
}));

// ─── Avatar filter per tier ───────────────────────────────────────────────────

function getAvatarFilter(tier: MatchTier): string {
  switch (tier) {
    case "echo":
      return "blur(22px) brightness(0.4) saturate(0)";
    case "recognition":
      return "blur(10px) brightness(0.65) saturate(0.3)";
    case "identification":
      return "blur(2px) brightness(0.85) saturate(0.7)";
    case "bond":
      return "none";
  }
}

// ─── Hint Card content per tier ───────────────────────────────────────────────

function getHintContent(
  tier: MatchTier,
  theirProfile: UserProfile | null
): { label: string; content: string } {
  // Access extended facts via type assertion since UserProfile doesn't declare them yet
  const facts = (theirProfile as unknown as { facts?: Record<string, string> })?.facts;

  switch (tier) {
    case "echo":
      return {
        label: "Mystery",
        content: "Identity sealed. Your first clue unlocks at 16h.",
      };
    case "recognition":
      return {
        label: "Comfort Food",
        content: facts?.comfortFood ?? "Clue loading...",
      };
    case "identification": {
      const major = facts?.major;
      const campusVibe = facts?.campusVibe;
      if (major && campusVibe) return { label: "About Them", content: `${major} · ${campusVibe}` };
      if (major) return { label: "Their Major", content: major };
      if (campusVibe) return { label: "Campus Vibe", content: campusVibe };
      return { label: "Second Clue", content: "Another hint just dropped..." };
    }
    case "bond":
      return {
        label: "✦ Deep Fact",
        content: facts?.deepFact ?? "Ask them in person 🫂",
      };
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MatchTierCard({ match, myUserId, onOpenSyncModal }: MatchTierCardProps) {
  const isUser1 = match.user1Id === myUserId;
  const myGrad = (isUser1 ? match.user1Gradient : match.user2Gradient) ?? 0;
  const theirGrad = (isUser1 ? match.user2Gradient : match.user1Gradient) ?? 0;
  const myName = isUser1 ? match.user1Name : match.user2Name;
  const theirName = isUser1 ? match.user2Name : match.user1Name;
  const theirUserId = isUser1 ? match.user2Id : match.user1Id;
  const isAkin = (match as { isAkinMatch?: boolean }).isAkinMatch;

  const { tier, progressToNext, msToNext } = useLiveProgress(match);
  const cfg = TIER_CONFIG[tier];

  // Fetch their profile for ALL tiers (needed for hint cards)
  const [theirProfile, setTheirProfile] = useState<UserProfile | null>(null);
  useEffect(() => {
    getUserProfile(theirUserId).then((p) => setTheirProfile(p ?? null));
  }, [theirUserId]);

  // Bond bloom — fire once per match per session
  const bloomKey = `akin_bloomed_${match.matchId}`;
  const [showBloom, setShowBloom] = useState(false);
  const [bloomed, setBloomed] = useState(() => {
    if (typeof sessionStorage === "undefined") return true;
    return sessionStorage.getItem(bloomKey) === "1";
  });
  const prevTier = useRef<MatchTier>(tier);

  useEffect(() => {
    if (prevTier.current !== "bond" && tier === "bond" && !bloomed) {
      setShowBloom(true);
      sessionStorage?.setItem(bloomKey, "1");
      const t = setTimeout(() => {
        setShowBloom(false);
        setBloomed(true);
      }, 1800);
      return () => clearTimeout(t);
    }
    prevTier.current = tier;
  }, [tier, bloomed, bloomKey]);

  // Progress ring dimensions
  const R = 16;
  const circ = 2 * Math.PI * R;
  const ringOffset = circ * (1 - progressToNext);

  // Hint card data
  const hint = getHintContent(tier, theirProfile);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 280, damping: 26 }}
    >
      <motion.div
        whileHover={{ scale: 1.012, y: -2 }}
        whileTap={{ scale: 0.985 }}
        animate={{ boxShadow: [`0 0 0px ${cfg.color}00`, `0 0 24px ${cfg.color}22`, `0 0 0px ${cfg.color}00`] }}
        transition={{ type: "spring", stiffness: 380, damping: 28, boxShadow: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
        style={{
          borderRadius: 24,
          overflow: "hidden",
          background: cfg.bg,
          border: `1px solid ${cfg.border}`,
          position: "relative",
          cursor: "pointer",
        }}
      >
        {/* ── Top accent line */}
        <div
          style={{
            height: 3,
            background: `linear-gradient(90deg, transparent, ${cfg.color}, transparent)`,
          }}
        />

        <div style={{ padding: "20px 20px 18px" }}>
          {/* ── Tier badge row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 18,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* Progress ring (non-bond) */}
              {tier !== "bond" && (
                <svg
                  width="38"
                  height="38"
                  viewBox="0 0 38 38"
                  style={{ transform: "rotate(-90deg)", flexShrink: 0 }}
                >
                  <circle
                    cx="19"
                    cy="19"
                    r={R}
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="2.5"
                  />
                  <motion.circle
                    cx="19"
                    cy="19"
                    r={R}
                    fill="none"
                    stroke={cfg.color}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    animate={{ strokeDashoffset: ringOffset }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </svg>
              )}
              {tier === "bond" && (
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    filter: [
                      "drop-shadow(0 0 4px #9b6dff)",
                      "drop-shadow(0 0 12px #9b6dff)",
                      "drop-shadow(0 0 4px #9b6dff)",
                    ],
                  }}
                  transition={{ duration: 2.4, repeat: Infinity }}
                  style={{ fontSize: 26, lineHeight: 1 }}
                >
                  ✦
                </motion.div>
              )}

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                  {tier !== "bond" && (
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      style={{ fontSize: 12 }}
                    >
                      {cfg.icon}
                    </motion.span>
                  )}
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: cfg.color,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    {cfg.label}
                  </span>
                  {isAkin && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "rgba(155,109,255,0.8)",
                        background: "rgba(155,109,255,0.12)",
                        border: "1px solid rgba(155,109,255,0.22)",
                        borderRadius: 999,
                        padding: "1px 6px",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Akin
                    </span>
                  )}
                </div>
                <p
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.35)",
                    lineHeight: 1.3,
                    maxWidth: 200,
                  }}
                >
                  {cfg.desc}
                </p>
              </div>
            </div>

            {/* Right side: timer pill + info button */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
              {/* Timer pill */}
              {tier !== "bond" && (
                <div
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 10,
                    padding: "5px 10px",
                    textAlign: "center",
                    flexShrink: 0,
                  }}
                >
                  <p
                    style={{
                      fontSize: 10,
                      color: "rgba(255,255,255,0.3)",
                      fontWeight: 600,
                      marginBottom: 1,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {cfg.timerLabel}
                  </p>
                  <p
                    style={{
                      fontSize: 16,
                      fontWeight: 800,
                      color: cfg.color,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {formatDuration(msToNext)}
                  </p>
                </div>
              )}

              {/* Info button */}
              {onOpenSyncModal && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenSyncModal();
                  }}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.14)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    padding: 0,
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "rgba(255,255,255,0.45)",
                      lineHeight: 1,
                    }}
                  >
                    i
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* ── Avatars */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 16,
              padding: "16px",
              borderRadius: 16,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Connection glow */}
            <motion.div
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute",
                inset: 0,
                background: `radial-gradient(ellipse 60% 80% at 50% 50%, ${cfg.bg}, transparent)`,
                pointerEvents: "none",
              }}
            />

            {/* My avatar */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                position: "relative",
                zIndex: 1,
              }}
            >
              <motion.div
                animate={{
                  boxShadow: [
                    `0 0 0 0 ${cfg.color}00`,
                    `0 0 0 6px ${cfg.color}22`,
                    `0 0 0 0 ${cfg.color}00`,
                  ],
                }}
                transition={{ duration: 2.4, repeat: Infinity }}
                style={{ borderRadius: "50%" }}
              >
                <GradientAvatar
                  gradient={myGrad}
                  name={myName}
                  size={58}
                  border={`2.5px solid ${cfg.color}66`}
                />
              </motion.div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.65)",
                  maxWidth: 60,
                  textAlign: "center",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                You
              </span>
            </div>

            {/* Center connector */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                position: "relative",
                zIndex: 1,
              }}
            >
              <motion.div
                animate={
                  tier === "bond"
                    ? { scale: [1, 1.3, 1], rotate: [0, 15, -15, 0] }
                    : { scale: [1, 1.1, 1] }
                }
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  fontSize: tier === "bond" ? 20 : 16,
                  color: cfg.color,
                  filter: `drop-shadow(0 0 8px ${cfg.color})`,
                }}
              >
                {tier === "bond" ? "✦" : "·····"}
              </motion.div>
              {/* Tier progress bar */}
              {tier !== "bond" && (
                <div
                  style={{
                    width: "100%",
                    height: 3,
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.08)",
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressToNext * 100}%` }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                    style={{ height: "100%", borderRadius: 999, background: cfg.color }}
                  />
                </div>
              )}
            </div>

            {/* Their avatar */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                position: "relative",
                zIndex: 1,
              }}
            >
              <motion.div
                animate={{
                  boxShadow: [
                    `0 0 0 0 ${cfg.color}00`,
                    `0 0 0 6px ${cfg.color}22`,
                    `0 0 0 0 ${cfg.color}00`,
                  ],
                }}
                transition={{ duration: 2.4, delay: 0.6, repeat: Infinity }}
                style={{ borderRadius: "50%" }}
              >
                <div style={{ position: "relative" }}>
                  <GradientAvatar
                    gradient={theirGrad}
                    name={theirName}
                    size={58}
                    border={`2.5px solid ${cfg.color}66`}
                    style={{
                      filter: getAvatarFilter(tier),
                      transition: "filter 1.8s ease, opacity 1.2s ease",
                    }}
                  />
                  {/* Frost overlay icon for echo stage */}
                  {tier === "echo" && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(10,8,26,0.3)",
                      }}
                    >
                      <motion.span
                        animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{
                          fontSize: 18,
                          filter: "drop-shadow(0 0 6px rgba(137,247,254,0.9))",
                        }}
                      >
                        ❄️
                      </motion.span>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Their name label */}
              {tier === "bond" ? (
                // Bond: orchid glow name
                <motion.span
                  animate={{ opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 2.2, repeat: Infinity }}
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#c084fc",
                    maxWidth: 60,
                    textAlign: "center",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    textShadow: "0 0 8px rgba(192,132,252,0.6)",
                  }}
                >
                  {theirName}
                </motion.span>
              ) : tier === "identification" ? (
                // Identification: liquid shimmer
                <motion.span
                  animate={{
                    backgroundPosition: ["200% center", "-200% center"],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  style={{
                    background:
                      "linear-gradient(90deg, #f0f0f5 20%, #9b6dff 40%, #00e5a0 60%, #f0f0f5 80%)",
                    backgroundSize: "200% auto",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    fontSize: 11,
                    fontWeight: 700,
                    maxWidth: 60,
                    textAlign: "center",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    display: "block",
                  }}
                >
                  {theirName}
                </motion.span>
              ) : (
                // Echo / Recognition: hidden
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.3)",
                    maxWidth: 60,
                    textAlign: "center",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    filter: tier === "echo" ? "blur(4px)" : "blur(2px)",
                    transition: "filter 1.8s ease, color 1.4s ease",
                    userSelect: "none",
                  }}
                >
                  ???
                </span>
              )}
            </div>
          </div>

          {/* ── Hint Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={tier}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ delay: 0.15 }}
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                background: tier === "identification"
                  ? "rgba(254,225,64,0.05)"
                  : tier === "bond"
                  ? "rgba(155,109,255,0.09)"
                  : "rgba(255,255,255,0.04)",
                border: tier === "identification"
                  ? "1px solid rgba(254,225,64,0.18)"
                  : tier === "bond"
                  ? "1px solid rgba(155,109,255,0.2)"
                  : "1px solid rgba(255,255,255,0.08)",
                marginBottom: 14,
                boxShadow: tier === "identification"
                  ? "0 0 18px rgba(254,225,64,0.08)"
                  : "none",
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.32)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontWeight: 700,
                  marginBottom: 4,
                }}
              >
                {hint.label}
              </p>
              {tier !== "echo" ? (
                <motion.p
                  animate={{ opacity: [0.7, 1, 0.7], color: [cfg.color + "99", cfg.color + "cc", cfg.color + "99"] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    fontSize: 13,
                    lineHeight: 1.5,
                    fontStyle: "italic",
                    textShadow: `0 0 12px ${cfg.color}44`,
                  }}
                >
                  {hint.content}
                </motion.p>
              ) : (
                <p
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.6)",
                    lineHeight: 1.5,
                    fontStyle: "italic",
                  }}
                >
                  {hint.content}
                </p>
              )}
            </motion.div>
          </AnimatePresence>

          {/* ── Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.22)",
                fontWeight: 500,
              }}
            >
              {formatRelativeTime(match.createdAt)}
            </span>

            {tier !== "bond" ? (
              <span style={{ fontSize: 11, color: cfg.color, fontWeight: 600 }}>
                → {cfg.nextLabel} in {formatDuration(msToNext)}
              </span>
            ) : (
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2.2, repeat: Infinity }}
                style={{ fontSize: 12, color: "#9b6dff", fontWeight: 700 }}
              >
                Full bond ✦
              </motion.span>
            )}
          </div>
        </div>

        {/* ── Shatter-and-Bloom overlay (fires on transition to bond) */}
        <AnimatePresence>
          {showBloom && (
            <motion.div
              key="bloom"
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 10,
                pointerEvents: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                borderRadius: 24,
              }}
            >
              {/* Frost peel */}
              <motion.div
                initial={{ clipPath: "circle(100% at 50% 50%)" }}
                animate={{ clipPath: "circle(0% at 50% 50%)" }}
                transition={{ duration: 1.1, ease: [0.34, 1.56, 0.64, 1] }}
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(10,8,26,0.82)",
                  backdropFilter: "blur(16px)",
                  borderRadius: 24,
                }}
              />
              {/* Shards */}
              {SHARDS.map((s) => (
                <motion.div
                  key={s.id}
                  initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                  animate={{
                    x: s.x,
                    y: s.y,
                    scale: [0, s.scale, 0],
                    rotate: s.rotate,
                    opacity: [0, 1, 0],
                  }}
                  transition={{ duration: 0.9, delay: s.delay, ease: "easeOut" }}
                  style={{
                    position: "absolute",
                    width: s.size,
                    height: s.size,
                    borderRadius: s.id % 3 === 0 ? 2 : "50%",
                    background: s.color,
                    boxShadow: `0 0 ${s.size * 2}px ${s.color}`,
                  }}
                />
              ))}
              {/* Central glow burst */}
              <motion.div
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 4, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(155,109,255,0.9), rgba(0,229,160,0.4), transparent 70%)",
                  filter: "blur(6px)",
                }}
              />
              {/* "Akin Bond" reveal text */}
              <motion.p
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: [0, 1, 1, 0], scale: [0.6, 1.1, 1, 0.9] }}
                transition={{ duration: 1.5, times: [0, 0.2, 0.7, 1] }}
                style={{
                  position: "absolute",
                  fontSize: 22,
                  fontWeight: 900,
                  background: "linear-gradient(135deg, #9b6dff, #00e5a0)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  filter: "drop-shadow(0 0 10px rgba(155,109,255,0.8))",
                  letterSpacing: "-0.02em",
                  zIndex: 5,
                }}
              >
                Akin Bond ✦
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
