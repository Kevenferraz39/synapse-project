import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "./firebase";
import type { User, StudentProfile } from "@/types";

// ==================== AUTH FUNCTIONS ====================

export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string,
  profileData?: {
    university: string;
    course: string;
    semester: number;
    subjects: string[];
    studySchedule: Record<string, boolean>;
  }
): Promise<FirebaseUser> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  await createUserDocument(credential.user, displayName, profileData);
  return credential.user;
}

export async function loginWithEmail(
  email: string,
  password: string
): Promise<FirebaseUser> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  await handleDailyLogin(credential.user.uid);
  return credential.user;
}

export async function loginWithGoogle(): Promise<FirebaseUser> {
  const credential = await signInWithPopup(auth, googleProvider);
  const userDoc = await getDoc(doc(db, "users", credential.user.uid));
  if (!userDoc.exists()) {
    await createUserDocument(
      credential.user,
      credential.user.displayName || "Estudante"
    );
  } else {
    await handleDailyLogin(credential.user.uid);
  }
  return credential.user;
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// ==================== USER DOCUMENT ====================

async function createUserDocument(
  firebaseUser: FirebaseUser,
  displayName: string,
  profileData?: {
    university: string;
    course: string;
    semester: number;
    subjects: string[];
    studySchedule: Record<string, boolean>;
  }
): Promise<void> {
  const userRef = doc(db, "users", firebaseUser.uid);
  const userData = {
    uid: firebaseUser.uid,
    email: firebaseUser.email || "",
    displayName,
    photoURL: firebaseUser.photoURL || "",
    role: "student",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
    profile: {
      university: profileData?.university || "",
      course: profileData?.course || "",
      semester: profileData?.semester || 1,
      subjects: profileData?.subjects || [],
      studySchedule: profileData?.studySchedule || {
        morning: false,
        afternoon: false,
        evening: true,
        night: false,
        weekdays: true,
        weekends: false,
      },
      bio: "",
      city: "",
      state: "",
      studyStyle: "discussion",
      goals: [],
    },
    stats: {
      xp: 50,
      level: 1,
      totalStudyMinutes: 0,
      pomodorosCompleted: 0,
      matchesCount: 0,
      currentStreak: 1,
      longestStreak: 1,
      badges: [],
      weeklyXp: 50,
    },
    settings: {
      notifications: true,
      emailNotifications: true,
      showOnline: true,
      allowMatchRequests: true,
      theme: "dark",
    },
  };
  await setDoc(userRef, userData);
}

// ==================== PROFILE UPDATE ====================

export async function updateUserProfile(
  uid: string,
  profileData: Partial<StudentProfile>
): Promise<void> {
  const userRef = doc(db, "users", uid);
  const updates: Record<string, any> = { updatedAt: serverTimestamp() };
  Object.entries(profileData).forEach(([key, value]) => {
    updates[`profile.${key}`] = value;
  });
  await updateDoc(userRef, updates);
}

export async function updateUserDisplayName(
  uid: string,
  displayName: string
): Promise<void> {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { displayName, updatedAt: serverTimestamp() });
  if (auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName });
  }
}

// ==================== DAILY LOGIN & STREAK ====================

async function handleDailyLogin(uid: string): Promise<void> {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;

    const data = userSnap.data();
    const lastLogin = data.lastLoginAt?.toDate?.() || null;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (lastLogin) {
      const lastDate = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());
      if (lastDate.getTime() === today.getTime()) return;

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastDate.getTime() === yesterday.getTime()) {
        const newStreak = (data.stats?.currentStreak || 0) + 1;
        await updateDoc(userRef, {
          "stats.currentStreak": newStreak,
          "stats.longestStreak": Math.max(newStreak, data.stats?.longestStreak || 0),
          "stats.xp": (data.stats?.xp || 0) + 10,
          "stats.weeklyXp": (data.stats?.weeklyXp || 0) + 10,
          lastLoginAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        await updateDoc(userRef, {
          "stats.currentStreak": 1,
          "stats.xp": (data.stats?.xp || 0) + 10,
          "stats.weeklyXp": (data.stats?.weeklyXp || 0) + 10,
          lastLoginAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } else {
      await updateDoc(userRef, {
        "stats.currentStreak": 1,
        "stats.xp": (data.stats?.xp || 0) + 10,
        "stats.weeklyXp": (data.stats?.weeklyXp || 0) + 10,
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    console.error("Error handling daily login:", err);
  }
}

// ==================== READ ====================

export async function getUserData(uid: string): Promise<User | null> {
  const userDoc = await getDoc(doc(db, "users", uid));
  if (!userDoc.exists()) return null;
  return { ...userDoc.data(), uid } as User;
}

export async function isAdmin(uid: string): Promise<boolean> {
  const userData = await getUserData(uid);
  return userData?.role === "admin";
}
