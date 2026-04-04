"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GradientAvatar from "./GradientAvatar";
import { AkinPick } from "@/lib/firestore";

interface AkinSlotProps {
  akinPick: AkinPick | null;
  onPickRequest?: () => void;
  onReleasePick?: () => Promise<void>;
  onOpenSyncModal?: () => void;
}

function CooldownTimer({ expiresAt }: { expiresAt: Date }) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    const update = () => {
      const diff = expiresAt.getTime() - Date.now();
      if (diff <= 0) {
        setRemaining("Unlocked");
        return;
      }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      setRemaining(`${h}h ${m}m ${s}s`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return <span>{remaining}</span>;
}

const RING_SIZE = 84;
const RING_R = 38;
const RING_CIRC = 2 * Math.PI * RING_R;
const LOCK_DURATION_MS = 48 * 60 * 60 * 1000; // 48 hours

export default function AkinSlot({
  akinPick,
  onPickRequest,
  onReleasePick,
  onOpenSyncModal,
}: AkinSlotProps) {
  const [showReleaseConfirm, setShowReleaseConfirm] = useState(false);
  const [releasing, setReleasing] = useState(false);
  const [lockProgress, setLockProgress] = useState(0);
  const now = Date.now();

  const expiresAtMs = akinPick?.expiresAt?.toMillis() ?? 0;
  const isLocked = akinPick !== null && expiresAtMs > now;
  const isFree = akinPick !== null && expiresAtMs <= now;
  const isEmpty = akinPick === null;

  const expiresAtDate = new Date(expiresAtMs);

  // Compute live lock ring progress
  useEffect(() => {
    if (!isLocked) return;
    const update = () => {
      const elapsed = LOCK_DURATION_MS - (expiresAtMs - Date.now());
      const progress = Math.min(1, Math.max(0, elapsed / LOCK_DURATION_MS));
      setLockProgress(progress);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [isLocked, expiresAtMs]);

  // Ring stroke offset — 0 offset = full ring; RING_CIRC offset = empty ring
  // We want the ring to deplete as time passes: starts full, ends empty
  const ringOffset = RING_CIRC * lockProgress;

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (isEmpty) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "20px",
          cursor: onPickRequest ? "pointer" : "default",
        }}
        onClick={onPickRequest}
        whileHover={onPickRequest ? { scale: 1.01 } : {}}
        whileTap={onPickRequest ? { scale: 0.99 } : {}}
      >
        <div style={{ textAlign: "center", padding: "24px 16px" }}>
          {/* Large orbit ring — 100px diameter */}
          <div
            style={{
              position: "relative",
              width: 100,
              height: 100,
              margin: "0 auto 20px",
            }}
          >
            {/* Outer dashed ring */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                border: "2px dashed rgba(155,109,255,0.4)",
                animation: "spin-slow 12s linear infinite",
              }}
            />
            {/* Orbiting particle */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              style={{ position: "absolute", inset: 0 }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -4,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#9b6dff",
                  boxShadow: "0 0 12px #9b6dff",
                }}
              />
            </motion.div>
            {/* Inner glow */}
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 20px rgba(155,109,255,0.15)",
                  "0 0 40px rgba(155,109,255,0.5)",
                  "0 0 20px rgba(155,109,255,0.15)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{
                position: "absolute",
                inset: 12,
                borderRadius: "50%",
                background: "rgba(155,109,255,0.08)",
                border: "1px solid rgba(155,109,255,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: 22, opacity: 0.45 }}>✦</span>
            </motion.div>
          </div>

          <p
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "rgba(240,240,245,0.6)",
              marginBottom: 4,
            }}
          >
            Who in this room is Akin to you?
          </p>
          <p style={{ fontSize: 12, color: "rgba(240,240,245,0.28)" }}>
            One pick. Forever honest.
          </p>
        </div>
      </motion.div>
    );
  }

  // ── Filled state ─────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: `1px solid ${isLocked ? "rgba(155,109,255,0.3)" : "rgba(255,255,255,0.08)"}`,
        borderRadius: "20px",
        padding: "20px",
        boxShadow: isLocked ? "0 0 32px rgba(155,109,255,0.12)" : "none",
      }}
    >
      {/* Label row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "rgba(155,109,255,0.8)",
            }}
          >
            Your Akin ✦
          </span>
          {onOpenSyncModal && (
            <button
              onClick={onOpenSyncModal}
              style={{
                background: "none",
                border: "none",
                padding: "2px 6px",
                cursor: "pointer",
                borderRadius: 6,
                lineHeight: 1,
              }}
            >
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                Timeline ↗
              </span>
            </button>
          )}
        </div>

        {isFree && !showReleaseConfirm && (
          <motion.button
            onClick={() => setShowReleaseConfirm(true)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            style={{
              background: "rgba(155,109,255,0.1)",
              border: "1px solid rgba(155,109,255,0.3)",
              borderRadius: "8px",
              padding: "4px 12px",
              fontSize: "12px",
              color: "#9b6dff",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Change
          </motion.button>
        )}
      </div>

      {/* Orbit ring + avatar — centered */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div
          style={{
            position: "relative",
            width: RING_SIZE,
            height: RING_SIZE,
          }}
        >
          {/* SVG progress ring */}
          <svg
            width={RING_SIZE}
            height={RING_SIZE}
            viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
            style={{
              position: "absolute",
              inset: 0,
              transform: "rotate(-90deg)",
            }}
          >
            {/* Track */}
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_R}
              fill="none"
              stroke="rgba(155,109,255,0.12)"
              strokeWidth="2.5"
            />
            {/* Progress arc */}
            {isLocked && (
              <motion.circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_R}
                fill="none"
                stroke="#9b6dff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={RING_CIRC}
                animate={{ strokeDashoffset: ringOffset }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            )}
            {/* Free state: dim full ring */}
            {isFree && (
              <circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_R}
                fill="none"
                stroke="rgba(155,109,255,0.22)"
                strokeWidth="2"
                strokeDasharray="4 6"
              />
            )}
          </svg>

          {/* Avatar centered inside ring */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <motion.div
              animate={
                isLocked
                  ? {
                      boxShadow: [
                        "0 0 0 0 rgba(155,109,255,0)",
                        "0 0 0 5px rgba(155,109,255,0.28)",
                        "0 0 0 0 rgba(155,109,255,0)",
                      ],
                    }
                  : {}
              }
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              style={{ borderRadius: "50%" }}
            >
              <GradientAvatar
                gradient={akinPick.pickedGradient ?? 0}
                name={akinPick.pickedName ?? "?"}
                size={60}
                border={
                  isLocked
                    ? "2px solid rgba(155,109,255,0.5)"
                    : "2px solid rgba(255,255,255,0.12)"
                }
              />
            </motion.div>
          </div>
        </div>

        {/* Name + lock status */}
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: "#f0f0f5",
              marginBottom: 4,
            }}
          >
            {akinPick.pickedName ?? "Unknown"}
          </p>
          {isLocked && akinPick.expiresAt && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(155,109,255,0.1)",
                border: "1px solid rgba(155,109,255,0.25)",
                borderRadius: "999px",
                padding: "4px 10px",
                fontSize: 12,
                color: "rgba(155,109,255,0.9)",
                fontWeight: 500,
              }}
            >
              <span>🔒</span>
              <span>Locked for </span>
              <CooldownTimer expiresAt={expiresAtDate} />
            </div>
          )}
          {isFree && (
            <p style={{ fontSize: 12, color: "rgba(240,240,245,0.4)" }}>
              Cooldown expired — you can change
            </p>
          )}
        </div>
      </div>

      {/* ── Burning Bridge release confirm ──────────────────── */}
      <AnimatePresence>
        {showReleaseConfirm && (
          <motion.div
            key="release-confirm"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            style={{
              marginTop: 16,
              borderRadius: 16,
              background: "rgba(255,60,60,0.06)",
              border: "1px solid rgba(255,80,80,0.22)",
              padding: "14px 16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>🔥</span>
              <div>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: "rgba(255,120,80,0.9)",
                    marginBottom: 3,
                  }}
                >
                  Burning Bridge Warning
                </p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>
                  Releasing{" "}
                  <strong style={{ color: "rgba(255,255,255,0.7)" }}>
                    {akinPick?.pickedName}
                  </strong>{" "}
                  will frost your class feed for{" "}
                  <strong style={{ color: "rgba(255,120,80,0.85)" }}>24 hours</strong>. You
                  cannot browse or pick during that time.
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <motion.button
                onClick={async () => {
                  if (releasing) return;
                  setReleasing(true);
                  try {
                    await onReleasePick?.();
                  } finally {
                    setReleasing(false);
                    setShowReleaseConfirm(false);
                  }
                }}
                disabled={releasing}
                whileHover={{ scale: releasing ? 1 : 1.03 }}
                whileTap={{ scale: releasing ? 1 : 0.97 }}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 12,
                  background: "rgba(255,60,60,0.14)",
                  border: "1px solid rgba(255,80,80,0.3)",
                  color: "rgba(255,120,80,0.9)",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: releasing ? "wait" : "pointer",
                  fontFamily: "inherit",
                  opacity: releasing ? 0.6 : 1,
                }}
              >
                {releasing ? "Releasing…" : "Release & Frost"}
              </motion.button>
              <motion.button
                onClick={() => setShowReleaseConfirm(false)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  color: "rgba(255,255,255,0.55)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Keep my pick
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
