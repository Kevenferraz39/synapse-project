"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { firebaseUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && firebaseUser) {
      router.push("/dashboard");
    }
  }, [firebaseUser, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="w-8 h-8 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-dark-800 flex-col items-center justify-center p-12">
        {/* Animated background glows */}
        <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] rounded-full bg-brand-purple/20 blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-150px] right-[-150px] w-[400px] h-[400px] rounded-full bg-brand-pink/15 blur-[100px] animate-pulse-slow" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] rounded-full bg-brand-orange/10 blur-[80px] animate-pulse-slow" style={{ animationDelay: "3s" }} />

        <div className="relative z-10 text-center max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-main flex items-center justify-center text-2xl font-black text-white relative overflow-hidden">
              S
              <div className="absolute inset-0 bg-gradient-to-br from-white/25 to-transparent rounded-2xl" />
            </div>
            <span className="text-3xl font-black tracking-tight">Synapse</span>
          </div>

          <h2 className="text-2xl font-bold mb-4">
            Conecte-se. Estude. <span className="gradient-text">Evolua.</span>
          </h2>
          <p className="text-text-secondary leading-relaxed mb-10">
            Junte-se a milhares de estudantes que transformaram o estudo solitário em uma experiência colaborativa e motivadora.
          </p>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-black font-mono gradient-text-mint">4M+</div>
              <div className="text-xs text-text-muted mt-1">Estudantes EAD</div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center">
              <div className="text-2xl font-black font-mono gradient-text-mint">40%</div>
              <div className="text-xs text-text-muted mt-1">Desistem sozinhos</div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center">
              <div className="text-2xl font-black font-mono gradient-text-mint">3x</div>
              <div className="text-xs text-text-muted mt-1">Mais foco em grupo</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
