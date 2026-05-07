import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  getCountFromServer,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { AdminStats, AdminUserView, Report, User } from "@/types";

// ==================== ADMIN ANALYTICS ====================

export async function getAdminStats(): Promise<AdminStats> {
  // Total users
  const usersCol = collection(db, "users");
  const totalUsersSnap = await getCountFromServer(usersCol);
  const totalUsers = totalUsersSnap.data().count;

  // Users registered today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = Timestamp.fromDate(today);

  const newTodayQuery = query(
    usersCol,
    where("createdAt", ">=", todayTimestamp)
  );
  const newTodaySnap = await getCountFromServer(newTodayQuery);
  const newUsersToday = newTodaySnap.data().count;

  // Users this week
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekTimestamp = Timestamp.fromDate(weekAgo);

  const newWeekQuery = query(
    usersCol,
    where("createdAt", ">=", weekTimestamp)
  );
  const newWeekSnap = await getCountFromServer(newWeekQuery);
  const newUsersThisWeek = newWeekSnap.data().count;

  // Total matches
  const matchesCol = collection(db, "matches");
  const matchesSnap = await getCountFromServer(matchesCol);
  const totalMatches = matchesSnap.data().count;

  // Active rooms
  const roomsCol = collection(db, "rooms");
  const activeRoomsQuery = query(roomsCol, where("isLive", "==", true));
  const activeRoomsSnap = await getCountFromServer(activeRoomsQuery);
  const activeRooms = activeRoomsSnap.data().count;

  // Top universities
  const usersSnap = await getDocs(query(usersCol, limit(500)));
  const uniCount: Record<string, number> = {};
  const subjectCount: Record<string, number> = {};
  let totalStudyMinutes = 0;

  usersSnap.forEach((doc) => {
    const data = doc.data();
    const uni = data.profile?.university;
    if (uni) uniCount[uni] = (uniCount[uni] || 0) + 1;

    const subjects = data.profile?.subjects || [];
    subjects.forEach((s: string) => {
      subjectCount[s] = (subjectCount[s] || 0) + 1;
    });

    totalStudyMinutes += data.stats?.totalStudyMinutes || 0;
  });

  const topUniversities = Object.entries(uniCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  const topSubjects = Object.entries(subjectCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  return {
    totalUsers,
    activeUsers: Math.round(totalUsers * 0.4), // placeholder
    newUsersToday,
    newUsersThisWeek,
    totalMatches,
    activeRooms,
    totalStudyMinutes,
    avgSessionDuration: totalUsers > 0 ? Math.round(totalStudyMinutes / totalUsers) : 0,
    retentionRate: 0.68, // placeholder - calculate from real data
    userGrowth: [],
    matchesGrowth: [],
    topUniversities,
    topSubjects,
  };
}

// ==================== USER MANAGEMENT ====================

export async function getAllUsers(
  maxResults: number = 50
): Promise<AdminUserView[]> {
  const usersRef = collection(db, "users");
  const q = query(usersRef, orderBy("createdAt", "desc"), limit(maxResults));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      lastActive: data.updatedAt || data.createdAt,
      reportCount: 0,
      isBlocked: data.isBlocked || false,
      isBanned: data.isBanned || false,
    } as AdminUserView;
  });
}

export async function blockUser(uid: string): Promise<void> {
  await updateDoc(doc(db, "users", uid), { isBlocked: true });
}

export async function unblockUser(uid: string): Promise<void> {
  await updateDoc(doc(db, "users", uid), { isBlocked: false });
}

export async function banUser(uid: string): Promise<void> {
  await updateDoc(doc(db, "users", uid), { isBanned: true, isBlocked: true });
}

export async function changeUserRole(
  uid: string,
  role: "student" | "admin"
): Promise<void> {
  await updateDoc(doc(db, "users", uid), { role });
}

// ==================== REPORTS ====================

export async function getReports(
  status?: string,
  maxResults: number = 50
): Promise<Report[]> {
  const reportsRef = collection(db, "reports");
  let q;
  if (status) {
    q = query(
      reportsRef,
      where("status", "==", status),
      orderBy("createdAt", "desc"),
      limit(maxResults)
    );
  } else {
    q = query(reportsRef, orderBy("createdAt", "desc"), limit(maxResults));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as Report);
}

export async function resolveReport(
  reportId: string,
  resolvedBy: string,
  action: "resolved" | "dismissed"
): Promise<void> {
  await updateDoc(doc(db, "reports", reportId), {
    status: action,
    resolvedBy,
    resolvedAt: new Date(),
  });
}
