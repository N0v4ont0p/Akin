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
import GradientAvatar from "@/components/GradientAvatar";
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
  getUserProfile,
  ClassData,
  UserProfile,
  MatchData,
  VibeCheck,
  AkinPick,
} from "@/lib/firestore";

interface PendingMatch {
  matchGradient: number;
  matchName: string;
  matchUserId: string;
  isAkin?: boolean;
  isInstantReveal?: boolean;
  matchFacts?: UserProfile["facts"] | null;
}

// ─── Timeline Tab ─────────────────────────────────────────────────────────────
const TIMELINE_STAGES = [
  { hour: 0, label: "Echo", icon: "🌑", color: "#89f7fe" },
  { hour: 16, label: "First Clue", icon: "🌒", color: "#00e5a0" },
  { hour: 32, label: "Second Clue", icon: "🌓", color: "#fee140" },
  { hour: 48, label: "Full Reveal", icon: "✦", color: "#9b6dff" },
];

function TimelineTab({ akinPicks, matches, myUserId, onViewMatch }: {
  akinPicks: AkinPick[];
  matches: MatchData[];
  myUserId: string;
  onViewMatch: (match: MatchData) => void;
}) {
  if (akinPicks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ padding: "60px 28px", textAlign: "center" }}
      >
        <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto 28px" }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1.5px dashed rgba(155,109,255,0.25)" }} />
          <div style={{ position: "absolute", inset: 18, borderRadius: "50%", background: "rgba(155,109,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 20 }}>⏳</span>
          </div>
        </div>
        <h3 style={{ fontSize: 20, fontWeight: 900, color: "#f0f0f5", letterSpacing: "-0.02em", marginBottom: 10 }}>
          Your timeline is empty
        </h3>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, maxWidth: 240, margin: "0 auto" }}>
          Pick your Akin in Browse. A mutual match starts the 48h reveal here.
        </p>
      </motion.div>
    );
  }

  return (
    <div style={{ padding: "20px 18px 24px" }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.02em", color: "#f0f0f5", marginBottom: 4 }}>Your Timeline</h2>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{akinPicks.length} active pick{akinPicks.length > 1 ? "s" : ""} · mutual matches reveal here</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {akinPicks.map((pick, idx) => {
          const matchForPick = matches.find(m =>
            (m.user1Id === myUserId && m.user2Id === pick.pickedId) ||
            (m.user2Id === myUserId && m.user1Id === pick.pickedId)
          );
          const isMutual = !!matchForPick;
          const expiresAtMs = pick.expiresAt?.toMillis() ?? 0;
          const isLocked = expiresAtMs > Date.now();

          let elapsedHours = 0;
          let stageIndex = 0;
          if (isMutual && matchForPick.createdAt) {
            elapsedHours = Math.max(0, (Date.now() - matchForPick.createdAt.toMillis()) / 3_600_000);
            stageIndex = TIMELINE_STAGES.filter(s => elapsedHours >= s.hour).length - 1;
          }

          return (
            <motion.div
              key={pick.pickedId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06, type: "spring", stiffness: 320, damping: 28 }}
              style={{
                borderRadius: 20,
                border: isMutual ? "1px solid rgba(155,109,255,0.3)" : "1px solid rgba(255,255,255,0.08)",
                background: isMutual ? "rgba(155,109,255,0.07)" : "rgba(255,255,255,0.03)",
                padding: "16px 18px",
                boxShadow: isMutual ? "0 0 24px rgba(155,109,255,0.08)" : "none",
              }}
            >
              {/* Pick header */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: isMutual ? 18 : 0 }}>
                <GradientAvatar
                  gradient={pick.pickedGradient ?? 0}
                  name={pick.pickedName ?? "?"}
                  size={44}
                  border={isMutual ? "2px solid rgba(155,109,255,0.5)" : "1.5px solid rgba(255,255,255,0.12)"}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 15, fontWeight: 800, color: "#f0f0f5", letterSpacing: "-0.01em" }}>
                    {pick.pickedName}
                  </p>
                  {isMutual ? (
                    <p style={{ fontSize: 11, color: "rgba(155,109,255,0.8)", fontWeight: 700 }}>
                      ✦ Mutual Akin — {Math.floor(elapsedHours)}h in
                    </p>
                  ) : (
                    <p style={{ fontSize: 11, color: isLocked ? "rgba(155,109,255,0.5)" : "rgba(255,255,255,0.3)", fontWeight: 600 }}>
                      {isLocked ? "🔒 Waiting for them to pick you back…" : "Unlocked — no mutual yet"}
                    </p>
                  )}
                </div>
                {isMutual && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onViewMatch(matchForPick)}
                    style={{ background: "rgba(155,109,255,0.12)", border: "1px solid rgba(155,109,255,0.25)", borderRadius: 10, padding: "5px 10px", cursor: "pointer", fontFamily: "inherit", fontSize: 11, color: "rgba(155,109,255,0.85)", fontWeight: 700, whiteSpace: "nowrap" }}
                  >
                    Detail ↗
                  </motion.button>
                )}
              </div>

              {/* Mystery timeline — only for mutual matches */}
              {isMutual && (
                <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                  {TIMELINE_STAGES.map((stage, si) => {
                    const isPast = si <= stageIndex;
                    const isCurrent = si === stageIndex;
                    const isLast = si === TIMELINE_STAGES.length - 1;
                    return (
                      <React.Fragment key={stage.label}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: isLast ? 0 : undefined }}>
                          <motion.div
                            animate={isCurrent ? { boxShadow: [`0 0 0 0 ${stage.color}00`, `0 0 0 5px ${stage.color}44`, `0 0 0 0 ${stage.color}00`] } : {}}
                            transition={{ duration: 1.8, repeat: Infinity }}
                            style={{
                              width: 28, height: 28, borderRadius: "50%",
                              background: isPast ? stage.color : "rgba(255,255,255,0.05)",
                              border: `2px solid ${isPast ? stage.color : "rgba(255,255,255,0.12)"}`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 12,
                              boxShadow: isPast ? `0 0 12px ${stage.color}55` : "none",
                            }}
                          >
                            {isPast ? <span>{stage.icon}</span> : <span style={{ opacity: 0.25, fontSize: 10 }}>?</span>}
                          </motion.div>
                          <span style={{ fontSize: 8, fontWeight: 700, color: isPast ? stage.color : "rgba(255,255,255,0.2)", textAlign: "center", maxWidth: 40, lineHeight: 1.2 }}>{stage.label}</span>
                        </div>
                        {!isLast && (
                          <div style={{ flex: 1, height: 2, background: si < stageIndex ? `linear-gradient(90deg, ${stage.color}66, ${TIMELINE_STAGES[si+1].color}33)` : "rgba(255,255,255,0.06)", margin: "0 4px", marginBottom: 16 }} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Psychological nudge — if picks have no mutual yet */}
      {akinPicks.length > 0 && matches.length === 0 && (
        <motion.div
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3.5, repeat: Infinity }}
          style={{ marginTop: 20, textAlign: "center" }}
        >
          <p style={{ fontSize: 12, color: "rgba(155,109,255,0.5)", fontStyle: "italic" }}>
            The signal is out there. They just haven't picked yet.
          </p>
        </motion.div>
      )}
    </div>
  );
}

export default function ClassPage() {
  const params = useParams();
  const classId = params.classId as string;
  const router = useRouter();
  const { user, profile, loading: userLoading, akinPicks, setProfile } = useUser();

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

  // Sync all picked IDs into likedIds so already-picked people never show in browse
  useEffect(() => {
    if (akinPicks.length > 0) {
      setLikedIds(prev => {
        const next = new Set(prev);
        akinPicks.forEach(p => next.add(p.pickedId));
        return next;
      });
    }
  }, [akinPicks]);

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
          const theirUserId = isUser1 ? match.user2Id : match.user1Id;
          const isInstantReveal = isUser1 ? (match.user1InstantReveal ?? false) : (match.user2InstantReveal ?? false);
          // Fetch their profile for facts (only needed for instant reveal)
          const pending: PendingMatch = {
            matchGradient: isUser1 ? match.user2Gradient : match.user1Gradient,
            matchName: isUser1 ? match.user2Name : match.user1Name,
            matchUserId: theirUserId,
            isAkin: match.isAkinMatch ?? false,
            isInstantReveal,
            matchFacts: null,
          };
          if (isInstantReveal) {
            getUserProfile(theirUserId).then(p => {
              setPendingMatch({ ...pending, matchFacts: p?.facts ?? null });
            });
          } else {
            setPendingMatch(pending);
          }
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

  const handleReleasePick = useCallback(async (pickedId: string) => {
    if (!user) return;
    await releaseAkinPick(user.uid, pickedId, classId);
    showToast("Pick released — feed frosted for 24 hours ❄️");
  }, [user, classId]);

  const handleAkinPick = useCallback(async (classmate: UserProfile) => {
    if (!user || !profile) return;
    // Optimistically remove from browse stack immediately — no UI stall
    setLikedIds((prev) => new Set([...prev, classmate.userId]));
    try {
      const result = await setAkinPick(
        user.uid,
        classmate.userId,
        classId,
        { name: classmate.name, avatarGradient: classmate.avatarGradient ?? 0 }
      );
      if (!result.success) {
        if (result.cooldownRemaining) {
          const h = Math.floor(result.cooldownRemaining / 3_600_000);
          const m = Math.floor((result.cooldownRemaining % 3_600_000) / 60_000);
          setCooldownToast(`Already picked — locked for ${h}h ${m}m.`);
          setTimeout(() => setCooldownToast(""), 4000);
        } else if (result.slotsFull) {
          setCooldownToast("All 4 Akin slots are full. Release one to pick again.");
          setTimeout(() => setCooldownToast(""), 4000);
        }
      } else {
        showToast(`Akin pick locked ✦`);
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
    const pickedIds = new Set(akinPicks.map(p => p.pickedId));
    const target = match ?? matches.find(m => pickedIds.has(m.user1Id) || pickedIds.has(m.user2Id)) ?? null;
    setSyncModalMatch(target);
    setShowSyncModal(true);
  }, [matches, akinPicks]);

  const handleUpdateProfile = useCallback(async (name: string, gradient: number, accentColor?: "orchid" | "mint" | "gold") => {
    if (!user || !profile) return;
    await updateUserProfile(user.uid, name, gradient, accentColor);
    setProfile({ ...profile, name, avatarGradient: gradient, ...(accentColor ? { accentColor } : {}) });
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
          {/* Ambient psychological hook — only when no picks and no matches */}
          {akinPicks.length === 0 && matches.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              style={{
                margin: "14px 18px 0",
                padding: "10px 14px",
                borderRadius: 14,
                background: "rgba(155,109,255,0.06)",
                border: "1px solid rgba(155,109,255,0.15)",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2.2, repeat: Infinity }}
                style={{ width: 7, height: 7, borderRadius: "50%", background: "#9b6dff", flexShrink: 0 }}
              />
              <p style={{ fontSize: 12, color: "rgba(155,109,255,0.75)", fontWeight: 600, lineHeight: 1.4 }}>
                Someone in your class may have already picked you — pick your Akin to find out
              </p>
            </motion.div>
          )}
          <div style={{ padding: "14px 18px 0" }}>
            <AkinSlot
              akinPicks={akinPicks}
              mutualPickIds={new Set(matches.map(m => m.user1Id === user?.uid ? m.user2Id : m.user1Id))}
              onReleasePick={handleReleasePick}
            />
          </div>
          {/* Browse content — wrapped in a relative container for RefrostOverlay */}
          <div style={{ paddingTop: "14px", position: "relative" }}>
            <CardStack
              classmates={classmates}
              alreadyLiked={likedIds}
              myName={profile?.name ?? "?"}
              myGradient={profile?.avatarGradient ?? 0}
              myAccentColor={profile?.accentColor ?? "orchid"}
              currentPickCount={akinPicks.length}
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

        {/* Timeline tab */}
        <motion.div
          animate={{ opacity: activeTab === "timeline" ? 1 : 0, x: activeTab === "timeline" ? 0 : 10 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          style={{ display: activeTab === "timeline" ? "block" : "none" }}
        >
          <TimelineTab
            akinPicks={akinPicks}
            matches={matches}
            myUserId={user?.uid ?? ""}
            onViewMatch={(match) => { handleOpenSyncModal(match); }}
          />
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
            akinPickCount={akinPicks.length}
            onOpenSyncModal={handleOpenSyncModal}
          />
        </motion.div>
      </div>

      {/* ── Navigation ──────────────────────────────────── */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        matchCount={matches.length}
        akinPickCount={akinPicks.length}
        onProfileTap={() => setShowProfile(true)}
        myGradient={profile?.avatarGradient ?? 0}
        myName={profile?.name ?? "?"}
        myAccentColor={profile?.accentColor ?? "orchid"}
      />

      {/* ── Toasts ──────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
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
              bottom: "calc(108px + env(safe-area-inset-bottom, 0px))",
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
            isInstantReveal={pendingMatch.isInstantReveal}
            matchFacts={pendingMatch.matchFacts}
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
