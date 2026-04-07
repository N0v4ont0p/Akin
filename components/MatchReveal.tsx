"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GradientAvatar from "./GradientAvatar";

interface MatchFacts {
  comfortFood?: string;
  major?: string;
  campusVibe?: string;
  deepFact?: string;
}

interface MatchRevealProps {
  myGradient: number;
  myName: string;
  matchGradient: number;
  matchName: string;
  onContinue: () => void;
  isAkin?: boolean;
  isInstantReveal?: boolean;
  matchFacts?: MatchFacts | null;
}

function seeded(seed: number, max: number) {
  return ((seed * 1664525 + 1013904223) & 0x7fffffff) % max;
}

// ─── Instant Reveal — intimate, warm, all facts shown ────────────────────────

function InstantReveal({ myGradient, myName, matchGradient, matchName, onContinue, matchFacts }: {
  myGradient: number;
  myName: string;
  matchGradient: number;
  matchName: string;
  onContinue: () => void;
  matchFacts?: MatchFacts | null;
}) {
  const [phase, setPhase] = useState<"flash" | "bloom" | "reveal">("flash");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("bloom"), 280);
    const t2 = setTimeout(() => setPhase("reveal"), 1000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const facts = useMemo(() => {
    const out: { label: string; value: string; icon: string }[] = [];
    if (matchFacts?.comfortFood) out.push({ label: "Comfort Food", value: matchFacts.comfortFood, icon: "🍜" });
    if (matchFacts?.major && matchFacts?.campusVibe) out.push({ label: "World", value: `${matchFacts.major} · ${matchFacts.campusVibe}`, icon: "🎓" });
    else if (matchFacts?.major) out.push({ label: "Major", value: matchFacts.major, icon: "🎓" });
    else if (matchFacts?.campusVibe) out.push({ label: "Vibe", value: matchFacts.campusVibe, icon: "✨" });
    if (matchFacts?.deepFact) out.push({ label: "Deep Fact", value: matchFacts.deepFact, icon: "💬" });
    return out;
  }, [matchFacts]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
      style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}
    >
      {/* Warm golden background */}
      <div style={{ position: "absolute", inset: 0, background: "#04030a", zIndex: 0 }} />

      {/* Bloom glow */}
      <AnimatePresence>
        {(phase === "bloom" || phase === "reveal") && (
          <motion.div
            key="glow"
            initial={{ opacity: 0, scale: 0.2 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            style={{
              position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
              background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(255,200,80,0.18) 0%, rgba(155,109,255,0.12) 45%, transparent 70%)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Flash */}
      <AnimatePresence>
        {phase === "flash" && (
          <motion.div
            key="flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.55, 0] }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            style={{ position: "absolute", inset: 0, background: "rgba(255,220,100,0.6)", zIndex: 5, pointerEvents: "none" }}
          />
        )}
      </AnimatePresence>

      {/* Floating golden particles */}
      <AnimatePresence>
        {phase === "reveal" && Array.from({ length: 24 }, (_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            animate={{ opacity: 0, y: -(80 + seeded(i * 5, 120)), x: (seeded(i * 3, 160) - 80), scale: 0 }}
            transition={{ duration: 2.2 + seeded(i * 11, 15) / 10, delay: seeded(i * 17, 12) / 10, ease: "easeOut", repeat: Infinity, repeatDelay: 1.5 }}
            style={{
              position: "absolute",
              left: `${10 + seeded(i * 7, 80)}%`,
              top: `${10 + seeded(i * 13, 80)}%`,
              width: i % 4 === 0 ? 10 : 6,
              height: i % 4 === 0 ? 10 : 6,
              borderRadius: i % 3 === 0 ? 2 : "50%",
              background: i % 3 === 0 ? "#ffd54f" : i % 3 === 1 ? "#9b6dff" : "#00e5a0",
              boxShadow: `0 0 ${i % 4 === 0 ? 16 : 8}px ${i % 3 === 0 ? "#ffd54f" : "#9b6dff"}`,
              zIndex: 3, pointerEvents: "none",
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
            transition={{ duration: 0.3 }}
            style={{
              position: "relative", zIndex: 10,
              display: "flex", flexDirection: "column", alignItems: "center",
              padding: "32px 24px", textAlign: "center",
              maxWidth: "440px", width: "100%",
              overflowY: "auto", maxHeight: "90vh",
            }}
          >
            {/* Eyebrow */}
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.28em", color: "rgba(255,200,80,0.55)", marginBottom: 12 }}
            >
              mutual akin ✦
            </motion.p>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, scale: 0.7, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 240, damping: 20 }}
              style={{
                fontSize: "clamp(34px, 9vw, 52px)", fontWeight: 900,
                letterSpacing: "-0.035em", marginBottom: 6, lineHeight: 1.05,
                background: "linear-gradient(135deg, #ffd54f, #ff9a3c, #9b6dff)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}
            >
              They felt it too.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", marginBottom: 36, lineHeight: 1.6 }}
            >
              Your only pick. Their only pick.<br />One connection, no waiting.
            </motion.p>

            {/* Avatars — side by side, warm glow */}
            <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 32, position: "relative" }}>
              {/* Connection glow */}
              <motion.div
                animate={{ opacity: [0.4, 0.85, 0.4], scaleX: [0.8, 1.3, 0.8] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)",
                  width: 160, height: 70, borderRadius: "50%",
                  background: "radial-gradient(ellipse, rgba(255,200,80,0.45), transparent 70%)",
                  filter: "blur(12px)", pointerEvents: "none",
                }}
              />

              {/* My avatar */}
              <motion.div
                initial={{ x: -60, opacity: 0, scale: 0.7 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 220, damping: 18 }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}
              >
                <motion.div
                  animate={{ boxShadow: ["0 0 0 0 rgba(255,200,80,0)", "0 0 0 10px rgba(255,200,80,0.2)", "0 0 0 0 rgba(255,200,80,0)"] }}
                  transition={{ duration: 2.4, repeat: Infinity }}
                  style={{ borderRadius: "50%" }}
                >
                  <GradientAvatar gradient={myGradient} name={myName} size={88} border="3px solid rgba(255,200,80,0.5)" style={{ boxShadow: "0 0 36px rgba(255,200,80,0.25)" }} />
                </motion.div>
                <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.75)" }}>You</span>
              </motion.div>

              {/* Center ✦ */}
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 280, damping: 16 }}
                style={{ flexShrink: 0, zIndex: 2 }}
              >
                <motion.span
                  animate={{ scale: [1, 1.4, 1], filter: ["drop-shadow(0 0 6px rgba(255,200,80,0.6))", "drop-shadow(0 0 20px rgba(255,200,80,1))", "drop-shadow(0 0 6px rgba(255,200,80,0.6))"] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    fontSize: 28,
                    background: "linear-gradient(135deg, #ffd54f, #9b6dff)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                  }}
                >
                  ✦
                </motion.span>
              </motion.div>

              {/* Their avatar — fully clear */}
              <motion.div
                initial={{ x: 60, opacity: 0, scale: 0.7 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 220, damping: 18 }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}
              >
                <motion.div
                  animate={{ boxShadow: ["0 0 0 0 rgba(155,109,255,0)", "0 0 0 10px rgba(155,109,255,0.2)", "0 0 0 0 rgba(155,109,255,0)"] }}
                  transition={{ duration: 2.4, delay: 0.4, repeat: Infinity }}
                  style={{ borderRadius: "50%" }}
                >
                  <GradientAvatar gradient={matchGradient} name={matchName} size={88} border="3px solid rgba(155,109,255,0.55)" style={{ boxShadow: "0 0 36px rgba(155,109,255,0.3)" }} />
                </motion.div>
                <motion.span
                  animate={{ opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ fontSize: 12, fontWeight: 800, color: "#c084fc", textShadow: "0 0 10px rgba(192,132,252,0.5)" }}
                >
                  {matchName}
                </motion.span>
              </motion.div>
            </div>

            {/* Facts card — intimate reveal */}
            {facts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                style={{
                  width: "100%", borderRadius: 20,
                  background: "rgba(255,200,80,0.05)",
                  border: "1px solid rgba(255,200,80,0.15)",
                  padding: "18px 20px", marginBottom: 28,
                  boxShadow: "0 0 32px rgba(255,200,80,0.06)",
                }}
              >
                <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,200,80,0.5)", marginBottom: 14 }}>
                  Who they are
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {facts.map((fact, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + i * 0.1 }}
                      style={{ display: "flex", alignItems: "flex-start", gap: 10 }}
                    >
                      <span style={{ fontSize: 16, flexShrink: 0 }}>{fact.icon}</span>
                      <div>
                        <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>{fact.label}</p>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.82)", lineHeight: 1.4 }}>{fact.value}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* CTA */}
            <motion.button
              onClick={onContinue}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: facts.length > 0 ? 0.9 : 0.65, type: "spring", stiffness: 260, damping: 24 }}
              whileHover={{ scale: 1.04, boxShadow: "0 16px 48px rgba(255,200,80,0.35)" }}
              whileTap={{ scale: 0.96 }}
              style={{
                background: "linear-gradient(135deg, rgba(255,200,80,0.18), rgba(155,109,255,0.18))",
                color: "#ffd54f",
                border: "1.5px solid rgba(255,200,80,0.4)",
                borderRadius: 16, padding: "16px 52px",
                fontSize: 16, fontWeight: 700, cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: "0 8px 32px rgba(255,200,80,0.15)",
                letterSpacing: "0.01em",
              }}
            >
              Meet your Akin →
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Mystery Reveal — frost, 48h countdown ────────────────────────────────────

function MysteryReveal({ myGradient, myName, matchGradient, matchName, onContinue, isAkin }: {
  myGradient: number;
  myName: string;
  matchGradient: number;
  matchName: string;
  onContinue: () => void;
  isAkin?: boolean;
}) {
  const [phase, setPhase] = useState<"flash" | "rings" | "reveal">("flash");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("rings"), 320);
    const t2 = setTimeout(() => setPhase("reveal"), 920);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const particles = useMemo(() =>
    Array.from({ length: 32 }, (_, i) => ({
      id: i,
      left: 10 + seeded(i * 7, 80),
      top: 10 + seeded(i * 13, 80),
      size: i % 4 === 0 ? 10 : i % 3 === 0 ? 7 : 5,
      color: i % 3 === 0 ? "#9b6dff" : i % 3 === 1 ? "#00e5a0" : "#89f7fe",
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
      style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}
    >
      <div style={{ position: "absolute", inset: 0, background: "#04040e", zIndex: 0 }} />

      <AnimatePresence>
        {phase === "flash" && (
          <motion.div key="flash" initial={{ opacity: 0 }} animate={{ opacity: [0, 0.7, 0] }} transition={{ duration: 0.32, ease: "easeOut" }}
            style={{ position: "absolute", inset: 0, background: "white", zIndex: 5, pointerEvents: "none" }} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(phase === "rings" || phase === "reveal") && [0, 1, 2, 3].map((i) => (
          <motion.div key={`ring-${i}`} initial={{ width: 0, height: 0, opacity: 0.9 }} animate={{ width: 900, height: 900, opacity: 0 }}
            transition={{ duration: 1.4, delay: i * 0.18, ease: "easeOut" }}
            style={{ position: "absolute", borderRadius: "50%", border: `${2 - i * 0.3}px solid rgba(137,247,254,0.5)`, zIndex: 1, pointerEvents: "none" }} />
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {(phase === "rings" || phase === "reveal") && (
          <motion.div key="glow" initial={{ opacity: 0, scale: 0.3 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.1, ease: "easeOut" }}
            style={{ position: "absolute", inset: 0, zIndex: 0, background: "radial-gradient(ellipse 70% 55% at 50% 50%, rgba(137,247,254,0.18) 0%, rgba(155,109,255,0.1) 45%, transparent 70%)", pointerEvents: "none" }} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === "reveal" && particles.map((p) => (
          <motion.div key={p.id}
            initial={{ opacity: 1, y: 0, x: 0, scale: 1, rotate: 0 }}
            animate={{ opacity: 0, y: p.dy, x: p.dx, scale: p.isStar ? [1, 1.4, 0] : [1, 0.6, 0], rotate: p.isStar ? 360 : 0 }}
            transition={{ duration: p.dur, delay: p.delay, ease: "easeOut", repeat: Infinity, repeatDelay: 1.2 }}
            style={{ position: "absolute", left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size, borderRadius: p.isStar ? 2 : "50%", background: p.color, zIndex: 3, pointerEvents: "none", boxShadow: `0 0 ${p.size * 2}px ${p.color}` }} />
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {phase === "reveal" && (
          <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}
            style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 24px", textAlign: "center", maxWidth: "440px", width: "100%" }}
          >
            <motion.p initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}
              style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.28em", color: "rgba(255,255,255,0.38)", marginBottom: 14 }}>
              {isAkin ? "akin match" : "matched"}
            </motion.p>

            <motion.h1 initial={{ opacity: 0, scale: 0.6, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.22, type: "spring", stiffness: 260, damping: 20 }}
              style={{ fontSize: "clamp(26px, 7vw, 44px)", fontWeight: 900, letterSpacing: "-0.035em", marginBottom: 44, lineHeight: 1.05,
                background: "linear-gradient(135deg, #89f7fe, #9b6dff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              An Akin Found You
            </motion.h1>

            {/* Avatars */}
            <div style={{ display: "flex", alignItems: "center", gap: 28, marginBottom: 32, position: "relative" }}>
              <motion.div animate={{ opacity: [0.4, 0.9, 0.4], scaleX: [0.8, 1.2, 0.8] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", width: 180, height: 80, borderRadius: "50%",
                  background: "radial-gradient(ellipse, rgba(137,247,254,0.35), transparent 70%)", filter: "blur(12px)", pointerEvents: "none" }} />

              <motion.div initial={{ x: -80, opacity: 0, scale: 0.7 }} animate={{ x: 0, opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 220, damping: 18 }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <GradientAvatar gradient={myGradient} name={myName} size={88} border="3px solid rgba(137,247,254,0.4)" style={{ boxShadow: "0 0 36px rgba(137,247,254,0.2)" }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.75)" }}>You</span>
              </motion.div>

              <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 16 }} style={{ flexShrink: 0, zIndex: 2 }}>
                <motion.span animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity }}
                  style={{ fontSize: 28, color: "#89f7fe", filter: "drop-shadow(0 0 12px rgba(137,247,254,0.8))" }}>❄️</motion.span>
              </motion.div>

              <motion.div initial={{ x: 80, opacity: 0, scale: 0.7 }} animate={{ x: 0, opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 220, damping: 18 }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <div style={{ position: "relative" }}>
                  <GradientAvatar gradient={matchGradient} name={matchName} size={88} border="3px solid rgba(137,247,254,0.3)"
                    style={{ filter: "blur(22px) brightness(0.4) saturate(0)", boxShadow: "0 0 36px rgba(137,247,254,0.1)" }} />
                  <motion.div animate={{ opacity: [0.6, 1, 0.6], scale: [0.9, 1.1, 0.9] }} transition={{ duration: 2.2, repeat: Infinity }}
                    style={{ position: "absolute", inset: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 24, filter: "drop-shadow(0 0 8px rgba(137,247,254,0.9))" }}>❄️</span>
                  </motion.div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.28)", filter: "blur(4px)", userSelect: "none" }}>???</span>
              </motion.div>
            </div>

            {/* Subtitle */}
            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
              style={{ fontSize: 14, color: "rgba(255,255,255,0.42)", marginBottom: 12, lineHeight: 1.65, maxWidth: 300 }}>
              Their identity is sealed for 48 hours. Clues drop every 16h — can you figure out who picked you?
            </motion.p>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 }}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(137,247,254,0.07)", border: "1px solid rgba(137,247,254,0.2)", borderRadius: 999, padding: "6px 14px", marginBottom: 40 }}>
              <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }}
                style={{ width: 6, height: 6, borderRadius: "50%", background: "#89f7fe", flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(137,247,254,0.8)", letterSpacing: "0.04em" }}>48h mystery begins now</span>
            </motion.div>

            <motion.button onClick={onContinue}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.92, type: "spring", stiffness: 260, damping: 24 }}
              whileHover={{ scale: 1.04, boxShadow: "0 16px 48px rgba(137,247,254,0.25)" }}
              whileTap={{ scale: 0.96 }}
              style={{ background: "linear-gradient(135deg, rgba(137,247,254,0.14), rgba(137,247,254,0.06))", color: "#89f7fe", border: "1.5px solid rgba(137,247,254,0.4)", borderRadius: 16, padding: "16px 52px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 8px 28px rgba(137,247,254,0.1)", letterSpacing: "0.01em" }}>
              Start the countdown →
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Export — route to correct mode ──────────────────────────────────────────

export default function MatchReveal({
  myGradient,
  myName,
  matchGradient,
  matchName,
  onContinue,
  isAkin = false,
  isInstantReveal = false,
  matchFacts,
}: MatchRevealProps) {
  if (isInstantReveal) {
    return (
      <InstantReveal
        myGradient={myGradient}
        myName={myName}
        matchGradient={matchGradient}
        matchName={matchName}
        onContinue={onContinue}
        matchFacts={matchFacts}
      />
    );
  }
  return (
    <MysteryReveal
      myGradient={myGradient}
      myName={myName}
      matchGradient={matchGradient}
      matchName={matchName}
      onContinue={onContinue}
      isAkin={isAkin}
    />
  );
}
