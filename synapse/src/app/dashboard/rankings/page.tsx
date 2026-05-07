"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { formatXp, getInitials } from "@/lib/utils";
import { BADGE_DEFINITIONS } from "@/lib/gamification-service";

const MOCK_LEADERBOARD = [
  { rank: 1, name: "Carolina Ferreira", university: "USP", weeklyXp: 4280, totalXp: 28400, streak: 45 },
  { rank: 2, name: "Pedro Almeida", university: "UNICAMP", weeklyXp: 3950, totalXp: 24100, streak: 30 },
  { rank: 3, name: "Julia Santos", university: "PUC-SP", weeklyXp: 3720, totalXp: 21800, streak: 21 },
  { rank: 4, name: "Você", university: "USP", weeklyXp: 3180, totalXp: 18500, streak: 14, isYou: true },
  { rank: 5, name: "Gabriel Lima", university: "UFMG", weeklyXp: 2900, totalXp: 17200, streak: 10 },
  { rank: 6, name: "Beatriz Rocha", university: "UFRJ", weeklyXp: 2650, totalXp: 15800, streak: 8 },
  { rank: 7, name: "Lucas Mendes", university: "USP", weeklyXp: 2420, totalXp: 14300, streak: 14 },
  { rank: 8, name: "Mariana Costa", university: "UNICAMP", weeklyXp: 2180, totalXp: 13100, streak: 7 },
  { rank: 9, name: "Rafael Oliveira", university: "PUC-SP", weeklyXp: 1900, totalXp: 11500, streak: 3 },
  { rank: 10, name: "Ana Beatriz", university: "USP", weeklyXp: 1750, totalXp: 10200, streak: 21 },
];

const GRADIENTS = [
  "bg-gradient-to-r from-yellow-400 to-amber-500", // gold
  "bg-gradient-to-r from-slate-300 to-slate-400", // silver
  "bg-gradient-to-r from-amber-600 to-orange-700", // bronze
];

export default function RankingsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"weekly" | "alltime">("weekly");

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="text-2xl font-bold">🏆 Rankings</h1>
        <p className="text-text-secondary text-sm mt-1">Veja quem está mandando bem essa semana</p>
      </div>

      {/* Top 3 podium */}
      <div className="flex justify-center items-end gap-4 pb-4">
        {/* 2nd place */}
        <div className="text-center animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <div className="w-16 h-16 rounded-full bg-gradient-cool mx-auto flex items-center justify-center text-lg font-bold mb-2">
            {getInitials(MOCK_LEADERBOARD[1].name)}
          </div>
          <div className="text-sm font-semibold">{MOCK_LEADERBOARD[1].name.split(" ")[0]}</div>
          <div className="text-xs font-mono text-text-muted">{formatXp(MOCK_LEADERBOARD[1].weeklyXp)} XP</div>
          <div className="mt-2 w-20 h-20 rounded-t-xl bg-slate-400/20 border border-slate-400/30 flex items-center justify-center text-2xl font-black text-slate-300 mx-auto">
            2
          </div>
        </div>

        {/* 1st place */}
        <div className="text-center animate-fade-up">
          <div className="text-2xl mb-1">👑</div>
          <div className="w-20 h-20 rounded-full bg-gradient-main mx-auto flex items-center justify-center text-xl font-bold mb-2 ring-4 ring-yellow-400/30">
            {getInitials(MOCK_LEADERBOARD[0].name)}
          </div>
          <div className="text-sm font-bold">{MOCK_LEADERBOARD[0].name.split(" ")[0]}</div>
          <div className="text-xs font-mono text-brand-mint font-bold">{formatXp(MOCK_LEADERBOARD[0].weeklyXp)} XP</div>
          <div className="mt-2 w-24 h-28 rounded-t-xl bg-yellow-400/15 border border-yellow-400/30 flex items-center justify-center text-3xl font-black text-yellow-400 mx-auto">
            1
          </div>
        </div>

        {/* 3rd place */}
        <div className="text-center animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <div className="w-16 h-16 rounded-full bg-gradient-warm mx-auto flex items-center justify-center text-lg font-bold mb-2">
            {getInitials(MOCK_LEADERBOARD[2].name)}
          </div>
          <div className="text-sm font-semibold">{MOCK_LEADERBOARD[2].name.split(" ")[0]}</div>
          <div className="text-xs font-mono text-text-muted">{formatXp(MOCK_LEADERBOARD[2].weeklyXp)} XP</div>
          <div className="mt-2 w-20 h-16 rounded-t-xl bg-amber-700/15 border border-amber-600/30 flex items-center justify-center text-2xl font-black text-amber-600 mx-auto">
            3
          </div>
        </div>
      </div>

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
      <div className="glass-card overflow-hidden">
        <div className="grid grid-cols-[60px_1fr_100px_80px] gap-2 px-5 py-3 text-[10px] text-text-muted font-mono uppercase tracking-wider border-b border-white/[0.06]">
          <span>Rank</span>
          <span>Estudante</span>
          <span className="text-right">{tab === "weekly" ? "XP Semanal" : "XP Total"}</span>
          <span className="text-right">Streak</span>
        </div>

        {MOCK_LEADERBOARD.map((entry, i) => (
          <div
            key={i}
            className={`grid grid-cols-[60px_1fr_100px_80px] gap-2 items-center px-5 py-3.5 transition-all hover:bg-white/[0.02] ${
              entry.isYou ? "bg-brand-purple/8 border-l-2 border-brand-purple" : ""
            } ${i < MOCK_LEADERBOARD.length - 1 ? "border-b border-white/[0.04]" : ""}`}
          >
            <span className={`text-sm font-mono font-bold ${i === 0 ? "text-yellow-400" : i === 1 ? "text-slate-300" : i === 2 ? "text-amber-600" : "text-text-muted"}`}>
              #{entry.rank}
            </span>

            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                i < 3 ? "bg-gradient-main" : "bg-dark-600"
              }`}>
                {getInitials(entry.name)}
              </div>
              <div>
                <div className="text-sm font-medium">{entry.name} {entry.isYou && <span className="text-brand-mint text-xs">(você)</span>}</div>
                <div className="text-[10px] text-text-muted">{entry.university}</div>
              </div>
            </div>

            <span className="text-right text-sm font-mono font-bold text-brand-mint">
              {formatXp(tab === "weekly" ? entry.weeklyXp : entry.totalXp)}
            </span>

            <span className="text-right text-sm">
              🔥 {entry.streak}
            </span>
          </div>
        ))}
      </div>

      {/* Badges section */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-bold mb-4">🎖️ Todas as conquistas</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {Object.entries(BADGE_DEFINITIONS).map(([id, badge]) => (
            <div key={id} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-brand-purple/20 transition-all cursor-pointer text-center">
              <span className="text-2xl">{badge.icon}</span>
              <span className="text-xs font-medium">{badge.name}</span>
              <span className="text-[9px] text-text-muted leading-tight">{badge.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
