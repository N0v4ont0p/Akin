"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/providers/UserProvider";
import { usePrivacyMode } from "@/providers/PrivacyModeProvider";
import CardStack from "@/components/CardStack";
import MatchesList from "@/components/MatchesList";
import Navigation from "@/components/Navigation";
import MatchReveal from "@/components/MatchReveal";
import AkinSlot from "@/components/AkinSlot";
import ProfileSheet from "@/components/ProfileSheet";
import GradientAvatar from "@/components/GradientAvatar";
import {
  getClass,
  getClassmates,
  getUserLikes,
  setAkinPick,
  subscribeToMatches,
  updateUserProfile,
  leaveClass,
  ClassData,
  UserProfile,
  MatchData,
} from "@/lib/firestore";

type Tab = "browse" | "matches" | "profile";

interface PendingMatch {
  matchGradient: number;
  matchName: string;
  isAkin?: boolean;
}

export default function ClassPage() {
  const params = useParams();
  const classId = params.classId as string;
  const router = useRouter();
  const { user, profile, loading: userLoading, akinPick, setProfile } = useUser();
  const { privacyMode, toggle: togglePrivacy } = usePrivacyMode();

  const [classData, setClassData] = useState<ClassData | null>(null);
  const [classmates, setClassmates] = useState<UserProfile[]>([]);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("browse");
  const [pageLoading, setPageLoading] = useState(true);
  const [pendingMatch, setPendingMatch] = useState<PendingMatch | null>(null);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [cooldownToast, setCooldownToast] = useState("");
  const [showProfile, setShowProfile] = useState(false);

  const previousMatchIds = useRef<Set<string>>(new Set());
  const isFirstMatchLoad = useRef(true);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // Auth guard
  useEffect(() => {
    if (userLoading) return;
    if (!user) { router.push("/auth"); return; }
    if (!profile) { router.push("/onboarding"); return; }
    if (!profile.classId) { router.push("/setup"); return; }
    if (profile.classId !== classId) { router.push(`/class/${profile.classId}`); return; }
  }, [userLoading, user, profile, classId, router]);

  // Load class data
  useEffect(() => {
    if (!classId) return;
    getClass(classId).then((data) => {
      if (!data) setError("Class not found.");
      else setClassData(data);
    });
  }, [classId]);

  // Load classmates + likes
  useEffect(() => {
    if (userLoading || !user) return;
    const load = async () => {
      try {
        const [mates, likedIdsList] = await Promise.all([
          getClassmates(classId, user.uid),
          getUserLikes(user.uid, classId),
        ]);
        setClassmates(mates);
        setLikedIds(new Set(likedIdsList));
      } catch (err) {
        console.error("Load error:", err);
        setError("Failed to load class data.");
      }
      setPageLoading(false);
    };
    load();
  }, [userLoading, user, classId]);

  // Real-time match subscription
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToMatches(user.uid, classId, (newMatches) => {
      setMatches(newMatches);
      if (isFirstMatchLoad.current) {
        previousMatchIds.current = new Set(newMatches.map((m) => m.matchId));
        isFirstMatchLoad.current = false;
        return;
      }
      for (const match of newMatches) {
        if (!previousMatchIds.current.has(match.matchId)) {
          previousMatchIds.current.add(match.matchId);
          const isUser1 = match.user1Id === user.uid;
          setPendingMatch({
            matchGradient: isUser1 ? match.user2Gradient : match.user1Gradient,
            matchName: isUser1 ? match.user2Name : match.user1Name,
            isAkin: (match as { isAkinMatch?: boolean }).isAkinMatch ?? false,
          });
          break;
        }
      }
    });
    return unsub;
  }, [user, classId]);

  const handleAkinPick = useCallback(async (classmate: UserProfile) => {
    if (!user || !profile) return;
    try {
      const result = await setAkinPick(
        user.uid,
        classmate.userId,
        classId,
        { name: classmate.name, avatarGradient: classmate.avatarGradient ?? 0 }
      );
      if (!result.success && result.cooldownRemaining) {
        const h = Math.floor(result.cooldownRemaining / 3_600_000);
        const m = Math.floor((result.cooldownRemaining % 3_600_000) / 60_000);
        setCooldownToast(`Pick locked for ${h}h ${m}m — one pick at a time.`);
        setTimeout(() => setCooldownToast(""), 4000);
      } else {
        setLikedIds((prev) => new Set([...prev, classmate.userId]));
        showToast(`You picked ${classmate.name} as your Akin`);
      }
    } catch (err) {
      console.error("Akin pick failed:", err);
    }
  }, [user, profile, classId]);

  const handlePass = useCallback((_classmate: UserProfile) => {}, []);

  const handleUpdateProfile = useCallback(async (name: string, gradient: number) => {
    if (!user || !profile) return;
    await updateUserProfile(user.uid, name, gradient);
    setProfile({ ...profile, name, avatarGradient: gradient });
  }, [user, profile, setProfile]);

  const handleLeaveClass = useCallback(async () => {
    if (!user) return;
    await leaveClass(user.uid);
    window.location.href = "/setup";
  }, [user]);

  // Open profile sheet when profile tab is tapped
  useEffect(() => {
    if (activeTab === "profile") {
      setShowProfile(true);
      setActiveTab("browse");
    }
  }, [activeTab]);

  if (userLoading || pageLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.95, 1.05, 0.95] }}
          transition={{ repeat: Infinity, duration: 1.6 }}
          style={{ width: "44px", height: "44px", borderRadius: "50%", background: "linear-gradient(135deg, #9b6dff, #00e5a0)" }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        <div className="glass" style={{ borderRadius: "24px", padding: "48px 32px", textAlign: "center", maxWidth: "360px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>{error}</h2>
          <button className="btn-glass" onClick={() => router.push("/")} style={{ marginTop: "20px", width: "100%" }}>
            Go home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "110px" }}>
      {/* Header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: privacyMode ? "rgba(245,245,240,0.92)" : "rgba(7,7,15,0.85)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottom: `1px solid ${privacyMode ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.06)"}`,
        }}
      >
        {/* Left: logo + breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/akin-logo.png"
            alt="Akin"
            style={{ width: "28px", height: "28px", borderRadius: "7px", objectFit: "cover" }}
          />
          <div>
            {classData?.schoolName && (
              <p style={{
                fontSize: "10px",
                color: privacyMode ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.35)",
                fontWeight: "600",
                marginBottom: "1px",
                letterSpacing: "0.02em",
              }}>
                {classData.schoolName}
              </p>
            )}
            <h1 style={{
              fontSize: "15px",
              fontWeight: "700",
              letterSpacing: "-0.01em",
              color: privacyMode ? "#1a1a1a" : "#f0f0f5",
            }}>
              {classData?.name ?? "Akin"}
            </h1>
          </div>
        </div>

        {/* Right: privacy + match badge + avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Privacy toggle */}
          <motion.button
            onClick={togglePrivacy}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            title={privacyMode ? "Exit privacy mode" : "Enter privacy mode"}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: privacyMode ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.07)",
              border: `1px solid ${privacyMode ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.12)"}`,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: privacyMode ? "#666" : "rgba(255,255,255,0.5)",
              transition: "all 0.2s ease",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {privacyMode ? (
                <>
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </>
              ) : (
                <>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </>
              )}
            </svg>
          </motion.button>

          {/* Match badge */}
          {matches.length > 0 && !privacyMode && (
            <motion.button
              onClick={() => setActiveTab("matches")}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                background: "rgba(0,229,160,0.10)",
                border: "1px solid rgba(0,229,160,0.25)",
                borderRadius: "999px",
                padding: "5px 10px",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <div className="pulse-dot" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--mint)" }} />
              <span style={{ fontSize: "12px", color: "var(--mint)", fontWeight: "700" }}>
                {matches.length}
              </span>
            </motion.button>
          )}

          {/* Profile avatar tap → open profile sheet */}
          {profile && !privacyMode && (
            <motion.button
              onClick={() => setShowProfile(true)}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.93 }}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              <GradientAvatar
                gradient={profile.avatarGradient ?? 0}
                name={profile.name}
                size={32}
                border="2px solid rgba(155,109,255,0.45)"
              />
            </motion.button>
          )}
        </div>
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {activeTab === "browse" && (
          <motion.div
            key="browse"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.22 }}
          >
            <div style={{ padding: "20px 20px 0" }}>
              {!privacyMode && <AkinSlot akinPick={akinPick} />}
            </div>
            <div style={{ paddingTop: "16px" }}>
              <CardStack
                classmates={classmates}
                alreadyLiked={likedIds}
                onLike={handleAkinPick}
                onPass={handlePass}
                onAkinPick={handleAkinPick}
              />
            </div>
          </motion.div>
        )}

        {activeTab === "matches" && (
          <motion.div
            key="matches"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.22 }}
          >
            <div style={{ paddingTop: "24px" }}>
              <div style={{ padding: "0 20px 20px" }}>
                <h2 style={{
                  fontSize: "26px",
                  fontWeight: "800",
                  letterSpacing: "-0.025em",
                  marginBottom: "4px",
                  color: privacyMode ? "#1a1a1a" : "#f0f0f5",
                }}>
                  {privacyMode ? "Notes" : "Your Matches"}
                </h2>
                {matches.length > 0 && (
                  <p style={{ color: privacyMode ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.35)", fontSize: "14px" }}>
                    {privacyMode
                      ? `${matches.length} item${matches.length !== 1 ? "s" : ""}`
                      : `${matches.length} mutual connection${matches.length !== 1 ? "s" : ""}`}
                  </p>
                )}
              </div>
              <MatchesList matches={matches} myUserId={user?.uid ?? ""} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} matchCount={matches.length} />

      {/* Toasts */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cooldownToast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            style={{
              position: "fixed",
              bottom: "100px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(155,109,255,0.12)",
              border: "1px solid rgba(155,109,255,0.35)",
              color: "#9b6dff",
              padding: "10px 20px",
              borderRadius: "999px",
              fontSize: "14px",
              fontWeight: "500",
              zIndex: 9999,
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              whiteSpace: "nowrap",
              maxWidth: "90vw",
              textAlign: "center",
            }}
          >
            {cooldownToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Match Reveal overlay */}
      <AnimatePresence>
        {pendingMatch && profile && (
          <MatchReveal
            myGradient={profile.avatarGradient ?? 0}
            myName={profile.name}
            matchGradient={pendingMatch.matchGradient}
            matchName={pendingMatch.matchName}
            isAkin={pendingMatch.isAkin}
            onContinue={() => {
              setPendingMatch(null);
              setActiveTab("matches");
            }}
          />
        )}
      </AnimatePresence>

      {/* Profile Sheet */}
      <AnimatePresence>
        {showProfile && profile && (
          <ProfileSheet
            profile={profile}
            matchCount={matches.length}
            classmateCount={classmates.length}
            onClose={() => setShowProfile(false)}
            onUpdateProfile={handleUpdateProfile}
            onLeaveClass={handleLeaveClass}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
