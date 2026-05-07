"use client";

import { formatXp } from "@/lib/utils";

const STATS = [
  { label: "Total de Usuários", value: "12.847", change: "+234", changeType: "up", icon: "👥" },
  { label: "Usuários Ativos (7d)", value: "5.142", change: "+18%", changeType: "up", icon: "📈" },
  { label: "Matches Realizados", value: "8.934", change: "+156", changeType: "up", icon: "🤝" },
  { label: "Salas Ativas Agora", value: "47", change: "+12", changeType: "up", icon: "📚" },
  { label: "Novos Hoje", value: "89", change: "-5%", changeType: "down", icon: "🆕" },
  { label: "Taxa de Retenção", value: "68%", change: "+3%", changeType: "up", icon: "🔄" },
  { label: "Tempo Médio", value: "42min", change: "+8min", changeType: "up", icon: "⏱️" },
  { label: "Denúncias Pendentes", value: "3", change: "-2", changeType: "up", icon: "🚨" },
];

const RECENT_USERS = [
  { name: "Maria Silva", email: "maria@gmail.com", university: "USP", date: "Hoje, 14:32", status: "active" },
  { name: "João Pedro", email: "joao@hotmail.com", university: "UNICAMP", date: "Hoje, 13:20", status: "active" },
  { name: "Ana Clara", email: "ana@gmail.com", university: "PUC-SP", date: "Hoje, 12:45", status: "active" },
  { name: "Carlos Lima", email: "carlos@outlook.com", university: "UFMG", date: "Hoje, 11:10", status: "active" },
  { name: "Fernanda Costa", email: "fer@gmail.com", university: "UFRJ", date: "Hoje, 10:30", status: "pending" },
];

const TOP_UNIVERSITIES = [
  { name: "USP", count: 2340, percentage: 18 },
  { name: "UNICAMP", count: 1890, percentage: 15 },
  { name: "PUC-SP", count: 1560, percentage: 12 },
  { name: "Anhanguera", count: 1280, percentage: 10 },
  { name: "UFMG", count: 980, percentage: 8 },
];

const TOP_SUBJECTS = [
  { name: "Programação", count: 4200 },
  { name: "Algoritmos", count: 3800 },
  { name: "Cálculo", count: 3200 },
  { name: "Estatística", count: 2900 },
  { name: "Banco de Dados", count: 2400 },
];

export default function AdminDashboard() {
  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="text-2xl font-bold">📊 Admin Dashboard</h1>
        <p className="text-text-secondary text-sm mt-1">Visão geral da plataforma Synapse</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-muted">{stat.label}</span>
              <span className="text-lg">{stat.icon}</span>
            </div>
            <div className="text-2xl font-black font-mono">{stat.value}</div>
            <div className={`text-xs font-medium mt-1 ${stat.changeType === "up" ? "text-brand-mint" : "text-brand-pink"}`}>
              {stat.changeType === "up" ? "↑" : "↓"} {stat.change}
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent users */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Novos usuários</h2>
            <a href="/admin/users" className="text-xs text-brand-purple hover:text-brand-mint transition-colors">Ver todos →</a>
          </div>

          <div className="space-y-1">
            <div className="grid grid-cols-[1fr_160px_100px_80px] gap-2 px-3 py-2 text-[10px] text-text-muted font-mono uppercase tracking-wider">
              <span>Usuário</span>
              <span>Universidade</span>
              <span>Data</span>
              <span className="text-right">Status</span>
            </div>

            {RECENT_USERS.map((user, i) => (
              <div key={i} className="grid grid-cols-[1fr_160px_100px_80px] gap-2 items-center px-3 py-3 rounded-xl hover:bg-white/[0.02] transition-all">
                <div>
                  <div className="text-sm font-medium">{user.name}</div>
                  <div className="text-[10px] text-text-muted">{user.email}</div>
                </div>
                <span className="text-xs text-text-secondary">{user.university}</span>
                <span className="text-xs text-text-muted">{user.date}</span>
                <div className="flex justify-end">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    user.status === "active" ? "bg-brand-mint/15 text-brand-mint" : "bg-brand-orange/15 text-brand-orange"
                  }`}>
                    {user.status === "active" ? "Ativo" : "Pendente"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Side panels */}
        <div className="space-y-6">
          {/* Top universities */}
          <div className="glass-card p-6">
            <h2 className="font-semibold mb-4">🏛️ Top universidades</h2>
            <div className="space-y-3">
              {TOP_UNIVERSITIES.map((uni, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-text-secondary">{uni.name}</span>
                    <span className="font-mono text-text-muted">{uni.count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-main transition-all" style={{ width: `${uni.percentage * 4}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top subjects */}
          <div className="glass-card p-6">
            <h2 className="font-semibold mb-4">📖 Matérias mais estudadas</h2>
            <div className="space-y-2">
              {TOP_SUBJECTS.map((subject, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-none">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-text-muted w-4">#{i + 1}</span>
                    <span className="text-sm">{subject.name}</span>
                  </div>
                  <span className="text-xs font-mono text-brand-mint">{formatXp(subject.count)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
