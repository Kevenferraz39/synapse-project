"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { logout } from "@/lib/auth-service";
import { getInitials, formatXp } from "@/lib/utils";
import { getXpForNextLevel } from "@/lib/gamification-service";

const NAV_ITEMS = [
  { href: "/dashboard", icon: "🏠", label: "Início" },
  { href: "/dashboard/matches", icon: "🔥", label: "Matches" },
  { href: "/dashboard/study-rooms", icon: "📚", label: "Salas de Estudo" },
  { href: "/dashboard/chat", icon: "💬", label: "Chat" },
  { href: "/dashboard/rankings", icon: "🏆", label: "Rankings" },
  { href: "/dashboard/profile", icon: "👤", label: "Perfil" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, firebaseUser, loading, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.push("/auth/login");
    }
  }, [firebaseUser, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-brand-purple border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-muted text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  const xpProgress = getXpForNextLevel(user.stats.xp);

  async function handleLogout() {
    await logout();
    router.push("/auth/login");
  }

  return (
    <div className="min-h-screen flex bg-dark-900">
      {/* Sidebar overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-[260px] bg-dark-800 border-r border-white/[0.06] flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/[0.06]">
          <div className="w-9 h-9 rounded-xl bg-gradient-main flex items-center justify-center text-base font-black text-white relative overflow-hidden">
            S
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
          </div>
          <span className="text-lg font-extrabold tracking-tight">Synapse</span>
        </div>

        {/* User card */}
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
            <div className="w-10 h-10 rounded-full bg-gradient-main flex items-center justify-center text-sm font-bold text-white shrink-0">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                getInitials(user.displayName)
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold truncate">{user.displayName}</div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-cool transition-all duration-500" style={{ width: `${xpProgress.progress}%` }} />
                </div>
                <span className="text-[10px] font-mono text-brand-mint font-bold">{formatXp(user.stats.xp)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`sidebar-link ${pathname === item.href ? "active" : ""}`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}

          {isAdmin && (
            <>
              <div className="h-px bg-white/[0.06] my-3" />
              <div className="px-4 py-1">
                <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Admin</span>
              </div>
              <Link
                href="/admin"
                onClick={() => setSidebarOpen(false)}
                className={`sidebar-link ${pathname.startsWith("/admin") ? "active" : ""}`}
              >
                <span className="text-base">⚙️</span>
                Painel Admin
              </Link>
            </>
          )}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/[0.06]">
          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-brand-pink/70 hover:text-brand-pink hover:bg-brand-pink/5"
          >
            <span className="text-base">🚪</span>
            Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen">
        {/* Top bar mobile */}
        <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-dark-900/80 backdrop-blur-xl border-b border-white/[0.06]">
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-text-secondary hover:text-text-primary">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-main flex items-center justify-center text-xs font-bold text-white">S</div>
            <span className="font-bold">Synapse</span>
          </div>
          <div className="w-8" />
        </div>

        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
