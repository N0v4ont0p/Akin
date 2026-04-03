"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimate } from "framer-motion";
import MagneticCard from "./MagneticCard";
import GradientAvatar from "./GradientAvatar";
import { UserProfile } from "@/lib/firestore";

interface CardStackProps {
  classmates: UserProfile[];
  alreadyLiked: Set<string>;
  onLike: (classmate: UserProfile) => Promise<void>;
  onPass: (classmate: UserProfile) => void;
  onAkinPick?: (classmate: UserProfile) => Promise<void>;
}

export default function CardStack({
  classmates,
  alreadyLiked,
  onLike,
  onPass,
  onAkinPick,
}: CardStackProps) {
  const [queue, setQueue] = useState<UserProfile[]>([]);
  const [current, setCurrent] = useState<UserProfile | null>(null);
  const [animating, setAnimating] = useState<"like" | "pass" | null>(null);
  const [showRipple, setShowRipple] = useState(false);
  const [cardKey, setCardKey] = useState(0);
  const [isShivering, setIsShivering] = useState(false);
  const [scope, animate] = useAnimate();

  useEffect(() => {
    const filtered = classmates.filter((c) => !alreadyLiked.has(c.userId));
    setQueue(filtered);
  }, [classmates, alreadyLiked]);

  useEffect(() => {
    if (!current && queue.length > 0) {
      setCurrent(queue[0]);
    }
  }, [queue, current]);

  const advance = () => {
    setQueue((prev) => {
      const next = prev.slice(1);
      if (next.length > 0) {
        setCurrent(next[0]);
      } else {
        setCurrent(null);
      }
      return next;
    });
    setCardKey((k) => k + 1);
    setAnimating(null);
    setShowRipple(false);
  };

  const handleLike = async () => {
    if (!current || animating) return;
    setAnimating("like");
    setShowRipple(true);

    // Screen shiver
    setIsShivering(true);
    setTimeout(() => setIsShivering(false), 350);

    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(40);
    }

    await onLike(current);
    setTimeout(advance, 700);
  };

  const handlePass = () => {
    if (!current || animating) return;
    setAnimating("pass");
    onPass(current);
    setTimeout(advance, 500);
  };

  const handleAkinPick = async () => {
    if (!current || animating || !onAkinPick) return;
    setAnimating("like");
    setShowRipple(true);

    // Screen shiver effect
    setIsShivering(true);
    setTimeout(() => setIsShivering(false), 350);

    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([40, 30, 60]);
    }

    await onAkinPick(current);
    setTimeout(advance, 800);
  };

  const totalInClass = classmates.length;
  const seenCount = totalInClass - queue.length + (current ? 1 : 0);

  if (queue.length === 0 && !current) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: "center", padding: "60px 20px" }}
      >
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #9b6dff, #00e5a0)",
            margin: "0 auto 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
        <h3 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "10px", color: "#f0f0f5" }}>
          All caught up!
        </h3>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "15px", lineHeight: 1.6 }}>
          You've seen everyone in your class.
          <br />
          Check your matches to see who connected with you.
        </p>
      </motion.div>
    );
  }

  if (!current) return null;

  return (
    <motion.div
      ref={scope}
      animate={isShivering ? { x: [-2, 2, -2, 2, 0] } : {}}
      transition={{ duration: 0.3 }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "28px",
        padding: "20px",
      }}
    >
      {/* Counter */}
      <p
        style={{
          color: "rgba(255,255,255,0.25)",
          fontSize: "12px",
          fontWeight: "500",
          letterSpacing: "0.05em",
        }}
      >
        {seenCount} of {totalInClass} classmates
      </p>

      {/* Card stack */}
      <div style={{ width: "100%", maxWidth: "340px", position: "relative" }}>
        {/* Peek card behind */}
        {queue.length > 1 && (
          <div
            style={{
              position: "absolute",
              top: "16px",
              left: "10px",
              right: "10px",
              height: "200px",
              borderRadius: "28px",
              background: "rgba(255,255,255,0.03)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.06)",
              transform: "scale(0.92)",
              opacity: 0.5,
              zIndex: 0,
              filter: "blur(1px)",
            }}
          />
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={cardKey}
            initial={{ opacity: 0, y: 32, scale: 0.94 }}
            animate={
              animating === "like"
                ? { opacity: 0, y: -100, scale: 1.04 }
                : animating === "pass"
                ? { opacity: 0, x: -80, scale: 0.94, filter: "blur(4px)" }
                : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
            }
            exit={{ opacity: 0 }}
            transition={
              animating === "like"
                ? { type: "spring", stiffness: 400, damping: 30 }
                : animating === "pass"
                ? { duration: 0.4, ease: "easeIn" }
                : { duration: 0.3, ease: "easeOut" }
            }
            style={{ position: "relative", zIndex: 1 }}
          >
            {/* Ripple rings */}
            {showRipple && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "80px",
                  height: "80px",
                  pointerEvents: "none",
                  zIndex: 10,
                }}
              >
                <div className="ripple-ring ripple-ring-1" />
                <div className="ripple-ring ripple-ring-2" />
                <div className="ripple-ring ripple-ring-3" />
              </div>
            )}

            <MagneticCard
              isActive={animating === "like"}
              className="glass shimmer-border"
              style={{
                borderRadius: "28px",
                padding: "48px 32px 40px",
                textAlign: "center",
                cursor: "default",
                boxShadow:
                  animating === "like"
                    ? "0 0 60px rgba(155,109,255,0.4)"
                    : "0 16px 48px rgba(0,0,0,0.35)",
                transition: "box-shadow 0.3s ease",
                position: "relative",
              }}
            >
              {/* Avatar */}
              <motion.div
                animate={animating === "like" ? { scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 0.4 }}
                style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}
              >
                <GradientAvatar
                  gradient={current.avatarGradient ?? 0}
                  name={current.name}
                  size={100}
                  border="3px solid rgba(255,255,255,0.12)"
                />
              </motion.div>

              {/* Name */}
              <h2
                style={{
                  fontSize: "26px",
                  fontWeight: "700",
                  marginBottom: "8px",
                  letterSpacing: "-0.02em",
                  color: "#f0f0f5",
                }}
              >
                {current.name}
              </h2>
              <p
                style={{
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.35)",
                  fontWeight: "500",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                }}
              >
                your classmate
              </p>

              {/* Queue dots */}
              {queue.length > 1 && (
                <div
                  style={{
                    marginTop: "28px",
                    display: "flex",
                    gap: "5px",
                    justifyContent: "center",
                  }}
                >
                  {queue.slice(0, Math.min(5, queue.length)).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: i === 0 ? "18px" : "7px",
                        height: "7px",
                        borderRadius: "999px",
                        background:
                          i === 0 ? "#9b6dff" : "rgba(255,255,255,0.18)",
                        transition: "all 0.3s ease",
                      }}
                    />
                  ))}
                </div>
              )}
            </MagneticCard>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        {/* Skip */}
        <motion.button
          onClick={handlePass}
          disabled={!!animating}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.10)",
            backdropFilter: "blur(12px)",
            color: "rgba(255,255,255,0.6)",
            cursor: animating ? "not-allowed" : "pointer",
            opacity: animating ? 0.4 : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "opacity 0.2s",
          }}
          title="Skip"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </motion.button>

        {/* Pick as Akin (primary action) */}
        <motion.button
          onClick={handleAkinPick || handleLike}
          disabled={!!animating}
          className="heartbeat"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          style={{
            width: "68px",
            height: "68px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #9b6dff, #6d3bff)",
            border: "none",
            cursor: animating ? "not-allowed" : "pointer",
            opacity: animating ? 0.4 : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 32px rgba(155,109,255,0.40)",
            transition: "opacity 0.2s",
          }}
          title="Pick as Akin"
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="white"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </motion.button>
      </div>

      {/* Remaining */}
      {queue.length > 1 && (
        <p style={{ color: "rgba(255,255,255,0.22)", fontSize: "12px" }}>
          {queue.length - 1} more to browse
        </p>
      )}
    </motion.div>
  );
}
