"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useUser } from "@/providers/UserProvider";
import GradientAvatar from "@/components/GradientAvatar";
import { GRADIENTS, getInitials } from "@/lib/firestore";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, profile, loading, refreshProfile } = useUser();
  const [name, setName] = useState("");
  const [selectedGradient, setSelectedGradient] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/auth");
      return;
    }
    if (profile?.classId) {
      router.push(`/class/${profile.classId}`);
      return;
    }
    if (profile?.name) {
      // Has profile but no class
      router.push("/setup");
      return;
    }
    // Pre-fill from Google displayName
    if (user.displayName) {
      setName(user.displayName.split(" ")[0]);
    }
  }, [loading, user, profile, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // Store the selected name/gradient temporarily in session storage
      // The actual user profile creation happens at /setup after class selection
      sessionStorage.setItem("onboarding_name", name.trim());
      sessionStorage.setItem("onboarding_gradient", String(selectedGradient));
      router.push("/setup");
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
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
      className="page-enter"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px 60px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: "100%", maxWidth: "440px" }}
      >
        {/* Progress */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "32px" }}>
          {[0, 1].map((i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: "3px",
                borderRadius: "999px",
                background: i === 0 ? "var(--orchid)" : "rgba(255,255,255,0.12)",
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>

        <h1 style={{ fontSize: "28px", fontWeight: "800", letterSpacing: "-0.02em", marginBottom: "8px" }}>
          Set up your profile
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", marginBottom: "36px" }}>
          Only your name and avatar are visible to classmates.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Avatar preview */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "28px" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedGradient}
                initial={{ scale: 0.75, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.75, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <GradientAvatar
                  gradient={selectedGradient}
                  name={name || "?"}
                  size={100}
                  border="3px solid rgba(255,255,255,0.15)"
                  style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.4)" }}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Name input */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{
              display: "block",
              fontSize: "11px",
              fontWeight: "700",
              color: "rgba(255,255,255,0.4)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "8px",
            }}>
              Your first name
            </label>
            <input
              className="input-glass"
              type="text"
              placeholder="e.g. Jordan"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              maxLength={24}
              autoComplete="given-name"
              autoFocus
              style={{ fontSize: "16px" }}
            />
          </div>

          {/* Gradient picker */}
          <div style={{ marginBottom: "32px" }}>
            <label style={{
              display: "block",
              fontSize: "11px",
              fontWeight: "700",
              color: "rgba(255,255,255,0.4)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "12px",
            }}>
              Choose your avatar color
            </label>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, 1fr)",
              gap: "10px",
            }}>
              {GRADIENTS.map((grad, i) => (
                <motion.button
                  key={i}
                  type="button"
                  onClick={() => setSelectedGradient(i)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.92 }}
                  style={{
                    width: "100%",
                    aspectRatio: "1",
                    borderRadius: "50%",
                    background: grad,
                    border: selectedGradient === i
                      ? "3px solid rgba(255,255,255,0.9)"
                      : "3px solid transparent",
                    cursor: "pointer",
                    padding: 0,
                    boxShadow: selectedGradient === i
                      ? "0 0 0 2px rgba(155,109,255,0.6), 0 4px 16px rgba(0,0,0,0.3)"
                      : "0 2px 8px rgba(0,0,0,0.25)",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {selectedGradient === i && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  color: "#ff4f7b",
                  fontSize: "13px",
                  marginBottom: "16px",
                  padding: "10px 14px",
                  background: "rgba(255,79,123,0.08)",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,79,123,0.2)",
                }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            className="btn-orchid"
            disabled={submitting}
            whileHover={{ scale: submitting ? 1 : 1.02 }}
            whileTap={{ scale: submitting ? 1 : 0.98 }}
            style={{ width: "100%", fontSize: "16px", padding: "15px", opacity: submitting ? 0.7 : 1 }}
          >
            {submitting ? "Saving..." : "Continue →"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
