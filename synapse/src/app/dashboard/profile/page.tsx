"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { formatXp, formatMinutes, getInitials } from "@/lib/utils";
import { getXpForNextLevel, BADGE_DEFINITIONS } from "@/lib/gamification-service";

export default function ProfilePage() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(user?.profile.bio || "");
  const [university, setUniversity] = useState(user?.profile.university || "");
  const [course, setCourse] = useState(user?.profile.course || "");

  if (!user) return null;

  const xp = getXpForNextLevel(user.stats.xp);

  return (
    <div className="animate-fade-up space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">👤 Meu Perfil</h1>

      {/* Profile header */}
      <div className="glass-card overflow-hidden">
        <div className="h-28 bg-gradient-main relative" />
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-10 mb-4">
            <div className="w-20 h-20 rounded-2xl bg-dark-800 border-4 border-dark-800 flex items-center justify-center text-2xl font-bold bg-gradient-main text-white shrink-0">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-full h-full rounded-xl object-cover" />
              ) : (
                getInitials(user.displayName)
              )}
            </div>
            <div className="flex-1 pt-10">
              <h2 className="text-xl font-bold">{user.displayName}</h2>
              <p className="text-sm text-text-muted">{user.email}</p>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className="btn-ghost py-2 px-4 text-xs"
            >
              {editing ? "Cancelar" : "Editar perfil"}
            </button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-3 py-4 border-y border-white/[0.06]">
            <div className="text-center">
              <div className="text-lg font-bold font-mono gradient-text-mint">{formatXp(user.stats.xp)}</div>
              <div className="text-[10px] text-text-muted">XP Total</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold font-mono text-brand-orange">{user.stats.currentStreak}</div>
              <div className="text-[10px] text-text-muted">Streak</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold font-mono text-brand-pink">{user.stats.pomodorosCompleted}</div>
              <div className="text-[10px] text-text-muted">Pomodoros</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold font-mono text-brand-purple">{user.stats.matchesCount}</div>
              <div className="text-[10px] text-text-muted">Conexões</div>
            </div>
          </div>

          {/* Level progress */}
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-text-secondary">Nível {user.stats.level || 1}</span>
              <span className="font-mono text-brand-mint">{xp.current}/{xp.needed} XP</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-cool transition-all" style={{ width: `${xp.progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Edit form or display */}
      <div className="glass-card p-6">
        <h3 className="font-semibold mb-4">Informações acadêmicas</h3>
        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-text-muted mb-1.5">Bio</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Conte um pouco sobre você..." className="input-field resize-none" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-text-muted mb-1.5">Universidade</label>
                <input type="text" value={university} onChange={(e) => setUniversity(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1.5">Curso</label>
                <input type="text" value={course} onChange={(e) => setCourse(e.target.value)} className="input-field" />
              </div>
            </div>
            <button onClick={() => setEditing(false)} className="btn-gradient py-2.5 px-6 text-sm">
              Salvar alterações
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <span className="text-text-muted w-24">Universidade</span>
              <span>{user.profile.university || "Não informada"}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-text-muted w-24">Curso</span>
              <span>{user.profile.course || "Não informado"}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-text-muted w-24">Semestre</span>
              <span>{user.profile.semester}º semestre</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-text-muted w-24">Bio</span>
              <span className="text-text-secondary">{user.profile.bio || "Nenhuma bio ainda"}</span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <span className="text-text-muted w-24 shrink-0">Matérias</span>
              <div className="flex flex-wrap gap-1.5">
                {user.profile.subjects.length > 0 ? user.profile.subjects.map((s) => (
                  <span key={s} className="badge-tag">{s}</span>
                )) : <span className="text-text-muted text-xs">Nenhuma matéria</span>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="glass-card p-6">
        <h3 className="font-semibold mb-4">🎖️ Minhas conquistas ({user.stats.badges.length})</h3>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {Object.entries(BADGE_DEFINITIONS).map(([id, badge]) => {
            const unlocked = user.stats.badges.some((b) => b.id === id);
            return (
              <div key={id} className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${unlocked ? "bg-brand-purple/10" : "bg-white/[0.02] opacity-30"}`}>
                <span className="text-xl">{badge.icon}</span>
                <span className="text-[9px] text-text-muted text-center">{badge.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Study stats */}
      <div className="glass-card p-6">
        <h3 className="font-semibold mb-4">📊 Estatísticas de estudo</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white/[0.02] text-center">
            <div className="text-xl font-bold font-mono text-brand-orange">{formatMinutes(user.stats.totalStudyMinutes)}</div>
            <div className="text-[10px] text-text-muted mt-1">Tempo total</div>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] text-center">
            <div className="text-xl font-bold font-mono text-brand-pink">{user.stats.pomodorosCompleted}</div>
            <div className="text-[10px] text-text-muted mt-1">Pomodoros</div>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] text-center">
            <div className="text-xl font-bold font-mono text-brand-purple">{user.stats.longestStreak}</div>
            <div className="text-[10px] text-text-muted mt-1">Maior streak</div>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] text-center">
            <div className="text-xl font-bold font-mono text-brand-mint">{user.stats.matchesCount}</div>
            <div className="text-[10px] text-text-muted mt-1">Conexões</div>
          </div>
        </div>
      </div>
    </div>
  );
}
