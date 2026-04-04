"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GradientAvatar from "./GradientAvatar";
import SlideToLock from "./SlideToLock";
import { UserProfile } from "@/lib/firestore";

interface AkinConfirmProps {
  target: UserProfile | null;
  myName: string;
  myGradient: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function AkinConfirm({
  target,
  myName,
  myGradient,
  onConfirm,
  onCancel,
}: AkinConfirmProps) {
  useEffect(() => {
    if (target) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [target]);

  return (
    <AnimatePresence>
      {target && (
        <>
          {/* Backdrop */}
          <motion.div
            key="akin-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onCancel}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(4,4,14,0.92)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              zIndex: 900,
            }}
          />

          {/* Sheet */}
          <motion.div
            key="akin-sheet"
            initial={{ y: "100%", opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32, mass: 0.9 }}
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 901,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "480px",
                background: "rgba(10,8,26,0.99)",
                borderRadius: "32px 32px 0 0",
                border: "1px solid rgba(155,109,255,0.2)",
                borderBottom: "none",
                boxShadow: "0 -28px 80px rgba(155,109,255,0.3), 0 -4px 40px rgba(0,0,0,0.7)",
                overflow: "hidden",
                paddingBottom: "max(32px, env(safe-area-inset-bottom))",
              }}
            >
              {/* Drag handle */}
              <div style={{ display: "flex", justifyContent: "center", padding: "16px 0 0" }}>
                <div style={{ width: 40, height: 4, borderRadius: 999, background: "rgba(255,255,255,0.12)" }} />
              </div>

              {/* ── Pre-Commitment Shield ─────────────────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                style={{
                  margin: "20px 24px 0",
                  borderRadius: 16,
                  background: "rgba(255,200,50,0.07)",
                  border: "1px solid rgba(255,200,50,0.18)",
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                }}
              >
                <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>⚠️</span>
                <div>
                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: "rgba(255,210,80,0.9)",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      marginBottom: 4,
                    }}
                  >
                    The Gravity of Choice
                  </p>
                  <p style={{ fontSize: 12, color: "rgba(255,210,80,0.6)", lineHeight: 1.5 }}>
                    This is your <strong style={{ color: "rgba(255,210,80,0.85)" }}>only active pick</strong>. If you release them later, your class feed frosts over for{" "}
                    <strong style={{ color: "rgba(255,210,80,0.85)" }}>24 hours</strong>.
                    Choose wisely.
                  </p>
                </div>
              </motion.div>

              {/* Avatar section */}
              <div style={{ padding: "28px 28px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
                {/* Pulsing halo rings */}
                <div style={{ position: "relative", marginBottom: 20 }}>
                  <motion.div
                    animate={{ scale: [1, 1.9, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: "easeOut" }}
                    style={{
                      position: "absolute",
                      inset: -28,
                      borderRadius: "50%",
                      background: "rgba(155,109,255,0.15)",
                      pointerEvents: "none",
                    }}
                  />
                  <motion.div
                    animate={{ scale: [1, 1.45, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2.8, delay: 0.5, repeat: Infinity, ease: "easeOut" }}
                    style={{
                      position: "absolute",
                      inset: -14,
                      borderRadius: "50%",
                      border: "2px solid rgba(155,109,255,0.35)",
                      pointerEvents: "none",
                    }}
                  />
                  <motion.div
                    animate={{ boxShadow: ["0 0 0 0px rgba(155,109,255,0.5)", "0 0 0 10px rgba(155,109,255,0.0)", "0 0 0 0px rgba(155,109,255,0.5)"] }}
                    transition={{ duration: 2.2, repeat: Infinity }}
                    style={{ borderRadius: "50%" }}
                  >
                    <GradientAvatar
                      gradient={target.avatarGradient ?? 0}
                      name={target.name}
                      size={112}
                      border="4px solid rgba(155,109,255,0.5)"
                      style={{ boxShadow: "0 14px 50px rgba(155,109,255,0.4)" }}
                    />
                  </motion.div>
                </div>

                <motion.h2
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  style={{ fontSize: 30, fontWeight: 900, letterSpacing: "-0.03em", color: "#f0f0f5", marginBottom: 5 }}
                >
                  {target.name}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.24 }}
                  style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 20 }}
                >
                  your classmate
                </motion.p>
              </div>

              {/* Headline */}
              <div style={{ padding: "0 28px", textAlign: "center", marginBottom: 20 }}>
                <motion.h1
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.18, type: "spring", stiffness: 280, damping: 22 }}
                  style={{ fontSize: "clamp(20px,5vw,24px)", fontWeight: 900, letterSpacing: "-0.025em", color: "#f0f0f5", marginBottom: 8, lineHeight: 1.2 }}
                >
                  Make {target.name.split(" ")[0]} your Akin?
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", lineHeight: 1.65, maxWidth: 300, margin: "0 auto" }}
                >
                  One person. Locked for{" "}
                  <strong style={{ color: "rgba(155,109,255,0.85)" }}>48 hours</strong>.
                  If mutual — it's Akin.
                </motion.p>
              </div>

              {/* Exclusivity signals */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38 }}
                style={{ margin: "0 24px 20px", borderRadius: 16, background: "rgba(155,109,255,0.07)", border: "1px solid rgba(155,109,255,0.14)", padding: "14px 18px", display: "flex", flexDirection: "column", gap: 10 }}
              >
                {[
                  { icon: "🛡️", text: "One pick — your only active Akin choice" },
                  { icon: "⏱️", text: "48-hour lock — no impulse changes" },
                  { icon: "🔥", text: "Release penalty: 24h feed frost" },
                  { icon: "✦", text: "Mutual pick = Akin Bond unlocked" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.42 + i * 0.07 }}
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <span style={{ fontSize: 15, flexShrink: 0 }}>{item.icon}</span>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>{item.text}</p>
                  </motion.div>
                ))}
              </motion.div>

              {/* Both users preview */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.52 }}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 24, padding: "0 28px" }}
              >
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                  <GradientAvatar gradient={myGradient} name={myName} size={40} border="2px solid rgba(155,109,255,0.35)" />
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>you</span>
                </div>
                <motion.span
                  animate={{ scale: [1, 1.35, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                  style={{ fontSize: 20, background: "linear-gradient(135deg, #9b6dff, #00e5a0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
                >
                  ✦
                </motion.span>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                  <GradientAvatar gradient={target.avatarGradient ?? 0} name={target.name} size={40} border="2px solid rgba(155,109,255,0.35)" />
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>{target.name.split(" ")[0].toLowerCase()}</span>
                </div>
              </motion.div>

              {/* Slide to Lock CTA */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 24 }}
                style={{ padding: "0 24px 12px", display: "flex", flexDirection: "column", gap: 12 }}
              >
                <SlideToLock
                  label={`Slide to pick ${target.name.split(" ")[0]}`}
                  lockedLabel="Locked in ✦"
                  onLock={onConfirm}
                />

                <button
                  onClick={onCancel}
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: "transparent",
                    border: "none",
                    color: "rgba(255,255,255,0.3)",
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Not yet — keep browsing
                </button>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
