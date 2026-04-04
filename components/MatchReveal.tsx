"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GradientAvatar from "./GradientAvatar";

interface MatchRevealProps {
  myGradient: number;
  myName: string;
  matchGradient: number;
  matchName: string;
  onContinue: () => void;
  isAkin?: boolean;
}

// Deterministic "random" so SSR and client agree
function seeded(seed: number, max: number) {
  return ((seed * 1664525 + 1013904223) & 0x7fffffff) % max;
}

export default function MatchReveal({
  myGradient,
  myName,
  matchGradient,
  matchName,
  onContinue,
  isAkin = false,
}: MatchRevealProps) {
  const [phase, setPhase] = useState<"flash" | "rings" | "reveal">("flash");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("rings"), 320);
    const t2 = setTimeout(() => setPhase("reveal"), 920);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Pre-compute particle positions using seed so they're stable
  const particles = useMemo(() =>
    Array.from({ length: 32 }, (_, i) => ({
      id: i,
      left: 10 + seeded(i * 7, 80),
      top: 10 + seeded(i * 13, 80),
      size: i % 4 === 0 ? 10 : i % 3 === 0 ? 7 : 5,
      color: i % 3 === 0 ? "#9b6dff" : i % 3 === 1 ? "#00e5a0" : "#ff4f7b",
      dx: (seeded(i * 3, 200) - 100),
      dy: -(60 + seeded(i * 5, 160)),
      dur: 1.8 + seeded(i * 11, 15) / 10,
      delay: seeded(i * 17, 12) / 10,
      isStar: i % 5 === 0,
    })),
  []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Deep background */}
      <div style={{ position: "absolute", inset: 0, background: "#04040e", zIndex: 0 }} />

      {/* Phase 1: White flash */}
      <AnimatePresence>
        {phase === "flash" && (
          <motion.div
            key="flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.7, 0] }}
            transition={{ duration: 0.32, ease: "easeOut" }}
            style={{
              position: "absolute", inset: 0,
              background: "white",
              zIndex: 5,
              pointerEvents: "none",
            }}
          />
        )}
      </AnimatePresence>

      {/* Phase 2: Expanding shockwave rings */}
      <AnimatePresence>
        {(phase === "rings" || phase === "reveal") &&
          [0, 1, 2, 3].map((i) => (
            <motion.div
              key={`ring-${i}`}
              initial={{ width: 0, height: 0, opacity: 0.9 }}
              animate={{ width: 900, height: 900, opacity: 0 }}
              transition={{ duration: 1.4, delay: i * 0.18, ease: "easeOut" }}
              style={{
                position: "absolute",
                borderRadius: "50%",
                border: `${2 - i * 0.3}px solid ${isAkin ? "rgba(155,109,255,0.6)" : "rgba(0,229,160,0.5)"}`,
                zIndex: 1,
                pointerEvents: "none",
              }}
            />
          ))}
      </AnimatePresence>

      {/* Radial background glow */}
      <AnimatePresence>
        {(phase === "rings" || phase === "reveal") && (
          <motion.div
            key="glow"
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            style={{
              position: "absolute", inset: 0, zIndex: 0,
              background: isAkin
                ? "radial-gradient(ellipse 70% 55% at 50% 50%, rgba(155,109,255,0.32) 0%, rgba(0,229,160,0.14) 45%, transparent 70%)"
                : "radial-gradient(ellipse 70% 55% at 50% 50%, rgba(0,229,160,0.25) 0%, rgba(155,109,255,0.12) 45%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
        )}
      </AnimatePresence>

      {/* Floating particles */}
      <AnimatePresence>
        {phase === "reveal" &&
          particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 1, y: 0, x: 0, scale: 1, rotate: 0 }}
              animate={{
                opacity: 0,
                y: p.dy,
                x: p.dx,
                scale: p.isStar ? [1, 1.4, 0] : [1, 0.6, 0],
                rotate: p.isStar ? 360 : 0,
              }}
              transition={{
                duration: p.dur,
                delay: p.delay,
                ease: "easeOut",
                repeat: Infinity,
                repeatDelay: 1.2,
              }}
              style={{
                position: "absolute",
                left: `${p.left}%`,
                top: `${p.top}%`,
                width: p.size,
                height: p.size,
                borderRadius: p.isStar ? "2px" : "50%",
                background: p.color,
                zIndex: 3,
                pointerEvents: "none",
                boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
              }}
            />
          ))}
      </AnimatePresence>

      {/* Main content */}
      <AnimatePresence>
        {phase === "reveal" && (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "relative",
              zIndex: 10,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "32px 24px",
              textAlign: "center",
              maxWidth: "440px",
              width: "100%",
            }}
          >
            {/* Eyebrow label */}
            <motion.p
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.28em",
                color: "rgba(255,255,255,0.38)",
                marginBottom: 14,
              }}
            >
              {isAkin ? "akin match" : "it's mutual"}
            </motion.p>

            {/* Big title */}
            <motion.h1
              initial={{ opacity: 0, scale: 0.6, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.22, type: "spring", stiffness: 260, damping: 20 }}
              className="gradient-text-match"
              style={{
                fontSize: "clamp(38px, 10vw, 58px)",
                fontWeight: 900,
                letterSpacing: "-0.035em",
                marginBottom: 48,
                lineHeight: 1.05,
              }}
            >
              {isAkin ? "✦ Akin ✦" : "It's a Match"}
            </motion.h1>

            {/* Avatars — come from sides */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 28,
                marginBottom: 32,
                position: "relative",
              }}
            >
              {/* Connection glow behind avatars */}
              <motion.div
                animate={{
                  opacity: [0.4, 0.9, 0.4],
                  scaleX: [0.8, 1.2, 0.8],
                }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 180,
                  height: 80,
                  borderRadius: "50%",
                  background: isAkin
                    ? "radial-gradient(ellipse, rgba(155,109,255,0.5), transparent 70%)"
                    : "radial-gradient(ellipse, rgba(0,229,160,0.4), transparent 70%)",
                  filter: "blur(12px)",
                  pointerEvents: "none",
                }}
              />

              {/* Left avatar */}
              <motion.div
                initial={{ x: -80, opacity: 0, scale: 0.7 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 220, damping: 18 }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}
              >
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(155,109,255,0)",
                      "0 0 0 10px rgba(155,109,255,0.2)",
                      "0 0 0 0 rgba(155,109,255,0)",
                    ],
                  }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  style={{ borderRadius: "50%" }}
                >
                  <GradientAvatar
                    gradient={myGradient}
                    name={myName}
                    size={96}
                    border="3px solid rgba(155,109,255,0.6)"
                    style={{ boxShadow: "0 0 40px rgba(155,109,255,0.35)" }}
                  />
                </motion.div>
                <motion.span
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 }}
                  style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}
                >
                  {myName}
                </motion.span>
              </motion.div>

              {/* Center symbol */}
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 16 }}
                style={{ flexShrink: 0, zIndex: 2 }}
              >
                <motion.div
                  animate={
                    isAkin
                      ? { scale: [1, 1.35, 1], rotate: [0, 15, -15, 0] }
                      : { scale: [1, 1.25, 1] }
                  }
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                >
                  {isAkin ? (
                    <span
                      style={{
                        fontSize: 32,
                        background: "linear-gradient(135deg, #9b6dff, #00e5a0)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        filter: "drop-shadow(0 0 12px rgba(155,109,255,0.8))",
                      }}
                    >
                      ✦
                    </span>
                  ) : (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="#00e5a0" stroke="none"
                      style={{ filter: "drop-shadow(0 0 10px rgba(0,229,160,0.8))" }}>
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  )}
                </motion.div>
              </motion.div>

              {/* Right avatar */}
              <motion.div
                initial={{ x: 80, opacity: 0, scale: 0.7 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 220, damping: 18 }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}
              >
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(0,229,160,0)",
                      "0 0 0 10px rgba(0,229,160,0.2)",
                      "0 0 0 0 rgba(0,229,160,0)",
                    ],
                  }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                  style={{ borderRadius: "50%" }}
                >
                  <GradientAvatar
                    gradient={matchGradient}
                    name={matchName}
                    size={96}
                    border="3px solid rgba(0,229,160,0.6)"
                    style={{ boxShadow: "0 0 40px rgba(0,229,160,0.35)" }}
                  />
                </motion.div>
                <motion.span
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 }}
                  style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}
                >
                  {matchName}
                </motion.span>
              </motion.div>
            </div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              style={{
                fontSize: 15,
                color: "rgba(255,255,255,0.42)",
                marginBottom: 52,
                lineHeight: 1.65,
                maxWidth: 300,
              }}
            >
              {isAkin
                ? "You chose each other — no one else. One pick. Mutual truth."
                : "Both of you liked each other at the same time."}
            </motion.p>

            {/* CTA */}
            <motion.button
              onClick={onContinue}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.88, type: "spring", stiffness: 260, damping: 24 }}
              whileHover={{ scale: 1.04, boxShadow: "0 16px 52px rgba(155,109,255,0.55)" }}
              whileTap={{ scale: 0.96 }}
              style={{
                background: "linear-gradient(135deg, #9b6dff, #6d3bff)",
                color: "white",
                border: "none",
                borderRadius: 16,
                padding: "16px 56px",
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: "0 12px 44px rgba(155,109,255,0.48)",
                letterSpacing: "0.01em",
              }}
            >
              See your matches →
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
