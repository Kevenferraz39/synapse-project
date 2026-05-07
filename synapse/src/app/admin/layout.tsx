"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

const ADMIN_NAV = [
  { href: "/admin", icon: "📊", label: "Dashboard" },
  { href: "/admin/users", icon: "👥", label: "Usuários" },
  { href: "/admin/analytics", icon: "📈", label: "Analytics" },
  { href: "/admin/reports", icon: "🚨", label: "Denúncias" },
  { href: "/admin/settings", icon: "⚙️", label: "Configurações" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push("/dashboard");
    }
  }, [user, isAdmin, loading, router]);

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="w-8 h-8 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-dark-900">
      <aside className="sticky top-0 h-screen w-[260px] bg-dark-800 border-r border-white/[0.06] flex-col hidden lg:flex">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/[0.06]">
          <div className="w-9 h-9 rounded-xl bg-gradient-warm flex items-center justify-center text-base font-black text-white">
            S
          </div>
          <div>
            <span className="text-lg font-extrabold">Synapse</span>
            <span className="ml-2 text-[10px] font-mono bg-brand-pink/15 text-brand-pink px-2 py-0.5 rounded-full">ADMIN</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${pathname === item.href ? "active" : ""}`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/[0.06]">
          <Link href="/dashboard" className="sidebar-link text-brand-mint/70 hover:text-brand-mint">
            <span className="text-base">←</span>
            Voltar ao app
          </Link>
        </div>
      </aside>

      <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
