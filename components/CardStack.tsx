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
  onLike: (classmate: UserProfile) => Promise<void>;
  onPass: (classmate: UserProfile) => void;
  onAkinPick?: (classmate: UserProfile) => Promise<void>;
}

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

  // ── Magnetic Pull transforms ──────────────────────────────────────
  // Card subtly stretches toward the Akin side and compresses away from pass
  const magneticScaleX = useTransform(x, [-200, -60, 0, 60, 200], [0.96, 0.98, 1, 1.03, 1.06]);
  const magneticSkewX = useTransform(x, [-120, 0, 120], [-2.5, 0, 2.5]);
  // The card "leans" toward whichever direction
  const magneticY = useTransform(x, [-200, 0, 200], [4, 0, -4]);

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x > 90) onLike();
    else if (info.offset.x < -90) onPass();
  };

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
            background: "rgba(255,255,255,0.03)",
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
        {/* Like indicator */}
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
              border: "3px solid #9b6dff",
              borderRadius: 10,
              padding: "5px 12px",
              background: "rgba(155,109,255,0.18)",
              backdropFilter: "blur(8px)",
            }}
          >
            <span
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: "#9b6dff",
                letterSpacing: "0.08em",
              }}
            >
              AKIN
            </span>
          </div>
        </motion.div>

        {/* Pass indicator */}
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
              border: "3px solid rgba(255,79,123,0.8)",
              borderRadius: 10,
              padding: "5px 12px",
              background: "rgba(255,79,123,0.15)",
              backdropFilter: "blur(8px)",
            }}
          >
            <span
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: "rgba(255,79,123,0.9)",
                letterSpacing: "0.06em",
              }}
            >
              SKIP
            </span>
          </div>
        </motion.div>

        {/* Card body */}
        <div
          className="glass shimmer-border"
          style={{
            borderRadius: "28px",
            padding: "52px 32px 40px",
            textAlign: "center",
            boxShadow: "0 20px 56px rgba(0,0,0,0.4)",
            cursor: "grab",
            userSelect: "none",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtle gradient blob inside card */}
          <div
            style={{
              position: "absolute",
              top: -40,
              left: "50%",
              transform: "translateX(-50%)",
              width: 180,
              height: 180,
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(155,109,255,0.1), transparent 70%)`,
              filter: "blur(30px)",
              pointerEvents: "none",
            }}
          />

          {/* Avatar */}
          <motion.div
            style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}
          >
            <div
              style={{
                padding: 4,
                borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(155,109,255,0.5), rgba(0,229,160,0.3))",
              }}
            >
              <GradientAvatar
                gradient={classmate.avatarGradient ?? 0}
                name={classmate.name}
                size={108}
                border="3px solid rgba(7,7,15,0.8)"
              />
            </div>
          </motion.div>

          {/* Name */}
          <h2
            style={{
              fontSize: "28px",
              fontWeight: 800,
              marginBottom: 6,
              letterSpacing: "-0.025em",
              color: "#f0f0f5",
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
            }}
          >
            your classmate
          </p>

          {/* Swipe hint */}
          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                background: "rgba(255,79,123,0.08)",
                border: "1px solid rgba(255,79,123,0.2)",
                borderRadius: 999,
                padding: "5px 12px",
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,79,123,0.7)" strokeWidth="2.5" strokeLinecap="round">
                <line x1="20" y1="12" x2="4" y2="12"/><polyline points="10 18 4 12 10 6"/>
              </svg>
              <span style={{ fontSize: 11, color: "rgba(255,79,123,0.65)", fontWeight: 500 }}>skip</span>
            </div>
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,0.15)" }} />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                background: "rgba(155,109,255,0.08)",
                border: "1px solid rgba(155,109,255,0.2)",
                borderRadius: 999,
                padding: "5px 12px",
              }}
            >
              <span style={{ fontSize: 11, color: "rgba(155,109,255,0.8)", fontWeight: 500 }}>akin</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(155,109,255,0.8)" strokeWidth="2.5" strokeLinecap="round">
                <line x1="4" y1="12" x2="20" y2="12"/><polyline points="14 6 20 12 14 18"/>
              </svg>
            </div>
          </div>
        </div>
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
    await (onAkinPick ?? onLike)(target);
    setTimeout(advance, 680);
  };

  const handlePass = () => {
    if (!current || animating) return;
    setAnimating("pass");
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
        style={{ textAlign: "center", padding: "60px 24px" }}
      >
        <motion.div
          animate={{ scale: [1, 1.08, 1], boxShadow: ["0 0 32px rgba(155,109,255,0.3)", "0 0 64px rgba(155,109,255,0.6)", "0 0 32px rgba(155,109,255,0.3)"] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
          style={{
            width: 88,
            height: 88,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #9b6dff, #00e5a0)",
            margin: "0 auto 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </motion.div>
        <h3
          style={{
            fontSize: "24px",
            fontWeight: 800,
            marginBottom: 12,
            color: "#f0f0f5",
            letterSpacing: "-0.02em",
          }}
        >
          All caught up
        </h3>
        <p
          style={{
            color: "rgba(255,255,255,0.38)",
            fontSize: "15px",
            lineHeight: 1.7,
            maxWidth: 260,
            margin: "0 auto",
          }}
        >
          You've seen everyone in your class.
          Check Matches to see who connected with you.
        </p>
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

      {/* Buttons */}
      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        {/* Pass */}
        <motion.button
          onClick={handlePass}
          disabled={!!animating}
          whileHover={{ scale: 1.08, backgroundColor: "rgba(255,79,123,0.12)" }}
          whileTap={{ scale: 0.9 }}
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,79,123,0.22)",
            backdropFilter: "blur(12px)",
            color: "rgba(255,79,123,0.6)",
            cursor: animating ? "not-allowed" : "pointer",
            opacity: animating ? 0.35 : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "opacity 0.2s",
          }}
          title="Skip"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </motion.button>

        {/* Akin pick (primary) */}
        <motion.button
          onClick={handleLike}
          disabled={!!animating}
          whileHover={{ scale: 1.1, boxShadow: "0 12px 48px rgba(155,109,255,0.6)" }}
          whileTap={{ scale: 0.9 }}
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #9b6dff, #6d3bff)",
            border: "none",
            cursor: animating ? "not-allowed" : "pointer",
            opacity: animating ? 0.35 : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 36px rgba(155,109,255,0.45)",
            transition: "opacity 0.2s, box-shadow 0.25s ease",
          }}
          title="Pick as Akin"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </motion.button>

        {/* Info about drag */}
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,0.25)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/>
            <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/>
            <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/>
            <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
          </svg>
        </div>
      </div>

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
        onConfirm={handleConfirmAkin}
        onCancel={() => setConfirmTarget(null)}
      />
    </motion.div>
  );
}
