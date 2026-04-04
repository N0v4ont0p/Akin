"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useUser } from "@/providers/UserProvider";
import GradientAvatar from "@/components/GradientAvatar";
import { GRADIENTS } from "@/lib/firestore";

type Step = "name" | "gender" | "colour" | "facts" | "features";
type Gender = "male" | "female" | "other";

const STEPS: Step[] = ["name", "gender", "colour", "facts", "features"];

const FEATURE_SLIDES = [
  {
    icon: "✦",
    iconColor: "#9b6dff",
    glowColor: "rgba(155,109,255,0.35)",
    heading: "One Akin. That's it.",
    body: "You get one pick in your class. Not ten. Not unlimited. One. Choose the person who just gets it.",
  },
  {
    icon: "❄️",
    iconColor: "#00e5ff",
    glowColor: "rgba(0,229,255,0.30)",
    heading: "Matches reveal over time",
    body: "When you and someone both pick each other, your connection unfolds in 3 stages over 72 hours. No instant gratification.",
  },
  {
    icon: "⚡",
    iconColor: "#fee140",
    glowColor: "rgba(254,225,64,0.30)",
    heading: "Feel the room",
    body: "Anonymous daily polls let you gauge the energy in your class. Vote to see results.",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, profile, loading } = useUser();
  const [selectedGradient, setSelectedGradient] = useState(0);
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const [facts, setFacts] = useState({ comfortFood: "", major: "", campusVibe: "", deepFact: "" });
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<Step>("name");
  const [featureSlide, setFeatureSlide] = useState(0);
  const [slideDir, setSlideDir] = useState(1);

  // Name from auth — can be overridden ONCE during onboarding
  const authName = user?.displayName?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "";
  const [editingName, setEditingName] = useState(false);
  const [customName, setCustomName] = useState("");
  // The name that will actually be used — custom if set, else auth
  const displayName = editingName
    ? customName
    : (customName || authName);
  // Keep lockedName alias for handleContinue
  const lockedName = displayName;

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/auth"); return; }
    if (profile?.classId) { router.push(`/class/${profile.classId}`); return; }
    if (profile?.name) { router.push("/setup"); return; }
  }, [loading, user, profile, router]);

  const handleContinue = async () => {
    const finalName = (customName.trim() || authName).trim();
    if (!user || !finalName) return;
    setSubmitting(true);
    sessionStorage.setItem("onboarding_name", finalName);
    sessionStorage.setItem("onboarding_gradient", String(selectedGradient));
    sessionStorage.setItem("onboarding_gender", selectedGender ?? "other");
    sessionStorage.setItem("onboarding_facts", JSON.stringify(facts));
    router.push("/setup");
  };

  const goToStep = (next: Step) => {
    setStep(next);
  };

  const stepIndex = STEPS.indexOf(step);

  const advanceFeatureSlide = () => {
    if (featureSlide < FEATURE_SLIDES.length - 1) {
      setSlideDir(1);
      setFeatureSlide((s) => s + 1);
    } else {
      handleContinue();
    }
  };

  const retreatFeatureSlide = () => {
    if (featureSlide > 0) {
      setSlideDir(-1);
      setFeatureSlide((s) => s - 1);
    } else {
      goToStep("facts");
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
        {/* Progress dots */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "36px" }}>
          {STEPS.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                background: i <= stepIndex ? "#9b6dff" : "rgba(255,255,255,0.10)",
              }}
              transition={{ duration: 0.3 }}
              style={{ flex: 1, height: "3px", borderRadius: "999px" }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ── STEP 1: NAME ── */}
          {step === "name" && (
            <motion.div
              key="name-step"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.32, ease: "easeOut" }}
            >
              <h1 style={{ fontSize: "clamp(24px,6vw,30px)", fontWeight: 900, letterSpacing: "-0.025em", marginBottom: 8, color: "#f0f0f5" }}>
                Hey, {displayName || "there"} 👋
              </h1>
              <p style={{ color: "rgba(255,255,255,0.42)", fontSize: "14px", marginBottom: "28px", lineHeight: 1.6 }}>
                This is how your classmates will know you. Once you continue, your name is permanent.
              </p>

              {/* Name card */}
              <motion.div
                layout
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${editingName ? "rgba(155,109,255,0.5)" : "rgba(155,109,255,0.28)"}`,
                  borderRadius: 20,
                  padding: "20px 22px",
                  marginBottom: 16,
                  boxShadow: editingName ? "0 0 32px rgba(155,109,255,0.14)" : "0 0 20px rgba(155,109,255,0.06)",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: editingName ? 16 : 0 }}>
                  <GradientAvatar
                    gradient={selectedGradient}
                    name={displayName || "?"}
                    size={62}
                    border="2px solid rgba(255,255,255,0.1)"
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 20, fontWeight: 800, color: "#f0f0f5", letterSpacing: "-0.02em", marginBottom: 5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {displayName || "—"}
                    </p>
                    {!editingName ? (
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(155,109,255,0.10)", border: "1px solid rgba(155,109,255,0.22)", borderRadius: 999, padding: "3px 10px" }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(155,109,255,0.8)" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                        <span style={{ fontSize: 11, color: "rgba(155,109,255,0.75)", fontWeight: 600 }}>from your account</span>
                      </div>
                    ) : (
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(254,225,64,0.08)", border: "1px solid rgba(254,225,64,0.28)", borderRadius: 999, padding: "3px 10px" }}>
                        <span style={{ fontSize: 10 }}>⚠️</span>
                        <span style={{ fontSize: 11, color: "rgba(254,225,64,0.85)", fontWeight: 600 }}>one-time change</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Inline name input — only visible when editing */}
                <AnimatePresence>
                  {editingName && (
                    <motion.div
                      key="name-input"
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.22 }}
                      style={{ overflow: "hidden" }}
                    >
                      <input
                        autoFocus
                        value={customName}
                        onChange={e => setCustomName(e.target.value.slice(0, 30))}
                        placeholder={authName}
                        maxLength={30}
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          borderRadius: 12,
                          background: "rgba(255,255,255,0.07)",
                          border: "1px solid rgba(155,109,255,0.35)",
                          color: "#f0f0f5",
                          fontSize: 16,
                          fontFamily: "inherit",
                          fontWeight: 700,
                          outline: "none",
                          boxSizing: "border-box",
                          letterSpacing: "-0.01em",
                        }}
                      />
                      <p style={{ fontSize: 11, color: "rgba(254,225,64,0.6)", marginTop: 7, lineHeight: 1.5 }}>
                        ⚠️ This is permanent. You cannot change your name after setup. Make it count.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* "Use a different name" toggle */}
              {!editingName && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => {
                    setCustomName(authName);
                    setEditingName(true);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "rgba(255,255,255,0.32)",
                    fontSize: 13,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 0",
                    marginBottom: 20,
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                  Use a different name
                </motion.button>
              )}

              {editingName && (
                <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                  <motion.button
                    onClick={() => { setEditingName(false); setCustomName(""); }}
                    whileTap={{ scale: 0.97 }}
                    style={{ padding: "8px 14px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.4)", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    Use "{authName}" instead
                  </motion.button>
                </div>
              )}

              <motion.button
                onClick={() => goToStep("gender")}
                disabled={editingName && !customName.trim()}
                className="btn-orchid"
                whileHover={{ scale: 1.02, boxShadow: "0 12px 40px rgba(155,109,255,0.55)" }}
                whileTap={{ scale: 0.97 }}
                style={{ width: "100%", fontSize: "16px", padding: "16px", fontWeight: 700, opacity: editingName && !customName.trim() ? 0.45 : 1 }}
              >
                That's me →
              </motion.button>
            </motion.div>
          )}

          {/* ── STEP 2: GENDER ── */}
          {step === "gender" && (
            <motion.div
              key="gender-step"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.32, ease: "easeOut" }}
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
                Who are you?
              </h1>
              <p
                style={{
                  color: "rgba(255,255,255,0.42)",
                  fontSize: "14px",
                  marginBottom: "32px",
                  lineHeight: 1.6,
                }}
              >
                This helps Akin understand the room. Only your classmates can see this.
              </p>

              {/* Gender cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "10px",
                  marginBottom: "28px",
                }}
              >
                {(
                  [
                    { value: "male" as Gender, emoji: "👨", label: "Male" },
                    { value: "female" as Gender, emoji: "👩", label: "Female" },
                    { value: "other" as Gender, emoji: "✨", label: "Prefer not to say" },
                  ] as { value: Gender; emoji: string; label: string }[]
                ).map(({ value, emoji, label }) => {
                  const isSelected = selectedGender === value;
                  return (
                    <motion.button
                      key={value}
                      type="button"
                      onClick={() => setSelectedGender(value)}
                      animate={{
                        scale: isSelected ? 1.04 : 1,
                        background: isSelected
                          ? "rgba(155,109,255,0.12)"
                          : "rgba(255,255,255,0.04)",
                        borderColor: isSelected
                          ? "rgba(155,109,255,0.5)"
                          : "rgba(255,255,255,0.08)",
                      }}
                      whileHover={{ scale: isSelected ? 1.04 : 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      transition={{ type: "spring", stiffness: 400, damping: 22 }}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                        padding: "22px 8px",
                        borderRadius: 18,
                        border: "1px solid rgba(255,255,255,0.08)",
                        cursor: "pointer",
                        position: "relative",
                        outline: "none",
                        boxShadow: isSelected
                          ? "0 0 24px rgba(155,109,255,0.18)"
                          : "none",
                      }}
                    >
                      {/* Selection ring */}
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            key="ring"
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.85 }}
                            transition={{ duration: 0.2 }}
                            style={{
                              position: "absolute",
                              inset: -1,
                              borderRadius: 18,
                              border: "2px solid rgba(155,109,255,0.6)",
                              pointerEvents: "none",
                            }}
                          />
                        )}
                      </AnimatePresence>

                      <span style={{ fontSize: 36, lineHeight: 1 }}>{emoji}</span>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: isSelected ? "rgba(200,170,255,0.9)" : "rgba(255,255,255,0.5)",
                          textAlign: "center",
                          lineHeight: 1.3,
                          transition: "color 0.2s",
                        }}
                      >
                        {label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <motion.button
                  onClick={() => goToStep("name")}
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
                  onClick={() => goToStep("colour")}
                  className="btn-orchid"
                  disabled={!selectedGender}
                  whileHover={{ scale: selectedGender ? 1.02 : 1, boxShadow: selectedGender ? "0 12px 40px rgba(155,109,255,0.55)" : "none" }}
                  whileTap={{ scale: selectedGender ? 0.97 : 1 }}
                  style={{
                    flex: 1,
                    fontSize: "16px",
                    padding: "16px",
                    fontWeight: 700,
                    opacity: selectedGender ? 1 : 0.45,
                    cursor: selectedGender ? "pointer" : "not-allowed",
                  }}
                >
                  Continue →
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: COLOUR ── */}
          {step === "colour" && (
            <motion.div
              key="colour-step"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.32, ease: "easeOut" }}
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
                  onClick={() => goToStep("gender")}
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
                  onClick={() => goToStep("facts")}
                  className="btn-orchid"
                  whileHover={{ scale: 1.02, boxShadow: "0 12px 40px rgba(155,109,255,0.55)" }}
                  whileTap={{ scale: 0.97 }}
                  style={{ flex: 1, fontSize: "16px", padding: "16px", fontWeight: 700 }}
                >
                  Continue →
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 4: FACTS ── */}
          {step === "facts" && (
            <motion.div key="facts-step" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.32 }}>
              <h1 style={{ fontSize: "clamp(22px,5vw,28px)", fontWeight: 900, letterSpacing: "-0.025em", marginBottom: 8, color: "#f0f0f5" }}>
                Leave clues for your match
              </h1>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", marginBottom: "24px", lineHeight: 1.6 }}>
                When someone connects with you, these hints unlock in stages — keeping the mystery alive.
              </p>

              {/* Clue rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>

                {/* Comfort food */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(137,247,254,0.7)", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 6 }}>
                    🍜 Comfort food (hint at 0h)
                  </label>
                  <input
                    value={facts.comfortFood}
                    onChange={e => setFacts(f => ({ ...f, comfortFood: e.target.value }))}
                    placeholder="e.g. Ramen at midnight"
                    maxLength={40}
                    style={{
                      width: "100%", padding: "12px 14px", borderRadius: 12,
                      background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)",
                      color: "#f0f0f5", fontSize: 14, fontFamily: "inherit", outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* Major */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(0,229,160,0.7)", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 6 }}>
                    🎓 Major / Study (hint at 24h)
                  </label>
                  <input
                    value={facts.major}
                    onChange={e => setFacts(f => ({ ...f, major: e.target.value }))}
                    placeholder="e.g. Computer Science"
                    maxLength={40}
                    style={{
                      width: "100%", padding: "12px 14px", borderRadius: 12,
                      background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)",
                      color: "#f0f0f5", fontSize: 14, fontFamily: "inherit", outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* Campus vibe — 4 button options */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(0,229,160,0.7)", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 8 }}>
                    🏫 Campus vibe (hint at 24h)
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {[
                      { value: "Campus Hermit", emoji: "🦔" },
                      { value: "Social Butterfly", emoji: "🦋" },
                      { value: "Late Night Grinder", emoji: "🌙" },
                      { value: "Early Bird", emoji: "🐦" },
                    ].map(({ value, emoji }) => {
                      const sel = facts.campusVibe === value;
                      return (
                        <motion.button
                          key={value}
                          type="button"
                          onClick={() => setFacts(f => ({ ...f, campusVibe: sel ? "" : value }))}
                          animate={{ background: sel ? "rgba(0,229,160,0.12)" : "rgba(255,255,255,0.04)", borderColor: sel ? "rgba(0,229,160,0.4)" : "rgba(255,255,255,0.08)" }}
                          whileTap={{ scale: 0.96 }}
                          style={{ padding: "10px 8px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit", justifyContent: "center" }}
                        >
                          <span style={{ fontSize: 16 }}>{emoji}</span>
                          <span style={{ fontSize: 11, fontWeight: 600, color: sel ? "rgba(0,229,160,0.9)" : "rgba(255,255,255,0.5)" }}>{value}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Deep fact */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(155,109,255,0.7)", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 6 }}>
                    ✦ Deep fact (revealed at 72h bond)
                  </label>
                  <textarea
                    value={facts.deepFact}
                    onChange={e => setFacts(f => ({ ...f, deepFact: e.target.value }))}
                    placeholder="Something only someone Akin to you would understand..."
                    maxLength={120}
                    rows={2}
                    style={{
                      width: "100%", padding: "12px 14px", borderRadius: 12,
                      background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)",
                      color: "#f0f0f5", fontSize: 13, fontFamily: "inherit", outline: "none",
                      resize: "none", lineHeight: 1.55, boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <motion.button onClick={() => goToStep("colour")} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} style={{ flex: 0, flexBasis: 52, padding: "16px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.5)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
                </motion.button>
                <motion.button
                  onClick={() => { setFeatureSlide(0); goToStep("features"); }}
                  className="btn-orchid"
                  whileHover={{ scale: 1.02, boxShadow: "0 12px 40px rgba(155,109,255,0.55)" }}
                  whileTap={{ scale: 0.97 }}
                  style={{ flex: 1, fontSize: "16px", padding: "16px", fontWeight: 700 }}
                >
                  Continue →
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 5: FEATURES ── */}
          {step === "features" && (
            <motion.div
              key="features-step"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.32, ease: "easeOut" }}
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
                Here's how Akin works
              </h1>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", marginBottom: "28px", lineHeight: 1.6 }}>
                Three things worth knowing before you step in.
              </p>

              {/* Feature card carousel */}
              <div style={{ position: "relative", overflow: "hidden", borderRadius: 22, marginBottom: 22 }}>
                <AnimatePresence mode="wait" custom={slideDir}>
                  {(() => {
                    const slide = FEATURE_SLIDES[featureSlide];
                    return (
                      <motion.div
                        key={featureSlide}
                        custom={slideDir}
                        variants={{
                          enter: (dir: number) => ({ x: dir * 60, opacity: 0 }),
                          center: { x: 0, opacity: 1 },
                          exit: (dir: number) => ({ x: -dir * 60, opacity: 0 }),
                        }}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: 22,
                          padding: "32px 28px 28px",
                          boxShadow: `0 0 60px ${slide.glowColor}, 0 8px 32px rgba(0,0,0,0.4)`,
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        {/* Glow blob behind icon */}
                        <div
                          style={{
                            position: "absolute",
                            top: -30,
                            right: -30,
                            width: 140,
                            height: 140,
                            borderRadius: "50%",
                            background: `radial-gradient(circle, ${slide.glowColor}, transparent 70%)`,
                            filter: "blur(24px)",
                            pointerEvents: "none",
                          }}
                        />

                        {/* Icon */}
                        <div
                          style={{
                            fontSize: 44,
                            lineHeight: 1,
                            marginBottom: 20,
                            filter: `drop-shadow(0 0 12px ${slide.glowColor})`,
                          }}
                        >
                          {slide.icon}
                        </div>

                        <h2
                          style={{
                            fontSize: "clamp(18px,4.5vw,22px)",
                            fontWeight: 800,
                            color: "#f0f0f5",
                            letterSpacing: "-0.02em",
                            marginBottom: 12,
                          }}
                        >
                          {slide.heading}
                        </h2>
                        <p
                          style={{
                            fontSize: "14px",
                            color: "rgba(255,255,255,0.52)",
                            lineHeight: 1.7,
                          }}
                        >
                          {slide.body}
                        </p>
                      </motion.div>
                    );
                  })()}
                </AnimatePresence>
              </div>

              {/* Dot indicators */}
              <div style={{ display: "flex", justifyContent: "center", gap: 7, marginBottom: 24 }}>
                {FEATURE_SLIDES.map((_, i) => (
                  <motion.button
                    key={i}
                    onClick={() => {
                      setSlideDir(i > featureSlide ? 1 : -1);
                      setFeatureSlide(i);
                    }}
                    animate={{
                      width: i === featureSlide ? 20 : 7,
                      background: i === featureSlide ? "#9b6dff" : "rgba(255,255,255,0.18)",
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 26 }}
                    style={{
                      height: 7,
                      borderRadius: 999,
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      outline: "none",
                    }}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div style={{ display: "flex", gap: 10 }}>
                <motion.button
                  onClick={retreatFeatureSlide}
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
                  onClick={advanceFeatureSlide}
                  disabled={submitting}
                  className="btn-orchid"
                  whileHover={{ scale: submitting ? 1 : 1.02, boxShadow: "0 12px 40px rgba(155,109,255,0.55)" }}
                  whileTap={{ scale: submitting ? 1 : 0.97 }}
                  style={{
                    flex: 1,
                    fontSize: "16px",
                    padding: "16px",
                    fontWeight: 700,
                    opacity: submitting ? 0.7 : 1,
                  }}
                >
                  {submitting
                    ? "Setting up…"
                    : featureSlide < FEATURE_SLIDES.length - 1
                    ? "Next →"
                    : "Enter my class →"}
                </motion.button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}
