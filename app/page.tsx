"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useUser } from "@/providers/UserProvider";
import IntroSlides from "@/components/IntroSlides";

function AkinSplash() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#07070f",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        overflow: "hidden",
      }}
    >
      {/* Ambient glow blobs */}
      <motion.div
        animate={{ opacity: [0.4, 0.9, 0.4], scale: [1, 1.15, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          width: 520,
          height: 520,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(155,109,255,0.18), transparent 70%)",
          filter: "blur(60px)",
          top: "-100px",
          left: "-80px",
          pointerEvents: "none",
        }}
      />
      <motion.div
        animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.2, 1] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,229,160,0.13), transparent 70%)",
          filter: "blur(60px)",
          bottom: "-60px",
          right: "-60px",
          pointerEvents: "none",
        }}
      />

      {/* Emanating rings */}
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            borderRadius: "50%",
            border: `1.5px solid rgba(155,109,255,${0.55 - i * 0.1})`,
            pointerEvents: "none",
          }}
          animate={{
            width: [88, 88 + 280 + i * 40],
            height: [88, 88 + 280 + i * 40],
            opacity: [0.7, 0],
          }}
          transition={{
            duration: 3.2,
            repeat: Infinity,
            delay: i * 0.72,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{
          opacity: 1,
          scale: 1,
          boxShadow: [
            "0 0 40px rgba(155,109,255,0.5)",
            "0 0 80px rgba(155,109,255,0.85)",
            "0 0 40px rgba(155,109,255,0.5)",
          ],
        }}
        transition={{
          opacity: { duration: 0.55, ease: "backOut" },
          scale: { duration: 0.55, ease: "backOut" },
          boxShadow: { duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.55 },
        }}
        style={{
          width: 84,
          height: 84,
          borderRadius: 22,
          overflow: "hidden",
          position: "relative",
          zIndex: 2,
          marginBottom: 28,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/akin-logo.png"
          alt="Akin"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </motion.div>

      {/* Wordmark */}
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28, duration: 0.5, ease: "easeOut" }}
        style={{
          fontSize: 30,
          fontWeight: 900,
          letterSpacing: "0.32em",
          background: "linear-gradient(135deg, #9b6dff, #00e5a0)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          zIndex: 2,
          marginBottom: 10,
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        AKIN
      </motion.p>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55, duration: 0.7 }}
        style={{
          color: "rgba(255,255,255,0.28)",
          fontSize: 12,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          zIndex: 2,
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        one pick · mutual truth
      </motion.p>

      {/* Bottom loading bar */}
      <motion.div
        style={{
          position: "absolute",
          bottom: 52,
          width: 120,
          height: 2,
          borderRadius: 999,
          background: "rgba(255,255,255,0.08)",
          overflow: "hidden",
          zIndex: 2,
        }}
      >
        <motion.div
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
          style={{
            width: "50%",
            height: "100%",
            background: "linear-gradient(90deg, transparent, #9b6dff, #00e5a0, transparent)",
            borderRadius: 999,
          }}
        />
      </motion.div>
    </div>
  );
}

export default function RootPage() {
  const router = useRouter();
  const { user, profile, loading } = useUser();

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (!profile) { router.push("/onboarding"); return; }
    if (!profile.classId) { router.push("/setup"); return; }
    router.push(`/class/${profile.classId}`);
  }, [loading, user, profile, router]);

  if (loading || (user && !profile?.classId)) return <AkinSplash />;
  if (!user) return <IntroSlides />;
  return <AkinSplash />;
}
