"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserProfile, UserProfile, AkinPick, subscribeToAkinPicks } from "@/lib/firestore";

interface UserContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  akinPicks: AkinPick[];
  setProfile: (p: UserProfile | null) => void;
  refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  profile: null,
  loading: true,
  akinPicks: [],
  setProfile: () => {},
  refreshProfile: async () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [akinPicks, setAkinPicks] = useState<AkinPick[]>([]);

  const refreshProfile = async () => {
    if (!user) return;
    const p = await getUserProfile(user.uid);
    setProfile(p);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const p = await getUserProfile(firebaseUser.uid);
          setProfile(p);
        } catch {
          setProfile(null);
        }
      } else {
        setUser(null);
        setProfile(null);
        setAkinPicks([]);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // Real-time picks subscription
  useEffect(() => {
    if (!user || !profile?.classId) return;
    const unsub = subscribeToAkinPicks(user.uid, profile.classId, (picks) => {
      setAkinPicks(picks);
    });
    return unsub;
  }, [user, profile?.classId]);

  return (
    <UserContext.Provider value={{ user, profile, loading, akinPicks, setProfile, refreshProfile }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
