"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getCompatibilityColor, getCompatibilityBg, getInitials } from "@/lib/utils";
import { calculateCompatibility, getMatchReasons } from "@/lib/match-service";
import { collection, query, where, getDocs, doc, setDoc, updateDoc, serverTimestamp, onSnapshot, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { User, Match } from "@/types";

const GRADIENT_COLORS = [
  "from-brand-orange to-brand-pink",
  "from-brand-mint to-brand-purple",
  "from-brand-purple to-brand-pink",
  "from-brand-orange to-brand-purple",
];

interface Suggestion {
  user: User;
  compatibility: number;
  commonSubjects: string[];
  reasons: string[];
}

export default function MatchesPage() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [pendingMatches, setPendingMatches] = useState<(Match & { otherUser?: User })[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [connected, setConnected] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"cards" | "list" | "pending">("cards");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Fetch suggestions from real users
  useEffect(() => {
    if (!user) return;

    async function fetchSuggestions() {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("role", "==", "student"), limit(50));
        const snapshot = await getDocs(q);

        const results: Suggestion[] = [];
        snapshot.forEach((docSnap) => {
          const other = { ...docSnap.data(), uid: docSnap.id } as User;
          if (other.uid === user!.uid) return;
          if (!other.profile?.subjects?.length) return;

          const compatibility = calculateCompatibility(user!, other);
          if (compatibility < 20) return;

          const commonSubjects = (user!.profile?.subjects || []).filter((s: string) =>
            (other.profile?.subjects || []).includes(s)
          );

          results.push({
            user: other,
            compatibility,
            commonSubjects,
            reasons: getMatchReasons(user!, other),
          });
        });

        results.sort((a, b) => b.compatibility - a.compatibility);
        setSuggestions(results);
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchSuggestions();
  }, [user]);

  // Listen to pending match requests
  useEffect(() => {
    if (!user) return;

    const matchesRef = collection(db, "matches");
    const q = query(
      matchesRef,
      where("users", "array-contains", user.uid),
      where("status", "==", "pending")
    );

    const unsub = onSnapshot(q, async (snapshot) => {
      const matches: (Match & { otherUser?: User })[] = [];
      for (const docSnap of snapshot.docs) {
        const data = { ...docSnap.data(), id: docSnap.id } as Match;
        const otherUid = data.users.find((u) => u !== user!.uid);
        if (otherUid) {
          try {
            const { getDoc } = await import("firebase/firestore");
            const otherDoc = await getDoc(doc(db, "users", otherUid));
            if (otherDoc.exists()) {
              (data as any).otherUser = { ...otherDoc.data(), uid: otherUid } as User;
            }
          } catch {}
        }
        matches.push(data as any);
      }
      setPendingMatches(matches);
    });

    return unsub;
  }, [user]);

  if (!user) return null;

  const current = suggestions[currentIndex];

  async function handleConnect(otherUid: string, compatibility: number, commonSubjects: string[]) {
    if (sending) return;
    setSending(true);
    try {
      const matchRef = doc(collection(db, "matches"));
      await setDoc(matchRef, {
        id: matchRef.id,
        users: [user!.uid, otherUid],
        compatibility,
        commonSubjects,
        status: "pending",
        requestedBy: user!.uid,
        createdAt: serverTimestamp(),
      });
      setConnected((prev) => [...prev, otherUid]);
      if (currentIndex < suggestions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Error sending match:", err);
    } finally {
      setSending(false);
    }
  }

  async function handleAccept(matchId: string) {
    try {
      await updateDoc(doc(db, "matches", matchId), {
        status: "accepted",
        lastInteraction: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error accepting match:", err);
    }
  }

  async function handleReject(matchId: string) {
    try {
      await updateDoc(doc(db, "matches", matchId), {
        status: "rejected",
        lastInteraction: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error rejecting match:", err);
    }
  }

  function handleSkip() {
    if (currentIndex < suggestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }

  const incomingRequests = pendingMatches.filter((m) => m.requestedBy !== user.uid);

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">🔥 Matches</h1>
          <p className="text-text-secondary text-sm mt-1">Encontre seu parceiro de estudo ideal</p>
        </div>
        <div className="flex gap-2 bg-dark-700 rounded-xl p-1">
          {[
            { key: "cards", label: "Cards" },
            { key: "list", label: "Lista" },
            { key: "pending", label: `Pendentes${incomingRequests.length ? ` (${incomingRequests.length})` : ""}` },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setViewMode(tab.key as any)} className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${viewMode === tab.key ? "bg-brand-purple text-white" : "text-text-muted hover:text-text-primary"}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
        </div>
      ) : viewMode === "cards" && current ? (
        <div className="max-w-lg mx-auto">
          <div className="glass-card overflow-hidden">
            <div className={`h-32 bg-gradient-to-br ${GRADIENT_COLORS[currentIndex % GRADIENT_COLORS.length]} relative`}>
              <div className="absolute -bottom-8 left-6">
                <div className="w-20 h-20 rounded-2xl bg-dark-800 border-4 border-dark-800 flex items-center justify-center text-2xl font-bold text-white bg-gradient-main">
                  {getInitials(current.user.displayName || "?")}
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
                {current.user.profile?.course || "Curso"} · {current.user.profile?.semester || 1}º sem · {current.user.profile?.university || "Universidade"}
              </p>
              {current.user.profile?.bio && <p className="text-sm text-text-secondary mt-4 leading-relaxed">{current.user.profile.bio}</p>}

              <div className="flex gap-4 mt-5 py-4 border-y border-white/[0.06]">
                <div className="text-center flex-1">
                  <div className="text-lg font-bold font-mono text-brand-mint">{current.user.stats?.currentStreak || 0}</div>
                  <div className="text-[10px] text-text-muted">Streak</div>
                </div>
                <div className="text-center flex-1">
                  <div className="text-lg font-bold font-mono text-brand-orange">{current.user.stats?.pomodorosCompleted || 0}</div>
                  <div className="text-[10px] text-text-muted">Pomodoros</div>
                </div>
                <div className="text-center flex-1">
                  <div className="text-lg font-bold font-mono text-brand-purple">{current.user.stats?.matchesCount || 0}</div>
                  <div className="text-[10px] text-text-muted">Conexões</div>
                </div>
              </div>

              {current.commonSubjects.length > 0 && (
                <div className="mt-4">
                  <div className="text-xs text-text-muted font-medium mb-2">Matérias em comum</div>
                  <div className="flex flex-wrap gap-2">
                    {current.commonSubjects.map((s) => (
                      <span key={s} className="px-3 py-1.5 rounded-full text-xs font-medium bg-brand-purple/15 text-brand-purple">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {current.reasons.length > 0 && (
                <div className="mt-4">
                  <div className="text-xs text-text-muted font-medium mb-2">Por que vocês combinam</div>
                  <div className="space-y-1.5">
                    {current.reasons.map((r, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-text-secondary">
                        <span className="text-brand-mint">✓</span> {r}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button onClick={handleSkip} className="flex-1 btn-ghost py-3 text-sm">Pular</button>
                <button
                  onClick={() => handleConnect(current.user.uid, current.compatibility, current.commonSubjects)}
                  disabled={sending || connected.includes(current.user.uid)}
                  className="flex-1 btn-gradient py-3 text-sm disabled:opacity-50"
                >
                  {connected.includes(current.user.uid) ? "Enviado ✓" : sending ? "Enviando..." : "Conectar 🤝"}
                </button>
              </div>

              <div className="text-center mt-4">
                <span className="text-xs text-text-muted">{currentIndex + 1} de {suggestions.length} sugestões</span>
              </div>
            </div>
          </div>
        </div>
      ) : viewMode === "cards" && !current ? (
        <div className="glass-card p-12 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold mb-2">Nenhuma sugestão no momento</h3>
          <p className="text-sm text-text-muted">Quando novos estudantes se cadastrarem com matérias em comum, eles aparecerão aqui.</p>
        </div>
      ) : viewMode === "list" ? (
        <div className="space-y-3">
          {suggestions.length > 0 ? suggestions.map((s, i) => (
            <div key={s.user.uid} className="glass-card-hover p-5 flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${GRADIENT_COLORS[i % GRADIENT_COLORS.length]} flex items-center justify-center text-lg font-bold text-white shrink-0`}>
                {getInitials(s.user.displayName || "?")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{s.user.displayName}</span>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg ${getCompatibilityBg(s.compatibility)} ${getCompatibilityColor(s.compatibility)}`}>{s.compatibility}%</span>
                </div>
                <div className="text-xs text-text-muted mt-0.5">{s.user.profile?.course} · {s.user.profile?.university}</div>
                <div className="flex gap-1.5 mt-2">
                  {s.commonSubjects.slice(0, 3).map((sub) => (
                    <span key={sub} className="badge-tag text-[10px]">{sub}</span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => handleConnect(s.user.uid, s.compatibility, s.commonSubjects)}
                disabled={connected.includes(s.user.uid)}
                className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${connected.includes(s.user.uid) ? "bg-brand-mint/15 text-brand-mint" : "btn-gradient"}`}
              >
                {connected.includes(s.user.uid) ? "Enviado ✓" : "Conectar"}
              </button>
            </div>
          )) : (
            <div className="glass-card p-12 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-sm text-text-muted">Nenhuma sugestão disponível ainda.</p>
            </div>
          )}
        </div>
      ) : viewMode === "pending" ? (
        <div className="space-y-3">
          {incomingRequests.length > 0 ? incomingRequests.map((match) => (
            <div key={match.id} className="glass-card p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-main flex items-center justify-center text-lg font-bold text-white shrink-0">
                  {getInitials((match as any).otherUser?.displayName || "?")}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{(match as any).otherUser?.displayName || "Estudante"}</div>
                  <div className="text-xs text-text-muted">{(match as any).otherUser?.profile?.course} · {(match as any).otherUser?.profile?.university}</div>
                  <div className="text-xs text-brand-mint font-mono font-bold mt-1">{match.compatibility}% compatível</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleReject(match.id)} className="px-4 py-2 rounded-xl text-xs font-medium bg-white/[0.04] text-text-muted hover:bg-brand-pink/10 hover:text-brand-pink transition-all">Recusar</button>
                  <button onClick={() => handleAccept(match.id)} className="btn-gradient px-4 py-2 text-xs">Aceitar 🤝</button>
                </div>
              </div>
            </div>
          )) : (
            <div className="glass-card p-12 text-center">
              <div className="text-5xl mb-4">📬</div>
              <h3 className="text-lg font-semibold mb-2">Nenhum pedido pendente</h3>
              <p className="text-sm text-text-muted">Quando alguém quiser se conectar com você, aparecerá aqui.</p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
