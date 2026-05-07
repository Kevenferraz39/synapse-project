"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { formatXp, getInitials } from "@/lib/utils";
import { BADGE_DEFINITIONS } from "@/lib/gamification-service";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface LeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL?: string;
  university: string;
  weeklyXp: number;
  totalXp: number;
  streak: number;
  isYou: boolean;
}

export default function RankingsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"weekly" | "alltime">("weekly");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [tab, user]);

  async function fetchLeaderboard() {
    if (!user) return;
    setLoading(true);

    try {
      const usersRef = collection(db, "users");
      const sortField = tab === "weekly" ? "stats.weeklyXp" : "stats.xp";
      const q = query(
        usersRef,
        where("role", "==", "student"),
        orderBy(sortField, "desc"),
        limit(20)
      );
      const snapshot = await getDocs(q);

      const entries: LeaderboardEntry[] = snapshot.docs.map((docSnap, index) => {
        const data = docSnap.data();
        return {
          uid: docSnap.id,
          displayName: data.displayName || "Estudante",
          photoURL: data.photoURL,
          university: data.profile?.university || "—",
          weeklyXp: data.stats?.weeklyXp || 0,
          totalXp: data.stats?.xp || 0,
          streak: data.stats?.currentStreak || 0,
          isYou: docSnap.id === user!.uid,
        };
      });

      // If user is not in top 20, add them
      const userInList = entries.some((e) => e.isYou);
      if (!userInList) {
        entries.push({
          uid: user.uid,
          displayName: user.displayName || "Você",
          photoURL: user.photoURL,
          university: user.profile?.university || "—",
          weeklyXp: user.stats?.weeklyXp || 0,
          totalXp: user.stats?.xp || 0,
          streak: user.stats?.currentStreak || 0,
          isYou: true,
        });
      }

      setLeaderboard(entries);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      // Fallback: show only current user
      if (user) {
        setLeaderboard([{
          uid: user.uid,
          displayName: user.displayName || "Você",
          photoURL: user.photoURL,
          university: user.profile?.university || "—",
          weeklyXp: user.stats?.weeklyXp || 0,
          totalXp: user.stats?.xp || 0,
          streak: user.stats?.currentStreak || 0,
          isYou: true,
        }]);
      }
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  const top3 = leaderboard.slice(0, 3);
  const xpField = tab === "weekly" ? "weeklyXp" : "totalXp";

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="text-2xl font-bold">🏆 Rankings</h1>
        <p className="text-text-secondary text-sm mt-1">Veja quem está mandando bem</p>
      </div>

      {/* Top 3 podium */}
      {!loading && top3.length >= 1 && (
        <div className="flex justify-center items-end gap-4 pb-4">
          {/* 2nd place */}
          {top3[1] && (
            <div className="text-center animate-fade-up" style={{ animationDelay: "0.1s" }}>
              <div className="w-16 h-16 rounded-full bg-gradient-cool mx-auto flex items-center justify-center text-lg font-bold mb-2">
                {top3[1].photoURL ? <img src={top3[1].photoURL} className="w-full h-full rounded-full object-cover" /> : getInitials(top3[1].displayName)}
              </div>
              <div className="text-sm font-semibold">{top3[1].displayName.split(" ")[0]}{top3[1].isYou ? " (você)" : ""}</div>
              <div className="text-xs font-mono text-text-muted">{formatXp(top3[1][xpField])} XP</div>
              <div className="mt-2 w-20 h-20 rounded-t-xl bg-slate-400/20 border border-slate-400/30 flex items-center justify-center text-2xl font-black text-slate-300 mx-auto">2</div>
            </div>
          )}

          {/* 1st place */}
          {top3[0] && (
            <div className="text-center animate-fade-up">
              <div className="text-2xl mb-1">👑</div>
              <div className="w-20 h-20 rounded-full bg-gradient-main mx-auto flex items-center justify-center text-xl font-bold mb-2 ring-4 ring-yellow-400/30">
                {top3[0].photoURL ? <img src={top3[0].photoURL} className="w-full h-full rounded-full object-cover" /> : getInitials(top3[0].displayName)}
              </div>
              <div className="text-sm font-bold">{top3[0].displayName.split(" ")[0]}{top3[0].isYou ? " (você)" : ""}</div>
              <div className="text-xs font-mono text-brand-mint font-bold">{formatXp(top3[0][xpField])} XP</div>
              <div className="mt-2 w-24 h-28 rounded-t-xl bg-yellow-400/15 border border-yellow-400/30 flex items-center justify-center text-3xl font-black text-yellow-400 mx-auto">1</div>
            </div>
          )}

          {/* 3rd place */}
          {top3[2] && (
            <div className="text-center animate-fade-up" style={{ animationDelay: "0.2s" }}>
              <div className="w-16 h-16 rounded-full bg-gradient-warm mx-auto flex items-center justify-center text-lg font-bold mb-2">
                {top3[2].photoURL ? <img src={top3[2].photoURL} className="w-full h-full rounded-full object-cover" /> : getInitials(top3[2].displayName)}
              </div>
              <div className="text-sm font-semibold">{top3[2].displayName.split(" ")[0]}{top3[2].isYou ? " (você)" : ""}</div>
              <div className="text-xs font-mono text-text-muted">{formatXp(top3[2][xpField])} XP</div>
              <div className="mt-2 w-20 h-16 rounded-t-xl bg-amber-700/15 border border-amber-600/30 flex items-center justify-center text-2xl font-black text-amber-600 mx-auto">3</div>
            </div>
          )}
        </div>
      )}

      {/* Tab switcher */}
      <div className="flex gap-2 bg-dark-700 rounded-xl p-1 max-w-xs">
        <button onClick={() => setTab("weekly")} className={`flex-1 px-4 py-2 rounded-lg text-xs font-medium transition-all ${tab === "weekly" ? "bg-brand-purple text-white" : "text-text-muted"}`}>
          Semanal
        </button>
        <button onClick={() => setTab("alltime")} className={`flex-1 px-4 py-2 rounded-lg text-xs font-medium transition-all ${tab === "alltime" ? "bg-brand-purple text-white" : "text-text-muted"}`}>
          Geral
        </button>
      </div>

      {/* Full leaderboard */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="grid grid-cols-[60px_1fr_100px_80px] gap-2 px-5 py-3 text-[10px] text-text-muted font-mono uppercase tracking-wider border-b border-white/[0.06]">
            <span>Rank</span>
            <span>Estudante</span>
            <span className="text-right">{tab === "weekly" ? "XP Semanal" : "XP Total"}</span>
            <span className="text-right">Streak</span>
          </div>

          {leaderboard.map((entry, i) => (
            <div
              key={entry.uid}
              className={`grid grid-cols-[60px_1fr_100px_80px] gap-2 items-center px-5 py-3.5 transition-all hover:bg-white/[0.02] ${
                entry.isYou ? "bg-brand-purple/8 border-l-2 border-brand-purple" : ""
              } ${i < leaderboard.length - 1 ? "border-b border-white/[0.04]" : ""}`}
            >
              <span className={`text-sm font-mono font-bold ${i === 0 ? "text-yellow-400" : i === 1 ? "text-slate-300" : i === 2 ? "text-amber-600" : "text-text-muted"}`}>
                #{i + 1}
              </span>

              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${i < 3 ? "bg-gradient-main" : "bg-dark-600"}`}>
                  {entry.photoURL ? <img src={entry.photoURL} className="w-full h-full rounded-full object-cover" /> : getInitials(entry.displayName)}
                </div>
                <div>
                  <div className="text-sm font-medium">
                    {entry.displayName} {entry.isYou && <span className="text-brand-mint text-xs">(você)</span>}
                  </div>
                  <div className="text-[10px] text-text-muted">{entry.university}</div>
                </div>
              </div>

              <span className="text-right text-sm font-mono font-bold text-brand-mint">
                {formatXp(entry[xpField])}
              </span>

              <span className="text-right text-sm">🔥 {entry.streak}</span>
            </div>
          ))}

          {leaderboard.length === 0 && (
            <div className="py-12 text-center text-text-muted text-sm">
              Nenhum estudante encontrado
            </div>
          )}
        </div>
      )}

      {/* Badges section */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-bold mb-4">🎖️ Todas as conquistas</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {Object.entries(BADGE_DEFINITIONS).map(([id, badge]) => {
            const unlocked = (user.stats?.badges || []).some((b: any) => b.id === id);
            return (
              <div key={id} className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all cursor-pointer text-center ${
                unlocked
                  ? "bg-brand-purple/10 border-brand-purple/20"
                  : "bg-white/[0.02] border-white/[0.06] opacity-50 hover:opacity-70"
              }`}>
                <span className="text-2xl">{badge.icon}</span>
                <span className="text-xs font-medium">{badge.name}</span>
                <span className="text-[9px] text-text-muted leading-tight">{badge.description}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
