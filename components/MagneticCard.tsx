"use client";

import React, { useRef, ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

interface MagneticCardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  isActive?: boolean;
  onClick?: () => void;
}

export default function MagneticCard({
  children,
  className = "",
  style = {},
  isActive = false,
  onClick,
}: MagneticCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), {
    stiffness: 280,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), {
    stiffness: 280,
    damping: 22,
  });

  const glowX = useTransform(mouseX, [-0.5, 0.5], [0, 100]);
  const glowY = useTransform(mouseY, [-0.5, 0.5], [0, 100]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{ perspective: 1000, ...style }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          width: "100%",
          height: "100%",
          position: "relative",
        }}
        animate={{
          scale: isActive ? 1.03 : 1,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        {/* Dynamic glare */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
            opacity: 0.1,
            background: useTransform(
              [glowX, glowY],
              ([x, y]) =>
                `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.9), transparent 65%)`
            ),
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        {/* Orchid glow when active */}
        {isActive && (
          <div
            style={{
              position: "absolute",
              inset: "-2px",
              borderRadius: "inherit",
              background:
                "linear-gradient(135deg, rgba(155,109,255,0.35), rgba(0,229,160,0.15))",
              zIndex: 0,
              filter: "blur(10px)",
              pointerEvents: "none",
            }}
          />
        )}

        <div style={{ position: "relative", zIndex: 2, height: "100%" }}>
          {children}
        </div>
      </motion.div>
    </div>
  );
}
