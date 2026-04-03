"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { GRADIENTS } from "@/lib/firestore";

const SLIDES = [
  {
    title: "Private by Design",
    body: "Your pick is completely hidden. Only a mutual Akin reveals itself — and nothing else.",
    visual: "rings" as const,
  },
  {
    title: "Your Class, Your Circle",
    body: "Join your school class and discover who shares the same spark — safe, private, and just for your group.",
    visual: "grid" as const,
  },
  {
    title: "One Pick. Mutual Truth.",
    body: "No awkward one-sided feelings. When you're both Akin to each other, something true happens.",
    visual: "merge" as const,
  },
];

// ─── Slide 1: Pulsing privacy rings ──────────────────────────────────────────
function RingsVisual() {
  return (
    <div style={{ position: "relative", width: 340, height: 340, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {[340, 270, 195, 118].map((size, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            width: size,
            height: size,
            borderRadius: "50%",
            border: `${i === 0 ? 1 : 1.5}px solid rgba(155,109,255,${0.12 + i * 0.07})`,
          }}
          animate={{ scale: [1, 1.07, 1], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 3.5, delay: i * 0.55, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      {/* Lock icon in center */}
      <motion.div
        animate={{ boxShadow: ["0 0 24px rgba(155,109,255,0.5)", "0 0 60px rgba(155,109,255,0.9)", "0 0 24px rgba(155,109,255,0.5)"] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        style={{
          width: 56, height: 56, borderRadius: "50%",
          background: "linear-gradient(135deg,#9b6dff,#6d3bff)",
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative", zIndex: 2,
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </motion.div>
      {/* Orbiting dot */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
        style={{ position: "absolute", width: 195, height: 195 }}
      >
        <div style={{
          position: "absolute", top: -6, left: "50%", transform: "translateX(-50%)",
          width: 12, height: 12, borderRadius: "50%",
          background: "linear-gradient(135deg,#00e5a0,#9b6dff)",
          boxShadow: "0 0 12px rgba(0,229,160,0.8)",
        }} />
      </motion.div>
    </div>
  );
}

// ─── Illustrated person avatar (SVG, no photos) ───────────────────────────────
function PersonAvatar({ gradient, delay = 0, size = 64 }: { gradient: string; delay?: number; size?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 280, damping: 22 }}
      style={{
        width: size, height: size, borderRadius: "50%",
        background: gradient,
        boxShadow: "0 4px 20px rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden", flexShrink: 0,
      }}
    >
      {/* Simple illustrated face using SVG */}
      <svg width={size * 0.72} height={size * 0.72} viewBox="0 0 48 52" fill="none">
        {/* Head */}
        <ellipse cx="24" cy="18" rx="12" ry="13" fill="rgba(255,255,255,0.92)"/>
        {/* Hair */}
        <ellipse cx="24" cy="7" rx="12" ry="6" fill="rgba(255,255,255,0.35)"/>
        {/* Eyes */}
        <circle cx="19.5" cy="16" r="1.8" fill="rgba(0,0,0,0.55)"/>
        <circle cx="28.5" cy="16" r="1.8" fill="rgba(0,0,0,0.55)"/>
        {/* Smile */}
        <path d="M19 22 Q24 26 29 22" stroke="rgba(0,0,0,0.45)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        {/* Shoulders */}
        <path d="M8 52 Q8 38 24 36 Q40 38 40 52" fill="rgba(255,255,255,0.5)"/>
      </svg>
    </motion.div>
  );
}

// ─── Slide 2: People grid ─────────────────────────────────────────────────────
const PEOPLE = [
  { x: 10,  y: 4,  g: 0,  delay: 0,    size: 72 },
  { x: 40,  y: 0,  g: 2,  delay: 0.08, size: 80 },
  { x: 72,  y: 6,  g: 4,  delay: 0.16, size: 68 },
  { x: 4,   y: 52, g: 6,  delay: 0.12, size: 74 },
  { x: 37,  y: 48, g: 8,  delay: 0.04, size: 82 },
  { x: 70,  y: 54, g: 10, delay: 0.20, size: 70 },
];

function GridVisual() {
  return (
    <div style={{ position: "relative", width: 360, height: 230 }}>
      {PEOPLE.map((p, i) => (
        <div key={i} style={{ position: "absolute", left: `${p.x}%`, top: `${p.y}%` }}>
          <PersonAvatar gradient={GRADIENTS[p.g]} delay={p.delay} size={p.size} />
        </div>
      ))}
      {/* Connecting lines SVG */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible", pointerEvents: "none" }} viewBox="0 0 360 230">
        {[
          [62, 42, 180, 38],
          [62, 42, 50, 142],
          [180, 38, 294, 52],
          [294, 52, 280, 155],
          [50, 142, 280, 155],
          [180, 130, 294, 52],
        ].map(([x1, y1, x2, y2], i) => (
          <motion.line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="rgba(155,109,255,0.35)" strokeWidth="1.2" strokeDasharray="5 4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: 0.5 + i * 0.1, duration: 0.7 }}
          />
        ))}
      </svg>
    </div>
  );
}

// ─── Slide 3: Heart + Question mark ──────────────────────────────────────────
function MergeVisual() {
  return (
    <div style={{ position: "relative", width: 360, height: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* Center glow */}
      <motion.div
        animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.85, 1.2, 0.85] }}
        transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
        style={{
          position: "absolute",
          width: 130, height: 130, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,229,160,0.5), rgba(155,109,255,0.35), transparent)",
          filter: "blur(22px)",
        }}
      />

      {/* Left: Heart */}
      <motion.div
        animate={{ x: [50, 18, 50] }}
        transition={{ repeat: Infinity, duration: 3.4, ease: "easeInOut" }}
        style={{
          position: "absolute", left: 14,
          width: 108, height: 108, borderRadius: "50%",
          background: "linear-gradient(135deg,#ff4f7b,#c084fc)",
          boxShadow: "0 8px 36px rgba(255,79,123,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 2,
        }}
      >
        <svg width="50" height="50" viewBox="0 0 24 24" fill="white" stroke="none">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </motion.div>

      {/* Right: Question mark */}
      <motion.div
        animate={{ x: [-50, -18, -50] }}
        transition={{ repeat: Infinity, duration: 3.4, ease: "easeInOut" }}
        style={{
          position: "absolute", right: 14,
          width: 108, height: 108, borderRadius: "50%",
          background: "linear-gradient(135deg,#9b6dff,#4facfe)",
          boxShadow: "0 8px 36px rgba(155,109,255,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 2,
        }}
      >
        <svg width="48" height="48" viewBox="0 0 24 24" fill="white" stroke="none">
          <text x="12" y="18" textAnchor="middle" fontSize="22" fontWeight="800" fontFamily="Inter,system-ui,sans-serif" fill="white">?</text>
        </svg>
      </motion.div>

      {/* Center spark */}
      <motion.div
        animate={{ opacity: [0, 1, 0], scale: [0.3, 1.4, 0.3] }}
        transition={{ repeat: Infinity, duration: 3.4, delay: 1.5, ease: "easeInOut" }}
        style={{
          position: "absolute", zIndex: 3,
          width: 40, height: 40, borderRadius: "50%",
          background: "linear-gradient(135deg,#00e5a0,#9b6dff)",
          boxShadow: "0 0 32px rgba(0,229,160,0.9)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
        </svg>
      </motion.div>

      {/* Labels */}
      <motion.p
        animate={{ x: [50, 18, 50] }}
        transition={{ repeat: Infinity, duration: 3.4, ease: "easeInOut" }}
        style={{
          position: "absolute", bottom: 6, left: 14,
          width: 108, textAlign: "center",
          fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.55)",
          letterSpacing: "0.04em",
        }}
      >
        You
      </motion.p>
      <motion.p
        animate={{ x: [-50, -18, -50] }}
        transition={{ repeat: Infinity, duration: 3.4, ease: "easeInOut" }}
        style={{
          position: "absolute", bottom: 6, right: 14,
          width: 108, textAlign: "center",
          fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.55)",
          letterSpacing: "0.04em",
        }}
      >
        ???
      </motion.p>
    </div>
  );
}

const VISUALS = { rings: RingsVisual, grid: GridVisual, merge: MergeVisual };

export default function IntroSlides() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const goNext = () => {
    if (current < SLIDES.length - 1) setCurrent((c) => c + 1);
    else router.push("/auth");
  };

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x < -50 && current < SLIDES.length - 1) setCurrent((c) => c + 1);
    else if (info.offset.x > 50 && current > 0) setCurrent((c) => c - 1);
  };

  const slide = SLIDES[current];
  const Visual = VISUALS[slide.visual];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
      {/* Skip */}
      <div style={{ position: "absolute", top: 20, right: 20, zIndex: 10 }}>
        <button
          onClick={() => router.push("/auth")}
          style={{
            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.55)", borderRadius: 999, padding: "8px 18px",
            fontSize: 14, cursor: "pointer", fontFamily: "inherit",
          }}
        >
          Skip
        </button>
      </div>

      {/* Logo */}
      <div style={{ position: "absolute", top: 18, left: 20, zIndex: 10, display: "flex", alignItems: "center", gap: 8 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/akin-logo.png" alt="Akin" style={{ width: 30, height: 30, borderRadius: 8, objectFit: "cover" }} />
        <span style={{
          fontSize: 15, fontWeight: 800, letterSpacing: "0.25em",
          background: "linear-gradient(135deg,#9b6dff,#00e5a0)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}>AKIN</span>
      </div>

      {/* Visual area — taller on desktop */}
      <div style={{
        flex: "0 0 clamp(260px, 54vh, 420px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        paddingTop: 60,
      }}>
        {mounted && (
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.08, y: -10 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <Visual />
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Bottom card + controls */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
        style={{ flex: 1, display: "flex", flexDirection: "column", padding: "0 24px 44px", cursor: "grab" }}
      >
        <div style={{
          background: "rgba(255,255,255,0.05)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)",
          border: "1px solid rgba(255,255,255,0.09)", borderRadius: 24,
          padding: "28px 28px 24px", marginBottom: 22, minHeight: 130,
        }}>
          {mounted && (
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <h2 style={{
                  fontSize: "clamp(20px,5vw,26px)", fontWeight: 800, letterSpacing: "-0.02em",
                  marginBottom: 10, lineHeight: 1.2, color: "#f0f0f5",
                }}>
                  {slide.title}
                </h2>
                <p style={{ fontSize: 15, color: "rgba(240,240,245,0.55)", lineHeight: 1.65 }}>
                  {slide.body}
                </p>
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* Dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 20 }}>
          {SLIDES.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => setCurrent(i)}
              animate={{ width: i === current ? 24 : 8, opacity: i === current ? 1 : 0.28 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              style={{
                height: 8, borderRadius: 999, padding: 0,
                background: i === current ? "#9b6dff" : "rgba(255,255,255,0.3)",
                border: "none", cursor: "pointer",
              }}
            />
          ))}
        </div>

        {/* CTA */}
        <motion.button
          onClick={goNext}
          whileHover={{ scale: 1.02, boxShadow: "0 12px 40px rgba(155,109,255,0.5)" }}
          whileTap={{ scale: 0.97 }}
          style={{
            width: "100%", background: "linear-gradient(135deg,#9b6dff,#6d3bff)",
            color: "white", border: "none", borderRadius: 14, padding: "16px",
            fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            boxShadow: "0 8px 32px rgba(155,109,255,0.35)", letterSpacing: "0.01em",
          }}
        >
          {current < SLIDES.length - 1 ? "Next →" : "Get Started"}
        </motion.button>
      </motion.div>
    </div>
  );
}
