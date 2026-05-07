// ==================== USER TYPES ====================
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: "student" | "admin";
  createdAt: Date;
  updatedAt: Date;
  profile: StudentProfile;
  stats: UserStats;
  settings: UserSettings;
}

export interface StudentProfile {
  university: string;
  course: string;
  semester: number;
  subjects: string[];
  studySchedule: StudySchedule;
  bio: string;
  city: string;
  state: string;
  studyStyle: "visual" | "reading" | "practice" | "discussion";
  goals: string[];
}

export interface StudySchedule {
  morning: boolean; // 6h - 12h
  afternoon: boolean; // 12h - 18h
  evening: boolean; // 18h - 22h
  night: boolean; // 22h - 2h
  weekdays: boolean;
  weekends: boolean;
}

export interface UserStats {
  xp: number;
  level: number;
  totalStudyMinutes: number;
  pomodorosCompleted: number;
  matchesCount: number;
  currentStreak: number;
  longestStreak: number;
  badges: Badge[];
  weeklyXp: number;
}

export interface UserSettings {
  notifications: boolean;
  emailNotifications: boolean;
  showOnline: boolean;
  allowMatchRequests: boolean;
  theme: "dark" | "light";
}

// ==================== MATCH TYPES ====================
export interface Match {
  id: string;
  users: [string, string]; // UIDs
  compatibility: number; // 0-100
  commonSubjects: string[];
  status: "pending" | "accepted" | "rejected";
  requestedBy: string;
  createdAt: Date;
  lastInteraction?: Date;
}

export interface MatchSuggestion {
  user: User;
  compatibility: number;
  commonSubjects: string[];
  commonSchedule: string[];
  reasonsToConnect: string[];
}

// ==================== STUDY ROOM TYPES ====================
export interface StudyRoom {
  id: string;
  name: string;
  subject: string;
  createdBy: string;
  members: RoomMember[];
  maxMembers: number;
  isLive: boolean;
  isPrivate: boolean;
  pomodoro: PomodoroState;
  createdAt: Date;
  tags: string[];
}

export interface RoomMember {
  uid: string;
  displayName: string;
  photoURL?: string;
  joinedAt: Date;
  isOnCamera: boolean;
  isOnMic: boolean;
}

export interface PomodoroState {
  isRunning: boolean;
  currentPhase: "focus" | "shortBreak" | "longBreak";
  timeRemaining: number; // seconds
  currentRound: number;
  totalRounds: number;
  focusDuration: number; // minutes
  shortBreakDuration: number;
  longBreakDuration: number;
}

// ==================== CHAT TYPES ====================
export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: Record<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: "text" | "image" | "file" | "system";
  readBy: string[];
  createdAt: Date;
}

// ==================== GAMIFICATION TYPES ====================
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "streak" | "social" | "study" | "special";
  unlockedAt: Date;
}

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL?: string;
  university: string;
  weeklyXp: number;
  totalXp: number;
  rank: number;
}

// ==================== ADMIN TYPES ====================
export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  totalMatches: number;
  activeRooms: number;
  totalStudyMinutes: number;
  avgSessionDuration: number;
  retentionRate: number;
  userGrowth: DataPoint[];
  matchesGrowth: DataPoint[];
  topUniversities: { name: string; count: number }[];
  topSubjects: { name: string; count: number }[];
}

export interface DataPoint {
  date: string;
  value: number;
}

export interface AdminUserView extends User {
  lastActive: Date;
  reportCount: number;
  isBlocked: boolean;
  isBanned: boolean;
}

export interface Report {
  id: string;
  reportedUser: string;
  reportedBy: string;
  reason: string;
  description: string;
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  createdAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
}

// ==================== NOTIFICATION TYPES ====================
export interface Notification {
  id: string;
  userId: string;
  type: "match_request" | "match_accepted" | "message" | "badge" | "room_invite" | "system";
  title: string;
  body: string;
  data?: Record<string, string>;
  read: boolean;
  createdAt: Date;
}
