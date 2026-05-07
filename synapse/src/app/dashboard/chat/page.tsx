"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getInitials } from "@/lib/utils";
import {
  collection, query, where, orderBy, onSnapshot, addDoc, updateDoc,
  doc, getDoc, getDocs, serverTimestamp, limit, Timestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface ChatUser {
  uid: string;
  displayName: string;
  photoURL?: string;
  course?: string;
}

interface Conversation {
  id: string;
  participants: string[];
  otherUser: ChatUser;
  lastMessage?: string;
  lastMessageAt?: any;
  unreadCount: number;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: any;
}

export default function ChatPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations from accepted matches
  useEffect(() => {
    if (!user) return;

    const matchesRef = collection(db, "matches");
    const q = query(
      matchesRef,
      where("users", "array-contains", user.uid),
      where("status", "==", "accepted")
    );

    const unsub = onSnapshot(q, async (snapshot) => {
      const convos: Conversation[] = [];

      for (const matchDoc of snapshot.docs) {
        const matchData = matchDoc.data();
        const otherUid = matchData.users.find((u: string) => u !== user!.uid);
        if (!otherUid) continue;

        // Fetch other user info
        let otherUser: ChatUser = { uid: otherUid, displayName: "Estudante" };
        try {
          const otherDoc = await getDoc(doc(db, "users", otherUid));
          if (otherDoc.exists()) {
            const data = otherDoc.data();
            otherUser = {
              uid: otherUid,
              displayName: data.displayName || "Estudante",
              photoURL: data.photoURL,
              course: data.profile?.course,
            };
          }
        } catch {}

        // Check for existing conversation or use match ID as convo ID
        const convoId = matchDoc.id;

        // Get last message
        let lastMessage = "";
        let lastMessageAt = matchData.lastInteraction || matchData.createdAt;
        let unreadCount = 0;

        try {
          const msgsRef = collection(db, "conversations", convoId, "messages");
          const lastMsgQuery = query(msgsRef, orderBy("createdAt", "desc"), limit(1));
          const lastMsgSnap = await getDocs(lastMsgQuery);
          if (!lastMsgSnap.empty) {
            const lastMsgData = lastMsgSnap.docs[0].data();
            lastMessage = lastMsgData.content || "";
            lastMessageAt = lastMsgData.createdAt;
          }
        } catch {}

        convos.push({
          id: convoId,
          participants: matchData.users,
          otherUser,
          lastMessage,
          lastMessageAt,
          unreadCount,
        });
      }

      // Sort by last message time
      convos.sort((a, b) => {
        const timeA = a.lastMessageAt?.seconds || 0;
        const timeB = b.lastMessageAt?.seconds || 0;
        return timeB - timeA;
      });

      setConversations(convos);
      setLoadingConvos(false);
    });

    return unsub;
  }, [user]);

  // Listen to messages in active conversation
  useEffect(() => {
    if (!activeChat) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);
    const msgsRef = collection(db, "conversations", activeChat, "messages");
    const q = query(msgsRef, orderBy("createdAt", "asc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Message[];
      setMessages(msgs);
      setLoadingMessages(false);
    }, () => setLoadingMessages(false));

    return unsub;
  }, [activeChat]);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!messageText.trim() || !activeChat || !user || sending) return;
    const text = messageText.trim();
    setMessageText("");
    setSending(true);

    try {
      // Ensure conversation document exists
      const convoRef = doc(db, "conversations", activeChat);
      const convoSnap = await getDoc(convoRef);
      const activeConvo = conversations.find((c) => c.id === activeChat);

      if (!convoSnap.exists() && activeConvo) {
        const { setDoc } = await import("firebase/firestore");
        await setDoc(convoRef, {
          participants: activeConvo.participants,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      // Add message to subcollection
      const msgsRef = collection(db, "conversations", activeChat, "messages");
      await addDoc(msgsRef, {
        senderId: user.uid,
        content: text,
        type: "text",
        createdAt: serverTimestamp(),
      });

      // Update conversation timestamp
      await updateDoc(convoRef, {
        lastMessage: text,
        lastMessageBy: user.uid,
        updatedAt: serverTimestamp(),
      });

      // Update match lastInteraction
      const matchRef = doc(db, "matches", activeChat);
      await updateDoc(matchRef, {
        lastInteraction: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error sending message:", err);
      setMessageText(text); // restore message on error
    } finally {
      setSending(false);
    }
  }

  function formatTime(timestamp: any): string {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }

  function formatConvoTime(timestamp: any): string {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return formatTime(timestamp);
    if (days === 1) return "Ontem";
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  }

  if (!user) return null;

  const activeConvo = conversations.find((c) => c.id === activeChat);

  return (
    <div className="animate-fade-up">
      <h1 className="text-2xl font-bold mb-6">💬 Chat</h1>

      <div className="glass-card overflow-hidden flex" style={{ height: "calc(100vh - 200px)" }}>
        {/* Conversations list */}
        <div className={`w-full sm:w-80 border-r border-white/[0.06] flex flex-col shrink-0 ${activeChat ? "hidden sm:flex" : "flex"}`}>
          <div className="p-4 border-b border-white/[0.06]">
            <div className="text-xs text-text-muted font-medium">
              {conversations.length} conversa{conversations.length !== 1 ? "s" : ""}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingConvos ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
              </div>
            ) : conversations.length > 0 ? (
              conversations.map((convo) => (
                <button
                  key={convo.id}
                  onClick={() => setActiveChat(convo.id)}
                  className={`w-full flex items-center gap-3 p-4 text-left transition-all hover:bg-white/[0.03] ${activeChat === convo.id ? "bg-brand-purple/10" : ""}`}
                >
                  <div className="w-11 h-11 rounded-full bg-gradient-main flex items-center justify-center text-sm font-bold text-white shrink-0">
                    {convo.otherUser.photoURL ? (
                      <img src={convo.otherUser.photoURL} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      getInitials(convo.otherUser.displayName)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold truncate">{convo.otherUser.displayName}</span>
                      <span className="text-[10px] text-text-muted shrink-0">{formatConvoTime(convo.lastMessageAt)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-xs text-text-muted truncate">{convo.lastMessage || convo.otherUser.course || "Iniciar conversa..."}</p>
                      {convo.unreadCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-brand-purple flex items-center justify-center text-[10px] font-bold text-white shrink-0 ml-2">
                          {convo.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="text-4xl mb-3">🤝</div>
                <p className="text-sm text-text-muted mb-2">Nenhum match aceito ainda</p>
                <p className="text-xs text-text-muted">Vá em <strong>Matches</strong> para encontrar parceiros de estudo e começar a conversar.</p>
              </div>
            )}
          </div>
        </div>

        {/* Message area */}
        <div className={`flex-1 flex flex-col ${!activeChat ? "hidden sm:flex" : "flex"}`}>
          {activeConvo ? (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 p-4 border-b border-white/[0.06]">
                <button onClick={() => setActiveChat(null)} className="sm:hidden p-1 text-text-muted hover:text-text-primary">
                  ←
                </button>
                <div className="w-9 h-9 rounded-full bg-gradient-main flex items-center justify-center text-xs font-bold text-white">
                  {activeConvo.otherUser.photoURL ? (
                    <img src={activeConvo.otherUser.photoURL} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    getInitials(activeConvo.otherUser.displayName)
                  )}
                </div>
                <div>
                  <div className="text-sm font-semibold">{activeConvo.otherUser.displayName}</div>
                  <div className="text-[10px] text-text-muted">{activeConvo.otherUser.course || "Estudante"}</div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loadingMessages ? (
                  <div className="flex justify-center py-12">
                    <div className="w-6 h-6 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.senderId === user.uid ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                        msg.senderId === user.uid
                          ? "bg-brand-purple text-white rounded-br-md"
                          : "bg-dark-700 text-text-primary rounded-bl-md"
                      }`}>
                        <p>{msg.content}</p>
                        <span className={`text-[10px] block mt-1 ${msg.senderId === user.uid ? "text-white/60" : "text-text-muted"}`}>
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="text-4xl mb-3">👋</div>
                    <p className="text-sm text-text-muted">Comecem a conversar!</p>
                    <p className="text-xs text-text-muted mt-1">Diga olá para {activeConvo.otherUser.displayName.split(" ")[0]}</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/[0.06]">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                    placeholder="Digite sua mensagem..."
                    className="input-field flex-1 py-2.5"
                    disabled={sending}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!messageText.trim() || sending}
                    className="btn-gradient py-2.5 px-5 text-sm disabled:opacity-40 shrink-0"
                  >
                    {sending ? "..." : "Enviar"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <div className="text-5xl mb-4">💬</div>
                <h3 className="text-lg font-semibold mb-2">Suas mensagens</h3>
                <p className="text-sm text-text-muted">
                  {conversations.length > 0
                    ? "Selecione uma conversa para começar"
                    : "Faça matches para começar a conversar"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
