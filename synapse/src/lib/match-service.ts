import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";
import { db } from "./firebase";
import type { User, Match, MatchSuggestion } from "@/types";

// ==================== MATCH ALGORITHM ====================

export function calculateCompatibility(userA: User, userB: User): number {
  let score = 0;
  let maxScore = 0;

  // 1. Common subjects (weight: 40%)
  const commonSubjects = userA.profile.subjects.filter((s) =>
    userB.profile.subjects.includes(s)
  );
  const subjectScore =
    commonSubjects.length /
    Math.max(
      1,
      Math.min(userA.profile.subjects.length, userB.profile.subjects.length)
    );
  score += subjectScore * 40;
  maxScore += 40;

  // 2. Schedule compatibility (weight: 25%)
  const schedA = userA.profile.studySchedule;
  const schedB = userB.profile.studySchedule;
  const scheduleKeys: (keyof typeof schedA)[] = [
    "morning",
    "afternoon",
    "evening",
    "night",
    "weekdays",
    "weekends",
  ];
  const scheduleMatches = scheduleKeys.filter(
    (key) => schedA[key] && schedB[key]
  ).length;
  const scheduleTotal = scheduleKeys.filter(
    (key) => schedA[key] || schedB[key]
  ).length;
  if (scheduleTotal > 0) {
    score += (scheduleMatches / scheduleTotal) * 25;
  }
  maxScore += 25;

  // 3. Same course (weight: 15%)
  if (
    userA.profile.course.toLowerCase() === userB.profile.course.toLowerCase()
  ) {
    score += 15;
  }
  maxScore += 15;

  // 4. Same university (weight: 10%)
  if (
    userA.profile.university.toLowerCase() ===
    userB.profile.university.toLowerCase()
  ) {
    score += 10;
  }
  maxScore += 10;

  // 5. Study style compatibility (weight: 10%)
  if (userA.profile.studyStyle === userB.profile.studyStyle) {
    score += 10;
  } else if (
    (userA.profile.studyStyle === "discussion" &&
      userB.profile.studyStyle === "practice") ||
    (userA.profile.studyStyle === "practice" &&
      userB.profile.studyStyle === "discussion")
  ) {
    score += 7; // complementary styles
  }
  maxScore += 10;

  return Math.round((score / maxScore) * 100);
}

export function getCommonScheduleLabels(userA: User, userB: User): string[] {
  const labels: Record<string, string> = {
    morning: "Manhã",
    afternoon: "Tarde",
    evening: "Noite",
    night: "Madrugada",
    weekdays: "Dias úteis",
    weekends: "Fins de semana",
  };

  const schedA = userA.profile.studySchedule;
  const schedB = userB.profile.studySchedule;

  return Object.keys(labels).filter(
    (key) =>
      schedA[key as keyof typeof schedA] && schedB[key as keyof typeof schedB]
  ).map((key) => labels[key]);
}

export function getMatchReasons(userA: User, userB: User): string[] {
  const reasons: string[] = [];
  const commonSubjects = userA.profile.subjects.filter((s) =>
    userB.profile.subjects.includes(s)
  );

  if (commonSubjects.length > 0) {
    reasons.push(`${commonSubjects.length} matéria(s) em comum`);
  }
  if (
    userA.profile.university.toLowerCase() ===
    userB.profile.university.toLowerCase()
  ) {
    reasons.push("Mesma universidade");
  }
  if (
    userA.profile.course.toLowerCase() === userB.profile.course.toLowerCase()
  ) {
    reasons.push("Mesmo curso");
  }

  const commonSchedule = getCommonScheduleLabels(userA, userB);
  if (commonSchedule.length > 0) {
    reasons.push(`Horários compatíveis: ${commonSchedule.join(", ")}`);
  }
  if (userA.profile.studyStyle === userB.profile.studyStyle) {
    reasons.push("Mesmo estilo de estudo");
  }

  return reasons;
}

// ==================== MATCH CRUD ====================

export async function getMatchSuggestions(
  currentUser: User,
  maxResults: number = 10
): Promise<MatchSuggestion[]> {
  // Get all users (in production, paginate and filter server-side)
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("role", "==", "student"), limit(50));
  const snapshot = await getDocs(q);

  const suggestions: MatchSuggestion[] = [];

  snapshot.forEach((doc) => {
    const user = doc.data() as User;
    if (user.uid === currentUser.uid) return;

    const compatibility = calculateCompatibility(currentUser, user);
    if (compatibility < 30) return; // minimum threshold

    const commonSubjects = currentUser.profile.subjects.filter((s) =>
      user.profile.subjects.includes(s)
    );

    suggestions.push({
      user,
      compatibility,
      commonSubjects,
      commonSchedule: getCommonScheduleLabels(currentUser, user),
      reasonsToConnect: getMatchReasons(currentUser, user),
    });
  });

  return suggestions
    .sort((a, b) => b.compatibility - a.compatibility)
    .slice(0, maxResults);
}

export async function sendMatchRequest(
  fromUid: string,
  toUid: string,
  compatibility: number,
  commonSubjects: string[]
): Promise<string> {
  const matchRef = doc(collection(db, "matches"));
  const matchData: Omit<Match, "createdAt"> & {
    createdAt: ReturnType<typeof serverTimestamp>;
  } = {
    id: matchRef.id,
    users: [fromUid, toUid],
    compatibility,
    commonSubjects,
    status: "pending",
    requestedBy: fromUid,
    createdAt: serverTimestamp(),
  };
  await setDoc(matchRef, matchData);
  return matchRef.id;
}

export async function respondToMatch(
  matchId: string,
  response: "accepted" | "rejected"
): Promise<void> {
  const matchRef = doc(db, "matches", matchId);
  await updateDoc(matchRef, {
    status: response,
    lastInteraction: serverTimestamp(),
  });

  // If accepted, increment match count for both users
  if (response === "accepted") {
    const matchDoc = await getDoc(matchRef);
    const matchData = matchDoc.data() as Match;
    for (const uid of matchData.users) {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        "stats.matchesCount": arrayUnion(1),
      });
    }
  }
}

export async function getUserMatches(uid: string): Promise<Match[]> {
  const matchesRef = collection(db, "matches");
  const q = query(
    matchesRef,
    where("users", "array-contains", uid),
    where("status", "==", "accepted"),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as Match);
}

export async function getPendingMatches(uid: string): Promise<Match[]> {
  const matchesRef = collection(db, "matches");
  const q = query(
    matchesRef,
    where("users", "array-contains", uid),
    where("status", "==", "pending")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as Match);
}
