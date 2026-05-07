"use client";

import { useState } from "react";
import Link from "next/link";
import { resetPassword } from "@/lib/auth-service";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch {
      setError("Erro ao enviar e-mail. Verifique o endereço.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="animate-fade-up text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-mint/15 flex items-center justify-center text-3xl mx-auto mb-6">
          ✉️
        </div>
        <h1 className="text-2xl font-bold mb-3">E-mail enviado!</h1>
        <p className="text-text-secondary mb-8">
          Verifique sua caixa de entrada em <strong className="text-text-primary">{email}</strong> para redefinir sua senha.
        </p>
        <Link href="/auth/login" className="btn-gradient py-3 px-8 text-sm inline-block">
          Voltar ao login
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <div className="flex items-center gap-3 mb-6 lg:hidden">
        <div className="w-10 h-10 rounded-xl bg-gradient-main flex items-center justify-center text-lg font-black text-white">S</div>
        <span className="text-xl font-black">Synapse</span>
      </div>

      <h1 className="text-3xl font-bold mb-2">Esqueceu a senha?</h1>
      <p className="text-text-secondary mb-8">
        Sem problemas. Informe seu e-mail e enviaremos um link de recuperação.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">E-mail</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required className="input-field" />
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl bg-brand-pink/10 border border-brand-pink/20 text-brand-pink text-sm">{error}</div>
        )}

        <button type="submit" disabled={loading} className="w-full btn-gradient py-3.5 text-sm disabled:opacity-50">
          {loading ? "Enviando..." : "Enviar link de recuperação"}
        </button>
      </form>

      <p className="text-center text-sm text-text-muted mt-6">
        Lembrou a senha?{" "}
        <Link href="/auth/login" className="text-brand-purple hover:text-brand-mint font-medium transition-colors">Voltar ao login</Link>
      </p>
    </div>
  );
}
