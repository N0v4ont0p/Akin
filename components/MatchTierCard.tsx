"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GradientAvatar from "./GradientAvatar";
import {
  MatchData,
  MatchTier,
  getMatchTierProgress,
  formatRelativeTime,
  GRADIENTS,
  getUserProfile,
  UserProfile,
} from "@/lib/firestore";

interface MatchTierCardProps {
  match: MatchData;
  myUserId: string;
}

// Seeded deterministic shard placement
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

const TIER_CONFIG: Record<
  MatchTier,
  { label: string; icon: string; desc: string; color: string; bg: string; border: string }
> = {
  match: {
    label: "Syncing",
    icon: "🌱",
    desc: "You matched! Your connection reveals in stages over 72 hours.",
    color: "#89f7fe",
    bg: "rgba(137,247,254,0.07)",
    border: "rgba(137,247,254,0.2)",
  },
  recognition: {
    label: "Warming Up",
    icon: "🌤",
    desc: "Getting there — Akin Bond unlocks in a few hours.",
    color: "#00e5a0",
    bg: "rgba(0,229,160,0.07)",
    border: "rgba(0,229,160,0.22)",
  },
  bond: {
    label: "Akin Bond",
    icon: "✦",
    desc: "Full connection. You chose each other — no one else.",
    color: "#9b6dff",
    bg: "rgba(155,109,255,0.09)",
    border: "rgba(155,109,255,0.28)",
  },
};

function useLiveProgress(match: MatchData) {
  const [data, setData] = useState(() => getMatchTierProgress(match.createdAt));
  useEffect(() => {
    const id = setInterval(() => setData(getMatchTierProgress(match.createdAt)), 30_000);
    return () => clearInterval(id);
  }, [match.createdAt]);
  return data;
}

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

export default function MatchTierCard({ match, myUserId }: MatchTierCardProps) {
  const isUser1 = match.user1Id === myUserId;
  const myGrad = (isUser1 ? match.user1Gradient : match.user2Gradient) ?? 0;
  const theirGrad = (isUser1 ? match.user2Gradient : match.user1Gradient) ?? 0;
  const myName = isUser1 ? match.user1Name : match.user2Name;
  const theirName = isUser1 ? match.user2Name : match.user1Name;
  const isAkin = (match as { isAkinMatch?: boolean }).isAkinMatch;

  const { tier, progressToNext, msToNext } = useLiveProgress(match);
  const cfg = TIER_CONFIG[tier];

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
      const t = setTimeout(() => { setShowBloom(false); setBloomed(true); }, 1800);
      return () => clearTimeout(t);
    }
    prevTier.current = tier;
  }, [tier, bloomed, bloomKey]);

  // Fetch other user's shared secret at bond tier
  const theirUserId = isUser1 ? match.user2Id : match.user1Id;
  const [theirProfile, setTheirProfile] = useState<UserProfile | null>(null);
  useEffect(() => {
    if (tier !== "bond") return;
    getUserProfile(theirUserId).then((p) => setTheirProfile(p ?? null));
  }, [tier, theirUserId]);

  // Progress ring
  const R = 16;
  const circ = 2 * Math.PI * R;
  const ringOffset = circ * (1 - progressToNext);

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
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        style={{
          borderRadius: 24,
          overflow: "hidden",
          background: cfg.bg,
          border: `1px solid ${cfg.border}`,
          boxShadow: `0 8px 32px ${cfg.bg}, 0 2px 8px rgba(0,0,0,0.35)`,
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
                  <circle cx="19" cy="19" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" />
                  <motion.circle
                    cx="19" cy="19" r={R}
                    fill="none"
                    stroke={cfg.color}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    animate={{ strokeDashoffset: ringOffset }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                  {/* Center text in ring */}
                </svg>
              )}
              {tier === "bond" && (
                <motion.div
                  animate={{ scale: [1, 1.3, 1], filter: ["drop-shadow(0 0 4px #9b6dff)", "drop-shadow(0 0 12px #9b6dff)", "drop-shadow(0 0 4px #9b6dff)"] }}
                  transition={{ duration: 2.4, repeat: Infinity }}
                  style={{ fontSize: 26, lineHeight: 1 }}
                >
                  ✦
                </motion.div>
              )}

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: cfg.color,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    {tier !== "bond" ? cfg.icon + " " : ""}{cfg.label}
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
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.3, maxWidth: 200 }}>
                  {cfg.desc}
                </p>
              </div>
            </div>

            {/* Time remaining badge */}
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
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 600, marginBottom: 1, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {tier === "match" ? "to reveal" : "to bond"}
                </p>
                <p style={{ fontSize: 14, fontWeight: 800, color: cfg.color, letterSpacing: "-0.01em" }}>
                  {formatDuration(msToNext)}
                </p>
              </div>
            )}
          </div>

          {/* ── Avatars — side by side, always clearly visible */}
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
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, position: "relative", zIndex: 1 }}>
              <motion.div
                animate={{ boxShadow: [`0 0 0 0 ${cfg.color}00`, `0 0 0 6px ${cfg.color}22`, `0 0 0 0 ${cfg.color}00`] }}
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
              <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.65)", maxWidth: 60, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                You
              </span>
            </div>

            {/* Center connector */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, position: "relative", zIndex: 1 }}>
              <motion.div
                animate={tier === "bond"
                  ? { scale: [1, 1.3, 1], rotate: [0, 15, -15, 0] }
                  : { scale: [1, 1.1, 1] }
                }
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                style={{ fontSize: tier === "bond" ? 20 : 16, color: cfg.color, filter: `drop-shadow(0 0 8px ${cfg.color})` }}
              >
                {tier === "bond" ? "✦" : "·····"}
              </motion.div>
              {/* Tier progress bar */}
              {tier !== "bond" && (
                <div style={{ width: "100%", height: 3, borderRadius: 999, background: "rgba(255,255,255,0.08)" }}>
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
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, position: "relative", zIndex: 1 }}>
              <motion.div
                animate={{ boxShadow: [`0 0 0 0 ${cfg.color}00`, `0 0 0 6px ${cfg.color}22`, `0 0 0 0 ${cfg.color}00`] }}
                transition={{ duration: 2.4, delay: 0.6, repeat: Infinity }}
                style={{ borderRadius: "50%" }}
              >
                {/* Frost overlay for tier 0 */}
                <div style={{ position: "relative" }}>
                  <GradientAvatar
                    gradient={theirGrad}
                    name={theirName}
                    size={58}
                    border={`2.5px solid ${cfg.color}66`}
                    style={{
                      filter: tier === "match" ? "blur(5px) brightness(0.6)" : tier === "recognition" ? "blur(1.5px) brightness(0.85)" : "none",
                      transition: "filter 1.4s ease",
                    }}
                  />
                  {tier === "match" && (
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
                        style={{ fontSize: 18, filter: "drop-shadow(0 0 6px rgba(137,247,254,0.9))" }}
                      >
                        ❄️
                      </motion.span>
                    </div>
                  )}
                </div>
              </motion.div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: tier === "match" ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.65)",
                  maxWidth: 60,
                  textAlign: "center",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  filter: tier === "match" ? "blur(3px)" : "none",
                  transition: "filter 1.4s ease, color 1.4s ease",
                  userSelect: tier === "match" ? "none" : "auto",
                }}
              >
                {theirName}
              </span>
            </div>
          </div>

          {/* ── Bond: Shared Secret */}
          <AnimatePresence>
            {tier === "bond" && bloomed && (
              <motion.div
                key="secret"
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 280, damping: 24 }}
                style={{
                  marginBottom: 14,
                  padding: "12px 15px",
                  borderRadius: 14,
                  background: "rgba(155,109,255,0.09)",
                  border: "1px solid rgba(155,109,255,0.2)",
                }}
              >
                <p style={{ fontSize: 11, fontWeight: 800, color: "rgba(155,109,255,0.65)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>
                  ✦ Shared Secret
                </p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.55, fontStyle: "italic" }}>
                  {theirProfile?.sharedSecret
                    ? `"${theirProfile.sharedSecret}"`
                    : "They haven't shared their secret yet. Ask them in person."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Footer */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.22)", fontWeight: 500 }}>
              {formatRelativeTime(match.createdAt)}
            </span>
            {tier !== "bond" && (
              <span style={{ fontSize: 11, color: cfg.color, fontWeight: 600 }}>
                {tier === "match" ? "→ Warming Up in " : "→ Akin Bond in "}{formatDuration(msToNext)}
              </span>
            )}
            {tier === "bond" && (
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

        {/* ── Shatter-and-Bloom overlay */}
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
                  animate={{ x: s.x, y: s.y, scale: [0, s.scale, 0], rotate: s.rotate, opacity: [0, 1, 0] }}
                  transition={{ duration: 0.9, delay: s.delay, ease: "easeOut" }}
                  style={{ position: "absolute", width: s.size, height: s.size, borderRadius: s.id % 3 === 0 ? 2 : "50%", background: s.color, boxShadow: `0 0 ${s.size * 2}px ${s.color}` }}
                />
              ))}
              {/* Central glow burst */}
              <motion.div
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 4, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{ width: 60, height: 60, borderRadius: "50%", background: "radial-gradient(circle, rgba(155,109,255,0.9), rgba(0,229,160,0.4), transparent 70%)", filter: "blur(6px)" }}
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
