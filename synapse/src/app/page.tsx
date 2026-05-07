"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function HomePage() {
  const { firebaseUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (firebaseUser) {
        router.push("/dashboard");
      } else {
        router.push("/auth/login");
      }
    }
  }, [firebaseUser, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-main flex items-center justify-center text-2xl font-black text-white mx-auto mb-4 relative overflow-hidden">
          S
          <div className="absolute inset-0 bg-gradient-to-br from-white/25 to-transparent rounded-2xl" />
        </div>
        <div className="w-8 h-8 border-2 border-brand-purple border-t-transparent rounded-full animate-spin mx-auto mt-4" />
      </div>
    </div>
  );
}
