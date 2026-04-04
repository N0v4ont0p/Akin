"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GradientAvatar from "./GradientAvatar";
import { GRADIENTS, UserProfile } from "@/lib/firestore";

interface ProfileSheetProps {
  profile: UserProfile;
  matchCount: number;
  classmateCount: number;
  onClose: () => void;
  onUpdateProfile: (name: string, gradient: number) => Promise<void>;
  onLeaveClass: () => void;
}

export default function ProfileSheet({
  profile,
  matchCount,
  classmateCount,
  onClose,
  onUpdateProfile,
  onLeaveClass,
}: ProfileSheetProps) {
  const [gradient, setGradient] = useState(profile.avatarGradient ?? 0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const gradientChanged = gradient !== (profile.avatarGradient ?? 0);

  const handleSave = async () => {
    if (!gradientChanged || saving) return;
    setSaving(true);
    await onUpdateProfile(profile.name, gradient);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 200,
          background: "rgba(0,0,0,0.72)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 380, damping: 40 }}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 201,
          background: "#0c0c1a",
          borderRadius: "28px 28px 0 0",
          border: "1px solid rgba(255,255,255,0.10)",
          borderBottom: "none",
          maxHeight: "92vh",
          overflowY: "auto",
          paddingBottom: "max(env(safe-area-inset-bottom), 32px)",
        }}
      >
        {/* Drag handle */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 14, paddingBottom: 4 }}>
          <div
            style={{ width: 44, height: 5, borderRadius: 999, background: "rgba(255,255,255,0.14)" }}
          />
        </div>

        {/* ─── Hero section ─────────────────────────────── */}
        <div style={{ position: "relative", paddingBottom: 0 }}>
          {/* Gradient hero banner — uses user's gradient color */}
          <div
            style={{
              height: 130,
              background: GRADIENTS[gradient],
              opacity: 0.25,
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              borderRadius: "28px 28px 0 0",
              filter: "blur(2px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 130,
              background: "linear-gradient(to bottom, transparent, #0c0c1a)",
              borderRadius: "28px 28px 0 0",
            }}
          />

          {/* Close button */}
          <div
            style={{
              position: "relative",
              display: "flex",
              justifyContent: "flex-end",
              padding: "14px 20px 0",
              zIndex: 2,
            }}
          >
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "rgba(0,0,0,0.45)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.7)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </motion.button>
          </div>

          {/* Avatar — centered, big */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              position: "relative",
              zIndex: 2,
              paddingTop: 8,
              paddingBottom: 20,
            }}
          >
            <motion.div
              key={gradient}
              initial={{ scale: 0.88, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 380, damping: 26 }}
              style={{
                padding: 4,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${GRADIENTS[gradient].split("(")[0]}(${GRADIENTS[gradient].split("(").slice(1).join("(")})`,
                boxShadow: "0 8px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)",
              }}
            >
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 0 3px rgba(155,109,255,0.2)",
                    "0 0 0 6px rgba(155,109,255,0.35)",
                    "0 0 0 3px rgba(155,109,255,0.2)",
                  ],
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                style={{ borderRadius: "50%" }}
              >
                <GradientAvatar
                  gradient={gradient}
                  name={profile.name}
                  size={114}
                  border="3px solid rgba(12,12,26,0.9)"
                />
              </motion.div>
            </motion.div>

            {/* Name — locked, displayed only */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 18,
                marginBottom: 4,
              }}
            >
              <h2
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  color: "#f0f0f5",
                }}
              >
                {profile.name}
              </h2>
              <div
                title="Name is locked to keep Akin authentic"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  background: "rgba(155,109,255,0.12)",
                  border: "1px solid rgba(155,109,255,0.25)",
                  borderRadius: 999,
                  padding: "3px 10px",
                }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(155,109,255,0.8)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span style={{ fontSize: 11, color: "rgba(155,109,255,0.75)", fontWeight: 600 }}>locked</span>
              </div>
            </div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.28)", letterSpacing: "0.02em" }}>
              Name is permanent — keeps Akin authentic
            </p>
          </div>
        </div>

        {/* ─── Stats ──────────────────────────────────────── */}
        <div style={{ padding: "0 20px", marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <StatCard
              value={matchCount}
              label="Matches"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--mint)" stroke="none">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              }
              color="var(--mint)"
            />
            <StatCard
              value={classmateCount}
              label="Classmates"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--orchid)" strokeWidth="2" strokeLinecap="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              }
              color="var(--orchid)"
            />
            <StatCard
              value={profile.className}
              label="Class"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              }
              color="rgba(255,255,255,0.55)"
              small
            />
          </div>
        </div>

        {/* ─── Class Badge ─────────────────────────────────── */}
        <div style={{ padding: "0 20px", marginBottom: 24 }}>
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16,
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: "linear-gradient(135deg, rgba(155,109,255,0.2), rgba(0,229,160,0.15))",
                border: "1px solid rgba(155,109,255,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--orchid)" strokeWidth="1.8" strokeLinecap="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#f0f0f5", marginBottom: 1 }}>
                {profile.className}
              </p>
              {profile.schoolName && (
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
                  {profile.schoolName}
                </p>
              )}
            </div>
            <div style={{ marginLeft: "auto", flexShrink: 0 }}>
              <div
                style={{
                  background: "rgba(0,229,160,0.1)",
                  border: "1px solid rgba(0,229,160,0.25)",
                  borderRadius: 999,
                  padding: "4px 10px",
                  fontSize: 11,
                  color: "var(--mint)",
                  fontWeight: 600,
                }}
              >
                Active
              </div>
            </div>
          </div>
        </div>

        {/* ─── Colour Picker ───────────────────────────────── */}
        <div style={{ padding: "0 20px", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <label
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.38)",
              }}
            >
              Your Colour
            </label>
            {gradientChanged && (
              <motion.span
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ fontSize: 11, color: "rgba(155,109,255,0.8)", fontWeight: 600 }}
              >
                unsaved changes
              </motion.span>
            )}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, 1fr)",
              gap: 10,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 18,
              padding: "16px",
            }}
          >
            {GRADIENTS.map((g, i) => (
              <motion.button
                key={i}
                onClick={() => setGradient(i)}
                whileHover={{ scale: 1.18 }}
                whileTap={{ scale: 0.88 }}
                style={{
                  width: "100%",
                  aspectRatio: "1",
                  borderRadius: "50%",
                  background: g,
                  border: "none",
                  cursor: "pointer",
                  position: "relative",
                  outline: "none",
                  boxShadow:
                    gradient === i
                      ? "0 0 0 3px #fff, 0 0 0 5.5px rgba(155,109,255,0.8)"
                      : "0 2px 10px rgba(0,0,0,0.4)",
                  transition: "box-shadow 0.15s ease",
                }}
              >
                <AnimatePresence>
                  {gradient === i && (
                    <motion.div
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 28 }}
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(0,0,0,0.2)",
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>
        </div>

        {/* ─── Save button ─────────────────────────────────── */}
        <div style={{ padding: "0 20px", marginBottom: 14 }}>
          <AnimatePresence>
            {(gradientChanged || saved) && (
              <motion.button
                key="save-btn"
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.97 }}
                onClick={handleSave}
                disabled={saving || (!gradientChanged && !saved)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  width: "100%",
                  padding: "16px",
                  background: saved
                    ? "linear-gradient(135deg,#00e5a0,#0fa87a)"
                    : saving
                    ? "rgba(155,109,255,0.35)"
                    : "linear-gradient(135deg,#9b6dff,#6d3bff)",
                  color: "white",
                  border: "none",
                  borderRadius: 16,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: saving ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  boxShadow: saved
                    ? "0 8px 28px rgba(0,229,160,0.4)"
                    : "0 8px 28px rgba(155,109,255,0.45)",
                  letterSpacing: "0.01em",
                  transition: "background 0.3s, box-shadow 0.3s",
                }}
              >
                {saved ? "✓  Colour Saved" : saving ? "Saving…" : "Save Colour"}
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* ─── Danger zone ─────────────────────────────────── */}
        <div style={{ padding: "0 20px" }}>
          <div
            style={{
              background: "rgba(255,79,123,0.05)",
              border: "1px solid rgba(255,79,123,0.15)",
              borderRadius: 18,
              padding: "18px",
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "rgba(255,79,123,0.5)",
                marginBottom: 12,
              }}
            >
              Danger Zone
            </p>
            <AnimatePresence mode="wait">
              {!showLeaveConfirm ? (
                <motion.button
                  key="leave-btn"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowLeaveConfirm(true)}
                  style={{
                    width: "100%",
                    padding: "13px",
                    background: "transparent",
                    border: "1px solid rgba(255,79,123,0.25)",
                    color: "rgba(255,79,123,0.7)",
                    borderRadius: 12,
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Leave {profile.className}
                </motion.button>
              ) : (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  style={{
                    background: "rgba(255,79,123,0.08)",
                    border: "1px solid rgba(255,79,123,0.28)",
                    borderRadius: 14,
                    padding: "16px",
                  }}
                >
                  <p
                    style={{
                      color: "rgba(255,255,255,0.65)",
                      fontSize: 14,
                      marginBottom: 14,
                      textAlign: "center",
                      lineHeight: 1.55,
                    }}
                  >
                    Leave <strong style={{ color: "#f0f0f5" }}>{profile.className}</strong>?<br />
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.38)" }}>Your matches will be removed.</span>
                  </p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => setShowLeaveConfirm(false)}
                      style={{
                        flex: 1,
                        padding: "11px",
                        background: "rgba(255,255,255,0.07)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        color: "rgba(255,255,255,0.55)",
                        borderRadius: 10,
                        fontSize: 14,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={onLeaveClass}
                      style={{
                        flex: 1,
                        padding: "11px",
                        background: "rgba(255,79,123,0.18)",
                        border: "1px solid rgba(255,79,123,0.42)",
                        color: "#ff4f7b",
                        borderRadius: 10,
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      Leave
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div style={{ height: 12 }} />
      </motion.div>
    </>
  );
}

function StatCard({
  value,
  label,
  icon,
  color,
  small,
}: {
  value: string | number;
  label: string;
  icon: React.ReactNode;
  color: string;
  small?: boolean;
}) {
  return (
    <div
      style={{
        flex: 1,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        padding: "16px 10px 14px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
      }}
    >
      {icon}
      <p
        style={{
          fontSize: small ? 12 : 24,
          fontWeight: 800,
          color,
          letterSpacing: small ? "0" : "-0.02em",
          lineHeight: 1.1,
          wordBreak: "break-word",
        }}
      >
        {value}
      </p>
      <p
        style={{
          fontSize: 10,
          color: "rgba(255,255,255,0.32)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
        }}
      >
        {label}
      </p>
    </div>
  );
}
