"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/providers/UserProvider";
import CardStack from "@/components/CardStack";
import MatchesList from "@/components/MatchesList";
import Navigation, { NavTab } from "@/components/Navigation";
import MatchReveal from "@/components/MatchReveal";
import AkinSlot from "@/components/AkinSlot";
import ProfileSheet from "@/components/ProfileSheet";
import RefrostOverlay from "@/components/RefrostOverlay";
import VibeCheckSheet from "@/components/VibeCheckSheet";
import SyncModal from "@/components/SyncModal";
import { Timestamp } from "firebase/firestore";
import {
  getClass,
  getClassmates,
  getUserLikes,
  addToUserHistory,
  getUserHistory,
  setAkinPick,
  subscribeToMatches,
  updateUserProfile,
  leaveClass,
  releaseAkinPick,
  subscribeToUserDoc,
  createOrFetchDailyVibeCheck,
  submitVibeResponse,
  subscribeToVibeCheck,
  getMatchTierProgress,
  ClassData,
  UserProfile,
  MatchData,
  VibeCheck,
} from "@/lib/firestore";

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

  const [classData, setClassData] = useState<ClassData | null>(null);
  const [classmates, setClassmates] = useState<UserProfile[]>([]);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [activeTab, setActiveTab] = useState<NavTab>("browse");
  const [pageLoading, setPageLoading] = useState(true);
  const [pendingMatch, setPendingMatch] = useState<PendingMatch | null>(null);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [cooldownToast, setCooldownToast] = useState("");
  // Profile sheet is FULLY SEPARATE from activeTab — fixes the tab-switching bug
  const [showProfile, setShowProfile] = useState(false);
  // Sync Modal — reveal timeline
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncModalMatch, setSyncModalMatch] = useState<MatchData | null>(null);
  // Burning Bridge — refrost state
  const [refrostUntil, setRefrostUntil] = useState<Date | null>(null);
  // Vibe Check
  const [vibeCheck, setVibeCheck] = useState<VibeCheck | null>(null);
  const [vibeCheckLoading, setVibeCheckLoading] = useState(true);

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
        const [mates, likedIdsList, historyIds] = await Promise.all([
          getClassmates(classId, user.uid),
          getUserLikes(user.uid, classId),
          getUserHistory(user.uid, classId),
        ]);
        setClassmates(mates);
        setLikedIds(new Set([...likedIdsList, ...historyIds]));
      } catch (err) {
        console.error("Load error:", err);
        setError("Failed to load class data.");
      }
      setPageLoading(false);
    };
    load();
  }, [userLoading, user, classId]);

  // Sync akinPick's pickedId into likedIds so already-picked person never shows in browse
  useEffect(() => {
    if (akinPick?.pickedId) {
      setLikedIds(prev => {
        const next = new Set(prev);
        next.add(akinPick.pickedId!);
        return next;
      });
    }
  }, [akinPick?.pickedId]);

  // Real-time match subscription — uses localStorage to persist seen reveals across refreshes
  useEffect(() => {
    if (!user) return;

    const seenKey = `akin_seen_reveals_${user.uid}`;
    const getSeenIds = () => {
      try { return new Set(JSON.parse(localStorage.getItem(seenKey) || "[]")); }
      catch { return new Set<string>(); }
    };
    const markSeen = (matchId: string) => {
      const seen = getSeenIds();
      seen.add(matchId);
      try { localStorage.setItem(seenKey, JSON.stringify([...seen])); } catch {}
    };

    const unsub = subscribeToMatches(user.uid, classId, (newMatches) => {
      setMatches(newMatches);
      const seen = getSeenIds();
      // On first load, mark all existing matches as seen
      if (isFirstMatchLoad.current) {
        newMatches.forEach(m => markSeen(m.matchId));
        previousMatchIds.current = new Set(newMatches.map(m => m.matchId));
        isFirstMatchLoad.current = false;
        return;
      }
      for (const match of newMatches) {
        if (!previousMatchIds.current.has(match.matchId) && !seen.has(match.matchId)) {
          previousMatchIds.current.add(match.matchId);
          markSeen(match.matchId);
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

  // ── Refrost / Burning Bridge — subscribe to own user doc ────────────────
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToUserDoc(user.uid, (updatedProfile) => {
      if (updatedProfile?.refrostUntil) {
        const d = (updatedProfile.refrostUntil as Timestamp).toDate();
        setRefrostUntil(d.getTime() > Date.now() ? d : null);
      } else {
        setRefrostUntil(null);
      }
    });
    return unsub;
  }, [user]);

  // ── Vibe Check — create/fetch today's check + subscribe ─────────────────
  useEffect(() => {
    if (!classId) return;
    setVibeCheckLoading(true);
    createOrFetchDailyVibeCheck(classId)
      .then((check) => {
        setVibeCheck(check);
        setVibeCheckLoading(false);
      })
      .catch(() => setVibeCheckLoading(false));
    const unsub = subscribeToVibeCheck(classId, (check) => {
      setVibeCheck(check);
    });
    return unsub;
  }, [classId]);

  const handleVibeVote = useCallback(async (optionIndex: number) => {
    if (!user || !vibeCheck) return;
    await submitVibeResponse(vibeCheck.id, user.uid, optionIndex);
  }, [user, vibeCheck]);

  const handleReleasePick = useCallback(async () => {
    if (!user) return;
    await releaseAkinPick(user.uid, classId);
    showToast("Pick released — feed frosted for 24 hours ❄️");
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
        showToast(`You picked ${classmate.name} as your Akin ✦`);
      }
    } catch (err) {
      console.error("Akin pick failed:", err);
    }
  }, [user, profile, classId]);

  const handlePass = useCallback((classmate: UserProfile) => {
    if (!user) return;
    setLikedIds(prev => { const next = new Set(prev); next.add(classmate.userId); return next; });
    addToUserHistory(user.uid, classId, classmate.userId).catch(console.error);
  }, [user, classId]);

  const handleOpenSyncModal = useCallback((match?: MatchData) => {
    // If no specific match passed, use the akinPick match if found
    const target = match ?? matches.find(m =>
      (akinPick?.pickedId && (m.user1Id === akinPick.pickedId || m.user2Id === akinPick.pickedId))
    ) ?? null;
    setSyncModalMatch(target);
    setShowSyncModal(true);
  }, [matches, akinPick]);

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
    <div style={{ minHeight: "100vh", paddingBottom: "112px" }}>
      {/* ── Header ──────────────────────────────────────── */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          padding: "11px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(8,8,18,0.92)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {/* Left: logo + class breadcrumb */}
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
                color: "rgba(255,255,255,0.32)",
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
              color: "#f0f0f5",
            }}>
              {classData?.name ?? "Akin"}
            </h1>
          </div>
        </div>

        {/* Right: match badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {matches.length > 0 && (
            <motion.button
              onClick={() => setActiveTab("matches")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
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
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.8 }}
                style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--mint)" }}
              />
              <span style={{ fontSize: "12px", color: "var(--mint)", fontWeight: "700" }}>
                {matches.length}
              </span>
            </motion.button>
          )}
        </div>
      </div>

      {/* ── Tab content — always mounted, CSS visibility swap ───────────── */}
      <div>
        {/* Browse tab */}
        <motion.div
          animate={{ opacity: activeTab === "browse" ? 1 : 0, x: activeTab === "browse" ? 0 : -20 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          style={{ display: activeTab === "browse" ? "block" : "none" }}
        >
          <div style={{ padding: "18px 18px 0" }}>
            <AkinSlot
              akinPick={akinPick}
              onReleasePick={handleReleasePick}
              onOpenSyncModal={akinPick ? () => handleOpenSyncModal() : undefined}
            />
          </div>
          {/* Browse content — wrapped in a relative container for RefrostOverlay */}
          <div style={{ paddingTop: "14px", position: "relative" }}>
            <CardStack
              classmates={classmates}
              alreadyLiked={likedIds}
              myName={profile?.name ?? "?"}
              myGradient={profile?.avatarGradient ?? 0}
              onLike={handleAkinPick}
              onPass={handlePass}
              onAkinPick={handleAkinPick}
            />
            {/* Burning Bridge — RefrostOverlay sits over the card stack */}
            <RefrostOverlay
              refrostUntil={refrostUntil}
              onExpired={() => setRefrostUntil(null)}
            />
          </div>
        </motion.div>

        {/* Matches tab */}
        <motion.div
          animate={{ opacity: activeTab === "matches" ? 1 : 0, x: activeTab === "matches" ? 0 : 20 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          style={{ display: activeTab === "matches" ? "block" : "none" }}
        >
          {/* Matches shrine header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            style={{
              padding: "28px 24px 20px",
              textAlign: "center",
              position: "relative",
            }}
          >
            {/* Ambient glow */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: 280,
                height: 100,
                background: "radial-gradient(ellipse, rgba(155,109,255,0.15) 0%, transparent 70%)",
                filter: "blur(20px)",
                pointerEvents: "none",
              }}
            />
            <motion.div
              animate={{ scale: [1, 1.22, 1], filter: ["drop-shadow(0 0 6px rgba(155,109,255,0.4))", "drop-shadow(0 0 18px rgba(155,109,255,0.9))", "drop-shadow(0 0 6px rgba(155,109,255,0.4))"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{
                fontSize: 28,
                background: "linear-gradient(135deg, #9b6dff, #00e5a0)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                marginBottom: 8,
                display: "block",
                position: "relative",
              }}
            >
              ✦
            </motion.div>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "900",
                letterSpacing: "-0.03em",
                marginBottom: 4,
                color: "#f0f0f5",
                position: "relative",
              }}
            >
              {matches.length === 0 ? "Your Matches" : matches.length === 1 ? "Your Match" : `${matches.length} Matches`}
            </h2>
            {matches.length > 0 && (
              <p
                style={{
                  color: "rgba(255,255,255,0.32)",
                  fontSize: "13px",
                  fontWeight: 500,
                  position: "relative",
                }}
              >
                mutual · exclusive · real
              </p>
            )}
          </motion.div>

          {/* Vibe Check — daily anonymous class pulse */}
          {user && (
            <VibeCheckSheet
              vibeCheck={vibeCheck}
              myUserId={user.uid}
              onVote={handleVibeVote}
              loading={vibeCheckLoading}
            />
          )}

          <MatchesList
            matches={matches}
            myUserId={user?.uid ?? ""}
            onOpenSyncModal={handleOpenSyncModal}
          />
        </motion.div>
      </div>

      {/* ── Navigation ──────────────────────────────────── */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        matchCount={matches.length}
        onProfileTap={() => setShowProfile(true)}
        myGradient={profile?.avatarGradient ?? 0}
        myName={profile?.name ?? "?"}
      />

      {/* ── Toasts ──────────────────────────────────────── */}
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
              bottom: "108px",
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

      {/* ── Match Reveal ────────────────────────────────── */}
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

      {/* ── Profile Sheet ───────────────────────────────── */}
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

      {/* ── Sync Modal — reveal timeline ─────────────────── */}
      <SyncModal
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        currentTier={syncModalMatch ? getMatchTierProgress(syncModalMatch.createdAt).tier : "echo"}
        matchCreatedAt={syncModalMatch?.createdAt ?? null}
      />
    </div>
  );
}
