"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useUser } from "@/providers/UserProvider";
import IntroSlides from "@/components/IntroSlides";

export default function RootPage() {
  const router = useRouter();
  const { user, profile, loading } = useUser();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      // Not authenticated — show intro slides (handled below)
      return;
    }

    if (!profile) {
      // Authenticated but no profile → onboarding
      router.push("/onboarding");
      return;
    }

    if (!profile.classId) {
      // Has profile but no class → setup
      router.push("/setup");
      return;
    }

    // Fully set up → go to class
    router.push(`/class/${profile.classId}`);
  }, [loading, user, profile, router]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.95, 1, 0.95] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #9b6dff, #00e5a0)",
          }}
        />
      </div>
    );
  }

  // Not authenticated — show intro slides
  if (!user) {
    return <IntroSlides />;
  }

  // While redirecting, show loader
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <motion.div
        animate={{ opacity: [0.3, 1, 0.3], scale: [0.95, 1, 0.95] }}
        transition={{ repeat: Infinity, duration: 1.8 }}
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #9b6dff, #00e5a0)",
        }}
      />
    </div>
  );
}
