"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserProfile, UserProfile, AkinPick, subscribeToAkinPick } from "@/lib/firestore";

interface UserContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  akinPick: AkinPick | null;
  setProfile: (p: UserProfile | null) => void;
  refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  profile: null,
  loading: true,
  akinPick: null,
  setProfile: () => {},
  refreshProfile: async () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [akinPick, setAkinPick] = useState<AkinPick | null>(null);

  const refreshProfile = async () => {
    if (!user) return;
    const p = await getUserProfile(user.uid);
    setProfile(p);
  };

  // Auth state listener
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
        setAkinPick(null);
      }
      setLoading(false);
    });

    return unsub;
  }, []);

  // Subscribe to real-time akin pick updates when profile loaded with classId
  useEffect(() => {
    if (!user || !profile?.classId) return;

    const unsub = subscribeToAkinPick(user.uid, profile.classId, (pick) => {
      setAkinPick(pick);
    });

    return unsub;
  }, [user, profile?.classId]);

  return (
    <UserContext.Provider value={{ user, profile, loading, akinPick, setProfile, refreshProfile }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
