"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { onAuthChange, getUserData } from "@/lib/auth-service";
import { db } from "@/lib/firebase";
import type { User } from "@/types";

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  user: null,
  loading: true,
  isAdmin: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubFirestore: (() => void) | null = null;

    const unsubAuth = onAuthChange((fbUser) => {
      setFirebaseUser(fbUser);

      if (unsubFirestore) {
        unsubFirestore();
        unsubFirestore = null;
      }

      if (fbUser) {
        const userRef = doc(db, "users", fbUser.uid);

        // Try real-time listener first
        unsubFirestore = onSnapshot(
          userRef,
          (snapshot) => {
            if (snapshot.exists()) {
              setUser({ ...snapshot.data(), uid: fbUser.uid } as User);
            } else {
              // Document doesn't exist yet - create fallback user
              setUser({
                uid: fbUser.uid,
                email: fbUser.email || "",
                displayName: fbUser.displayName || "Estudante",
                photoURL: fbUser.photoURL || "",
                role: "student",
                profile: {
                  university: "",
                  course: "",
                  semester: 1,
                  subjects: [],
                  studySchedule: { morning: false, afternoon: false, evening: true, night: false, weekdays: true, weekends: false },
                  bio: "",
                  city: "",
                  state: "",
                  studyStyle: "discussion",
                  goals: [],
                },
                stats: {
                  xp: 0,
                  level: 1,
                  totalStudyMinutes: 0,
                  pomodorosCompleted: 0,
                  matchesCount: 0,
                  currentStreak: 0,
                  longestStreak: 0,
                  badges: [],
                  weeklyXp: 0,
                },
                settings: {
                  notifications: true,
                  emailNotifications: true,
                  showOnline: true,
                  allowMatchRequests: true,
                  theme: "dark",
                },
              } as any);
            }
            setLoading(false);
          },
          (error) => {
            console.error("Firestore listener error:", error);
            // Fallback: try single read
            getDoc(userRef).then((snap) => {
              if (snap.exists()) {
                setUser({ ...snap.data(), uid: fbUser.uid } as User);
              } else {
                setUser({
                  uid: fbUser.uid,
                  email: fbUser.email || "",
                  displayName: fbUser.displayName || "Estudante",
                  role: "student",
                  profile: { university: "", course: "", semester: 1, subjects: [], studySchedule: {}, bio: "", city: "", state: "", studyStyle: "discussion", goals: [] },
                  stats: { xp: 0, level: 1, totalStudyMinutes: 0, pomodorosCompleted: 0, matchesCount: 0, currentStreak: 0, longestStreak: 0, badges: [], weeklyXp: 0 },
                  settings: { notifications: true, emailNotifications: true, showOnline: true, allowMatchRequests: true, theme: "dark" },
                } as any);
              }
              setLoading(false);
            }).catch(() => {
              setUser({
                uid: fbUser.uid,
                email: fbUser.email || "",
                displayName: fbUser.displayName || "Estudante",
                role: "student",
                profile: { university: "", course: "", semester: 1, subjects: [], studySchedule: {}, bio: "", city: "", state: "", studyStyle: "discussion", goals: [] },
                stats: { xp: 0, level: 1, totalStudyMinutes: 0, pomodorosCompleted: 0, matchesCount: 0, currentStreak: 0, longestStreak: 0, badges: [], weeklyXp: 0 },
                settings: { notifications: true, emailNotifications: true, showOnline: true, allowMatchRequests: true, theme: "dark" },
              } as any);
              setLoading(false);
            });
          }
        );
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubAuth();
      if (unsubFirestore) unsubFirestore();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ firebaseUser, user, loading, isAdmin: user?.role === "admin" }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
