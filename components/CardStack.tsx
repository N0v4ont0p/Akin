"use client";

import React, { useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useAnimate,
} from "framer-motion";
import GradientAvatar from "./GradientAvatar";
import { UserProfile } from "@/lib/firestore";
import AkinConfirm from "./AkinConfirm";

interface CardStackProps {
  classmates: UserProfile[];
  alreadyLiked: Set<string>;
  myName: string;
  myGradient: number;
  myAccentColor?: "orchid" | "mint" | "gold";
  currentPickCount: number;
  onLike: (classmate: UserProfile) => Promise<void>;
  onPass: (classmate: UserProfile) => void;
  onAkinPick?: (classmate: UserProfile) => Promise<void>;
}

// ─── Accent color maps ────────────────────────────────────────────────────────
const accentColorMap: Record<string, string> = {
  orchid: "#9b6dff",
  mint: "#00e5a0",
  gold: "#fee140",
};

// ─── Draggable Card ───────────────────────────────────────────────────────────
interface DraggableCardProps {
  classmate: UserProfile;
  onLike: () => void;
  onPass: () => void;
  peekNext: UserProfile | null;
}

function DraggableCard({ classmate, onLike, onPass, peekNext }: DraggableCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-22, 22]);
  const likeOpacity = useTransform(x, [14, 80], [0, 1]);
  const passOpacity = useTransform(x, [-80, -14], [1, 0]);
  const cardOpacity = useTransform(x, [-220, -180, 0, 180, 220], [0, 1, 1, 1, 0]);

  // ── Dynamic card tinting overlays ────────────────────────────────────
  const akinOverlayOpacity = useTransform(x, [0, 100], [0, 0.85]);
  const skipOverlayOpacity = useTransform(x, [-100, 0], [0.85, 0]);

  // ── Dynamic box shadow driven by drag direction ───────────────────────
  const cardElevation = useTransform(
    x,
    [-160, 0, 160],
    [
      "0 8px 24px rgba(255,60,80,0.25), 0 2px 8px rgba(0,0,0,0.5)",
      "0 20px 56px rgba(0,0,0,0.4)",
      "0 24px 72px rgba(155,109,255,0.4), 0 8px 24px rgba(0,0,0,0.5)",
    ]
  );

  // ── Magnetic Pull transforms ──────────────────────────────────────────
  const magneticScaleX = useTransform(x, [-200, -60, 0, 60, 200], [0.96, 0.98, 1, 1.03, 1.06]);
  const magneticSkewX = useTransform(x, [-120, 0, 120], [-2.5, 0, 2.5]);
  const magneticY = useTransform(x, [-200, 0, 200], [4, 0, -4]);

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x > 90) onLike();
    else if (info.offset.x < -90) onPass();
  };

  // Accent color for this classmate
  const accentColor = accentColorMap[classmate.accentColor ?? "orchid"] ?? accentColorMap.orchid;

  // Peek card tint based on peekNext accent
  const peekAccentMap: Record<string, string> = {
    orchid: "rgba(155,109,255,0.12)",
    mint: "rgba(0,229,160,0.10)",
    gold: "rgba(254,225,64,0.10)",
  };
  const peekTint = peekAccentMap[peekNext?.accentColor ?? "orchid"] ?? peekAccentMap.orchid;

  // Vibe emoji map
  const vibeEmoji: Record<string, string> = {
    "Campus Hermit": "🦔",
    "Social Butterfly": "🦋",
    "Late Night Grinder": "🌙",
    "Early Bird": "🐦",
  };
  const facts = (classmate as unknown as { facts?: Record<string, string> })?.facts;
  const vibe = facts?.campusVibe ? vibeEmoji[facts.campusVibe] : undefined;
  const genderLabel =
    classmate.gender === "male" ? "♂" : classmate.gender === "female" ? "♀" : null;
  const major = facts?.major;

  // Subtitle: gender symbol + major if available, else "your classmate"
  const subtitle =
    genderLabel || major
      ? [genderLabel, major].filter(Boolean).join(" · ")
      : "your classmate";

  // Ring gradient
  const ringMap: Record<string, string> = {
    orchid: "linear-gradient(135deg, rgba(155,109,255,0.6), rgba(0,229,160,0.3))",
    mint: "linear-gradient(135deg, rgba(0,229,160,0.6), rgba(137,247,254,0.4))",
    gold: "linear-gradient(135deg, rgba(254,225,64,0.6), rgba(255,180,60,0.4))",
  };
  const ring = ringMap[classmate.accentColor ?? "orchid"] ?? ringMap.orchid;

  // Aura color
  const auraMap: Record<string, string> = {
    orchid: "rgba(155,109,255,0.14)",
    mint: "rgba(0,229,160,0.12)",
    gold: "rgba(254,225,64,0.10)",
  };
  const auraColor = auraMap[classmate.accentColor ?? "orchid"] ?? auraMap.orchid;

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: "340px" }}>
      {/* Peek card behind */}
      {peekNext && (
        <div
          style={{
            position: "absolute",
            top: "14px",
            left: "10px",
            right: "10px",
            height: "80%",
            borderRadius: "28px",
            background: peekTint,
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.06)",
            transform: "scale(0.92)",
            opacity: 0.5,
            zIndex: 0,
          }}
        />
      )}

      {/* Main draggable card — outer wrapper handles x/rotate/opacity */}
      <motion.div
        style={{ x, rotate, opacity: cardOpacity, position: "relative", zIndex: 1 }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        onDragEnd={handleDragEnd}
        whileTap={{ cursor: "grabbing" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
      {/* Inner wrapper applies Magnetic Pull warp */}
      <motion.div style={{ scaleX: magneticScaleX, skewX: magneticSkewX, y: magneticY }}>
        {/* AKIN stamp */}
        <motion.div
          style={{
            opacity: likeOpacity,
            position: "absolute",
            top: 24,
            left: 24,
            zIndex: 10,
            transform: "rotate(-18deg)",
          }}
        >
          <div
            style={{
              border: `3.5px solid ${accentColor}`,
              borderRadius: 10,
              padding: "5px 12px",
              background: "rgba(155,109,255,0.18)",
              backdropFilter: "blur(8px)",
              boxShadow: "0 0 28px rgba(155,109,255,0.7)",
            }}
          >
            <span
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: accentColor,
                letterSpacing: "0.08em",
                textShadow: "0 0 20px rgba(155,109,255,0.9)",
              }}
            >
              AKIN
            </span>
          </div>
        </motion.div>

        {/* NOPE stamp */}
        <motion.div
          style={{
            opacity: passOpacity,
            position: "absolute",
            top: 24,
            right: 24,
            zIndex: 10,
            transform: "rotate(18deg)",
          }}
        >
          <div
            style={{
              border: "3.5px solid rgba(255,60,80,0.85)",
              borderRadius: 10,
              padding: "5px 12px",
              background: "rgba(255,50,80,0.15)",
              backdropFilter: "blur(8px)",
              boxShadow: "0 0 28px rgba(255,60,80,0.6)",
            }}
          >
            <span
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: "rgba(255,60,80,0.95)",
                letterSpacing: "0.06em",
                textShadow: "0 0 20px rgba(255,60,80,0.8)",
              }}
            >
              NOPE
            </span>
          </div>
        </motion.div>

        {/* Card body — motion.div so it can receive MotionValue boxShadow */}
        <motion.div
          className="glass shimmer-border"
          style={{
            borderRadius: "28px",
            padding: "52px 32px 40px",
            textAlign: "center",
            boxShadow: cardElevation,
            cursor: "grab",
            userSelect: "none",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Accent color aura */}
          <div
            style={{
              position: "absolute",
              top: -40,
              left: "50%",
              transform: "translateX(-50%)",
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${auraColor}, transparent 70%)`,
              filter: "blur(30px)",
              pointerEvents: "none",
            }}
          />

          {/* Akin overlay tint (right swipe = purple/mint) */}
          <motion.div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "28px",
              background: "linear-gradient(135deg, rgba(155,109,255,0.18), rgba(0,229,160,0.08))",
              opacity: akinOverlayOpacity,
              pointerEvents: "none",
              zIndex: 1,
            }}
          />

          {/* Skip overlay tint (left swipe = pink/red) */}
          <motion.div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "28px",
              background: "rgba(255,50,80,0.14)",
              opacity: skipOverlayOpacity,
              pointerEvents: "none",
              zIndex: 1,
            }}
          />

          {/* Avatar */}
          <motion.div
            style={{ display: "flex", justifyContent: "center", marginBottom: 20, position: "relative", zIndex: 2 }}
          >
            <div style={{ padding: 5, borderRadius: "50%", background: ring }}>
              <GradientAvatar
                gradient={classmate.avatarGradient ?? 0}
                name={classmate.name}
                size={116}
                border="3px solid rgba(7,7,15,0.8)"
              />
            </div>
          </motion.div>

          {/* Personality badges */}
          {(vibe || genderLabel) && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 6,
                marginBottom: 10,
                position: "relative",
                zIndex: 2,
              }}
            >
              {genderLabel && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.55)",
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 999,
                    padding: "2px 8px",
                  }}
                >
                  {genderLabel}
                </span>
              )}
              {vibe && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.55)",
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 999,
                    padding: "2px 8px",
                  }}
                >
                  {vibe}
                </span>
              )}
            </div>
          )}

          {/* Name */}
          <h2
            style={{
              fontSize: "30px",
              fontWeight: 900,
              marginBottom: 5,
              letterSpacing: "-0.025em",
              color: "#f0f0f5",
              position: "relative",
              zIndex: 2,
            }}
          >
            {classmate.name}
          </h2>
          <p
            style={{
              fontSize: "12px",
              color: "rgba(255,255,255,0.3)",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              marginBottom: 28,
              position: "relative",
              zIndex: 2,
            }}
          >
            {subtitle}
          </p>

          {/* Dot direction hint — replaces oscillating arrows */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              position: "relative",
              zIndex: 2,
            }}
          >
            {/* Left dots — pink */}
            {[...Array(3)].map((_, i) => (
              <div
                key={`l-${i}`}
                style={{
                  width: i === 2 ? 5 : i === 1 ? 4 : 3,
                  height: i === 2 ? 5 : i === 1 ? 4 : 3,
                  borderRadius: "50%",
                  background: `rgba(255,60,80,${0.15 + i * 0.08})`,
                }}
              />
            ))}
            <div style={{ width: 8 }} />
            {/* Right dots — orchid */}
            {[...Array(3)].map((_, i) => (
              <div
                key={`r-${i}`}
                style={{
                  width: i === 0 ? 3 : i === 1 ? 4 : 5,
                  height: i === 0 ? 3 : i === 1 ? 4 : 5,
                  borderRadius: "50%",
                  background: `rgba(155,109,255,${0.15 + i * 0.08})`,
                }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
      {/* close magnetic inner wrapper */}
      </motion.div>
    </div>
  );
}

// ─── Main CardStack ───────────────────────────────────────────────────────────
export default function CardStack({
  classmates,
  alreadyLiked,
  myName,
  myGradient,
  myAccentColor = "orchid",
  currentPickCount,
  onLike,
  onPass,
  onAkinPick,
}: CardStackProps) {
  const [queue, setQueue] = useState<UserProfile[]>([]);
  const [current, setCurrent] = useState<UserProfile | null>(null);
  const [animating, setAnimating] = useState<"like" | "pass" | null>(null);
  const [cardKey, setCardKey] = useState(0);
  const [isShivering, setIsShivering] = useState(false);
  const [showRipple, setShowRipple] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<UserProfile | null>(null);
  const [scope, animate] = useAnimate();

  useEffect(() => {
    const filtered = classmates.filter((c) => !alreadyLiked.has(c.userId));
    setQueue(filtered);
    // If current card is now in the liked/picked set, silently skip to next
    setCurrent(prev => {
      if (!prev) return null;
      if (alreadyLiked.has(prev.userId)) return filtered[0] ?? null;
      return prev;
    });
  }, [classmates, alreadyLiked]);

  useEffect(() => {
    if (!current && queue.length > 0) setCurrent(queue[0]);
  }, [queue, current]);

  const advance = () => {
    setQueue((prev) => {
      const next = prev.slice(1);
      setCurrent(next.length > 0 ? next[0] : null);
      return next;
    });
    setCardKey((k) => k + 1);
    setAnimating(null);
    setShowRipple(false);
  };

  const handleLike = () => {
    if (!current || animating) return;
    // Show confirm modal instead of immediately picking
    setConfirmTarget(current);
  };

  const handleConfirmAkin = async () => {
    if (!confirmTarget) return;
    const target = confirmTarget;
    setConfirmTarget(null);
    setAnimating("like");
    setShowRipple(true);
    setIsShivering(true);
    setTimeout(() => setIsShivering(false), 380);
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(40);
    // Fire-and-forget: never await Firestore — advance always fires immediately
    void (onAkinPick ?? onLike)(target);
    setTimeout(advance, 680);
  };

  const handlePass = () => {
    if (!current || animating) return;
    setAnimating("pass");
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(12);
    onPass(current);
    setTimeout(advance, 420);
  };

  const totalInClass = classmates.length;
  const seenCount = totalInClass - queue.length + (current ? 1 : 0);

  // ─── Empty state ───────────────────────────────────────────────────────────
  if (queue.length === 0 && !current) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        style={{ textAlign: "center", padding: "48px 28px" }}
      >
        {/* Orbit rings */}
        <div style={{ position: "relative", width: 110, height: 110, margin: "0 auto 32px" }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: "1.5px dashed rgba(155,109,255,0.25)",
            }}
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
            style={{
              position: "absolute",
              inset: 16,
              borderRadius: "50%",
              border: "1.5px dashed rgba(0,229,160,0.2)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 28,
              borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(155,109,255,0.3), rgba(0,229,160,0.2))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <motion.span
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2.2, repeat: Infinity }}
              style={{ fontSize: 24 }}
            >
              ✦
            </motion.span>
          </div>
        </div>

        <h3
          style={{
            fontSize: "22px",
            fontWeight: 900,
            marginBottom: 10,
            color: "#f0f0f5",
            letterSpacing: "-0.02em",
          }}
        >
          You&apos;ve seen everyone
        </h3>
        <p
          style={{
            color: "rgba(255,255,255,0.42)",
            fontSize: "14px",
            lineHeight: 1.75,
            maxWidth: 260,
            margin: "0 auto 20px",
          }}
        >
          But not everyone has seen you yet. New classmates join all the time — and someone may have already picked you.
        </p>

        {/* FOMO nudge */}
        <motion.div
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.8, repeat: Infinity }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(155,109,255,0.08)",
            border: "1px solid rgba(155,109,255,0.2)",
            borderRadius: 999,
            padding: "8px 16px",
          }}
        >
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#9b6dff" }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(155,109,255,0.85)" }}>
            Check Matches — your Akin might be waiting
          </span>
        </motion.div>
      </motion.div>
    );
  }

  if (!current) return null;

  return (
    <motion.div
      ref={scope}
      animate={isShivering ? { x: [-3, 3, -2, 2, 0] } : {}}
      transition={{ duration: 0.32 }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "26px",
        padding: "8px 20px 20px",
      }}
    >
      {/* Counter */}
      <p
        style={{
          color: "rgba(255,255,255,0.22)",
          fontSize: "12px",
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {seenCount} of {totalInClass}
      </p>

      {/* Card */}
      <div style={{ width: "100%", maxWidth: "340px", position: "relative" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={cardKey}
            initial={{ opacity: 0, y: 36, scale: 0.93 }}
            animate={
              animating === "like"
                ? { opacity: 0, y: -120, scale: 1.05, rotate: 8 }
                : animating === "pass"
                ? { opacity: 0, x: -100, scale: 0.92, rotate: -6 }
                : { opacity: 1, y: 0, scale: 1, rotate: 0 }
            }
            exit={{ opacity: 0 }}
            transition={
              animating
                ? { type: "spring", stiffness: 380, damping: 28 }
                : { duration: 0.28, ease: "easeOut" }
            }
            style={{ width: "100%" }}
          >
            {/* Ripple rings */}
            {showRipple && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "100px",
                  height: "100px",
                  pointerEvents: "none",
                  zIndex: 10,
                }}
              >
                <div className="ripple-ring ripple-ring-1" />
                <div className="ripple-ring ripple-ring-2" />
                <div className="ripple-ring ripple-ring-3" />
              </div>
            )}

            <DraggableCard
              classmate={current}
              onLike={handleLike}
              onPass={handlePass}
              peekNext={queue[1] ?? null}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Gesture hint — glass pill */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 999,
          padding: "6px 14px",
        }}
      >
        <span style={{ fontSize: 11, color: "rgba(255,79,123,0.45)", fontWeight: 600, letterSpacing: "0.04em" }}>← skip forever</span>
        <div style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(255,255,255,0.12)" }} />
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.18)", fontWeight: 500 }}>drag</span>
        <div style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(255,255,255,0.12)" }} />
        <span style={{ fontSize: 11, color: accentColorMap[myAccentColor] ? `${accentColorMap[myAccentColor]}aa` : "rgba(155,109,255,0.65)", fontWeight: 600, letterSpacing: "0.04em" }}>
          akin ✦ →
          {currentPickCount === 0 && (
            <span style={{ color: "rgba(255,215,80,0.7)", marginLeft: 4, fontSize: 10 }}>⚡ instant</span>
          )}
        </span>
      </motion.div>

      {queue.length > 1 && (
        <p style={{ color: "rgba(255,255,255,0.18)", fontSize: "12px" }}>
          {queue.length - 1} more
        </p>
      )}

      {/* Akin confirmation modal */}
      <AkinConfirm
        target={confirmTarget}
        myName={myName}
        myGradient={myGradient}
        currentPickCount={currentPickCount}
        onConfirm={handleConfirmAkin}
        onCancel={() => setConfirmTarget(null)}
      />
    </motion.div>
  );
}
