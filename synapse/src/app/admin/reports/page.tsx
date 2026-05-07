"use client";

import { useState } from "react";
import { getInitials } from "@/lib/utils";

const MOCK_REPORTS = [
  { id: "1", reportedUser: "Spam User", reportedBy: "Carolina Ferreira", reason: "Spam", description: "Enviando links suspeitos no chat para vários usuários", status: "pending", date: "Hoje, 10:30" },
  { id: "2", reportedUser: "User123", reportedBy: "Pedro Almeida", reason: "Assédio", description: "Mensagens inapropriadas repetidas após ser bloqueado", status: "pending", date: "Hoje, 09:15" },
  { id: "3", reportedUser: "FakeAccount", reportedBy: "Julia Santos", reason: "Perfil falso", description: "Usando foto de outra pessoa e informações falsas da universidade", status: "pending", date: "Ontem, 22:00" },
  { id: "4", reportedUser: "ToxicGamer", reportedBy: "Beatriz Rocha", reason: "Comportamento tóxico", description: "Atrapalhando salas de estudo deliberadamente", status: "reviewed", date: "02/05/2026" },
  { id: "5", reportedUser: "OldReport", reportedBy: "Gabriel Lima", reason: "Spam", description: "Propaganda de cursos externos nas salas", status: "resolved", date: "28/04/2026" },
];

export default function AdminReportsPage() {
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = reports.filter((r) => filterStatus === "all" || r.status === filterStatus);
  const pendingCount = reports.filter((r) => r.status === "pending").length;

  function updateStatus(id: string, newStatus: string) {
    setReports((prev) => prev.map((r) => r.id === id ? { ...r, status: newStatus } : r));
  }

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">🚨 Denúncias</h1>
          <p className="text-text-secondary text-sm mt-1">
            {pendingCount} denúncia{pendingCount !== 1 ? "s" : ""} pendente{pendingCount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Status filters */}
      <div className="flex gap-2">
        {[
          { value: "all", label: "Todas" },
          { value: "pending", label: `Pendentes (${pendingCount})` },
          { value: "reviewed", label: "Em análise" },
          { value: "resolved", label: "Resolvidas" },
          { value: "dismissed", label: "Descartadas" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilterStatus(f.value)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              filterStatus === f.value ? "bg-brand-purple text-white" : "bg-white/[0.04] border border-white/10 text-text-muted hover:text-text-primary"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Reports list */}
      <div className="space-y-4">
        {filtered.map((report) => (
          <div key={report.id} className="glass-card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-pink/20 flex items-center justify-center text-sm font-bold text-brand-pink">
                  {getInitials(report.reportedUser)}
                </div>
                <div>
                  <div className="text-sm font-semibold">{report.reportedUser}</div>
                  <div className="text-[10px] text-text-muted">Reportado por {report.reportedBy} · {report.date}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  report.reason === "Spam" ? "bg-brand-orange/15 text-brand-orange" :
                  report.reason === "Assédio" ? "bg-brand-pink/15 text-brand-pink" :
                  "bg-brand-purple/15 text-brand-purple"
                }`}>
                  {report.reason}
                </span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  report.status === "pending" ? "bg-yellow-500/15 text-yellow-400" :
                  report.status === "reviewed" ? "bg-blue-500/15 text-blue-400" :
                  report.status === "resolved" ? "bg-brand-mint/15 text-brand-mint" :
                  "bg-white/10 text-text-muted"
                }`}>
                  {report.status === "pending" ? "Pendente" :
                   report.status === "reviewed" ? "Em análise" :
                   report.status === "resolved" ? "Resolvida" : "Descartada"}
                </span>
              </div>
            </div>

            <p className="text-sm text-text-secondary mb-4 pl-[52px]">{report.description}</p>

            {report.status === "pending" && (
              <div className="flex gap-2 pl-[52px]">
                <button
                  onClick={() => updateStatus(report.id, "reviewed")}
                  className="text-[10px] font-medium px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all"
                >
                  📋 Analisar
                </button>
                <button
                  onClick={() => updateStatus(report.id, "resolved")}
                  className="text-[10px] font-medium px-4 py-2 rounded-lg bg-brand-mint/10 text-brand-mint hover:bg-brand-mint/20 transition-all"
                >
                  ✅ Resolver
                </button>
                <button
                  onClick={() => updateStatus(report.id, "dismissed")}
                  className="text-[10px] font-medium px-4 py-2 rounded-lg bg-white/[0.04] text-text-muted hover:bg-white/[0.08] transition-all"
                >
                  ✕ Descartar
                </button>
              </div>
            )}

            {report.status === "reviewed" && (
              <div className="flex gap-2 pl-[52px]">
                <button
                  onClick={() => updateStatus(report.id, "resolved")}
                  className="text-[10px] font-medium px-4 py-2 rounded-lg bg-brand-mint/10 text-brand-mint hover:bg-brand-mint/20 transition-all"
                >
                  ✅ Resolver (banir usuário)
                </button>
                <button
                  onClick={() => updateStatus(report.id, "dismissed")}
                  className="text-[10px] font-medium px-4 py-2 rounded-lg bg-white/[0.04] text-text-muted hover:bg-white/[0.08] transition-all"
                >
                  ✕ Descartar
                </button>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="glass-card p-12 text-center">
            <div className="text-4xl mb-3">🎉</div>
            <p className="text-text-muted">Nenhuma denúncia encontrada</p>
          </div>
        )}
      </div>
    </div>
  );
}
