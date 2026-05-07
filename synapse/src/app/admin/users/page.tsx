"use client";

import { useState } from "react";
import { getInitials } from "@/lib/utils";

const MOCK_USERS = [
  { uid: "1", name: "Carolina Ferreira", email: "carol@gmail.com", university: "USP", course: "Eng. Software", xp: 28400, joined: "15/01/2026", lastActive: "Hoje", status: "active", role: "student" },
  { uid: "2", name: "Pedro Almeida", email: "pedro@hotmail.com", university: "UNICAMP", course: "Ciência de Dados", xp: 24100, joined: "20/01/2026", lastActive: "Hoje", status: "active", role: "student" },
  { uid: "3", name: "Julia Santos", email: "julia@gmail.com", university: "PUC-SP", course: "Design", xp: 21800, joined: "02/02/2026", lastActive: "Ontem", status: "active", role: "student" },
  { uid: "4", name: "Gabriel Lima", email: "gabriel@outlook.com", university: "UFMG", course: "Administração", xp: 17200, joined: "10/02/2026", lastActive: "3d atrás", status: "active", role: "student" },
  { uid: "5", name: "Beatriz Rocha", email: "bia@gmail.com", university: "UFRJ", course: "Psicologia", xp: 15800, joined: "15/02/2026", lastActive: "Hoje", status: "active", role: "student" },
  { uid: "6", name: "Lucas Mendes", email: "lucas@gmail.com", university: "USP", course: "Eng. Software", xp: 14300, joined: "01/03/2026", lastActive: "Hoje", status: "active", role: "student" },
  { uid: "7", name: "Mariana Costa", email: "mari@gmail.com", university: "UNICAMP", course: "Ciência de Dados", xp: 13100, joined: "05/03/2026", lastActive: "2d atrás", status: "active", role: "student" },
  { uid: "8", name: "Rafael Oliveira", email: "rafael@gmail.com", university: "PUC-SP", course: "Design Digital", xp: 11500, joined: "10/03/2026", lastActive: "1 semana", status: "inactive", role: "student" },
  { uid: "9", name: "Spam User", email: "spam@test.com", university: "Fake", course: "N/A", xp: 0, joined: "20/04/2026", lastActive: "Hoje", status: "blocked", role: "student" },
  { uid: "10", name: "Admin Master", email: "admin@synapse.com", university: "—", course: "—", xp: 0, joined: "01/01/2026", lastActive: "Hoje", status: "active", role: "admin" },
];

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [users, setUsers] = useState(MOCK_USERS);

  const filtered = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === "all" || u.role === filterRole;
    const matchesStatus = filterStatus === "all" || u.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  function toggleBlock(uid: string) {
    setUsers((prev) =>
      prev.map((u) =>
        u.uid === uid
          ? { ...u, status: u.status === "blocked" ? "active" : "blocked" }
          : u
      )
    );
  }

  function changeRole(uid: string) {
    setUsers((prev) =>
      prev.map((u) =>
        u.uid === uid
          ? { ...u, role: u.role === "admin" ? "student" : "admin" }
          : u
      )
    );
  }

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">👥 Gestão de Usuários</h1>
          <p className="text-text-secondary text-sm mt-1">{users.length} usuários registrados</p>
        </div>
        <button className="btn-gradient py-2.5 px-5 text-sm">Exportar CSV</button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou e-mail..."
          className="input-field max-w-xs text-xs py-2.5"
        />
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="input-field w-auto text-xs py-2.5"
        >
          <option value="all">Todos os papéis</option>
          <option value="student">Estudante</option>
          <option value="admin">Admin</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-field w-auto text-xs py-2.5"
        >
          <option value="all">Todos os status</option>
          <option value="active">Ativo</option>
          <option value="inactive">Inativo</option>
          <option value="blocked">Bloqueado</option>
        </select>
      </div>

      {/* Users table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left px-5 py-3 text-[10px] text-text-muted font-mono uppercase tracking-wider">Usuário</th>
                <th className="text-left px-5 py-3 text-[10px] text-text-muted font-mono uppercase tracking-wider">Universidade</th>
                <th className="text-left px-5 py-3 text-[10px] text-text-muted font-mono uppercase tracking-wider">XP</th>
                <th className="text-left px-5 py-3 text-[10px] text-text-muted font-mono uppercase tracking-wider">Último acesso</th>
                <th className="text-left px-5 py-3 text-[10px] text-text-muted font-mono uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3 text-[10px] text-text-muted font-mono uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.uid} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-all">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-main flex items-center justify-center text-xs font-bold text-white shrink-0">
                        {getInitials(user.name)}
                      </div>
                      <div>
                        <div className="text-sm font-medium flex items-center gap-2">
                          {user.name}
                          {user.role === "admin" && (
                            <span className="text-[9px] font-mono bg-brand-pink/15 text-brand-pink px-1.5 py-0.5 rounded">ADMIN</span>
                          )}
                        </div>
                        <div className="text-[10px] text-text-muted">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="text-xs text-text-secondary">{user.university}</div>
                    <div className="text-[10px] text-text-muted">{user.course}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-mono font-bold text-brand-mint">{user.xp.toLocaleString()}</span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-text-muted">{user.lastActive}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      user.status === "active" ? "bg-brand-mint/15 text-brand-mint" :
                      user.status === "blocked" ? "bg-brand-pink/15 text-brand-pink" :
                      "bg-white/10 text-text-muted"
                    }`}>
                      {user.status === "active" ? "Ativo" : user.status === "blocked" ? "Bloqueado" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => toggleBlock(user.uid)}
                        className={`text-[10px] font-medium px-3 py-1.5 rounded-lg transition-all ${
                          user.status === "blocked"
                            ? "bg-brand-mint/10 text-brand-mint hover:bg-brand-mint/20"
                            : "bg-brand-pink/10 text-brand-pink hover:bg-brand-pink/20"
                        }`}
                      >
                        {user.status === "blocked" ? "Desbloquear" : "Bloquear"}
                      </button>
                      <button
                        onClick={() => changeRole(user.uid)}
                        className="text-[10px] font-medium px-3 py-1.5 rounded-lg bg-brand-purple/10 text-brand-purple hover:bg-brand-purple/20 transition-all"
                      >
                        {user.role === "admin" ? "→ Student" : "→ Admin"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-text-muted text-sm">
            Nenhum usuário encontrado
          </div>
        )}
      </div>
    </div>
  );
}
