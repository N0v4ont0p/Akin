"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GradientAvatar from "./GradientAvatar";
import { AkinPick } from "@/lib/firestore";

interface AkinSlotProps {
  akinPicks: AkinPick[];
  mutualPickIds?: Set<string>;
  onReleasePick?: (pickedId: string) => Promise<void>;
  onOpenSyncModal?: () => void;
}

const LOCK_DURATION_MS = 48 * 60 * 60 * 1000;

function CooldownTimer({ expiresAt }: { expiresAt: Date }) {
  const [remaining, setRemaining] = useState("");
  useEffect(() => {
    const update = () => {
      const diff = expiresAt.getTime() - Date.now();
      if (diff <= 0) { setRemaining("Free"); return; }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      setRemaining(`${h}h ${m}m`);
    };
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, [expiresAt]);
  return <span>{remaining}</span>;
}

function FilledSlot({ pick, onRelease, isMutual = false }: { pick: AkinPick; onRelease?: () => void; isMutual?: boolean }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [releasing, setReleasing] = useState(false);
  const [progress, setProgress] = useState(0);
  const now = Date.now();
  const expiresAtMs = pick.expiresAt?.toMillis() ?? 0;
  const isLocked = expiresAtMs > now;
  const R = 26, CIRC = 2 * Math.PI * R;

  useEffect(() => {
    if (!isLocked) return;
    const update = () => {
      const elapsed = LOCK_DURATION_MS - (expiresAtMs - Date.now());
      setProgress(Math.min(1, Math.max(0, elapsed / LOCK_DURATION_MS)));
    };
    update();
    const id = setInterval(update, 10_000);
    return () => clearInterval(id);
  }, [isLocked, expiresAtMs]);

  const ringOffset = CIRC * progress;

  // Stroke color: mutual = gold, locked = orchid, unlocked = dim
  const ringStroke = isLocked
    ? isMutual ? "#fee140" : "#9b6dff"
    : "rgba(155,109,255,0.25)";

  // Avatar border: mutual = gold, locked = orchid, unlocked = dim
  const avatarBorder = isMutual
    ? "2px solid rgba(255,200,80,0.7)"
    : isLocked
    ? "2px solid rgba(155,109,255,0.5)"
    : "1.5px solid rgba(255,255,255,0.15)";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.7, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.6, y: -6 }}
      transition={{ type: "spring", stiffness: 340, damping: 26 }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}
    >
      {/* Ring + avatar */}
      <div
        style={{ position: "relative", width: 64, height: 64, cursor: "pointer" }}
        onClick={() => !isLocked && setShowConfirm(true)}
      >
        <svg width={64} height={64} viewBox="0 0 64 64" style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
          <circle cx={32} cy={32} r={R} fill="none" stroke="rgba(155,109,255,0.1)" strokeWidth={2} />
          {isLocked ? (
            <motion.circle
              cx={32} cy={32} r={R}
              fill="none"
              stroke={ringStroke}
              strokeWidth={2}
              strokeLinecap="round"
              strokeDasharray={CIRC}
              animate={{ strokeDashoffset: ringOffset }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          ) : (
            <circle cx={32} cy={32} r={R} fill="none" stroke="rgba(155,109,255,0.25)" strokeWidth={1.5} strokeDasharray="3 5" />
          )}
        </svg>

        {/* Mutual golden glow ring */}
        {isMutual && (
          <motion.div
            animate={{ boxShadow: ["0 0 0 0 rgba(255,200,80,0)", "0 0 0 5px rgba(255,200,80,0.3)", "0 0 0 0 rgba(255,200,80,0)"] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ position: "absolute", inset: 3, borderRadius: "50%", pointerEvents: "none" }}
          />
        )}

        <div style={{ position: "absolute", inset: 6, borderRadius: "50%", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <motion.div
            animate={isLocked
              ? isMutual
                ? { boxShadow: ["0 0 0 0 rgba(255,200,80,0)", "0 0 0 4px rgba(255,200,80,0.28)", "0 0 0 0 rgba(255,200,80,0)"] }
                : { boxShadow: ["0 0 0 0 rgba(155,109,255,0)", "0 0 0 4px rgba(155,109,255,0.28)", "0 0 0 0 rgba(155,109,255,0)"] }
              : {}}
            transition={{ duration: 2.5, repeat: Infinity }}
            style={{ borderRadius: "50%" }}
          >
            <GradientAvatar
              gradient={pick.pickedGradient ?? 0}
              name={pick.pickedName ?? "?"}
              size={50}
              border={avatarBorder}
            />
          </motion.div>
        </div>

        {/* Lock badge */}
        {isLocked && (
          <div style={{ position: "absolute", bottom: -2, right: -2, width: 16, height: 16, borderRadius: "50%", background: isMutual ? "rgba(255,200,80,0.85)" : "rgba(155,109,255,0.85)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, border: "1.5px solid rgba(10,8,26,0.9)" }}>
            🔒
          </div>
        )}

        {/* Mutual ✦ badge at top-right */}
        {isMutual && (
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: "rgba(255,200,80,0.9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 9,
              fontWeight: 900,
              color: "#1a1000",
              border: "1.5px solid rgba(10,8,26,0.9)",
              boxShadow: "0 0 8px rgba(255,200,80,0.6)",
            }}
          >
            ✦
          </motion.div>
        )}
      </div>

      {/* Name */}
      <p style={{ fontSize: 10, fontWeight: 700, color: isMutual ? "rgba(255,200,80,0.9)" : isLocked ? "rgba(155,109,255,0.85)" : "rgba(255,255,255,0.45)", textAlign: "center", maxWidth: 64, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {pick.pickedName?.split(" ")[0]}
      </p>
      {isLocked && pick.expiresAt ? (
        <p style={{ fontSize: 9, color: isMutual ? "rgba(255,200,80,0.5)" : "rgba(155,109,255,0.5)", fontWeight: 500 }}>
          <CooldownTimer expiresAt={new Date(expiresAtMs)} />
        </p>
      ) : (
        <p
          style={{ fontSize: 9, color: "rgba(255,79,123,0.65)", fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}
          onClick={() => setShowConfirm(true)}
        >
          Release
        </p>
      )}

      {/* Release confirm */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            key="release-confirm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px",
              background: "rgba(4,4,14,0.9)",
              backdropFilter: "blur(24px)",
            }}
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              onClick={e => e.stopPropagation()}
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              style={{
                background: "rgba(10,8,26,0.99)",
                border: "1px solid rgba(255,80,80,0.25)",
                borderRadius: 24,
                padding: "28px 24px",
                maxWidth: 340,
                width: "100%",
                boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
              }}
            >
              <p style={{ fontSize: 16, fontWeight: 800, color: "rgba(255,120,80,0.9)", marginBottom: 8 }}>🔥 Release {pick.pickedName?.split(" ")[0]}?</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, marginBottom: 20 }}>
                This burns the bridge. Your class feed frosts for <strong style={{ color: "rgba(255,120,80,0.8)" }}>24 hours</strong>. Their slot opens permanently.
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  disabled={releasing}
                  onClick={async () => {
                    if (releasing) return;
                    setReleasing(true);
                    try { await onRelease?.(); } finally { setReleasing(false); setShowConfirm(false); }
                  }}
                  style={{ flex: 1, padding: "12px", borderRadius: 14, background: "rgba(255,60,60,0.14)", border: "1px solid rgba(255,80,80,0.3)", color: "rgba(255,120,80,0.9)", fontSize: 13, fontWeight: 700, cursor: releasing ? "wait" : "pointer", fontFamily: "inherit", opacity: releasing ? 0.6 : 1 }}
                >
                  {releasing ? "Releasing…" : "Release & Frost"}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowConfirm(false)}
                  style={{ flex: 1, padding: "12px", borderRadius: 14, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                >
                  Keep
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function EmptySlot({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.06, type: "spring", stiffness: 320, damping: 28 }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}
    >
      <div style={{ position: "relative", width: 64, height: 64 }}>
        {/* Dashed orbit */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10 + index * 2, repeat: Infinity, ease: "linear" }}
          style={{
            position: "absolute",
            inset: 4,
            borderRadius: "50%",
            border: "1.5px dashed rgba(155,109,255,0.2)",
          }}
        />
        {/* Primary orbiting dot */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8 + index * 1.5, repeat: Infinity, ease: "linear" }}
          style={{ position: "absolute", inset: 4 }}
        >
          <div style={{
            position: "absolute", top: -3, left: "50%", transform: "translateX(-50%)",
            width: 6, height: 6, borderRadius: "50%",
            background: "rgba(155,109,255,0.4)",
            boxShadow: "0 0 8px rgba(155,109,255,0.5)",
          }} />
        </motion.div>
        {/* Second orbiting dot at opposite phase (180deg offset) */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 11 + index * 1.8, repeat: Infinity, ease: "linear" }}
          style={{ position: "absolute", inset: 4 }}
        >
          <div style={{
            position: "absolute", bottom: -3, left: "50%", transform: "translateX(-50%)",
            width: 4, height: 4, borderRadius: "50%",
            background: "rgba(0,229,160,0.25)",
            boxShadow: "0 0 6px rgba(0,229,160,0.3)",
          }} />
        </motion.div>
        {/* Center */}
        <div style={{
          position: "absolute", inset: 10, borderRadius: "50%",
          background: "rgba(155,109,255,0.04)",
          border: "1px solid rgba(155,109,255,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: 14, opacity: 0.35 }}>✦</span>
        </div>
      </div>
      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.08)", fontWeight: 500 }}>·</p>
    </motion.div>
  );
}

export default function AkinSlot({ akinPicks, mutualPickIds, onReleasePick, onOpenSyncModal }: AkinSlotProps) {
  const filledCount = akinPicks.length;
  const isEmpty = filledCount === 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: "rgba(255,255,255,0.035)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: filledCount > 0 ? "1px solid rgba(155,109,255,0.2)" : "1px solid rgba(255,255,255,0.07)",
        borderRadius: 20,
        padding: "18px 16px 16px",
        boxShadow: filledCount > 0 ? "0 0 32px rgba(155,109,255,0.08)" : "none",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: "rgba(155,109,255,0.8)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Akin Picks
            </span>
            {/* Animated ✦ beside label */}
            <motion.span
              animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.1, 0.9] }}
              transition={{ duration: 2.2, repeat: Infinity }}
              style={{ fontSize: 10, color: "rgba(155,109,255,0.6)" }}
            >
              ✦
            </motion.span>
          </div>
          {/* Slot counter + dot indicators */}
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            background: filledCount > 0 ? "rgba(155,109,255,0.1)" : "rgba(255,255,255,0.05)",
            border: `1px solid ${filledCount > 0 ? "rgba(155,109,255,0.22)" : "rgba(255,255,255,0.1)"}`,
            borderRadius: 999, padding: "3px 8px",
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: filledCount > 0 ? "rgba(155,109,255,0.9)" : "rgba(255,255,255,0.3)" }}>
              {filledCount}/4
            </span>
            {/* 4 small dot indicators */}
            <div style={{ display: "flex", gap: 3 }}>
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: i < filledCount ? "rgba(155,109,255,0.8)" : "rgba(255,255,255,0.12)",
                    transition: "background 0.3s ease",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
        {onOpenSyncModal && filledCount > 0 && (
          <button onClick={onOpenSyncModal} style={{ background: "none", border: "none", padding: "2px 6px", cursor: "pointer", borderRadius: 6 }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.28)" }}>Timeline ↗</span>
          </button>
        )}
      </div>

      {/* 4 slots */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        {Array.from({ length: 4 }, (_, i) => {
          const pick = akinPicks[i];
          return pick ? (
            <FilledSlot
              key={pick.pickedId}
              pick={pick}
              isMutual={mutualPickIds?.has(pick.pickedId) ?? false}
              onRelease={onReleasePick ? () => onReleasePick(pick.pickedId) : undefined}
            />
          ) : (
            <EmptySlot key={`empty-${i}`} index={i} />
          );
        })}
      </div>

      {/* Mechanic explanation — with contextual left border accent */}
      <motion.div
        layout
        style={{
          marginTop: 14,
          borderRadius: 12,
          padding: "10px 12px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderLeft: filledCount === 1
            ? "3px solid rgba(255,200,80,0.4)"
            : filledCount > 1
            ? "3px solid rgba(137,247,254,0.3)"
            : "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {isEmpty ? (
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", lineHeight: 1.6, textAlign: "center" }}>
            Pick up to <strong style={{ color: "rgba(155,109,255,0.7)" }}>4 people</strong> you feel Akin to.
            {" "}<strong style={{ color: "rgba(255,215,80,0.75)" }}>1 pick + mutual</strong> = instant full reveal ✦
            {" "}·{" "}
            <strong style={{ color: "rgba(137,247,254,0.7)" }}>2–4 picks</strong> = 48h mystery reveal
          </p>
        ) : filledCount === 1 ? (
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", lineHeight: 1.6, textAlign: "center" }}>
            <strong style={{ color: "rgba(255,215,80,0.8)" }}>One pick active</strong> — if they pick you back, identity reveals <strong style={{ color: "rgba(255,215,80,0.8)" }}>instantly ✦</strong>
          </p>
        ) : (
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", lineHeight: 1.6, textAlign: "center" }}>
            <strong style={{ color: "rgba(137,247,254,0.75)" }}>{filledCount} picks active</strong> — any mutual match enters the <strong style={{ color: "rgba(137,247,254,0.75)" }}>48h mystery reveal</strong>
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
