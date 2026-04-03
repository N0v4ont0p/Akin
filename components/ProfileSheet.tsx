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

function StatCard({
  value,
  label,
  color,
  small,
}: {
  value: string | number;
  label: string;
  color: string;
  small?: boolean;
}) {
  return (
    <div
      style={{
        flex: 1,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "14px",
        padding: "14px 10px",
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontSize: small ? 12 : 22,
          fontWeight: 700,
          color,
          marginBottom: 2,
          letterSpacing: small ? "0" : "-0.02em",
          lineHeight: 1.2,
          wordBreak: "break-word",
        }}
      >
        {value}
      </p>
      <p
        style={{
          fontSize: 10,
          color: "rgba(255,255,255,0.35)",
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </p>
    </div>
  );
}

export default function ProfileSheet({
  profile,
  matchCount,
  classmateCount,
  onClose,
  onUpdateProfile,
  onLeaveClass,
}: ProfileSheetProps) {
  const [name, setName] = useState(profile.name);
  const [gradient, setGradient] = useState(profile.avatarGradient ?? 0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const hasChanges =
    name.trim() !== profile.name || gradient !== (profile.avatarGradient ?? 0);

  const handleSave = async () => {
    if (!hasChanges || saving || !name.trim()) return;
    setSaving(true);
    await onUpdateProfile(name.trim(), gradient);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 360, damping: 38 }}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 201,
          background: "rgba(10,10,20,0.97)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          borderRadius: "28px 28px 0 0",
          border: "1px solid rgba(255,255,255,0.10)",
          borderBottom: "none",
          maxHeight: "90vh",
          overflowY: "auto",
          paddingBottom: "max(env(safe-area-inset-bottom), 28px)",
        }}
      >
        {/* Drag handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "14px 0 0" }}>
          <div
            style={{
              width: 40,
              height: 4,
              borderRadius: 999,
              background: "rgba(255,255,255,0.16)",
            }}
          />
        </div>

        <div style={{ padding: "20px 24px 0" }}>
          {/* Header row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 28,
            }}
          >
            <h2
              style={{
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: "#f0f0f5",
              }}
            >
              Your Profile
            </h2>
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.5)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </motion.button>
          </div>

          {/* Avatar preview — live updates */}
          <div
            style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}
          >
            <motion.div
              key={`${gradient}-${name}`}
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 360, damping: 28 }}
              style={{
                borderRadius: "50%",
                boxShadow: "0 0 0 4px rgba(155,109,255,0.3), 0 0 32px rgba(155,109,255,0.2)",
              }}
            >
              <GradientAvatar
                gradient={gradient}
                name={name || "?"}
                size={100}
                border="3px solid rgba(255,255,255,0.12)"
              />
            </motion.div>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
            <StatCard value={matchCount} label="Matches" color="var(--mint)" />
            <StatCard value={classmateCount} label="Classmates" color="var(--orchid)" />
            <StatCard
              value={profile.className}
              label="Class"
              color="rgba(255,255,255,0.55)"
              small
            />
          </div>

          {/* Name field */}
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.38)",
                marginBottom: 8,
                display: "block",
              }}
            >
              Display Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={30}
              className="input-glass"
              style={{ width: "100%", fontSize: 16, fontWeight: 600 }}
              placeholder="Your name"
            />
          </div>

          {/* Gradient picker */}
          <div style={{ marginBottom: 28 }}>
            <label
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.38)",
                marginBottom: 12,
                display: "block",
              }}
            >
              Your Colour
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(6, 1fr)",
                gap: 10,
              }}
            >
              {GRADIENTS.map((g, i) => (
                <motion.button
                  key={i}
                  onClick={() => setGradient(i)}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
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
                        ? "0 0 0 3px #fff, 0 0 0 5.5px rgba(155,109,255,0.75)"
                        : "0 2px 8px rgba(0,0,0,0.35)",
                    transition: "box-shadow 0.15s ease",
                  }}
                >
                  {gradient === i && (
                    <motion.div
                      layoutId="grad-check"
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Save */}
          <AnimatePresence>
            {(hasChanges || saved) && (
              <motion.button
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                onClick={handleSave}
                disabled={saving || !name.trim()}
                whileHover={!saving ? { scale: 1.02 } : {}}
                whileTap={!saving ? { scale: 0.97 } : {}}
                style={{
                  width: "100%",
                  padding: "15px",
                  background: saved
                    ? "linear-gradient(135deg,#00e5a0,#0fa87a)"
                    : saving
                    ? "rgba(155,109,255,0.4)"
                    : "linear-gradient(135deg,#9b6dff,#6d3bff)",
                  color: "white",
                  border: "none",
                  borderRadius: 14,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: saving ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  boxShadow: saved
                    ? "0 8px 28px rgba(0,229,160,0.35)"
                    : "0 8px 28px rgba(155,109,255,0.4)",
                  marginBottom: 12,
                  letterSpacing: "0.01em",
                  transition: "background 0.3s ease, box-shadow 0.3s ease",
                }}
              >
                {saved ? "✓ Saved" : saving ? "Saving…" : "Save Changes"}
              </motion.button>
            )}
          </AnimatePresence>

          {/* Leave class */}
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
                  background: "rgba(255,79,123,0.07)",
                  border: "1px solid rgba(255,79,123,0.2)",
                  color: "rgba(255,79,123,0.65)",
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Leave Class
              </motion.button>
            ) : (
              <motion.div
                key="leave-confirm"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                style={{
                  background: "rgba(255,79,123,0.08)",
                  border: "1px solid rgba(255,79,123,0.25)",
                  borderRadius: 16,
                  padding: "18px 16px",
                }}
              >
                <p
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: 14,
                    marginBottom: 14,
                    textAlign: "center",
                    lineHeight: 1.55,
                  }}
                >
                  This removes you from{" "}
                  <strong style={{ color: "#f0f0f5" }}>{profile.className}</strong>.
                  <br />
                  Your matches will be lost.
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
                      border: "1px solid rgba(255,79,123,0.4)",
                      color: "#ff4f7b",
                      borderRadius: 10,
                      fontSize: 14,
                      fontWeight: 600,
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

          <div style={{ height: 8 }} />
        </div>
      </motion.div>
    </>
  );
}
