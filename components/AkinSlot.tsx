"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GradientAvatar from "./GradientAvatar";
import { AkinPick } from "@/lib/firestore";

interface AkinSlotProps {
  akinPick: AkinPick | null;
  onPickRequest?: () => void;
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

export default function AkinSlot({ akinPick, onPickRequest }: AkinSlotProps) {
  const now = Date.now();

  // Determine cooldown state
  const expiresAtMs = akinPick?.expiresAt?.toMillis() ?? 0;
  const isLocked = akinPick !== null && expiresAtMs > now;
  const isFree = akinPick !== null && expiresAtMs <= now;
  const isEmpty = akinPick === null;

  const expiresAtDate = new Date(expiresAtMs);

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
          padding: "24px 20px",
          textAlign: "center",
          cursor: onPickRequest ? "pointer" : "default",
        }}
        onClick={onPickRequest}
        whileHover={onPickRequest ? { scale: 1.01 } : {}}
        whileTap={onPickRequest ? { scale: 0.99 } : {}}
      >
        {/* Ghost circle with spinning dashed border */}
        <div
          style={{
            position: "relative",
            width: "80px",
            height: "80px",
            margin: "0 auto 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Spinning dashed ring */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: "2px dashed rgba(155,109,255,0.5)",
              animation: "spin-slow 8s linear infinite",
            }}
          />
          {/* Breathing inner glow */}
          <motion.div
            animate={{
              boxShadow: [
                "0 0 20px rgba(155,109,255,0.15)",
                "0 0 40px rgba(155,109,255,0.4)",
                "0 0 20px rgba(155,109,255,0.15)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "rgba(155,109,255,0.08)",
              border: "1px solid rgba(155,109,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Orchid star */}
            <span style={{ fontSize: "20px", opacity: 0.5 }}>✦</span>
          </motion.div>
        </div>

        <p
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "rgba(240,240,245,0.6)",
            marginBottom: "4px",
          }}
        >
          Who in this room is Akin to you?
        </p>
        <p
          style={{
            fontSize: "12px",
            color: "rgba(240,240,245,0.3)",
          }}
        >
          Pick one classmate. One pick. Forever honest.
        </p>
      </motion.div>
    );
  }

  // Filled state (locked or free)
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
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "rgba(155,109,255,0.8)",
          }}
        >
          Your Akin
        </span>

        {isLocked && akinPick?.expiresAt && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(155,109,255,0.1)",
              border: "1px solid rgba(155,109,255,0.25)",
              borderRadius: "999px",
              padding: "4px 10px",
              fontSize: "12px",
              color: "rgba(155,109,255,0.9)",
              fontWeight: 500,
            }}
          >
            <span>🔒</span>
            <CooldownTimer expiresAt={expiresAtDate} />
          </div>
        )}

        {isFree && (
          <button
            onClick={onPickRequest}
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
          </button>
        )}
      </div>

      {/* Avatar + name */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ position: "relative" }}>
          {/* Orchid glowing ring */}
          <motion.div
            animate={
              isLocked
                ? {
                    boxShadow: [
                      "0 0 0 3px rgba(155,109,255,0.3)",
                      "0 0 0 5px rgba(155,109,255,0.5)",
                      "0 0 0 3px rgba(155,109,255,0.3)",
                    ],
                  }
                : {}
            }
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            style={{
              borderRadius: "50%",
              padding: "3px",
              background: isLocked
                ? "linear-gradient(135deg, rgba(155,109,255,0.6), rgba(109,59,255,0.4))"
                : "transparent",
            }}
          >
            <GradientAvatar
              gradient={akinPick.pickedGradient ?? 0}
              name={akinPick.pickedName ?? "?"}
              size={56}
              border="2px solid rgba(0,0,0,0.2)"
            />
          </motion.div>
        </div>

        <div>
          <p
            style={{
              fontSize: "17px",
              fontWeight: 700,
              color: "#f0f0f5",
              marginBottom: "2px",
            }}
          >
            {akinPick.pickedName ?? "Unknown"}
          </p>
          {isLocked ? (
            <p style={{ fontSize: "12px", color: "rgba(155,109,255,0.6)", fontWeight: 500 }}>
              Locked for{" "}
              <CooldownTimer expiresAt={expiresAtDate} />
            </p>
          ) : (
            <p style={{ fontSize: "12px", color: "rgba(240,240,245,0.4)" }}>
              Cooldown expired — you can change
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
