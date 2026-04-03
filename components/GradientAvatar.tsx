"use client";

import React from "react";
import { getGradient, getInitials } from "@/lib/firestore";

interface GradientAvatarProps {
  gradient: number;
  name: string;
  size?: number;
  fontSize?: number;
  style?: React.CSSProperties;
  border?: string;
}

export default function GradientAvatar({
  gradient,
  name,
  size = 48,
  fontSize,
  style = {},
  border,
}: GradientAvatarProps) {
  const computedFontSize = fontSize ?? Math.round(size * 0.36);
  const initials = getInitials(name || "?");

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: getGradient(gradient),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        border: border ?? "none",
        boxShadow: `0 4px 16px rgba(0,0,0,0.3)`,
        ...style,
      }}
    >
      <span
        style={{
          fontSize: computedFontSize,
          fontWeight: "700",
          color: "rgba(255,255,255,0.95)",
          letterSpacing: "-0.01em",
          lineHeight: 1,
          userSelect: "none",
        }}
      >
        {initials}
      </span>
    </div>
  );
}
