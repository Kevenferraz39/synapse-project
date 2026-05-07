"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getCompatibilityColor, getCompatibilityBg, getInitials } from "@/lib/utils";

// Mock data for demonstration
const MOCK_SUGGESTIONS = [
  {
    user: { uid: "1", displayName: "Lucas Mendes", photoURL: "", profile: { university: "USP", course: "Engenharia de Software", semester: 5, subjects: ["React", "Python", "Node.js", "Algoritmos"], bio: "Apaixonado por desenvolvimento web. Procuro alguém para estudar frameworks e resolver desafios de código.", studyStyle: "practice", city: "São Paulo", state: "SP", studySchedule: { morning: false, afternoon: false, evening: true, night: true, weekdays: true, weekends: false }, goals: [] }, stats: { xp: 2840, level: 5, totalStudyMinutes: 4200, pomodorosCompleted: 156, matchesCount: 12, currentStreak: 14, longestStreak: 21, badges: [], weeklyXp: 420 } },
    compatibility: 94,
    commonSubjects: ["React", "Python", "Algoritmos"],
    commonSchedule: ["Noite", "Dias úteis"],
    reasonsToConnect: ["3 matérias em comum", "Mesmo curso", "Horários compatíveis: Noite, Dias úteis"],
  },
  {
    user: { uid: "2", displayName: "Mariana Costa", photoURL: "", profile: { university: "UNICAMP", course: "Ciência de Dados", semester: 3, subjects: ["SQL", "Estatística", "Python", "Machine Learning"], bio: "Futura cientista de dados! Amo resolver problemas com dados e visualizações.", studyStyle: "discussion", city: "Campinas", state: "SP", studySchedule: { morning: false, afternoon: true, evening: true, night: false, weekdays: true, weekends: true }, goals: [] }, stats: { xp: 3100, level: 6, totalStudyMinutes: 5800, pomodorosCompleted: 210, matchesCount: 18, currentStreak: 7, longestStreak: 30, badges: [], weeklyXp: 580 } },
    compatibility: 89,
    commonSubjects: ["Python", "Estatística"],
    commonSchedule: ["Noite", "Dias úteis"],
    reasonsToConnect: ["2 matérias em comum", "Mesma universidade", "Horários compatíveis"],
  },
  {
    user: { uid: "3", displayName: "Rafael Oliveira", photoURL: "", profile: { university: "PUC-SP", course: "Design Digital", semester: 4, subjects: ["UX/UI", "Figma", "HTML/CSS", "Design Thinking"], bio: "Designer que adora prototipar interfaces. Busco devs para trocar ideia sobre produto.", studyStyle: "visual", city: "São Paulo", state: "SP", studySchedule: { morning: true, afternoon: false, evening: false, night: false, weekdays: true, weekends: true }, goals: [] }, stats: { xp: 1900, level: 4, totalStudyMinutes: 3200, pomodorosCompleted: 98, matchesCount: 8, currentStreak: 3, longestStreak: 15, badges: [], weeklyXp: 290 } },
    compatibility: 78,
    commonSubjects: ["UX/UI"],
    commonSchedule: ["Dias úteis"],
    reasonsToConnect: ["1 matéria em comum", "Estilos complementares"],
  },
  {
    user: { uid: "4", displayName: "Ana Beatriz Silva", photoURL: "", profile: { university: "USP", course: "Engenharia de Software", semester: 6, subjects: ["Banco de Dados", "Java", "Algoritmos", "Redes"], bio: "Focada em backend. Estudar em grupo me ajuda muito com matérias difíceis.", studyStyle: "practice", city: "São Paulo", state: "SP", studySchedule: { morning: false, afternoon: false, evening: true, night: true, weekdays: true, weekends: false }, goals: [] }, stats: { xp: 4200, level: 7, totalStudyMinutes: 7600, pomodorosCompleted: 312, matchesCount: 24, currentStreak: 21, longestStreak: 45, badges: [], weeklyXp: 710 } },
    compatibility: 92,
    commonSubjects: ["Algoritmos", "Banco de Dados"],
    commonSchedule: ["Noite", "Madrugada", "Dias úteis"],
    reasonsToConnect: ["2 matérias em comum", "Mesmo curso", "Mesma universidade", "Horários compatíveis"],
  },
];

const GRADIENT_COLORS = [
  "from-brand-orange to-brand-pink",
  "from-brand-mint to-brand-purple",
  "from-brand-purple to-brand-pink",
  "from-brand-orange to-brand-purple",
];

export default function MatchesPage() {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [connected, setConnected] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");

  if (!user) return null;

  const current = MOCK_SUGGESTIONS[currentIndex];

  function handleConnect(uid: string) {
    setConnected((prev) => [...prev, uid]);
    if (currentIndex < MOCK_SUGGESTIONS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }

  function handleSkip() {
    if (currentIndex < MOCK_SUGGESTIONS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">🔥 Matches</h1>
          <p className="text-text-secondary text-sm mt-1">Encontre seu parceiro de estudo ideal</p>
        </div>
        <div className="flex gap-2 bg-dark-700 rounded-xl p-1">
          <button
            onClick={() => setViewMode("cards")}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${viewMode === "cards" ? "bg-brand-purple text-white" : "text-text-muted hover:text-text-primary"}`}
          >
            Cards
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${viewMode === "list" ? "bg-brand-purple text-white" : "text-text-muted hover:text-text-primary"}`}
          >
            Lista
          </button>
        </div>
      </div>

      {viewMode === "cards" && current && (
        <div className="max-w-lg mx-auto">
          <div className="glass-card overflow-hidden">
            {/* Header gradient */}
            <div className={`h-32 bg-gradient-to-br ${GRADIENT_COLORS[currentIndex % GRADIENT_COLORS.length]} relative`}>
              <div className="absolute -bottom-8 left-6">
                <div className="w-20 h-20 rounded-2xl bg-dark-800 border-4 border-dark-800 flex items-center justify-center text-2xl font-bold text-white bg-gradient-main">
                  {getInitials(current.user.displayName)}
                </div>
              </div>
              <div className="absolute top-4 right-4">
                <span className={`text-sm font-mono font-bold px-3 py-1.5 rounded-xl ${getCompatibilityBg(current.compatibility)} ${getCompatibilityColor(current.compatibility)}`}>
                  {current.compatibility}% match
                </span>
              </div>
            </div>

            <div className="p-6 pt-12">
              <h2 className="text-xl font-bold">{current.user.displayName}</h2>
              <p className="text-sm text-text-secondary mt-0.5">
                {current.user.profile.course} · {current.user.profile.semester}º sem · {current.user.profile.university}
              </p>

              <p className="text-sm text-text-secondary mt-4 leading-relaxed">
                {current.user.profile.bio}
              </p>

              {/* Stats */}
              <div className="flex gap-4 mt-5 py-4 border-y border-white/[0.06]">
                <div className="text-center flex-1">
                  <div className="text-lg font-bold font-mono text-brand-mint">{current.user.stats.currentStreak}</div>
                  <div className="text-[10px] text-text-muted">Streak</div>
                </div>
                <div className="text-center flex-1">
                  <div className="text-lg font-bold font-mono text-brand-orange">{current.user.stats.pomodorosCompleted}</div>
                  <div className="text-[10px] text-text-muted">Pomodoros</div>
                </div>
                <div className="text-center flex-1">
                  <div className="text-lg font-bold font-mono text-brand-purple">{current.user.stats.matchesCount}</div>
                  <div className="text-[10px] text-text-muted">Conexões</div>
                </div>
              </div>

              {/* Common subjects */}
              <div className="mt-4">
                <div className="text-xs text-text-muted font-medium mb-2">Matérias em comum</div>
                <div className="flex flex-wrap gap-2">
                  {current.commonSubjects.map((s) => (
                    <span key={s} className="px-3 py-1.5 rounded-full text-xs font-medium bg-brand-purple/15 text-brand-purple">{s}</span>
                  ))}
                </div>
              </div>

              {/* Reasons */}
              <div className="mt-4">
                <div className="text-xs text-text-muted font-medium mb-2">Por que vocês combinam</div>
                <div className="space-y-1.5">
                  {current.reasonsToConnect.map((r, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-text-secondary">
                      <span className="text-brand-mint">✓</span> {r}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button onClick={handleSkip} className="flex-1 btn-ghost py-3 text-sm">
                  Pular
                </button>
                <button
                  onClick={() => handleConnect(current.user.uid)}
                  className="flex-1 btn-gradient py-3 text-sm"
                >
                  Conectar 🤝
                </button>
              </div>

              {/* Counter */}
              <div className="text-center mt-4">
                <span className="text-xs text-text-muted">
                  {currentIndex + 1} de {MOCK_SUGGESTIONS.length} sugestões
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === "list" && (
        <div className="space-y-3">
          {MOCK_SUGGESTIONS.map((suggestion, i) => (
            <div key={i} className="glass-card-hover p-5 flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${GRADIENT_COLORS[i % GRADIENT_COLORS.length]} flex items-center justify-center text-lg font-bold text-white shrink-0`}>
                {getInitials(suggestion.user.displayName)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{suggestion.user.displayName}</span>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg ${getCompatibilityBg(suggestion.compatibility)} ${getCompatibilityColor(suggestion.compatibility)}`}>
                    {suggestion.compatibility}%
                  </span>
                </div>
                <div className="text-xs text-text-muted mt-0.5">
                  {suggestion.user.profile.course} · {suggestion.user.profile.university}
                </div>
                <div className="flex gap-1.5 mt-2">
                  {suggestion.commonSubjects.map((s) => (
                    <span key={s} className="badge-tag text-[10px]">{s}</span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleConnect(suggestion.user.uid)}
                disabled={connected.includes(suggestion.user.uid)}
                className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  connected.includes(suggestion.user.uid)
                    ? "bg-brand-mint/15 text-brand-mint"
                    : "btn-gradient"
                }`}
              >
                {connected.includes(suggestion.user.uid) ? "Enviado ✓" : "Conectar"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
