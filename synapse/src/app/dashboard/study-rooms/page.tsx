"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getInitials } from "@/lib/utils";
import {
  collection, query, where, onSnapshot, doc, setDoc, updateDoc,
  deleteDoc, arrayUnion, arrayRemove, serverTimestamp, increment, getDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

interface Room {
  id: string;
  name: string;
  subject: string;
  createdBy: string;
  members: string[];
  maxMembers: number;
  isLive: boolean;
  tags: string[];
}

export default function StudyRoomsPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [subject, setSubject] = useState("");
  const [maxMembers, setMaxMembers] = useState(8);
  const [creating, setCreating] = useState(false);
  const [joinedRoom, setJoinedRoom] = useState<Room | null>(null);
  const [pomodoroTime, setPomodoroTime] = useState(1500);
  const [pomodoroRunning, setPomodoroRunning] = useState(false);
  const [pomodoroPhase, setPomodoroPhase] = useState<"focus" | "shortBreak" | "longBreak">("focus");
  const [pomodoroRound, setPomodoroRound] = useState(1);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Listen to all rooms in real-time
  useEffect(() => {
    const roomsRef = collection(db, "rooms");
    const unsub = onSnapshot(roomsRef, (snapshot) => {
      const allRooms: Room[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        members: d.data().members || [],
        tags: d.data().tags || [],
      })) as Room[];
      setRooms(allRooms);
      setLoading(false);

      // Update joined room if it exists
      if (joinedRoom) {
        const updated = allRooms.find((r) => r.id === joinedRoom.id);
        if (updated) setJoinedRoom(updated);
      }
    });
    return unsub;
  }, [joinedRoom?.id]);

  // Pomodoro timer
  useEffect(() => {
    if (pomodoroRunning && pomodoroTime > 0) {
      intervalRef.current = setInterval(() => {
        setPomodoroTime((t) => t - 1);
      }, 1000);
    } else if (pomodoroTime === 0 && pomodoroRunning) {
      setPomodoroRunning(false);

      if (pomodoroPhase === "focus") {
        // Award XP for completing a Pomodoro
        awardPomodoroXP();
        setPomodoroRound((r) => r + 1);

        if (pomodoroRound % 4 === 0) {
          setPomodoroPhase("longBreak");
          setPomodoroTime(900); // 15 min
        } else {
          setPomodoroPhase("shortBreak");
          setPomodoroTime(300); // 5 min
        }
      } else {
        setPomodoroPhase("focus");
        setPomodoroTime(1500); // 25 min
      }
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [pomodoroRunning, pomodoroTime]);

  async function awardPomodoroXP() {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        "stats.xp": increment(25),
        "stats.weeklyXp": increment(25),
        "stats.pomodorosCompleted": increment(1),
        "stats.totalStudyMinutes": increment(25),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error awarding XP:", err);
    }
  }

  async function createRoom() {
    if (!user || !roomName.trim() || creating) return;
    setCreating(true);
    try {
      const roomRef = doc(collection(db, "rooms"));
      await setDoc(roomRef, {
        id: roomRef.id,
        name: roomName.trim(),
        subject: subject.trim() || "Geral",
        createdBy: user.uid,
        members: [user.uid],
        maxMembers,
        isLive: true,
        tags: subject ? [subject.trim()] : [],
        createdAt: serverTimestamp(),
      });

      setRoomName("");
      setSubject("");
      setShowCreate(false);

      // Auto-join the created room
      const newRoom: Room = {
        id: roomRef.id,
        name: roomName.trim(),
        subject: subject.trim() || "Geral",
        createdBy: user.uid,
        members: [user.uid],
        maxMembers,
        isLive: true,
        tags: subject ? [subject.trim()] : [],
      };
      setJoinedRoom(newRoom);
    } catch (err) {
      console.error("Error creating room:", err);
    } finally {
      setCreating(false);
    }
  }

  async function joinRoom(room: Room) {
    if (!user) return;
    try {
      const roomRef = doc(db, "rooms", room.id);
      await updateDoc(roomRef, {
        members: arrayUnion(user.uid),
      });
      setJoinedRoom(room);
    } catch (err) {
      console.error("Error joining room:", err);
    }
  }

  async function leaveRoom() {
    if (!user || !joinedRoom) return;
    try {
      const roomRef = doc(db, "rooms", joinedRoom.id);
      await updateDoc(roomRef, {
        members: arrayRemove(user.uid),
      });

      // If creator and last member, delete room
      const roomSnap = await getDoc(roomRef);
      if (roomSnap.exists()) {
        const data = roomSnap.data();
        if (!data.members || data.members.length === 0) {
          await deleteDoc(roomRef);
        }
      }
    } catch (err) {
      console.error("Error leaving room:", err);
    }
    setPomodoroRunning(false);
    setJoinedRoom(null);
    setPomodoroTime(1500);
    setPomodoroPhase("focus");
    setPomodoroRound(1);
  }

  if (!user) return null;

  // Inside a room view
  if (joinedRoom) {
    return (
      <div className="animate-fade-up space-y-6">
        <button onClick={leaveRoom} className="text-sm text-text-muted hover:text-text-primary transition-colors">
          ← Voltar às salas
        </button>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold">{joinedRoom.name}</h1>
              <p className="text-sm text-text-muted mt-0.5">
                {joinedRoom.members?.length || 1} membro{(joinedRoom.members?.length || 1) !== 1 ? "s" : ""} na sala · {joinedRoom.subject}
              </p>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-brand-pink font-semibold">
              <span className="w-2 h-2 bg-brand-pink rounded-full animate-pulse" /> AO VIVO
            </span>
          </div>

          {/* Members */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {(joinedRoom.members || []).map((uid, i) => (
              <div key={uid} className="aspect-video rounded-xl bg-dark-700 border border-white/[0.06] flex items-center justify-center relative">
                <div className="w-12 h-12 rounded-full bg-gradient-main flex items-center justify-center text-sm font-bold">
                  {uid === user.uid ? getInitials(user.displayName || "EU") : `U${i + 1}`}
                </div>
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-[10px] text-white font-medium">
                  {uid === user.uid ? "Você" : `Estudante ${i + 1}`}
                </div>
                {uid === user.uid && <div className="absolute top-2 right-2 w-2 h-2 bg-brand-mint rounded-full" />}
              </div>
            ))}
          </div>

          {/* Pomodoro timer */}
          <div className="glass-card p-8 text-center">
            <div className="text-xs text-text-muted font-medium mb-2 uppercase tracking-wider">
              {pomodoroPhase === "focus" ? "🍅 Foco" : pomodoroPhase === "shortBreak" ? "☕ Pausa curta" : "🌿 Pausa longa"}
              <span className="ml-2">Round {pomodoroRound}</span>
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
            <p className="text-xs text-text-muted mt-4">
              +25 XP ao completar cada Pomodoro de foco 🍅
            </p>
          </div>

          {/* Leave button */}
          <div className="flex justify-center mt-6">
            <button
              onClick={leaveRoom}
              className="px-6 py-3 rounded-xl font-medium text-sm bg-brand-pink/10 border border-brand-pink/20 text-brand-pink hover:bg-brand-pink/20 transition-all"
            >
              🚪 Sair da sala
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Room listing
  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">📚 Salas de Estudo</h1>
          <p className="text-text-secondary text-sm mt-1">Estude com Pomodoro compartilhado</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-gradient py-2.5 px-5 text-sm">
          + Criar sala
        </button>
      </div>

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
            <button onClick={createRoom} disabled={!roomName.trim() || creating} className="btn-gradient py-2 px-6 text-sm disabled:opacity-50">
              {creating ? "Criando..." : "Criar e entrar 🚀"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
        </div>
      ) : rooms.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {rooms.map((room) => {
            const isMember = room.members?.includes(user.uid);
            const isFull = (room.members?.length || 0) >= room.maxMembers;

            return (
              <div key={room.id} className="glass-card-hover p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">{room.name}</h3>
                  {room.isLive && room.members?.length > 0 ? (
                    <span className="flex items-center gap-1.5 text-[10px] text-brand-pink font-semibold">
                      <span className="w-1.5 h-1.5 bg-brand-pink rounded-full animate-pulse" /> AO VIVO
                    </span>
                  ) : (
                    <span className="text-[10px] text-text-muted">Aguardando</span>
                  )}
                </div>

                {room.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {room.tags.map((tag) => (
                      <span key={tag} className="badge-tag text-[10px]">{tag}</span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-text-muted">👥 {room.members?.length || 0}/{room.maxMembers}</span>
                  <span className="text-xs text-text-muted">{room.subject}</span>
                </div>

                <div className="h-1 rounded-full bg-white/10 overflow-hidden mb-4">
                  <div className="h-full rounded-full bg-brand-orange" style={{ width: `${((room.members?.length || 0) / room.maxMembers) * 100}%` }} />
                </div>

                <button
                  onClick={() => isMember ? setJoinedRoom(room) : joinRoom(room)}
                  disabled={isFull && !isMember}
                  className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isMember
                      ? "bg-brand-mint/15 text-brand-mint border border-brand-mint/25 hover:bg-brand-mint/25"
                      : isFull
                      ? "bg-white/[0.04] text-text-muted cursor-not-allowed"
                      : "bg-brand-purple/15 text-brand-purple border border-brand-purple/25 hover:bg-brand-purple hover:text-white"
                  }`}
                >
                  {isMember ? "Entrar na sala →" : isFull ? "Sala cheia" : "Entrar →"}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <div className="text-5xl mb-4">📚</div>
          <h3 className="text-lg font-semibold mb-2">Nenhuma sala criada ainda</h3>
          <p className="text-sm text-text-muted mb-4">Seja o primeiro a criar uma sala de estudo!</p>
          <button onClick={() => setShowCreate(true)} className="btn-gradient py-2.5 px-6 text-sm">
            Criar primeira sala 🚀
          </button>
        </div>
      )}
    </div>
  );
}
