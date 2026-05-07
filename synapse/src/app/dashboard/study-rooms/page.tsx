"use client";

import { useState, useEffect, useRef } from "react";

const MOCK_ROOMS = [
  { id: "1", name: "Algoritmos & Estrutura de Dados", subject: "Algoritmos", members: 5, maxMembers: 8, isLive: true, tags: ["Recursão", "Árvores"], pomodoro: { timeRemaining: 1122, currentRound: 3, totalRounds: 4, currentPhase: "focus" as const } },
  { id: "2", name: "Cálculo II — Integrais", subject: "Cálculo", members: 6, maxMembers: 10, isLive: true, tags: ["Integrais", "Séries"], pomodoro: { timeRemaining: 435, currentRound: 5, totalRounds: 6, currentPhase: "focus" as const } },
  { id: "3", name: "React Avançado", subject: "Programação", members: 3, maxMembers: 6, isLive: true, tags: ["Hooks", "Next.js"], pomodoro: { timeRemaining: 300, currentRound: 1, totalRounds: 4, currentPhase: "shortBreak" as const } },
  { id: "4", name: "Estatística Aplicada", subject: "Estatística", members: 2, maxMembers: 8, isLive: false, tags: ["Regressão", "Probabilidade"], pomodoro: { timeRemaining: 1500, currentRound: 0, totalRounds: 4, currentPhase: "focus" as const } },
];

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function StudyRoomsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [subject, setSubject] = useState("");
  const [maxMembers, setMaxMembers] = useState(8);
  const [joinedRoom, setJoinedRoom] = useState<string | null>(null);
  const [pomodoroTime, setPomodoroTime] = useState(1500);
  const [pomodoroRunning, setPomodoroRunning] = useState(false);
  const [pomodoroPhase, setPomodoroPhase] = useState<"focus" | "shortBreak" | "longBreak">("focus");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (pomodoroRunning && pomodoroTime > 0) {
      intervalRef.current = setInterval(() => {
        setPomodoroTime((t) => t - 1);
      }, 1000);
    } else if (pomodoroTime === 0) {
      setPomodoroRunning(false);
      if (pomodoroPhase === "focus") {
        setPomodoroPhase("shortBreak");
        setPomodoroTime(300);
      } else {
        setPomodoroPhase("focus");
        setPomodoroTime(1500);
      }
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [pomodoroRunning, pomodoroTime, pomodoroPhase]);

  if (joinedRoom) {
    const room = MOCK_ROOMS.find((r) => r.id === joinedRoom);
    return (
      <div className="animate-fade-up space-y-6">
        <button onClick={() => { setJoinedRoom(null); setPomodoroRunning(false); }} className="text-sm text-text-muted hover:text-text-primary transition-colors">
          ← Voltar às salas
        </button>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold">{room?.name}</h1>
              <p className="text-sm text-text-muted mt-0.5">{room?.members} membros na sala</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-brand-pink font-semibold">
              <span className="w-2 h-2 bg-brand-pink rounded-full animate-pulse" /> AO VIVO
            </span>
          </div>

          {/* Video grid placeholder */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {["Você", "Lucas M.", "Mariana C.", "Rafael O.", "Ana B."].map((name, i) => (
              <div key={i} className="aspect-video rounded-xl bg-dark-700 border border-white/[0.06] flex items-center justify-center relative overflow-hidden">
                <div className="w-12 h-12 rounded-full bg-gradient-main flex items-center justify-center text-sm font-bold">{name[0]}</div>
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-[10px] text-white font-medium">{name}</div>
                {i === 0 && <div className="absolute top-2 right-2 w-2 h-2 bg-brand-mint rounded-full" />}
              </div>
            ))}
          </div>

          {/* Pomodoro timer */}
          <div className="glass-card p-8 text-center">
            <div className="text-xs text-text-muted font-medium mb-2 uppercase tracking-wider">
              {pomodoroPhase === "focus" ? "🍅 Foco" : pomodoroPhase === "shortBreak" ? "☕ Pausa curta" : "🌿 Pausa longa"}
            </div>
            <div className="text-6xl font-black font-mono gradient-text mb-6">
              {formatTimer(pomodoroTime)}
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setPomodoroRunning(!pomodoroRunning)}
                className={`px-8 py-3 rounded-xl font-semibold text-sm transition-all ${
                  pomodoroRunning
                    ? "bg-brand-pink/15 text-brand-pink border border-brand-pink/30 hover:bg-brand-pink/25"
                    : "btn-gradient"
                }`}
              >
                {pomodoroRunning ? "⏸ Pausar" : "▶ Iniciar"}
              </button>
              <button
                onClick={() => { setPomodoroRunning(false); setPomodoroTime(1500); setPomodoroPhase("focus"); }}
                className="px-6 py-3 rounded-xl font-medium text-sm bg-white/[0.04] border border-white/10 text-text-secondary hover:text-text-primary transition-all"
              >
                ↺ Reset
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4 mt-6">
            <button className="p-3 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] transition-all text-lg">🎤</button>
            <button className="p-3 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] transition-all text-lg">📹</button>
            <button className="p-3 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] transition-all text-lg">💬</button>
            <button className="p-3 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] transition-all text-lg">📎</button>
            <button
              onClick={() => { setJoinedRoom(null); setPomodoroRunning(false); }}
              className="p-3 rounded-xl bg-brand-pink/15 border border-brand-pink/30 hover:bg-brand-pink/25 transition-all text-lg"
            >
              🚪
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">📚 Salas de Estudo</h1>
          <p className="text-text-secondary text-sm mt-1">Estude com Pomodoro compartilhado e vídeo</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-gradient py-2.5 px-5 text-sm">
          + Criar sala
        </button>
      </div>

      {/* Create room form */}
      {showCreate && (
        <div className="glass-card p-6 animate-fade-up">
          <h3 className="font-semibold mb-4">Nova sala de estudo</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-text-muted mb-1.5">Nome da sala</label>
              <input type="text" value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="Ex: Algoritmos Avançados" className="input-field" />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1.5">Matéria</label>
              <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Ex: Programação" className="input-field" />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1.5">Máx. membros</label>
              <select value={maxMembers} onChange={(e) => setMaxMembers(Number(e.target.value))} className="input-field">
                {[2, 4, 6, 8, 10].map((n) => <option key={n} value={n}>{n} pessoas</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setShowCreate(false)} className="btn-ghost py-2 px-4 text-sm">Cancelar</button>
            <button onClick={() => setShowCreate(false)} className="btn-gradient py-2 px-6 text-sm">Criar e entrar 🚀</button>
          </div>
        </div>
      )}

      {/* Room cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {MOCK_ROOMS.map((room) => (
          <div key={room.id} className="glass-card-hover p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">{room.name}</h3>
              {room.isLive ? (
                <span className="flex items-center gap-1.5 text-[10px] text-brand-pink font-semibold">
                  <span className="w-1.5 h-1.5 bg-brand-pink rounded-full animate-pulse" /> AO VIVO
                </span>
              ) : (
                <span className="text-[10px] text-text-muted">Offline</span>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {room.tags.map((tag) => (
                <span key={tag} className="badge-tag text-[10px]">{tag}</span>
              ))}
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-text-muted">
                👥 {room.members}/{room.maxMembers}
              </span>
              {room.isLive && (
                <span className="text-sm font-mono font-bold text-brand-orange">
                  🍅 {formatTimer(room.pomodoro.timeRemaining)}
                  <span className="text-[10px] text-text-muted font-normal ml-1">
                    #{room.pomodoro.currentRound}/{room.pomodoro.totalRounds}
                  </span>
                </span>
              )}
            </div>

            {/* Progress bar */}
            <div className="h-1 rounded-full bg-white/10 overflow-hidden mb-4">
              <div className="h-full rounded-full bg-brand-orange" style={{ width: `${(room.members / room.maxMembers) * 100}%` }} />
            </div>

            <button
              onClick={() => setJoinedRoom(room.id)}
              className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all ${
                room.members >= room.maxMembers
                  ? "bg-white/[0.04] text-text-muted cursor-not-allowed"
                  : "bg-brand-purple/15 text-brand-purple border border-brand-purple/25 hover:bg-brand-purple hover:text-white"
              }`}
              disabled={room.members >= room.maxMembers}
            >
              {room.members >= room.maxMembers ? "Sala cheia" : "Entrar na sala →"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
