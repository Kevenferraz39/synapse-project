"use client";

import { useAuth } from "@/contexts/AuthContext";
import { formatXp, formatMinutes } from "@/lib/utils";
import { getXpForNextLevel, BADGE_DEFINITIONS } from "@/lib/gamification-service";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();
  if (!user) return null;

  const xp = getXpForNextLevel(user.stats.xp);
  const level = user.stats.level || 1;

  return (
    <div className="animate-fade-up space-y-8">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">
          Olá, <span className="gradient-text">{user.displayName.split(" ")[0]}</span> 👋
        </h1>
        <p className="text-text-secondary mt-1">Pronto para mais uma sessão de estudo?</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="text-xs text-text-muted font-medium mb-2">XP Total</div>
          <div className="text-2xl font-black font-mono gradient-text-mint">{formatXp(user.stats.xp)}</div>
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
          <div className="text-2xl font-black font-mono text-brand-orange">{user.stats.currentStreak}</div>
          <div className="text-xs text-text-muted mt-1">
            🔥 {user.stats.currentStreak === 0 ? "Estude hoje!" : `${user.stats.currentStreak} dias seguidos`}
          </div>
        </div>

        <div className="stat-card">
          <div className="text-xs text-text-muted font-medium mb-2">Pomodoros</div>
          <div className="text-2xl font-black font-mono text-brand-pink">{user.stats.pomodorosCompleted}</div>
          <div className="text-xs text-text-muted mt-1">🍅 completados</div>
        </div>

        <div className="stat-card">
          <div className="text-xs text-text-muted font-medium mb-2">Tempo de Estudo</div>
          <div className="text-2xl font-black font-mono text-brand-purple">{formatMinutes(user.stats.totalStudyMinutes)}</div>
          <div className="text-xs text-text-muted mt-1">⏱️ total acumulado</div>
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick actions */}
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

          {/* Recent matches placeholder */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Matches recentes</h2>
              <Link href="/dashboard/matches" className="text-xs text-brand-purple hover:text-brand-mint transition-colors font-medium">
                Ver todos →
              </Link>
            </div>

            <div className="space-y-3">
              {[
                { name: "Lucas M.", course: "Eng. Software", compat: 94, subjects: ["React", "Python"] },
                { name: "Mariana C.", course: "Ciência de Dados", compat: 89, subjects: ["SQL", "Estatística"] },
                { name: "Rafael O.", course: "Design", compat: 85, subjects: ["UX/UI", "Figma"] },
              ].map((match, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-gradient-main flex items-center justify-center text-sm font-bold shrink-0">
                    {match.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold">{match.name}</div>
                    <div className="text-xs text-text-muted">{match.course}</div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    {match.subjects.map((s) => (
                      <span key={s} className="badge-tag text-[10px]">{s}</span>
                    ))}
                  </div>
                  <span className="text-xs font-mono font-bold text-brand-mint bg-brand-mint/10 px-2 py-1 rounded-lg">{match.compat}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Active study rooms */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Salas ativas agora</h2>
              <Link href="/dashboard/study-rooms" className="text-xs text-brand-purple hover:text-brand-mint transition-colors font-medium">
                Ver todas →
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { name: "Algoritmos & ED", members: 5, pomodoro: "18:42", round: 3 },
                { name: "Cálculo II", members: 6, pomodoro: "07:15", round: 5 },
              ].map((room, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-brand-purple/20 transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold">{room.name}</span>
                    <span className="flex items-center gap-1.5 text-[10px] text-brand-pink font-semibold">
                      <span className="w-1.5 h-1.5 bg-brand-pink rounded-full animate-pulse" /> AO VIVO
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">👥 {room.members} membros</span>
                    <span className="text-sm font-mono font-bold text-brand-orange">
                      🍅 {room.pomodoro} <span className="text-[10px] text-text-muted font-normal">#{room.round}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Badges */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold mb-4">🎖️ Conquistas</h2>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(BADGE_DEFINITIONS).slice(0, 9).map(([id, badge]) => {
                const unlocked = user.stats.badges.some((b) => b.id === id);
                return (
                  <div
                    key={id}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                      unlocked ? "bg-brand-purple/10" : "bg-white/[0.02] opacity-40"
                    }`}
                  >
                    <span className="text-xl">{badge.icon}</span>
                    <span className="text-[9px] text-text-muted text-center leading-tight">{badge.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weekly goal */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold mb-4">🎯 Meta semanal</h2>
            <div className="space-y-4">
              {[
                { label: "Pomodoros", current: 12, target: 20, color: "bg-brand-orange" },
                { label: "Horas de estudo", current: 8, target: 15, color: "bg-brand-purple" },
                { label: "Conexões", current: 3, target: 5, color: "bg-brand-mint" },
              ].map((goal) => (
                <div key={goal.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-text-secondary">{goal.label}</span>
                    <span className="font-mono font-bold text-text-primary">
                      {goal.current}/{goal.target}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${goal.color} transition-all duration-500`}
                      style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
