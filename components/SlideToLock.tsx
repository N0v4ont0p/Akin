"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

interface SlideToLockProps {
  label?: string;
  lockedLabel?: string;
  onLock: () => void;
  disabled?: boolean;
  accentColor?: string;
}

export default function SlideToLock({
  label = "Slide to lock in",
  lockedLabel = "Locked ✦",
  onLock,
  disabled = false,
  accentColor = "#9b6dff",
}: SlideToLockProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [locked, setLocked] = useState(false);
  const [maxX, setMaxX] = useState(260);
  const THUMB_W = 58;
  const PADDING = 4;

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        setMaxX(containerRef.current.offsetWidth - THUMB_W - PADDING * 2);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const x = useMotionValue(0);
  const fillOpacity = useTransform(x, [0, maxX], [0.18, 0.65]);
  const labelOpacity = useTransform(x, [0, maxX * 0.45], [1, 0]);
  const thumbScale = useTransform(x, [0, maxX * 0.5, maxX], [1, 1.08, 1.14]);
  const arrowOpacity = useTransform(x, [0, maxX * 0.8], [1, 0]);
  const starOpacity = useTransform(x, [maxX * 0.75, maxX], [0, 1]);
  const fillWidth = useTransform(x, [0, maxX], [THUMB_W + PADDING, THUMB_W + PADDING + maxX]);

  const handleDragEnd = () => {
    const currentX = x.get();
    if (currentX >= maxX * 0.82) {
      animate(x, maxX, { type: "spring", stiffness: 700, damping: 40 });
      setLocked(true);
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate([20, 8, 40, 8, 60]);
      }
      setTimeout(onLock, 420);
    } else {
      animate(x, 0, { type: "spring", stiffness: 380, damping: 28 });
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        height: 62,
        borderRadius: 999,
        background: `rgba(${accentColor === "#9b6dff" ? "155,109,255" : "0,229,160"},0.10)`,
        border: `1.5px solid rgba(${accentColor === "#9b6dff" ? "155,109,255" : "0,229,160"},0.28)`,
        overflow: "hidden",
        cursor: disabled ? "not-allowed" : "default",
        opacity: disabled ? 0.5 : 1,
        userSelect: "none",
      }}
    >
      {/* Fill track */}
      <motion.div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: fillWidth,
          background: `linear-gradient(90deg, rgba(${accentColor === "#9b6dff" ? "155,109,255" : "0,229,160"},0.35), rgba(${accentColor === "#9b6dff" ? "109,59,255" : "0,185,130"},0.15))`,
          borderRadius: 999,
          pointerEvents: "none",
          opacity: fillOpacity,
        }}
      />

      {/* Sheen sweep */}
      <motion.div
        animate={locked ? {} : { x: ["-100%", "200%"] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.8 }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "45%",
          height: "100%",
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)",
          pointerEvents: "none",
          borderRadius: 999,
        }}
      />

      {/* Label */}
      <motion.span
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 15,
          fontWeight: 700,
          color: accentColor,
          opacity: labelOpacity,
          letterSpacing: "0.01em",
          pointerEvents: "none",
          paddingLeft: THUMB_W + 12,
        }}
      >
        {locked ? lockedLabel : label}
      </motion.span>

      {/* Thumb */}
      <motion.div
        drag={disabled || locked ? false : "x"}
        dragConstraints={{ left: 0, right: maxX }}
        dragElastic={0.04}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        whileTap={{ scale: 1.05 }}
        style={{
          x,
          scale: thumbScale,
          position: "absolute",
          left: PADDING,
          top: PADDING,
          width: THUMB_W,
          height: 62 - PADDING * 2,
          borderRadius: 999,
          background: locked
            ? `linear-gradient(135deg, ${accentColor}, ${accentColor === "#9b6dff" ? "#6d3bff" : "#00b87a"})`
            : "rgba(255,255,255,0.95)",
          boxShadow: locked
            ? `0 4px 24px ${accentColor}88`
            : "0 3px 18px rgba(0,0,0,0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: disabled || locked ? "default" : "grab",
          zIndex: 2,
          transition: "background 0.35s ease, box-shadow 0.35s ease",
        }}
      >
        {/* Arrow icon */}
        <motion.div style={{ opacity: arrowOpacity, position: "absolute" }}>
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke={accentColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </motion.div>

        {/* Star lock icon */}
        <motion.span
          style={{
            opacity: starOpacity,
            position: "absolute",
            fontSize: 22,
            color: "white",
            filter: "drop-shadow(0 0 6px rgba(255,255,255,0.8))",
          }}
        >
          ✦
        </motion.span>
      </motion.div>
    </div>
  );
}
