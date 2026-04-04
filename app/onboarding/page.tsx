"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useUser } from "@/providers/UserProvider";
import GradientAvatar from "@/components/GradientAvatar";
import { GRADIENTS } from "@/lib/firestore";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, profile, loading } = useUser();
  const [selectedGradient, setSelectedGradient] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<"name" | "colour">("name");

  // Derive display name from auth — locked, cannot be changed
  const lockedName = user?.displayName?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "";

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/auth"); return; }
    if (profile?.classId) { router.push(`/class/${profile.classId}`); return; }
    if (profile?.name) { router.push("/setup"); return; }
  }, [loading, user, profile, router]);

  const handleContinue = async () => {
    if (!user || !lockedName) return;
    setSubmitting(true);
    sessionStorage.setItem("onboarding_name", lockedName);
    sessionStorage.setItem("onboarding_gradient", String(selectedGradient));
    router.push("/setup");
  };

  if (loading || !user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.6 }}
          style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #9b6dff, #00e5a0)" }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px 60px",
        overflow: "hidden",
      }}
    >
      {/* Ambient glow */}
      <motion.div
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "fixed",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(155,109,255,0.14), transparent 70%)",
          filter: "blur(60px)",
          top: "-100px",
          left: "50%",
          transform: "translateX(-50%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{ width: "100%", maxWidth: "420px", position: "relative", zIndex: 1 }}
      >
        {/* Progress bar */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "36px" }}>
          {[0, 1].map((i) => (
            <motion.div
              key={i}
              animate={{ background: i === 0 ? "#9b6dff" : "rgba(255,255,255,0.10)" }}
              style={{ flex: 1, height: "3px", borderRadius: "999px" }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === "name" ? (
            <motion.div
              key="name-step"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <h1
                style={{
                  fontSize: "clamp(24px,6vw,30px)",
                  fontWeight: 900,
                  letterSpacing: "-0.025em",
                  marginBottom: 8,
                  color: "#f0f0f5",
                }}
              >
                Hey, {lockedName || "there"} 👋
              </h1>
              <p
                style={{
                  color: "rgba(255,255,255,0.42)",
                  fontSize: "14px",
                  marginBottom: "36px",
                  lineHeight: 1.6,
                }}
              >
                This is how your classmates will see you. Your name comes from your account and stays permanent — no impersonating, no trolling.
              </p>

              {/* Big name card — read only */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(155,109,255,0.30)",
                  borderRadius: 20,
                  padding: "22px 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  marginBottom: 28,
                  boxShadow: "0 0 32px rgba(155,109,255,0.08)",
                }}
              >
                <GradientAvatar
                  gradient={selectedGradient}
                  name={lockedName || "?"}
                  size={68}
                  border="2px solid rgba(255,255,255,0.1)"
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: "#f0f0f5",
                      letterSpacing: "-0.02em",
                      marginBottom: 4,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {lockedName || "—"}
                  </p>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      background: "rgba(155,109,255,0.10)",
                      border: "1px solid rgba(155,109,255,0.22)",
                      borderRadius: 999,
                      padding: "3px 10px",
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(155,109,255,0.8)" strokeWidth="2.5" strokeLinecap="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span style={{ fontSize: 11, color: "rgba(155,109,255,0.75)", fontWeight: 600 }}>
                      locked · authentic
                    </span>
                  </div>
                </div>
              </motion.div>

              <motion.button
                onClick={() => setStep("colour")}
                className="btn-orchid"
                whileHover={{ scale: 1.02, boxShadow: "0 12px 40px rgba(155,109,255,0.55)" }}
                whileTap={{ scale: 0.97 }}
                style={{ width: "100%", fontSize: "16px", padding: "16px", fontWeight: 700 }}
              >
                That's me — pick my colour →
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="colour-step"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <h1
                style={{
                  fontSize: "clamp(22px,5vw,28px)",
                  fontWeight: 900,
                  letterSpacing: "-0.025em",
                  marginBottom: 8,
                  color: "#f0f0f5",
                }}
              >
                Pick your colour
              </h1>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", marginBottom: "28px", lineHeight: 1.6 }}>
                This is your avatar. Classmates see it, not a photo. You can change it later.
              </p>

              {/* Live preview */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "28px" }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedGradient}
                    initial={{ scale: 0.8, opacity: 0, rotate: -8 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0.8, opacity: 0, rotate: 8 }}
                    transition={{ type: "spring", stiffness: 340, damping: 22 }}
                    style={{
                      padding: 5,
                      borderRadius: "50%",
                      background: `conic-gradient(${GRADIENTS[selectedGradient]}, ${GRADIENTS[selectedGradient]})`,
                      boxShadow: "0 12px 48px rgba(0,0,0,0.45)",
                    }}
                  >
                    <GradientAvatar
                      gradient={selectedGradient}
                      name={lockedName || "?"}
                      size={108}
                      border="4px solid #07070f"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Gradient grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(6, 1fr)",
                  gap: "11px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 20,
                  padding: "18px",
                  marginBottom: 28,
                }}
              >
                {GRADIENTS.map((grad, i) => (
                  <motion.button
                    key={i}
                    type="button"
                    onClick={() => setSelectedGradient(i)}
                    whileHover={{ scale: 1.16 }}
                    whileTap={{ scale: 0.88 }}
                    style={{
                      width: "100%",
                      aspectRatio: "1",
                      borderRadius: "50%",
                      background: grad,
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      outline: "none",
                      boxShadow:
                        selectedGradient === i
                          ? "0 0 0 3px #fff, 0 0 0 5.5px rgba(155,109,255,0.8)"
                          : "0 3px 10px rgba(0,0,0,0.4)",
                      transition: "box-shadow 0.15s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                    }}
                  >
                    <AnimatePresence>
                      {selectedGradient === i && (
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
                            background: "rgba(0,0,0,0.18)",
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

              <div style={{ display: "flex", gap: 10 }}>
                <motion.button
                  onClick={() => setStep("name")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    flex: 0,
                    flexBasis: 52,
                    padding: "16px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    borderRadius: 14,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </motion.button>

                <motion.button
                  onClick={handleContinue}
                  className="btn-orchid"
                  disabled={submitting}
                  whileHover={{ scale: submitting ? 1 : 1.02, boxShadow: "0 12px 40px rgba(155,109,255,0.55)" }}
                  whileTap={{ scale: submitting ? 1 : 0.97 }}
                  style={{ flex: 1, fontSize: "16px", padding: "16px", fontWeight: 700, opacity: submitting ? 0.7 : 1 }}
                >
                  {submitting ? "Saving…" : "Continue →"}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
