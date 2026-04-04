"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useUser } from "@/providers/UserProvider";
import SchoolSetup from "@/components/SchoolSetup";
import { ClassData, createUserProfile } from "@/lib/firestore";

export default function SetupPage() {
  const router = useRouter();
  const { user, profile, loading, refreshProfile } = useUser();
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
  }, [loading, user, profile, router]);

  const handleClassSelected = async (classData: ClassData) => {
    if (!user) return;

    // Retrieve onboarding data from sessionStorage
    const storedName = sessionStorage.getItem("onboarding_name");
    const storedGradient = sessionStorage.getItem("onboarding_gradient");
    const storedGender = sessionStorage.getItem("onboarding_gender") as "male" | "female" | "other" | null;

    const name = storedName ?? user.displayName?.split(" ")[0] ?? "Student";
    const gradient = storedGradient ? parseInt(storedGradient, 10) : 0;
    const gender = storedGender ?? undefined;

    setSubmitting(true);
    setError("");

    try {
      await createUserProfile(
        user.uid,
        name,
        gradient,
        classData.classId,
        classData.name,
        classData.schoolId,
        classData.schoolName,
        user.email ?? "",
        user.photoURL ?? "",
        gender
      );

      // Clean up session storage
      sessionStorage.removeItem("onboarding_name");
      sessionStorage.removeItem("onboarding_gradient");
      sessionStorage.removeItem("onboarding_gender");

      // Hard navigate so the page reloads with fresh profile state
      window.location.href = `/class/${classData.classId}`;
    } catch (err) {
      console.error(err);
      setError("Failed to join class. Please try again.");
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

  if (submitting) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.95, 1.05, 0.95] }}
          transition={{ repeat: Infinity, duration: 1.4 }}
          style={{ width: "48px", height: "48px", borderRadius: "50%", background: "linear-gradient(135deg, #9b6dff, #00e5a0)" }}
        />
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "15px" }}>Joining your class...</p>
        {error && (
          <p style={{ color: "#ff4f7b", fontSize: "13px", marginTop: "8px" }}>{error}</p>
        )}
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
        padding: "60px 20px",
      }}
    >
      {/* Progress bar */}
      <div style={{ width: "100%", maxWidth: "520px", marginBottom: "40px", display: "flex", gap: "6px" }}>
        {[0, 1].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: "3px",
              borderRadius: "999px",
              background: "var(--orchid)",
            }}
          />
        ))}
      </div>

      <SchoolSetup userId={user.uid} onComplete={handleClassSelected} />
    </div>
  );
}
