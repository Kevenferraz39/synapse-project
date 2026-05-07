import {
  doc,
  updateDoc,
  increment,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Badge, LeaderboardEntry, UserStats } from "@/types";

// ==================== XP SYSTEM ====================

export const XP_ACTIONS = {
  COMPLETE_POMODORO: 25,
  STUDY_SESSION_30MIN: 50,
  STUDY_SESSION_60MIN: 120,
  SEND_MATCH_REQUEST: 5,
  ACCEPT_MATCH: 10,
  FIRST_MESSAGE: 5,
  CREATE_ROOM: 15,
  JOIN_ROOM: 10,
  DAILY_LOGIN: 10,
  COMPLETE_PROFILE: 50,
  SHARE_MATERIAL: 20,
  STREAK_BONUS_7: 100,
  STREAK_BONUS_30: 500,
} as const;

export function calculateLevel(xp: number): number {
  // Each level requires progressively more XP
  // Level 1: 0, Level 2: 100, Level 3: 250, Level 4: 450...
  let level = 1;
  let threshold = 0;
  let step = 100;
  while (xp >= threshold + step) {
    threshold += step;
    level++;
    step = Math.floor(step * 1.3);
  }
  return level;
}

export function getXpForNextLevel(currentXp: number): {
  current: number;
  needed: number;
  progress: number;
} {
  let threshold = 0;
  let step = 100;
  while (currentXp >= threshold + step) {
    threshold += step;
    step = Math.floor(step * 1.3);
  }
  const current = currentXp - threshold;
  return {
    current,
    needed: step,
    progress: Math.round((current / step) * 100),
  };
}

export async function awardXp(
  uid: string,
  action: keyof typeof XP_ACTIONS
): Promise<void> {
  const xpAmount = XP_ACTIONS[action];
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    "stats.xp": increment(xpAmount),
    "stats.weeklyXp": increment(xpAmount),
  });
}

// ==================== BADGE SYSTEM ====================

export const BADGE_DEFINITIONS: Record<
  string,
  Omit<Badge, "id" | "unlockedAt">
> = {
  first_blood: {
    name: "First Blood",
    description: "Completou seu primeiro Pomodoro",
    icon: "⚡",
    category: "study",
  },
  streak_7: {
    name: "Fogo Sagrado",
    description: "7 dias seguidos estudando",
    icon: "🔥",
    category: "streak",
  },
  streak_30: {
    name: "Imparável",
    description: "30 dias seguidos estudando",
    icon: "💎",
    category: "streak",
  },
  pomodoro_100: {
    name: "Centurião",
    description: "100 Pomodoros completados",
    icon: "🍅",
    category: "study",
  },
  pomodoro_500: {
    name: "Mestre do Foco",
    description: "500 Pomodoros completados",
    icon: "🧘",
    category: "study",
  },
  social_10: {
    name: "Networker",
    description: "10 conexões feitas",
    icon: "🤝",
    category: "social",
  },
  social_50: {
    name: "Hub Social",
    description: "50 conexões feitas",
    icon: "🌐",
    category: "social",
  },
  night_owl: {
    name: "Coruja Noturna",
    description: "Estudou após meia-noite 10 vezes",
    icon: "🌙",
    category: "special",
  },
  early_bird: {
    name: "Pássaro Madrugador",
    description: "Estudou antes das 7h 10 vezes",
    icon: "🌅",
    category: "special",
  },
  subjects_5: {
    name: "Polímata",
    description: "Estudou 5 matérias diferentes",
    icon: "📖",
    category: "study",
  },
  room_creator: {
    name: "Líder Nato",
    description: "Criou 10 salas de estudo",
    icon: "👑",
    category: "social",
  },
  top_weekly: {
    name: "Top Semanal",
    description: "Ficou em #1 no ranking semanal",
    icon: "🏆",
    category: "special",
  },
};

export async function checkAndAwardBadges(
  uid: string,
  stats: UserStats
): Promise<Badge[]> {
  const newBadges: Badge[] = [];
  const existingBadgeIds = stats.badges.map((b) => b.id);

  const checks: [string, boolean][] = [
    ["first_blood", stats.pomodorosCompleted >= 1],
    ["streak_7", stats.currentStreak >= 7],
    ["streak_30", stats.currentStreak >= 30],
    ["pomodoro_100", stats.pomodorosCompleted >= 100],
    ["pomodoro_500", stats.pomodorosCompleted >= 500],
    ["social_10", stats.matchesCount >= 10],
    ["social_50", stats.matchesCount >= 50],
    ["subjects_5", stats.badges.filter((b) => b.category === "study").length >= 5],
  ];

  for (const [badgeId, condition] of checks) {
    if (condition && !existingBadgeIds.includes(badgeId)) {
      const badgeDef = BADGE_DEFINITIONS[badgeId];
      if (badgeDef) {
        const badge: Badge = {
          id: badgeId,
          ...badgeDef,
          unlockedAt: new Date(),
        };
        newBadges.push(badge);
      }
    }
  }

  // Save new badges to Firestore
  if (newBadges.length > 0) {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      "stats.badges": [...stats.badges, ...newBadges],
    });
  }

  return newBadges;
}

// ==================== LEADERBOARD ====================

export async function getWeeklyLeaderboard(
  maxResults: number = 20
): Promise<LeaderboardEntry[]> {
  const usersRef = collection(db, "users");
  const q = query(
    usersRef,
    where("role", "==", "student"),
    orderBy("stats.weeklyXp", "desc"),
    limit(maxResults)
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc, index) => {
    const data = doc.data();
    return {
      uid: data.uid,
      displayName: data.displayName,
      photoURL: data.photoURL,
      university: data.profile?.university || "",
      weeklyXp: data.stats?.weeklyXp || 0,
      totalXp: data.stats?.xp || 0,
      rank: index + 1,
    };
  });
}

export async function getAllTimeLeaderboard(
  maxResults: number = 20
): Promise<LeaderboardEntry[]> {
  const usersRef = collection(db, "users");
  const q = query(
    usersRef,
    where("role", "==", "student"),
    orderBy("stats.xp", "desc"),
    limit(maxResults)
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc, index) => {
    const data = doc.data();
    return {
      uid: data.uid,
      displayName: data.displayName,
      photoURL: data.photoURL,
      university: data.profile?.university || "",
      weeklyXp: data.stats?.weeklyXp || 0,
      totalXp: data.stats?.xp || 0,
      rank: index + 1,
    };
  });
}
