"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GradientAvatar from "./GradientAvatar";
import { MatchData, MatchTier, getMatchTierProgress, formatRelativeTime, GRADIENTS, getUserProfile, UserProfile } from "@/lib/firestore";

interface MatchTierCardProps {
  match: MatchData;
  myUserId: string;
}

// Seeded deterministic placement for shatter shards
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

const TIER_META: Record<MatchTier, { label: string; sublabel: string; color: string; glowColor: string }> = {
  match: {
    label: "Syncing",
    sublabel: "Connection forming — check back soon",
    color: "rgba(137,247,254,0.85)",
    glowColor: "rgba(137,247,254,0.25)",
  },
  recognition: {
    label: "Recognised",
    sublabel: "Bond deepening — almost there",
    color: "rgba(0,229,160,0.85)",
    glowColor: "rgba(0,229,160,0.22)",
  },
  bond: {
    label: "Akin Bond ✦",
    sublabel: "Full connection unlocked",
    color: "rgba(155,109,255,0.9)",
    glowColor: "rgba(155,109,255,0.35)",
  },
};

// Frost blur per tier
const FROST_BLUR: Record<MatchTier, number> = { match: 14, recognition: 4, bond: 0 };
const FROST_OPACITY: Record<MatchTier, number> = { match: 0.78, recognition: 0.35, bond: 0 };

// Shard positions for the bloom animation
function useShards(count: number) {
  return useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: (seeded(i * 7 + 1, 200) - 100) * 2.2,
        y: (seeded(i * 13 + 3, 200) - 100) * 2.2,
        rotate: seeded(i * 17, 360),
        scale: 0.4 + seeded(i * 11, 12) / 20,
        size: 4 + seeded(i * 5, 8),
        color: i % 3 === 0 ? "#9b6dff" : i % 3 === 1 ? "#00e5a0" : "rgba(137,247,254,0.9)",
        delay: seeded(i * 19, 18) / 100,
      })),
    [count]
  );
}

function gradientGlow(index: number): string {
  const glows = ["rgba(102,126,234,0.4)", "rgba(240,147,251,0.4)", "rgba(79,172,254,0.4)", "rgba(67,233,123,0.4)", "rgba(250,112,154,0.4)", "rgba(161,140,209,0.4)", "rgba(252,203,144,0.4)", "rgba(224,195,252,0.4)", "rgba(246,211,101,0.4)", "rgba(150,251,196,0.4)", "rgba(137,247,254,0.4)", "rgba(253,219,146,0.4)"];
  return glows[index % glows.length];
}

// Countdown hook (refreshes every 60s for tier progress, 1s for display)
function useLiveProgress(match: MatchData) {
  const [data, setData] = useState(() => getMatchTierProgress(match.createdAt));
  useEffect(() => {
    const id = setInterval(() => setData(getMatchTierProgress(match.createdAt)), 60_000);
    return () => clearInterval(id);
  }, [match.createdAt]);
  return data;
}

export default function MatchTierCard({ match, myUserId }: MatchTierCardProps) {
  const isUser1 = match.user1Id === myUserId;
  const myGrad = (isUser1 ? match.user1Gradient : match.user2Gradient) ?? 0;
  const theirGrad = (isUser1 ? match.user2Gradient : match.user1Gradient) ?? 0;
  const myName = isUser1 ? match.user1Name : match.user2Name;
  const theirName = isUser1 ? match.user2Name : match.user1Name;
  const isAkin = (match as { isAkinMatch?: boolean }).isAkinMatch;

  const { tier, progressToNext, msToNext } = useLiveProgress(match);
  const meta = TIER_META[tier];
  const shards = useShards(16);

  // Track whether the Bond animation has fired (only once per session per match)
  const bloomKey = `akin_bloomed_${match.matchId}`;
  const [hasBloomed, setHasBloomed] = useState(() => {
    if (typeof sessionStorage === "undefined") return tier === "bond";
    return sessionStorage.getItem(bloomKey) === "1" || tier !== "bond";
  });
  const prevTier = useRef<MatchTier>(tier);
  const [showingBloom, setShowingBloom] = useState(false);

  // Other user's profile (fetched at bond tier for shared secret)
  const [theirProfile, setTheirProfile] = useState<UserProfile | null>(null);
  const theirUserId = isUser1 ? match.user2Id : match.user1Id;

  useEffect(() => {
    if (tier !== "bond") return;
    getUserProfile(theirUserId).then((p) => setTheirProfile(p ?? null));
  }, [tier, theirUserId]);

  // Trigger bloom animation when tier first reaches "bond"
  useEffect(() => {
    if (prevTier.current !== "bond" && tier === "bond") {
      if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(bloomKey) !== "1") {
        setShowingBloom(true);
        sessionStorage.setItem(bloomKey, "1");
        setTimeout(() => {
          setShowingBloom(false);
          setHasBloomed(true);
        }, 1800);
      }
    }
    prevTier.current = tier;
  }, [tier, bloomKey]);

  const circumference = 2 * Math.PI * 18;
  const ringOffset = circumference * (1 - progressToNext);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 280, damping: 26 }}
    >
      <motion.div
        whileHover={{ scale: 1.01, y: -2 }}
        whileTap={{ scale: 0.985 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        style={{
          borderRadius: 28,
          overflow: "hidden",
          position: "relative",
          boxShadow: `0 8px 40px ${meta.glowColor}, 0 2px 12px rgba(0,0,0,0.4)`,
          cursor: "pointer",
        }}
      >
        {/* ── Hero gradient banner ─────────────────────────────────── */}
        <div style={{ height: 90, position: "relative", overflow: "hidden" }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: GRADIENTS[myGrad],
              opacity: 0.55,
              clipPath: "polygon(0 0, 60% 0, 40% 100%, 0 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: GRADIENTS[theirGrad],
              opacity: 0.55,
              clipPath: "polygon(40% 0, 100% 0, 100% 100%, 60% 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(90deg, transparent 20%, rgba(10,8,26,0.5) 50%, transparent 80%)",
            }}
          />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 48, background: "linear-gradient(to bottom, transparent, rgba(10,8,26,0.95))" }} />

          {/* Tier badge */}
          <motion.div
            key={tier}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            style={{
              position: "absolute",
              top: 12,
              right: 14,
              background: "rgba(10,8,26,0.78)",
              border: `1px solid ${meta.color}`,
              borderRadius: 999,
              padding: "4px 10px",
              display: "flex",
              alignItems: "center",
              gap: 6,
              backdropFilter: "blur(8px)",
            }}
          >
            {/* Tier progress ring */}
            {tier !== "bond" && (
              <svg width="22" height="22" viewBox="0 0 44 44" style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
                <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                <motion.circle
                  cx="22" cy="22" r="18"
                  fill="none"
                  stroke={meta.color}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  animate={{ strokeDashoffset: ringOffset }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </svg>
            )}
            {tier === "bond" && (
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ fontSize: 12, color: meta.color }}
              >
                ✦
              </motion.span>
            )}
            <span style={{ fontSize: 11, fontWeight: 700, color: meta.color, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              {meta.label}
            </span>
          </motion.div>

          {/* Akin badge */}
          {isAkin && (
            <div
              style={{
                position: "absolute",
                top: 12,
                left: 14,
                background: "rgba(10,8,26,0.78)",
                border: "1px solid rgba(155,109,255,0.45)",
                borderRadius: 999,
                padding: "4px 10px",
                backdropFilter: "blur(8px)",
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(155,109,255,0.9)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Akin
              </span>
            </div>
          )}
        </div>

        {/* ── Card body ─────────────────────────────────────────────── */}
        <div
          style={{
            background: tier === "bond" ? "rgba(16,12,36,0.97)" : "rgba(10,8,26,0.97)",
            border: `1px solid ${tier === "bond" ? "rgba(155,109,255,0.2)" : "rgba(255,255,255,0.07)"}`,
            borderTop: "none",
            borderRadius: "0 0 28px 28px",
            padding: "0 22px 22px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* ── Overlapping avatars with frost ──────────────────────── */}
          <div style={{ display: "flex", justifyContent: "center", marginTop: -40, marginBottom: 14, position: "relative", zIndex: 3 }}>
            {/* Connection glow */}
            <motion.div
              animate={{ opacity: [0.3, 0.7, 0.3], scaleX: [0.85, 1.25, 0.85] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute",
                width: 130,
                height: 50,
                borderRadius: "50%",
                background: `radial-gradient(ellipse, ${meta.glowColor}, transparent 70%)`,
                filter: "blur(10px)",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
              }}
            />

            {/* My avatar */}
            <div style={{ position: "relative", zIndex: 2 }}>
              <div
                style={{
                  filter: tier === "match" ? `blur(${FROST_BLUR.match}px)` : tier === "recognition" ? `blur(${FROST_BLUR.recognition}px)` : "none",
                  transition: "filter 1.2s ease",
                  borderRadius: "50%",
                }}
              >
                <GradientAvatar
                  gradient={myGrad}
                  name={myName}
                  size={68}
                  border={`3px solid ${tier === "bond" ? "rgba(155,109,255,0.6)" : "rgba(255,255,255,0.15)"}`}
                  style={{ boxShadow: `0 8px 28px ${gradientGlow(myGrad)}` }}
                />
              </div>
              {/* Frost overlay */}
              {tier !== "bond" && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    background: `rgba(10,8,26,${FROST_OPACITY[tier]})`,
                    backdropFilter: tier === "match" ? "blur(4px)" : "none",
                    transition: "all 1.2s ease",
                    pointerEvents: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {tier === "match" && (
                    <motion.span
                      animate={{ opacity: [0.4, 0.9, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{ fontSize: 16, filter: "drop-shadow(0 0 4px rgba(137,247,254,0.8))" }}
                    >
                      ❄️
                    </motion.span>
                  )}
                </div>
              )}
            </div>

            {/* Their avatar */}
            <div style={{ marginLeft: -18, position: "relative", zIndex: 1 }}>
              <div
                style={{
                  filter: tier === "match" ? `blur(${FROST_BLUR.match}px)` : tier === "recognition" ? `blur(${FROST_BLUR.recognition}px)` : "none",
                  transition: "filter 1.2s ease",
                  borderRadius: "50%",
                }}
              >
                <GradientAvatar
                  gradient={theirGrad}
                  name={theirName}
                  size={68}
                  border={`3px solid ${tier === "bond" ? "rgba(155,109,255,0.6)" : "rgba(255,255,255,0.15)"}`}
                  style={{ boxShadow: `0 8px 28px ${gradientGlow(theirGrad)}` }}
                />
              </div>
              {tier !== "bond" && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    background: `rgba(10,8,26,${FROST_OPACITY[tier]})`,
                    backdropFilter: tier === "match" ? "blur(4px)" : "none",
                    transition: "all 1.2s ease",
                    pointerEvents: "none",
                  }}
                />
              )}
            </div>
          </div>

          {/* ── Names ────────────────────────────────────────────────── */}
          <div style={{ textAlign: "center", marginBottom: 10 }}>
            <p style={{ fontSize: 18, fontWeight: 800, color: "#f0f0f5", letterSpacing: "-0.02em", marginBottom: 3 }}>
              {myName} &amp; {theirName}
            </p>
            <p style={{ fontSize: 12, color: meta.color, fontWeight: 600 }}>
              {meta.sublabel}
            </p>
          </div>

          {/* ── Bond reveal: Shared Secret ───────────────────────────── */}
          <AnimatePresence>
            {tier === "bond" && hasBloomed && (
              <motion.div
                key="secret"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 280, damping: 24 }}
                style={{
                  margin: "4px 0 12px",
                  padding: "12px 16px",
                  borderRadius: 14,
                  background: "rgba(155,109,255,0.09)",
                  border: "1px solid rgba(155,109,255,0.2)",
                  textAlign: "center",
                }}
              >
                <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(155,109,255,0.6)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                  Shared Secret
                </p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.5, fontStyle: "italic" }}>
                  {theirProfile?.sharedSecret
                    ? `"${theirProfile.sharedSecret}"`
                    : "They haven't added their secret yet — ask them in person."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Progress bar (non-bond tiers) ───────────────────────── */}
          {tier !== "bond" && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>
                  {tier === "match" ? "→ Recognition" : "→ Akin Bond"}
                </span>
                <span style={{ fontSize: 11, color: meta.color, fontWeight: 600 }}>
                  {formatDuration(msToNext)} left
                </span>
              </div>
              <div
                style={{
                  height: 4,
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.07)",
                  overflow: "hidden",
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressToNext * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  style={{
                    height: "100%",
                    borderRadius: 999,
                    background: `linear-gradient(90deg, ${meta.color}, ${tier === "match" ? "rgba(0,229,160,0.7)" : "rgba(155,109,255,0.9)"})`,
                  }}
                />
              </div>
            </div>
          )}

          {/* ── Footer ───────────────────────────────────────────────── */}
          <div
            style={{
              height: 1,
              background: `linear-gradient(90deg, transparent, ${meta.glowColor}, transparent)`,
              marginBottom: 10,
            }}
          />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
              {formatRelativeTime(match.createdAt)}
            </span>
            {isAkin && tier === "bond" && (
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ fontSize: 12, color: "#9b6dff" }}
              >
                · ✦ Akin Bond
              </motion.span>
            )}
          </div>
        </div>

        {/* ── Shatter-and-Bloom overlay ────────────────────────────── */}
        <AnimatePresence>
          {showingBloom && (
            <motion.div
              key="bloom-overlay"
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 10,
                pointerEvents: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {/* Frost layer that blooms away */}
              <motion.div
                initial={{ clipPath: "circle(100% at 50% 50%)", backdropFilter: "blur(18px)", background: "rgba(10,8,26,0.85)" }}
                animate={{ clipPath: "circle(0% at 50% 50%)", backdropFilter: "blur(0px)", background: "rgba(10,8,26,0)" }}
                transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
                style={{ position: "absolute", inset: 0, borderRadius: 28 }}
              />

              {/* Shard particles bursting outward */}
              {shards.map((shard) => (
                <motion.div
                  key={shard.id}
                  initial={{ x: 0, y: 0, scale: 0, rotate: 0, opacity: 1 }}
                  animate={{
                    x: shard.x,
                    y: shard.y,
                    scale: [0, shard.scale, 0],
                    rotate: shard.rotate,
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1.0,
                    delay: shard.delay,
                    ease: "easeOut",
                  }}
                  style={{
                    position: "absolute",
                    width: shard.size,
                    height: shard.size,
                    borderRadius: shard.id % 3 === 0 ? 2 : "50%",
                    background: shard.color,
                    boxShadow: `0 0 ${shard.size * 2}px ${shard.color}`,
                  }}
                />
              ))}

              {/* Central burst glow */}
              <motion.div
                initial={{ scale: 0, opacity: 0.9 }}
                animate={{ scale: 5, opacity: 0 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(155,109,255,0.8), rgba(0,229,160,0.4), transparent 70%)",
                  filter: "blur(8px)",
                }}
              />

              {/* "Akin Bond" text reveal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.15, 1, 0.8] }}
                transition={{ duration: 1.5, times: [0, 0.25, 0.7, 1] }}
                style={{
                  position: "absolute",
                  textAlign: "center",
                  zIndex: 5,
                }}
              >
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 900,
                    background: "linear-gradient(135deg, #9b6dff, #00e5a0)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    letterSpacing: "-0.02em",
                    filter: "drop-shadow(0 0 12px rgba(155,109,255,0.9))",
                  }}
                >
                  Akin Bond ✦
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
