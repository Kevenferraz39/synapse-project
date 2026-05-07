"use client";

import { useState, useRef, useEffect } from "react";
import { getInitials } from "@/lib/utils";

const MOCK_CONVERSATIONS = [
  {
    id: "1", name: "Lucas Mendes", lastMessage: "Show! Vamos estudar React hooks amanhã?", time: "14:32", unread: 2,
    messages: [
      { id: "1", text: "E aí, tudo bem?", fromMe: false, time: "14:20" },
      { id: "2", text: "Opa! Tudo sim, e você?", fromMe: true, time: "14:22" },
      { id: "3", text: "Estou travado em um exercício de React hooks, pode me ajudar?", fromMe: false, time: "14:25" },
      { id: "4", text: "Claro! Qual hook especificamente?", fromMe: true, time: "14:28" },
      { id: "5", text: "useEffect com cleanup function. Não entendi quando usar.", fromMe: false, time: "14:30" },
      { id: "6", text: "Show! Vamos estudar React hooks amanhã?", fromMe: false, time: "14:32" },
    ],
  },
  {
    id: "2", name: "Mariana Costa", lastMessage: "Obrigada pela explicação! 🙏", time: "12:15", unread: 0,
    messages: [
      { id: "1", text: "Oi Mariana! Vi que você estuda Ciência de Dados", fromMe: true, time: "11:40" },
      { id: "2", text: "Oi! Sim, estou no 3º semestre", fromMe: false, time: "11:45" },
      { id: "3", text: "Consigo te ajudar com SQL se precisar", fromMe: true, time: "12:00" },
      { id: "4", text: "Obrigada pela explicação! 🙏", fromMe: false, time: "12:15" },
    ],
  },
  {
    id: "3", name: "Ana Beatriz", lastMessage: "Bora criar uma sala de estudo?", time: "Ontem", unread: 1,
    messages: [
      { id: "1", text: "Oi Ana! Aceito o match 😄", fromMe: true, time: "Ontem 18:00" },
      { id: "2", text: "Ei! Que legal, vi que estudamos as mesmas matérias", fromMe: false, time: "Ontem 18:30" },
      { id: "3", text: "Bora criar uma sala de estudo?", fromMe: false, time: "Ontem 19:00" },
    ],
  },
];

export default function ChatPage() {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<Record<string, typeof MOCK_CONVERSATIONS[0]["messages"]>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initial: Record<string, typeof MOCK_CONVERSATIONS[0]["messages"]> = {};
    MOCK_CONVERSATIONS.forEach((c) => { initial[c.id] = c.messages; });
    setMessages(initial);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat, messages]);

  const activeConvo = MOCK_CONVERSATIONS.find((c) => c.id === activeChat);
  const activeMessages = activeChat ? messages[activeChat] || [] : [];

  function sendMessage() {
    if (!messageText.trim() || !activeChat) return;
    const newMsg = { id: Date.now().toString(), text: messageText, fromMe: true, time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) };
    setMessages((prev) => ({ ...prev, [activeChat]: [...(prev[activeChat] || []), newMsg] }));
    setMessageText("");
  }

  return (
    <div className="animate-fade-up">
      <h1 className="text-2xl font-bold mb-6">💬 Chat</h1>

      <div className="glass-card overflow-hidden flex" style={{ height: "calc(100vh - 200px)" }}>
        {/* Conversations list */}
        <div className={`w-full sm:w-80 border-r border-white/[0.06] flex flex-col shrink-0 ${activeChat ? "hidden sm:flex" : "flex"}`}>
          <div className="p-4 border-b border-white/[0.06]">
            <input type="text" placeholder="Buscar conversa..." className="input-field text-xs py-2.5" />
          </div>
          <div className="flex-1 overflow-y-auto">
            {MOCK_CONVERSATIONS.map((convo) => (
              <button
                key={convo.id}
                onClick={() => setActiveChat(convo.id)}
                className={`w-full flex items-center gap-3 p-4 text-left transition-all hover:bg-white/[0.03] ${activeChat === convo.id ? "bg-brand-purple/10" : ""}`}
              >
                <div className="w-11 h-11 rounded-full bg-gradient-main flex items-center justify-center text-sm font-bold text-white shrink-0">
                  {getInitials(convo.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold truncate">{convo.name}</span>
                    <span className="text-[10px] text-text-muted shrink-0">{convo.time}</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-text-muted truncate">{convo.lastMessage}</p>
                    {convo.unread > 0 && (
                      <span className="w-5 h-5 rounded-full bg-brand-purple flex items-center justify-center text-[10px] font-bold text-white shrink-0 ml-2">
                        {convo.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
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
                  {getInitials(activeConvo.name)}
                </div>
                <div>
                  <div className="text-sm font-semibold">{activeConvo.name}</div>
                  <div className="text-[10px] text-brand-mint">Online</div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {activeMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.fromMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                      msg.fromMe
                        ? "bg-brand-purple text-white rounded-br-md"
                        : "bg-dark-700 text-text-primary rounded-bl-md"
                    }`}>
                      <p>{msg.text}</p>
                      <span className={`text-[10px] block mt-1 ${msg.fromMe ? "text-white/60" : "text-text-muted"}`}>
                        {msg.time}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/[0.06]">
                <div className="flex gap-3">
                  <button className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-text-muted hover:text-text-primary transition-all shrink-0">
                    📎
                  </button>
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Digite sua mensagem..."
                    className="input-field flex-1 py-2.5"
                  />
                  <button onClick={sendMessage} disabled={!messageText.trim()} className="btn-gradient py-2.5 px-5 text-sm disabled:opacity-40 shrink-0">
                    Enviar
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <div className="text-5xl mb-4">💬</div>
                <h3 className="text-lg font-semibold mb-2">Suas mensagens</h3>
                <p className="text-sm text-text-muted">Selecione uma conversa para começar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
