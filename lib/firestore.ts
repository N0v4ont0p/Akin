import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
  Timestamp,
  updateDoc,
  increment,
  deleteDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "./firebase";

// ─── Gradient helpers ────────────────────────────────────────────────────────

export const GRADIENTS = [
  "linear-gradient(135deg, #667eea, #764ba2)",
  "linear-gradient(135deg, #f093fb, #f5576c)",
  "linear-gradient(135deg, #4facfe, #00f2fe)",
  "linear-gradient(135deg, #43e97b, #38f9d7)",
  "linear-gradient(135deg, #fa709a, #fee140)",
  "linear-gradient(135deg, #a18cd1, #fbc2eb)",
  "linear-gradient(135deg, #fccb90, #d57eeb)",
  "linear-gradient(135deg, #e0c3fc, #8ec5fc)",
  "linear-gradient(135deg, #f6d365, #fda085)",
  "linear-gradient(135deg, #96fbc4, #f9f586)",
  "linear-gradient(135deg, #89f7fe, #66a6ff)",
  "linear-gradient(135deg, #fddb92, #d1fdff)",
];

export function getGradient(index: number): string {
  return GRADIENTS[index % GRADIENTS.length];
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── Code generator ──────────────────────────────────────────────────────────

export function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface SchoolData {
  schoolId: string;
  name: string;
  location: string;
  code: string;
  createdBy: string;
  createdAt: Timestamp | null;
  memberCount: number;
}

export interface ClassData {
  classId: string;
  name: string;
  schoolId: string;
  schoolName: string;
  code: string;
  createdBy: string;
  createdAt: Timestamp | null;
}

export interface UserProfile {
  userId: string;
  name: string;
  avatarGradient: number;
  gender?: "male" | "female" | "other";
  accentColor?: "orchid" | "mint" | "gold";
  classId: string;
  className: string;
  schoolId: string;
  schoolName: string;
  email: string;
  photoURL: string;
  createdAt: Timestamp | null;
  // Akin pick fields (multi-slot: up to 4 simultaneous picks)
  akinPickIds?: string[];
  refrostUntil?: Timestamp | null;
  sharedSecret?: string;
  facts?: {
    comfortFood?: string;
    major?: string;
    campusVibe?: string;
    deepFact?: string;
  };
}

export interface LikeData {
  likerId: string;
  likedId: string;
  classId: string;
  createdAt: Timestamp | null;
}

export interface MatchData {
  matchId: string;
  user1Id: string;
  user2Id: string;
  user1Name: string;
  user2Name: string;
  user1Gradient: number;
  user2Gradient: number;
  classId: string;
  createdAt: Timestamp | null;
  isAkinMatch?: boolean;
  // Instant reveal: true if that user had exactly 1 active pick when the match formed
  user1InstantReveal?: boolean;
  user2InstantReveal?: boolean;
}

export interface AkinPick {
  pickId: string;
  pickerId: string;
  pickedId: string;
  classId: string;
  pickedAt: Timestamp | null;
  expiresAt: Timestamp | null;
  // Denormalized picked profile fields for display
  pickedName?: string;
  pickedGradient?: number;
}

// ─── Schools ─────────────────────────────────────────────────────────────────

export async function getAllSchools(): Promise<SchoolData[]> {
  const snap = await getDocs(collection(db, "schools"));
  return snap.docs.map((d) => ({ schoolId: d.id, ...(d.data() as Omit<SchoolData, "schoolId">) }));
}

export async function createSchool(
  name: string,
  location: string,
  createdBy: string
): Promise<SchoolData> {
  const code = generateCode();
  const ref = doc(collection(db, "schools"));
  const data = {
    name: name.trim(),
    location: location.trim(),
    code,
    createdBy,
    createdAt: serverTimestamp(),
    memberCount: 0,
  };
  await setDoc(ref, data);
  return { schoolId: ref.id, ...data, createdAt: null };
}

// ─── Classes ─────────────────────────────────────────────────────────────────

export async function getClassesForSchool(schoolId: string): Promise<ClassData[]> {
  const q = query(collection(db, "classes"), where("schoolId", "==", schoolId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ classId: d.id, ...(d.data() as Omit<ClassData, "classId">) }));
}

export async function createClass(
  name: string,
  schoolId: string,
  schoolName: string,
  createdBy: string
): Promise<ClassData> {
  const code = generateCode();
  const ref = doc(collection(db, "classes"));
  const data = {
    name: name.trim(),
    schoolId,
    schoolName,
    code,
    createdBy,
    createdAt: serverTimestamp(),
  };
  await setDoc(ref, data);
  return { classId: ref.id, ...data, createdAt: null };
}

export async function getClass(classId: string): Promise<ClassData | null> {
  const snap = await getDoc(doc(db, "classes", classId));
  if (!snap.exists()) return null;
  return { classId: snap.id, ...(snap.data() as Omit<ClassData, "classId">) };
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function createUserProfile(
  userId: string,
  name: string,
  avatarGradient: number,
  classId: string,
  className: string,
  schoolId: string,
  schoolName: string,
  email: string,
  photoURL: string,
  gender?: "male" | "female" | "other",
  facts?: { comfortFood?: string; major?: string; campusVibe?: string; deepFact?: string },
  accentColor?: "orchid" | "mint" | "gold"
): Promise<void> {
  await setDoc(doc(db, "users", userId), {
    name: name.trim(),
    avatarGradient,
    ...(gender ? { gender } : {}),
    ...(facts ? { facts } : {}),
    ...(accentColor ? { accentColor } : {}),
    classId,
    className,
    schoolId,
    schoolName,
    email,
    photoURL,
    createdAt: serverTimestamp(),
    akinPickId: null,
    akinPickedAt: null,
  });
  try {
    await updateDoc(doc(db, "schools", schoolId), {
      memberCount: increment(1),
    });
  } catch {
    // non-critical
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", userId));
  if (!snap.exists()) return null;
  return { userId, ...(snap.data() as Omit<UserProfile, "userId">) };
}

// ─── Classmates ───────────────────────────────────────────────────────────────

export async function getClassmates(classId: string, currentUserId: string): Promise<UserProfile[]> {
  const q = query(collection(db, "users"), where("classId", "==", classId));
  const snap = await getDocs(q);
  return snap.docs
    .filter((d) => d.id !== currentUserId)
    .map((d) => ({ userId: d.id, ...(d.data() as Omit<UserProfile, "userId">) }));
}

// ─── Likes ────────────────────────────────────────────────────────────────────

export async function getUserLikes(userId: string, classId: string): Promise<string[]> {
  // Single-field query only — avoids composite index requirement
  const q = query(collection(db, "likes"), where("likerId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs
    .filter((d) => d.data().classId === classId)
    .map((d) => d.data().likedId as string);
}

export async function likeClassmate(
  likerId: string,
  likedId: string,
  classId: string,
  likerName: string,
  likerGradient: number,
  likedName: string,
  likedGradient: number
): Promise<boolean> {
  const likeDocId = `${likerId}_${likedId}`;
  await setDoc(doc(db, "likes", likeDocId), {
    likerId,
    likedId,
    classId,
    createdAt: serverTimestamp(),
  });

  const reverseDocId = `${likedId}_${likerId}`;
  const reverseSnap = await getDoc(doc(db, "likes", reverseDocId));

  if (reverseSnap.exists()) {
    const [user1Id, user2Id] = [likerId, likedId].sort();
    const isLikerUser1 = user1Id === likerId;
    const matchDocId = `${user1Id}_${user2Id}`;
    const matchRef = doc(db, "matches", matchDocId);
    const existingMatch = await getDoc(matchRef);

    if (!existingMatch.exists()) {
      await setDoc(matchRef, {
        user1Id,
        user2Id,
        user1Name: isLikerUser1 ? likerName : likedName,
        user2Name: isLikerUser1 ? likedName : likerName,
        user1Gradient: isLikerUser1 ? likerGradient : likedGradient,
        user2Gradient: isLikerUser1 ? likedGradient : likerGradient,
        classId,
        createdAt: serverTimestamp(),
      });
    }
    return true;
  }

  return false;
}

// ─── Matches ─────────────────────────────────────────────────────────────────

export async function getUserMatches(userId: string, classId: string): Promise<MatchData[]> {
  // Single-field queries to avoid composite index requirement
  const q1 = query(collection(db, "matches"), where("user1Id", "==", userId));
  const q2 = query(collection(db, "matches"), where("user2Id", "==", userId));

  const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
  const allMatches: MatchData[] = [
    ...snap1.docs.map((d) => ({ matchId: d.id, ...(d.data() as Omit<MatchData, "matchId">) })),
    ...snap2.docs.map((d) => ({ matchId: d.id, ...(d.data() as Omit<MatchData, "matchId">) })),
  ].filter((m) => m.classId === classId);

  return allMatches.sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0));
}

export function subscribeToMatches(
  userId: string,
  classId: string,
  onMatch: (matches: MatchData[]) => void
): Unsubscribe {
  // Single-field queries to avoid composite index requirement
  const q1 = query(collection(db, "matches"), where("user1Id", "==", userId));
  const q2 = query(collection(db, "matches"), where("user2Id", "==", userId));

  let matches1: MatchData[] = [];
  let matches2: MatchData[] = [];

  const merge = () => {
    const all = [...matches1, ...matches2]
      .filter((m) => m.classId === classId)
      .sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0));
    onMatch(all);
  };

  const unsub1 = onSnapshot(q1, (snap) => {
    matches1 = snap.docs.map((d) => ({
      matchId: d.id,
      ...(d.data() as Omit<MatchData, "matchId">),
    }));
    merge();
  });

  const unsub2 = onSnapshot(q2, (snap) => {
    matches2 = snap.docs.map((d) => ({
      matchId: d.id,
      ...(d.data() as Omit<MatchData, "matchId">),
    }));
    merge();
  });

  return () => {
    unsub1();
    unsub2();
  };
}

// ─── Akin Picks (4-slot multi-pick system) ───────────────────────────────────
// Doc ID: `${pickerId}_${pickedId}_${classId}` — one doc per directed pair.
// Allows up to 4 simultaneous active picks per user per class.
// Instant reveal fires when picker has exactly 1 active pick AND it's mutual.

const COOLDOWN_MS = 48 * 60 * 60 * 1000; // 48 hours
const MAX_PICKS = 4;

/** Returns all active (unexpired) picks for a user in a class. */
export async function getActiveAkinPicks(pickerId: string, classId: string): Promise<AkinPick[]> {
  const q = query(collection(db, "akin_picks"), where("pickerId", "==", pickerId));
  const snap = await getDocs(q);
  const now = Date.now();
  return snap.docs
    .map(d => ({ pickId: d.id, ...(d.data() as Omit<AkinPick, "pickId">) }))
    .filter(p => p.classId === classId && (!p.expiresAt || p.expiresAt.toMillis() > now));
}

export async function setAkinPick(
  pickerId: string,
  pickedId: string,
  classId: string,
  pickedProfile: { name: string; avatarGradient: number }
): Promise<{ success: boolean; cooldownRemaining?: number; slotsFull?: boolean }> {
  // Check if this exact pick already exists and is still locked
  const pickDocId = `${pickerId}_${pickedId}_${classId}`;
  const pickRef = doc(db, "akin_picks", pickDocId);
  const existing = await getDoc(pickRef);
  if (existing.exists()) {
    const data = existing.data();
    const expiresAt = data.expiresAt as Timestamp | null;
    if (expiresAt) {
      const remaining = expiresAt.toMillis() - Date.now();
      if (remaining > 0) return { success: false, cooldownRemaining: remaining };
    }
  }

  // Enforce 4-slot cap
  const activePicks = await getActiveAkinPicks(pickerId, classId);
  if (activePicks.length >= MAX_PICKS) return { success: false, slotsFull: true };

  const expiresAtMs = Date.now() + COOLDOWN_MS;

  await setDoc(pickRef, {
    pickerId,
    pickedId,
    classId,
    pickedName: pickedProfile.name,
    pickedGradient: pickedProfile.avatarGradient,
    pickedAt: serverTimestamp(),
    expiresAt: Timestamp.fromMillis(expiresAtMs),
  });

  await updateDoc(doc(db, "users", pickerId), {
    akinPickIds: arrayUnion(pickedId),
  });

  // Check for mutual match
  const isMutual = await checkAkinMatch(pickerId, pickedId, classId);
  if (isMutual) {
    // Instant reveal = picker had exactly 1 pick (this one) when match formed
    const pickerInstantReveal = activePicks.length === 0; // was 0 before this pick = now 1
    const theirPicks = await getActiveAkinPicks(pickedId, classId);
    const pickedInstantReveal = theirPicks.length === 1; // they had 1 pick and it's us

    const [user1Id, user2Id] = [pickerId, pickedId].sort();
    const matchDocId = `akin_${user1Id}_${user2Id}_${classId}`;
    const matchRef = doc(db, "matches", matchDocId);
    const existingMatch = await getDoc(matchRef);
    if (!existingMatch.exists()) {
      const pickerProfile = await getUserProfile(pickerId);
      const pickedFullProfile = await getUserProfile(pickedId);
      if (pickerProfile && pickedFullProfile) {
        const isPickerUser1 = user1Id === pickerId;
        await setDoc(matchRef, {
          user1Id,
          user2Id,
          user1Name: isPickerUser1 ? pickerProfile.name : pickedFullProfile.name,
          user2Name: isPickerUser1 ? pickedFullProfile.name : pickerProfile.name,
          user1Gradient: isPickerUser1 ? (pickerProfile.avatarGradient ?? 0) : (pickedFullProfile.avatarGradient ?? 0),
          user2Gradient: isPickerUser1 ? (pickedFullProfile.avatarGradient ?? 0) : (pickerProfile.avatarGradient ?? 0),
          classId,
          createdAt: serverTimestamp(),
          isAkinMatch: true,
          user1InstantReveal: isPickerUser1 ? pickerInstantReveal : pickedInstantReveal,
          user2InstantReveal: isPickerUser1 ? pickedInstantReveal : pickerInstantReveal,
        });
      }
    }
  }

  return { success: true };
}

/**
 * Check for mutual akin match — reads the other user's directed pick doc.
 * NEVER returns raw pick data — only boolean.
 */
export async function checkAkinMatch(
  userId: string,
  otherUserId: string,
  classId: string
): Promise<boolean> {
  const otherPickDocId = `${otherUserId}_${userId}_${classId}`;
  const snap = await getDoc(doc(db, "akin_picks", otherPickDocId));
  if (!snap.exists()) return false;
  const expiresAt = snap.data().expiresAt as Timestamp | null;
  if (expiresAt && expiresAt.toMillis() <= Date.now()) return false;
  return true;
}

/** Subscribe to all active picks for this user in this class (real-time). */
export function subscribeToAkinPicks(
  pickerId: string,
  classId: string,
  callback: (picks: AkinPick[]) => void
): Unsubscribe {
  const q = query(collection(db, "akin_picks"), where("pickerId", "==", pickerId));
  return onSnapshot(q, (snap) => {
    const now = Date.now();
    const picks = snap.docs
      .map(d => ({ pickId: d.id, ...(d.data() as Omit<AkinPick, "pickId">) }))
      .filter(p => p.classId === classId && (!p.expiresAt || p.expiresAt.toMillis() > now));
    callback(picks);
  }, (err) => {
    console.error("[subscribeToAkinPicks] snapshot error:", err);
  });
}

/** Release a specific pick. Applies 24h frost only if still within the 48h lock. */
export async function releaseAkinPick(userId: string, pickedId: string, classId: string): Promise<void> {
  const pickDocId = `${userId}_${pickedId}_${classId}`;
  const pickRef = doc(db, "akin_picks", pickDocId);
  const snap = await getDoc(pickRef);
  const isStillLocked = snap.exists() &&
    snap.data().expiresAt?.toMillis() > Date.now();

  try { await deleteDoc(pickRef); } catch { /* non-critical */ }

  const updates: Record<string, unknown> = { akinPickIds: arrayRemove(pickedId) };
  if (isStillLocked) {
    updates.refrostUntil = Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000);
  }
  await updateDoc(doc(db, "users", userId), updates);
}

// ─── Profile Updates (kept separate — not part of Akin Picks) ───────────────

export async function updateUserProfile(
  userId: string,
  name: string,
  avatarGradient: number,
  accentColor?: "orchid" | "mint" | "gold"
): Promise<void> {
  const updates: Record<string, unknown> = { name: name.trim(), avatarGradient };
  if (accentColor !== undefined) updates.accentColor = accentColor;
  await updateDoc(doc(db, "users", userId), updates);
}

export async function leaveClass(userId: string): Promise<void> {
  await updateDoc(doc(db, "users", userId), { classId: null, className: "" });
}

// ─── Utils ────────────────────────────────────────────────────────────────────

export function formatRelativeTime(timestamp: Timestamp | null): string {
  if (!timestamp) return "just now";
  const now = Date.now();
  const diff = now - timestamp.toMillis();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}


export function subscribeToUserDoc(
  userId: string,
  callback: (profile: UserProfile | null) => void
): Unsubscribe {
  return onSnapshot(doc(db, "users", userId), (snap) => {
    if (!snap.exists()) { callback(null); return; }
    callback({ userId, ...(snap.data() as Omit<UserProfile, "userId">) });
  });
}

// ─── Sync Streak / Match Tiers ───────────────────────────────────────────────

export type MatchTier = "echo" | "recognition" | "identification" | "bond";

export function getMatchTierProgress(createdAt: Timestamp | null): {
  tier: MatchTier;
  progressToNext: number;
  msToNext: number;
  ageMs: number;
} {
  if (!createdAt) return { tier: "echo", progressToNext: 0, msToNext: 57_600_000, ageMs: 0 };
  const ageMs = Date.now() - createdAt.toMillis();
  // 48h total reveal: 0-16h echo, 16-32h recognition, 32-48h identification, 48h+ bond
  const h16 = 57_600_000;
  const h32 = 115_200_000;
  const h48 = 172_800_000;
  if (ageMs >= h48) return { tier: "bond", progressToNext: 1, msToNext: 0, ageMs };
  if (ageMs >= h32) return { tier: "identification", progressToNext: (ageMs - h32) / (h48 - h32), msToNext: h48 - ageMs, ageMs };
  if (ageMs >= h16) return { tier: "recognition", progressToNext: (ageMs - h16) / (h32 - h16), msToNext: h32 - ageMs, ageMs };
  return { tier: "echo", progressToNext: ageMs / h16, msToNext: h16 - ageMs, ageMs };
}

export async function updateSharedSecret(userId: string, secret: string): Promise<void> {
  await updateDoc(doc(db, "users", userId), { sharedSecret: secret.trim() });
}

// ─── Vibe Checks ─────────────────────────────────────────────────────────────

export interface VibeCheck {
  id: string;
  classId: string;
  question: string;
  options: Array<{ emoji: string; label: string }>;
  responses: Record<string, number>;
  date: string;
  createdAt: Timestamp | null;
}

const VIBE_PROMPTS = [
  { question: "What's the energy in class today?", options: [{ emoji: "⚡", label: "Charged" }, { emoji: "😴", label: "Sleepy" }, { emoji: "🔥", label: "On fire" }, { emoji: "🌊", label: "Flowing" }] },
  { question: "How are people feeling right now?", options: [{ emoji: "😌", label: "Chill" }, { emoji: "😤", label: "Stressed" }, { emoji: "🥳", label: "Hyped" }, { emoji: "🤔", label: "In thought" }] },
  { question: "What's the vibe check?", options: [{ emoji: "✨", label: "Magical" }, { emoji: "🥱", label: "Dragging" }, { emoji: "💥", label: "Explosive" }, { emoji: "🫶", label: "Warm" }] },
  { question: "Rate the room's mood:", options: [{ emoji: "🧊", label: "Ice cold" }, { emoji: "😎", label: "Cool" }, { emoji: "☀️", label: "Sunny" }, { emoji: "🌪️", label: "Chaotic" }] },
  { question: "What's the collective feeling?", options: [{ emoji: "🎯", label: "Focused" }, { emoji: "💤", label: "Out of it" }, { emoji: "🎉", label: "Celebrating" }, { emoji: "🫠", label: "Melting" }] },
  { question: "Class vibe right now?", options: [{ emoji: "🧠", label: "Big brain" }, { emoji: "😵", label: "Overwhelmed" }, { emoji: "🕺", label: "Vibing" }, { emoji: "🫥", label: "Ghosted" }] },
  { question: "How charged is the room?", options: [{ emoji: "💯", label: "Maxed out" }, { emoji: "🔋", label: "Draining" }, { emoji: "⚡", label: "Sparking" }, { emoji: "😶", label: "Neutral" }] },
];

export async function createOrFetchDailyVibeCheck(classId: string): Promise<VibeCheck> {
  const today = new Date().toISOString().slice(0, 10);
  const docId = `${classId}_${today}`;
  const ref = doc(db, "vibe_checks", docId);
  const snap = await getDoc(ref);
  if (snap.exists()) return { id: snap.id, ...(snap.data() as Omit<VibeCheck, "id">) };
  const dayOfWeek = new Date().getDay();
  const prompt = VIBE_PROMPTS[dayOfWeek % VIBE_PROMPTS.length];
  const data = { classId, question: prompt.question, options: prompt.options, responses: {}, date: today, createdAt: serverTimestamp() };
  await setDoc(ref, data);
  return { id: docId, ...data, createdAt: null };
}

export async function submitVibeResponse(checkId: string, userId: string, optionIndex: number): Promise<void> {
  await updateDoc(doc(db, "vibe_checks", checkId), { [`responses.${userId}`]: optionIndex });
}

export function subscribeToVibeCheck(classId: string, callback: (check: VibeCheck | null) => void): Unsubscribe {
  const today = new Date().toISOString().slice(0, 10);
  const docId = `${classId}_${today}`;
  return onSnapshot(doc(db, "vibe_checks", docId), (snap) => {
    if (!snap.exists()) { callback(null); return; }
    callback({ id: snap.id, ...(snap.data() as Omit<VibeCheck, "id">) });
  });
}

// ─── User History (skip/pass persistence) ────────────────────────────────────

export async function addToUserHistory(
  userId: string,
  classId: string,
  skippedUserId: string
): Promise<void> {
  const docId = `${userId}_${classId}`;
  const ref = doc(db, "user_history", docId);
  await setDoc(ref, { userId, classId, skippedIds: arrayUnion(skippedUserId) }, { merge: true });
}

export async function getUserHistory(userId: string, classId: string): Promise<string[]> {
  const docId = `${userId}_${classId}`;
  const snap = await getDoc(doc(db, "user_history", docId));
  if (!snap.exists()) return [];
  return (snap.data().skippedIds ?? []) as string[];
}
