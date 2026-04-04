"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RefrostOverlayProps {
  refrostUntil: Date | null;
  onExpired?: () => void;
}

function useCountdown(until: Date | null) {
  const [remaining, setRemaining] = useState({ h: 0, m: 0, s: 0, total: 0 });

  useEffect(() => {
    if (!until) return;
    const update = () => {
      const diff = until.getTime() - Date.now();
      if (diff <= 0) {
        setRemaining({ h: 0, m: 0, s: 0, total: 0 });
        return;
      }
      setRemaining({
        h: Math.floor(diff / 3_600_000),
        m: Math.floor((diff % 3_600_000) / 60_000),
        s: Math.floor((diff % 60_000) / 1_000),
        total: diff,
      });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [until]);

  return remaining;
}

export default function RefrostOverlay({ refrostUntil, onExpired }: RefrostOverlayProps) {
  const { h, m, s, total } = useCountdown(refrostUntil);
  const isActive = refrostUntil !== null && refrostUntil.getTime() > Date.now();

  // Notify parent when countdown expires
  useEffect(() => {
    if (refrostUntil && total === 0 && onExpired) {
      onExpired();
    }
  }, [total, refrostUntil, onExpired]);

  // Compute fractional progress for the icy progress ring
  const totalDuration = 24 * 3600 * 1000;
  const elapsed = refrostUntil ? totalDuration - total : 0;
  const progressFraction = Math.min(elapsed / totalDuration, 1);
  const circumference = 2 * Math.PI * 44; // r=44
  const dashOffset = circumference * (1 - progressFraction);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          key="refrost"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6 } }}
          transition={{ duration: 0.5 }}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 80,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 28px",
            // Heavy frost glass
            backdropFilter: "blur(40px) saturate(0.4) brightness(0.7)",
            WebkitBackdropFilter: "blur(40px) saturate(0.4) brightness(0.7)",
            background: "rgba(4, 6, 28, 0.72)",
            borderRadius: 0,
          }}
        >
          {/* Floating ice crystal particles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -24, 0],
                x: [0, (i % 2 === 0 ? 1 : -1) * 12, 0],
                opacity: [0.15, 0.45, 0.15],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 4 + i * 0.7,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5,
              }}
              style={{
                position: "absolute",
                left: `${10 + (i * 11) % 80}%`,
                top: `${12 + (i * 13) % 70}%`,
                width: 6 + (i % 3) * 4,
                height: 6 + (i % 3) * 4,
                borderRadius: i % 2 === 0 ? "2px" : "50%",
                background: i % 3 === 0
                  ? "rgba(137,247,254,0.6)"
                  : i % 3 === 1
                  ? "rgba(155,109,255,0.5)"
                  : "rgba(255,255,255,0.4)",
                pointerEvents: "none",
                filter: "blur(1px)",
              }}
            />
          ))}

          {/* Main content */}
          <div style={{ textAlign: "center", position: "relative", zIndex: 2 }}>
            {/* Countdown ring */}
            <div style={{ position: "relative", width: 108, height: 108, margin: "0 auto 28px" }}>
              {/* Track ring */}
              <svg
                width="108"
                height="108"
                viewBox="0 0 108 108"
                style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}
              >
                <circle
                  cx="54" cy="54" r="44"
                  fill="none"
                  stroke="rgba(137,247,254,0.12)"
                  strokeWidth="3"
                />
                <motion.circle
                  cx="54" cy="54" r="44"
                  fill="none"
                  stroke="rgba(137,247,254,0.55)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  style={{ transition: "stroke-dashoffset 1s linear" }}
                />
              </svg>

              {/* Center icon + time */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <motion.div
                  animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    fontSize: 28,
                    filter: "drop-shadow(0 0 8px rgba(137,247,254,0.8))",
                    lineHeight: 1,
                    marginBottom: 2,
                  }}
                >
                  ❄️
                </motion.div>
                <span style={{ fontSize: 11, color: "rgba(137,247,254,0.6)", fontWeight: 700, letterSpacing: "0.04em" }}>
                  FROSTED
                </span>
              </div>
            </div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                fontSize: 24,
                fontWeight: 900,
                letterSpacing: "-0.025em",
                color: "#f0f0f5",
                marginBottom: 10,
                lineHeight: 1.2,
              }}
            >
              Your feed is frosted
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.38)",
                lineHeight: 1.7,
                maxWidth: 280,
                margin: "0 auto 28px",
              }}
            >
              You released your Akin pick. Browsing is locked while you reflect — it reopens in
            </motion.p>

            {/* Countdown */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.38, type: "spring", stiffness: 280 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                background: "rgba(137,247,254,0.08)",
                border: "1px solid rgba(137,247,254,0.22)",
                borderRadius: 14,
                padding: "14px 24px",
              }}
            >
              {[
                { val: String(h).padStart(2, "0"), label: "h" },
                { val: ":", label: null },
                { val: String(m).padStart(2, "0"), label: "m" },
                { val: ":", label: null },
                { val: String(s).padStart(2, "0"), label: "s" },
              ].map((seg, i) =>
                seg.label === null ? (
                  <motion.span
                    key={i}
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    style={{ fontSize: 28, fontWeight: 900, color: "rgba(137,247,254,0.5)", lineHeight: 1, width: 8, textAlign: "center" }}
                  >
                    :
                  </motion.span>
                ) : (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 44 }}>
                    <span style={{ fontSize: 32, fontWeight: 900, color: "rgba(137,247,254,0.9)", letterSpacing: "-0.03em", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                      {seg.val}
                    </span>
                    <span style={{ fontSize: 10, color: "rgba(137,247,254,0.35)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {seg.label}
                    </span>
                  </div>
                )
              )}
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", marginTop: 20, fontStyle: "italic" }}
            >
              "A choice made slowly is a choice that lasts."
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
