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
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "./firebase";
import type { User } from "@/types";

// ==================== AUTH FUNCTIONS ====================

export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<FirebaseUser> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  await createUserDocument(credential.user, displayName);
  return credential.user;
}

export async function loginWithEmail(
  email: string,
  password: string
): Promise<FirebaseUser> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
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
  displayName: string
): Promise<void> {
  const userRef = doc(db, "users", firebaseUser.uid);
  const userData: Omit<User, "createdAt" | "updatedAt"> & {
    createdAt: ReturnType<typeof serverTimestamp>;
    updatedAt: ReturnType<typeof serverTimestamp>;
  } = {
    uid: firebaseUser.uid,
    email: firebaseUser.email || "",
    displayName,
    photoURL: firebaseUser.photoURL || "",
    role: "student",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    profile: {
      university: "",
      course: "",
      semester: 1,
      subjects: [],
      studySchedule: {
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
  };
  await setDoc(userRef, userData);
}

export async function getUserData(uid: string): Promise<User | null> {
  const userDoc = await getDoc(doc(db, "users", uid));
  if (!userDoc.exists()) return null;
  return userDoc.data() as User;
}

export async function isAdmin(uid: string): Promise<boolean> {
  const userData = await getUserData(uid);
  return userData?.role === "admin";
}
