"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useRouter } from "next/navigation";

interface AuthFormProps {
  onSuccess?: () => void;
}

export default function AuthForm({ onSuccess }: AuthFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const navigateAfterAuth = () => {
    if (onSuccess) {
      onSuccess();
    } else {
      try {
        router.push("/");
      } catch {
        window.location.href = "/";
      }
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
      navigateAfterAuth();
    } catch (err: unknown) {
      const e = err as { code?: string };
      if (e.code !== "auth/popup-closed-by-user") {
        setError("Google sign-in failed. Please try again.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmailAuth = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (mode === "signup") {
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      navigateAfterAuth();
    } catch (err: unknown) {
      const e = err as { code?: string };
      if (
        e.code === "auth/user-not-found" ||
        e.code === "auth/wrong-password" ||
        e.code === "auth/invalid-credential"
      ) {
        setError("Incorrect email or password.");
      } else if (e.code === "auth/email-already-in-use") {
        setError("This email is already registered. Try signing in.");
      } else if (e.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (e.code === "auth/too-many-requests") {
        setError("Too many attempts. Please wait a moment.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: "420px" }}>
      {/* Logo + wordmark + tagline */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "10px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/akin-logo.png"
            alt="Akin"
            style={{ width: "48px", height: "48px", borderRadius: "12px", objectFit: "cover" }}
          />
          <div
            style={{
              fontSize: "32px",
              fontWeight: 800,
              letterSpacing: "0.3em",
              background: "linear-gradient(135deg, #9b6dff, #00e5a0)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            AKIN
          </div>
        </div>
        <p
          style={{
            fontSize: "13px",
            color: "rgba(240,240,245,0.4)",
            fontStyle: "italic",
            letterSpacing: "0.02em",
          }}
        >
          One pick. Mutual truth.
        </p>
      </div>

      {/* Glass card */}
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "24px",
          padding: "32px",
        }}
      >
        {/* Heading */}
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            marginBottom: "6px",
            color: "#f0f0f5",
          }}
        >
          {mode === "login" ? "Welcome back" : "Create account"}
        </h1>
        <p style={{ color: "rgba(240,240,245,0.4)", fontSize: "14px", marginBottom: "28px" }}>
          {mode === "login" ? "Sign in to continue" : "Join your class today"}
        </p>

        {/* Google button */}
        <motion.button
          onClick={handleGoogle}
          disabled={googleLoading || loading}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          style={{
            width: "100%",
            height: "48px",
            background: "rgba(255,255,255,0.9)",
            border: "none",
            borderRadius: "12px",
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            cursor: googleLoading ? "wait" : "pointer",
            fontSize: "15px",
            fontWeight: 600,
            color: "#1a1a1a",
            fontFamily: "inherit",
            opacity: googleLoading ? 0.7 : 1,
            boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
            marginBottom: "20px",
            transition: "opacity 0.2s",
          }}
        >
          {/* Google logo */}
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path
              fill="#4285F4"
              d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
            />
            <path
              fill="#34A853"
              d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
            />
            <path
              fill="#FBBC05"
              d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"
            />
            <path
              fill="#EA4335"
              d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
            />
          </svg>
          {googleLoading ? "Signing in..." : "Continue with Google"}
        </motion.button>

        {/* OR divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>
            or
          </span>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
        </div>

        {/* Email/password form */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleEmailAuth(); }}
          style={{ display: "flex", flexDirection: "column", gap: "12px" }}
        >
          <input
            className="input-glass"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            autoComplete="email"
            disabled={loading}
          />

          <div style={{ position: "relative" }}>
            <input
              className="input-glass"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              disabled={loading}
              style={{ paddingRight: "48px" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              style={{
                position: "absolute",
                right: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                color: "rgba(255,255,255,0.4)",
              }}
            >
              {showPassword ? (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          <AnimatePresence>
            {mode === "signup" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <input
                  className="input-glass"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError("");
                  }}
                  autoComplete="new-password"
                  disabled={loading}
                />
              </motion.div>
            )}
          </AnimatePresence>

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
            onClick={(e) => { e.preventDefault(); handleEmailAuth(); }}
            disabled={loading || googleLoading}
            whileHover={{ scale: loading ? 1 : 1.01 }}
            whileTap={{ scale: loading ? 1 : 0.99 }}
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #9b6dff, #6d3bff)",
              color: "white",
              border: "none",
              borderRadius: "14px",
              padding: "14px",
              fontSize: "15px",
              fontWeight: 600,
              cursor: loading ? "wait" : "pointer",
              fontFamily: "inherit",
              opacity: loading ? 0.7 : 1,
              boxShadow: "0 8px 32px rgba(155,109,255,0.3)",
              marginTop: "4px",
              transition: "opacity 0.2s",
            }}
          >
            {loading
              ? mode === "login"
                ? "Signing in..."
                : "Creating account..."
              : mode === "login"
              ? "Sign in"
              : "Create account"}
          </motion.button>
        </form>

        {/* Toggle mode */}
        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
            fontSize: "14px",
            color: "rgba(255,255,255,0.4)",
          }}
        >
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError("");
            }}
            style={{
              background: "none",
              border: "none",
              color: "#9b6dff",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "14px",
              fontFamily: "inherit",
              padding: 0,
            }}
          >
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>

      {/* Privacy note */}
      <p
        style={{
          textAlign: "center",
          marginTop: "16px",
          fontSize: "12px",
          color: "rgba(255,255,255,0.2)",
        }}
      >
        🔒 We never show your picks to others
      </p>
    </div>
  );
}
