"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useUser } from "@/providers/UserProvider";
import AuthForm from "@/components/AuthForm";

export default function AuthPage() {
  const router = useRouter();
  const { user, profile, loading } = useUser();

  useEffect(() => {
    if (loading) return;
    if (!user) return;

    if (!profile) {
      router.push("/onboarding");
    } else if (!profile.classId) {
      router.push("/setup");
    } else {
      router.push(`/class/${profile.classId}`);
    }
  }, [loading, user, profile, router]);

  if (loading) {
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

  if (user) {
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
        padding: "40px 20px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{ width: "100%", display: "flex", justifyContent: "center" }}
      >
        <AuthForm />
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{
          marginTop: "28px",
          fontSize: "12px",
          color: "rgba(255,255,255,0.2)",
          textAlign: "center",
          maxWidth: "300px",
          lineHeight: 1.7,
        }}
      >
        By continuing, you agree that your likes remain private until a mutual match occurs.
      </motion.p>
    </div>
  );
}
