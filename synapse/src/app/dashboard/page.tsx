"use client";

import { useAuth } from "@/contexts/AuthContext";
import { formatXp, formatMinutes, getInitials } from "@/lib/utils";
import { getXpForNextLevel, BADGE_DEFINITIONS, calculateLevel } from "@/lib/gamification-service";
import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, query, where, orderBy, limit, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface RecentMatch {
  id: string;
  name: string;
  course: string;
  compatibility: number;
  subjects: string[];
}

interface ActiveRoom {
  id: string;
  name: string;
  members: number;
  maxMembers: number;
  isLive: boolean;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [recentMatches, setRecentMatches] = useState<RecentMatch[]>([]);
  const [activeRooms, setActiveRooms] = useState<ActiveRoom[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [loadingRooms, setLoadingRooms] = useState(true);

  // Fetch recent accepted matches
  useEffect(() => {
    if (!user) return;

    async function fetchMatches() {
      try {
        const matchesRef = collection(db, "matches");
        const q = query(
          matchesRef,
          where("users", "array-contains", user!.uid),
          where("status", "==", "accepted"),
          orderBy("createdAt", "desc"),
          limit(3)
        );
        const snapshot = await getDocs(q);

        const matches: RecentMatch[] = [];
        for (const docSnap of snapshot.docs) {
          const data = docSnap.data();
          const otherUid = data.users.find((u: string) => u !== user!.uid);
          if (otherUid) {
            // Fetch other user's data
            const { getDoc, doc } = await import("firebase/firestore");
            const otherDoc = await getDoc(doc(db, "users", otherUid));
            if (otherDoc.exists()) {
              const other = otherDoc.data();
              matches.push({
                id: docSnap.id,
                name: other.displayName || "Estudante",
                course: other.profile?.course || "Curso não informado",
                compatibility: data.compatibility || 0,
                subjects: data.commonSubjects || [],
              });
            }
          }
        }
        setRecentMatches(matches);
      } catch (err) {
        console.error("Error fetching matches:", err);
      } finally {
        setLoadingMatches(false);
      }
    }

    fetchMatches();
  }, [user]);

  // Listen to active rooms in real-time
  useEffect(() => {
    const roomsRef = collection(db, "rooms");
    const q = query(roomsRef, where("isLive", "==", true), limit(4));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rooms: ActiveRoom[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || "Sala sem nome",
          members: data.members?.length || 0,
          maxMembers: data.maxMembers || 8,
          isLive: true,
        };
      });
      setActiveRooms(rooms);
      setLoadingRooms(false);
    }, () => setLoadingRooms(false));

    return unsubscribe;
  }, []);

  if (!user) return null;

  const stats = user.stats || { xp: 0, level: 1, currentStreak: 0, pomodorosCompleted: 0, totalStudyMinutes: 0, badges: [], weeklyXp: 0, matchesCount: 0, longestStreak: 0 };
  const level = calculateLevel(stats.xp);
  const xp = getXpForNextLevel(stats.xp);

  // Calculate weekly goals from real data
  const weeklyPomodoros = stats.pomodorosCompleted;
  const weeklyHours = Math.round(stats.totalStudyMinutes / 60);
  const weeklyConnections = stats.matchesCount;

  return (
    <div className="animate-fade-up space-y-8">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">
          Olá, <span className="gradient-text">{(user.displayName || "Estudante").split(" ")[0]}</span> 👋
        </h1>
        <p className="text-text-secondary mt-1">
          {user.profile?.university
            ? `${user.profile.course} · ${user.profile.university}`
            : "Pronto para mais uma sessão de estudo?"}
        </p>
      </div>

      {/* Stats grid - REAL DATA */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="text-xs text-text-muted font-medium mb-2">XP Total</div>
          <div className="text-2xl font-black font-mono gradient-text-mint">{formatXp(stats.xp)}</div>
          <div className="mt-2">
            <div className="flex justify-between text-[10px] text-text-muted mb-1">
              <span>Nível {level}</span>
              <span>{xp.progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-cool transition-all" style={{ width: `${xp.progress}%` }} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="text-xs text-text-muted font-medium mb-2">Streak</div>
          <div className="text-2xl font-black font-mono text-brand-orange">{stats.currentStreak}</div>
          <div className="text-xs text-text-muted mt-1">
            🔥 {stats.currentStreak === 0 ? "Estude hoje!" : `${stats.currentStreak} dias seguidos`}
          </div>
        </div>

        <div className="stat-card">
          <div className="text-xs text-text-muted font-medium mb-2">Pomodoros</div>
          <div className="text-2xl font-black font-mono text-brand-pink">{stats.pomodorosCompleted}</div>
          <div className="text-xs text-text-muted mt-1">🍅 completados</div>
        </div>

        <div className="stat-card">
          <div className="text-xs text-text-muted font-medium mb-2">Tempo de Estudo</div>
          <div className="text-2xl font-black font-mono text-brand-purple">{formatMinutes(stats.totalStudyMinutes)}</div>
          <div className="text-xs text-text-muted mt-1">⏱️ total acumulado</div>
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Quick access */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold mb-4">Acesso rápido</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Link href="/dashboard/matches" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-brand-purple/30 transition-all group">
                <span className="text-2xl group-hover:scale-110 transition-transform">🔥</span>
                <span className="text-xs font-medium text-text-secondary">Encontrar Match</span>
              </Link>
              <Link href="/dashboard/study-rooms" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-brand-orange/30 transition-all group">
                <span className="text-2xl group-hover:scale-110 transition-transform">📚</span>
                <span className="text-xs font-medium text-text-secondary">Criar Sala</span>
              </Link>
              <Link href="/dashboard/chat" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-brand-pink/30 transition-all group">
                <span className="text-2xl group-hover:scale-110 transition-transform">💬</span>
                <span className="text-xs font-medium text-text-secondary">Mensagens</span>
              </Link>
              <Link href="/dashboard/rankings" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-brand-mint/30 transition-all group">
                <span className="text-2xl group-hover:scale-110 transition-transform">🏆</span>
                <span className="text-xs font-medium text-text-secondary">Rankings</span>
              </Link>
            </div>
          </div>

          {/* Recent matches - REAL DATA */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Matches recentes</h2>
              <Link href="/dashboard/matches" className="text-xs text-brand-purple hover:text-brand-mint transition-colors font-medium">Ver todos →</Link>
            </div>

            {loadingMatches ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
              </div>
            ) : recentMatches.length > 0 ? (
              <div className="space-y-3">
                {recentMatches.map((match) => (
                  <div key={match.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-gradient-main flex items-center justify-center text-sm font-bold shrink-0">
                      {getInitials(match.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold">{match.name}</div>
                      <div className="text-xs text-text-muted">{match.course}</div>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      {match.subjects.slice(0, 2).map((s) => (
                        <span key={s} className="badge-tag text-[10px]">{s}</span>
                      ))}
                    </div>
                    <span className="text-xs font-mono font-bold text-brand-mint bg-brand-mint/10 px-2 py-1 rounded-lg">{match.compatibility}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-3xl mb-3">🔍</div>
                <p className="text-sm text-text-muted mb-3">Nenhum match ainda</p>
                <Link href="/dashboard/matches" className="text-xs text-brand-purple hover:text-brand-mint font-medium">
                  Encontrar parceiros de estudo →
                </Link>
              </div>
            )}
          </div>

          {/* Active study rooms - REAL DATA */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Salas ativas agora</h2>
              <Link href="/dashboard/study-rooms" className="text-xs text-brand-purple hover:text-brand-mint transition-colors font-medium">Ver todas →</Link>
            </div>

            {loadingRooms ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
              </div>
            ) : activeRooms.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {activeRooms.map((room) => (
                  <div key={room.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-brand-purple/20 transition-all cursor-pointer">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold">{room.name}</span>
                      <span className="flex items-center gap-1.5 text-[10px] text-brand-pink font-semibold">
                        <span className="w-1.5 h-1.5 bg-brand-pink rounded-full animate-pulse" /> AO VIVO
                      </span>
                    </div>
                    <span className="text-xs text-text-muted">👥 {room.members}/{room.maxMembers} membros</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-3xl mb-3">📚</div>
                <p className="text-sm text-text-muted mb-3">Nenhuma sala ativa agora</p>
                <Link href="/dashboard/study-rooms" className="text-xs text-brand-purple hover:text-brand-mint font-medium">
                  Criar uma sala de estudo →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Profile completion */}
          {(!user.profile?.university || !user.profile?.course) && (
            <div className="glass-card p-6 border-brand-orange/20">
              <h2 className="text-lg font-bold mb-2">⚡ Complete seu perfil</h2>
              <p className="text-xs text-text-muted mb-4">
                Preencha seus dados para receber melhores sugestões de match.
              </p>
              <Link href="/dashboard/profile" className="btn-gradient py-2 px-4 text-xs inline-block">
                Completar perfil →
              </Link>
            </div>
          )}

          {/* Badges */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold mb-4">🎖️ Conquistas</h2>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(BADGE_DEFINITIONS).slice(0, 9).map(([id, badge]) => {
                const unlocked = (stats.badges || []).some((b: any) => b.id === id);
                return (
                  <div key={id} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${unlocked ? "bg-brand-purple/10" : "bg-white/[0.02] opacity-40"}`}>
                    <span className="text-xl">{badge.icon}</span>
                    <span className="text-[9px] text-text-muted text-center leading-tight">{badge.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weekly goals - REAL DATA */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold mb-4">🎯 Meta semanal</h2>
            <div className="space-y-4">
              {[
                { label: "Pomodoros", current: weeklyPomodoros, target: 20, color: "bg-brand-orange" },
                { label: "Horas de estudo", current: weeklyHours, target: 15, color: "bg-brand-purple" },
                { label: "Conexões", current: weeklyConnections, target: 5, color: "bg-brand-mint" },
              ].map((goal) => (
                <div key={goal.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-text-secondary">{goal.label}</span>
                    <span className="font-mono font-bold text-text-primary">{goal.current}/{goal.target}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className={`h-full rounded-full ${goal.color} transition-all duration-500`} style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Your subjects */}
          {user.profile?.subjects && user.profile.subjects.length > 0 && (
            <div className="glass-card p-6">
              <h2 className="text-lg font-bold mb-4">📖 Suas matérias</h2>
              <div className="flex flex-wrap gap-2">
                {user.profile.subjects.map((s: string) => (
                  <span key={s} className="px-3 py-1.5 rounded-full text-xs font-medium bg-brand-purple/15 text-brand-purple">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
