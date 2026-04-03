"use client";

import React, { useEffect, useState } from "react";
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

export default function MatchReveal({
  myGradient,
  myName,
  matchGradient,
  matchName,
  onContinue,
  isAkin = false,
}: MatchRevealProps) {
  const [phase, setPhase] = useState<"shatter" | "bloom" | "reveal">("shatter");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("bloom"), 700);
    const t2 = setTimeout(() => setPhase("reveal"), 1400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const shatterPaths = {
    initial: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
    step1:
      "polygon(2% 1%, 48% 0%, 52% 4%, 99% 1%, 98% 48%, 100% 53%, 97% 99%, 51% 97%, 49% 100%, 1% 98%, 0% 51%, 3% 47%)",
    step2:
      "polygon(8% 5%, 45% 1%, 58% 9%, 93% 4%, 96% 43%, 100% 58%, 91% 94%, 56% 90%, 44% 99%, 7% 92%, 1% 57%, 5% 43%)",
    collapsed:
      "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%)",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
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
      {/* Dark base */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(7,7,15,0.97)",
          zIndex: -1,
        }}
      />

      {/* Phase 1: Shatter overlay */}
      <AnimatePresence>
        {phase === "shatter" && (
          <motion.div
            key="shatter"
            initial={{ clipPath: shatterPaths.initial, opacity: 1 }}
            animate={{
              clipPath: [
                shatterPaths.initial,
                shatterPaths.step1,
                shatterPaths.step2,
                shatterPaths.collapsed,
              ],
              opacity: [1, 1, 1, 0],
            }}
            transition={{
              duration: 0.7,
              times: [0, 0.3, 0.6, 1],
              ease: "easeInOut",
            }}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(7,7,15,1)",
              zIndex: 2,
            }}
          />
        )}
      </AnimatePresence>

      {/* Phase 2: Radial bloom */}
      <AnimatePresence>
        {(phase === "bloom" || phase === "reveal") && (
          <motion.div
            key="bloom"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              position: "absolute",
              inset: 0,
              background: isAkin
                ? "radial-gradient(circle at center, rgba(155,109,255,0.28) 0%, rgba(0,229,160,0.16) 35%, transparent 65%)"
                : "radial-gradient(circle at center, rgba(155,109,255,0.20) 0%, rgba(0,229,160,0.12) 35%, transparent 65%)",
              zIndex: 0,
            }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      {/* Floating particles */}
      <AnimatePresence>
        {phase === "reveal" &&
          Array.from({ length: 14 }, (_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0.8, y: 0, x: 0 }}
              animate={{
                opacity: 0,
                y: -180 - Math.random() * 100,
                x: (Math.random() - 0.5) * 120,
                rotate: 360,
              }}
              transition={{
                duration: 2 + Math.random() * 1.5,
                delay: Math.random() * 1.2,
                ease: "easeOut",
                repeat: Infinity,
                repeatDelay: 0.8,
              }}
              style={{
                position: "absolute",
                left: `${10 + Math.random() * 80}%`,
                top: `${20 + Math.random() * 60}%`,
                width: i % 3 === 0 ? "8px" : "5px",
                height: i % 3 === 0 ? "8px" : "5px",
                borderRadius: "50%",
                background: i % 2 === 0 ? "#9b6dff" : "#00e5a0",
                zIndex: 2,
                pointerEvents: "none",
              }}
            />
          ))}
      </AnimatePresence>

      {/* Main content */}
      <AnimatePresence>
        {phase === "reveal" && (
          <motion.div
            key="content"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 26,
              delay: 0.1,
            }}
            style={{
              position: "relative",
              zIndex: 10,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "40px 24px",
              textAlign: "center",
              maxWidth: "420px",
              width: "100%",
            }}
          >
            {/* Label */}
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.22em",
                color: "rgba(255,255,255,0.4)",
                marginBottom: "14px",
              }}
            >
              {isAkin ? "akin match" : "new match"}
            </motion.p>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, scale: 0.75 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 280 }}
              className="gradient-text-match"
              style={{
                fontSize: "clamp(32px, 8vw, 48px)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                marginBottom: "44px",
                lineHeight: 1.1,
              }}
            >
              {isAkin ? "✦ Akin ✦" : "It's a Match"}
            </motion.h1>

            {/* Avatars */}
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 18 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                marginBottom: "28px",
              }}
            >
              <div
                className="float-slow"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <GradientAvatar
                  gradient={myGradient}
                  name={myName}
                  size={88}
                  border="3px solid rgba(155,109,255,0.5)"
                  style={{ boxShadow: "0 0 32px rgba(155,109,255,0.3)" }}
                />
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.8)",
                  }}
                >
                  {myName}
                </span>
              </div>

              {/* Center icon */}
              <motion.div
                animate={isAkin ? { scale: [1, 1.3, 1], rotate: [0, 10, 0] } : { scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.6 }}
              >
                {isAkin ? (
                  <span style={{ fontSize: "28px" }}>✦</span>
                ) : (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="#00e5a0" stroke="none">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                )}
              </motion.div>

              <div
                className="float-slow"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "10px",
                  animationDelay: "0.5s",
                }}
              >
                <GradientAvatar
                  gradient={matchGradient}
                  name={matchName}
                  size={88}
                  border="3px solid rgba(0,229,160,0.5)"
                  style={{ boxShadow: "0 0 32px rgba(0,229,160,0.3)" }}
                />
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.8)",
                  }}
                >
                  {matchName}
                </span>
              </div>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
              style={{
                fontSize: "15px",
                color: "rgba(255,255,255,0.4)",
                marginBottom: "48px",
                lineHeight: 1.6,
              }}
            >
              {isAkin
                ? "You both chose each other. One pick. Mutual truth."
                : "You both liked each other."}
            </motion.p>

            {/* Continue button */}
            <motion.button
              onClick={onContinue}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              style={{
                background: "linear-gradient(135deg, #9b6dff, #6d3bff)",
                color: "white",
                border: "none",
                borderRadius: "14px",
                padding: "15px 48px",
                fontSize: "16px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: "0 12px 40px rgba(155,109,255,0.45)",
                letterSpacing: "0.01em",
              }}
            >
              Keep going
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
